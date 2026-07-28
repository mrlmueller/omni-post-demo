import base64
import datetime
import json
import logging
import requests
from flask import jsonify, request
from google.cloud import firestore, storage
from google.oauth2 import service_account
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# Constants
BUCKET_NAME = "omni-post-eu.appspot.com"
CLIENT_KEY = os.environ["TIKTOK_CLIENT_KEY"]
CLIENT_SECRET = os.environ["TIKTOK_CLIENT_SECRET"]


def video_upload_status(
    db: firestore.Client,
    user_id: str,
    upload_id: str,
    platform: str,
    status_code: int,
    title: str = None,
):
    STATUS_CODES = {
        "PROCESSING": 1,
        "UPLOADING": 2,
        "FAILED": 3,
        "SUCCESS": 4,
    }

    VALID_STATUS_CODES = {v: k for k, v in STATUS_CODES.items()}
    if status_code not in VALID_STATUS_CODES:
        raise ValueError(
            f"Invalid status code: {status_code}. Must be one of {list(VALID_STATUS_CODES.keys())}"
        )

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:  # Correct usage here
        raise ValueError("User not found")

    uploads_ref = user_ref.collection("uploads").document(upload_id)
    upload_doc = uploads_ref.get()

    platform_data = {
        f"{platform}.status_code": status_code,
        f"{platform}.timestamp": datetime.datetime.now().isoformat(),
        f"{platform}.read": False,
    }
    if title:
        platform_data["title"] = title

    if upload_doc.exists:  # Correct usage here
        uploads_ref.update(platform_data)
    else:
        new_upload = {
            "upload_id": upload_id,
            "title": title if title else "Untitled",
            platform: platform_data,
        }
        uploads_ref.set(new_upload)


def initialize_firestore():
    db = firestore.Client()
    return db


def generate_signed_url(bucket_name, blob_name, expiration_time):
    credentials = service_account.Credentials.from_service_account_file(
        "omni-post-eu-ca41b32744e1.json"
    )
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.generate_signed_url(expiration=expiration_time, method="GET")

    return url


def get_access_token(refresh_token, client_key, client_secret):
    token_url = "https://open.tiktokapis.com/v2/oauth/token/"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "client_key": client_key,
        "client_secret": client_secret,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    response = requests.post(token_url, headers=headers, data=data)
    response.raise_for_status()

    response_data = response.json()

    access_token = response_data.get("access_token")
    new_refresh_token = response_data.get("refresh_token")

    if not access_token or not new_refresh_token:
        raise Exception("Invalid response: Missing access_token or refresh_token")

    return access_token, new_refresh_token


def extract_blob_name_from_url(video_url):
    try:
        blob_name = video_url.split("/o/")[1].split("?alt=media")[0].replace("%2F", "/")
        return blob_name
    except IndexError:
        raise ValueError("Error extracting blob name from URL")


def post_video_to_tiktok(
    video_url,
    access_token,
    title,
    privacy_level,
    disable_comment,
    disable_duet,
    disable_stitch,
):
    post_url = "https://open.tiktokapis.com/v2/post/publish/video/init/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=UTF-8",
    }

    data = {
        "post_info": {
            "title": title,
            "privacy_level": privacy_level,
            "disable_duet": disable_duet,
            "disable_comment": disable_comment,
            "disable_stitch": disable_stitch,
            "video_cover_timestamp_ms": 1000,
        },
        "source_info": {"source": "PULL_FROM_URL", "video_url": video_url},
    }

    try:
        response = requests.post(post_url, headers=headers, json=data)
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        # Log the response content for detailed error message
        logger.error(
            f"HTTP error occurred: {http_err.response.status_code} - {http_err.response.text}"
        )
        raise
    except Exception as err:
        logger.error(f"Other error occurred: {err}")
        raise

    response_data = response.json()
    return response_data


def decrypt_token(encrypted_token: str) -> str:
    try:
        # Get the secret key from google secretmanager
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        secret_key_base64 = response.payload.data.decode("UTF-8")

        # Split the encrypted data into IV, ciphertext, and auth tag
        iv_base64, ciphertext_base64, auth_tag_base64 = encrypted_token.split(":")

        # Decode the base64-encoded components
        iv = base64.b64decode(iv_base64)
        ciphertext = base64.b64decode(ciphertext_base64)
        auth_tag = base64.b64decode(auth_tag_base64)

        # Decode the secret key from base64
        secret_key = base64.b64decode(secret_key_base64)

        # Check the length of the secret key
        if len(secret_key) != 32:
            raise ValueError("Invalid secret key length")

        # Initialize AESGCM with the secret key
        aesgcm = AESGCM(secret_key)

        # Combine ciphertext and auth tag, then decrypt
        decrypted_token = aesgcm.decrypt(iv, ciphertext + auth_tag, None)

        # Return the decrypted token as a UTF-8 string
        return decrypted_token.decode("utf-8")

    except ValueError as ve:
        logging.error(f"ValueError during decryption: {ve}")
    except Exception as e:
        logging.error(f"Unexpected error during decryption: {e}")
    return None


def encrypt_token(token: str) -> str:
    try:
        # Retrieve the encryption key from Secret Manager
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        key_base64 = response.payload.data.decode("UTF-8")

        # Decode the base64-encoded key
        key = base64.b64decode(key_base64)

        # Ensure the key size is 32 bytes (256 bits)
        if len(key) != 32:
            raise ValueError(
                f"Invalid key size ({len(key)}) for AES. Must be 32 bytes."
            )

        # Generate a random IV (nonce) of 12 bytes
        iv = os.urandom(12)

        # Initialize the cipher with AES-GCM mode
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Encrypt the token
        encrypted_token = encryptor.update(token.encode("utf-8")) + encryptor.finalize()

        # Get the authentication tag
        auth_tag = encryptor.tag

        # Convert IV, encrypted data, and auth tag to base64 for storage
        iv_base64 = base64.b64encode(iv).decode("utf-8")
        encrypted_base64 = base64.b64encode(encrypted_token).decode("utf-8")
        auth_tag_base64 = base64.b64encode(auth_tag).decode("utf-8")

        return f"{iv_base64}:{encrypted_base64}:{auth_tag_base64}"
    except Exception as e:
        logging.error(f"Error during encryption: {e}")
        raise


def validate_tiktok_compliance(tiktokCompliance):
    # Default values if not provided
    default_compliance = {
        "privacyLevelOption": "SELF_ONLY",
        "commentDisabled": True,
        "duetDisabled": True,
        "stitchDisabled": True,
        "discloseVideoContent": False,
        "isYourBrandChecked": False,
        "isBrandedContentChecked": False,
    }

    # If tiktokCompliance is not provided at all, use default_compliance
    if not tiktokCompliance:
        return default_compliance

    # Merge provided tiktokCompliance with defaults
    validated_compliance = {
        key: tiktokCompliance.get(key, default_compliance[key])
        for key in default_compliance
    }

    return validated_compliance


def main(request):
    if request.method != "POST":
        logger.error("ERR001: Invalid request method. Only POST is allowed.")
        return jsonify({"error": "Invalid request method. Only POST is allowed."}), 405

    envelope = request.get_json(silent=True)
    if envelope is None or "message" not in envelope:
        logger.error("ERR002: Invalid JSON payload.")
        return jsonify({"error": "Invalid JSON payload."}), 400

    message = envelope["message"]

    if "data" not in message:
        logger.error("ERR003: Data field is missing in the message.")
        return jsonify({"error": "Data field is missing in the message."}), 400

    try:
        decoded_data = base64.b64decode(message["data"]).decode("utf-8")
        payload = json.loads(decoded_data)
    except Exception as e:
        logger.error(f"ERR004: Error decoding data: {e}")
        return jsonify({"error": f"Error decoding data: {e}"}), 400

    user_id = payload.get("user_id")
    video_url = payload.get("video_url")
    title = payload.get("title")
    upload_id = payload.get("upload_id")
    tiktokCompliance = payload.get("tiktokCompliance")

    if not user_id or not video_url or not title or not upload_id:
        logger.error(
            "ERR005: Missing required fields (user_id, video_url, title, upload_id)."
        )
        return (
            jsonify(
                {
                    "error": "user_id, video_url, title, and upload_id are required in the JSON payload."
                }
            ),
            400,
        )

    try:
        db = initialize_firestore()
        logger.info(
            f"INFO001: Initializing Firestore for user_id={user_id} upload_id={upload_id}."
        )
        video_upload_status(db, user_id, upload_id, "tiktok", 1, title)

        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            logger.error(f"ERR006: User not found (user_id={user_id}).")
            return jsonify({"error": "User not found"}), 404

        socials = user_doc.get("socials")
        if not socials:
            logger.error(
                f"ERR007: Invalid user data: 'socials' not found (user_id={user_id})."
            )
            return jsonify({"error": "Invalid user data: 'socials' not found"}), 400

        tiktok = socials.get("tiktok")
        if not tiktok:
            logger.error(
                f"ERR008: Invalid user data: 'tiktok' not found (user_id={user_id})."
            )
            return jsonify({"error": "Invalid user data: 'tiktok' not found"}), 400

        refresh_token = decrypt_token(tiktok.get("refresh_token"))

        try:
            access_token, new_refresh_token = get_access_token(
                refresh_token, CLIENT_KEY, CLIENT_SECRET
            )
            logger.info(f"INFO002: Access token obtained for user_id={user_id}.")
            user_ref.update(
                {"socials.tiktok.refresh_token": encrypt_token(new_refresh_token)}
            )
        except Exception as e:
            video_upload_status(db, user_id, upload_id, "tiktok", 3, title)
            logger.error(
                f"ERR009: Error getting access token for user_id={user_id}: {e}"
            )
            return jsonify({"error": str(e)}), 500

        try:
            blob_name = extract_blob_name_from_url(video_url)
            logger.info(f"INFO003: Blob name extracted for video_url={video_url}.")
            signed_url = generate_signed_url(
                BUCKET_NAME, blob_name, datetime.timedelta(hours=1)
            )
            logger.info(f"INFO004: Signed URL generated for blob_name={blob_name}.")
        except Exception as e:
            video_upload_status(db, user_id, upload_id, "tiktok", 3, title)
            logger.error(
                f"ERR010: Error generating signed URL for user_id={user_id}: {e}"
            )
            return jsonify({"error": str(e)}), 500

        try:
            video_upload_status(db, user_id, upload_id, "tiktok", 1, title)

            tiktokCompliance = validate_tiktok_compliance(tiktokCompliance)

            # Extract values from tiktokCompliance, already validated with default values
            privacy_level = tiktokCompliance[
                "privacyLevelOption"
            ]  # Use the value directly from tiktokCompliance
            disable_comment = tiktokCompliance["commentDisabled"]
            disable_duet = tiktokCompliance["duetDisabled"]
            disable_stitch = tiktokCompliance["stitchDisabled"]

            def update_title_with_compliance(tiktokCompliance, title):
                # Check conditions and modify the title accordingly
                if (
                    tiktokCompliance["isYourBrandChecked"]
                    and tiktokCompliance["isBrandedContentChecked"]
                ):
                    return title + " | Paid partnership"
                elif tiktokCompliance["isBrandedContentChecked"]:
                    return title + " | Paid partnership"
                elif tiktokCompliance["isYourBrandChecked"]:
                    return title + " | Promotional content"
                else:
                    return title

            new_title = update_title_with_compliance(tiktokCompliance, title)
            print(new_title)

            # Call the post_video_to_tiktok function with dynamic values
            init_response = post_video_to_tiktok(
                signed_url,
                access_token,
                new_title,
                privacy_level,
                disable_comment,
                disable_duet,
                disable_stitch,
            )

            logger.info(
                f"INFO005: Video successfully posted to TikTok for user_id={user_id}, upload_id={upload_id}."
            )
            video_upload_status(db, user_id, upload_id, "tiktok", 4, title)
            return jsonify(init_response), 200
        except Exception as e:
            video_upload_status(db, user_id, upload_id, "tiktok", 3, title)
            logger.error(
                f"ERR011: Error posting video to TikTok for user_id={user_id}: {e}"
            )
            return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"ERR012: Unexpected error for user_id={user_id}: {e}")
        return jsonify({"error": "Unexpected error occurred."}), 500
