import os
import json
import requests
from google.cloud import firestore
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import io
import base64
import logging
from google.auth.exceptions import GoogleAuthError
from flask import jsonify
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager
import datetime

# Configure loggingg this is new
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


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


def process_video_upload(user_id: str, video_url: str, title: str, upload_id: str):
    try:
        db = firestore.Client()

        video_upload_status(db, user_id, upload_id, "youtube", 1, title)

        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:  # Correct usage here
            logging.error("User document does not exist.")
            video_upload_status(db, user_id, upload_id, "youtube", 3)
            return {"error": "User document does not exist."}, 404

        user_data = user_doc.to_dict()
        youtube_account = user_data.get("socials", {}).get("youtube", {})
        refresh_token = decrypt_token(youtube_account.get("refresh_token"))

        if not refresh_token:
            logging.error("Refresh token not found.")
            video_upload_status(db, user_id, upload_id, "youtube", 3)
            return {"error": "Refresh token not found."}, 404

        oauth2_client = Credentials(
            None,
            refresh_token=refresh_token,
            client_id=os.environ["GOOGLE_OAUTH_CLIENT_ID"],
            client_secret=os.environ["GOOGLE_OAUTH_CLIENT_SECRET"],
            token_uri="https://oauth2.googleapis.com/token",
        )
        oauth2_client.refresh(Request())

        youtube = build("youtube", "v3", credentials=oauth2_client)

        video_response = requests.get(video_url, stream=True)
        if video_response.status_code != 200:
            logging.error("Failed to download video: %s", video_response.text)
            video_upload_status(db, user_id, upload_id, "youtube", 3)
            return {
                "error": "Failed to download video",
                "details": video_response.text,
            }, 500

        video_stream = io.BytesIO(video_response.content)
        media = MediaIoBaseUpload(
            video_stream, mimetype="video/mp4", chunksize=-1, resumable=True
        )

        request_body = {
            "snippet": {
                "title": title,
                "description": "Description",
            },
            "status": {"privacyStatus": "public", "madeForKids": False},
        }

        # Update status to UPLOADING
        video_upload_status(db, user_id, upload_id, "youtube", 2)

        response = (
            youtube.videos()
            .insert(part="snippet,status", body=request_body, media_body=media)
            .execute()
        )

        if "id" in response:
            # Update status to SUCCESS
            video_upload_status(db, user_id, upload_id, "youtube", 4)
            return {
                "message": "Video uploaded successfully!",
                "videoId": response["id"],
            }, 200
        else:
            logging.error("Invalid YouTube API response. No video ID returned.")
            video_upload_status(db, user_id, upload_id, "youtube", 3)
            return {
                "error": "Invalid YouTube API response",
                "details": "No video ID returned",
            }, 500

    except requests.exceptions.RequestException as req_err:
        logging.error("Network error: %s", req_err)
        video_upload_status(db, user_id, upload_id, "youtube", 3)
        return {"error": f"Network error: {req_err}"}, 500
    except GoogleAuthError as auth_err:
        logging.error("Authentication error: %s", auth_err)
        video_upload_status(db, user_id, upload_id, "youtube", 3)
        return {"error": f"Authentication error: {auth_err}"}, 500
    except Exception as e:
        logging.error("Error uploading video: %s", e)
        video_upload_status(db, user_id, upload_id, "youtube", 3)
        return {"error": f"Error uploading video: {e}"}, 500


def upload_video(request):
    if request.method != "POST":
        return jsonify({"error": "Invalid request method. Only POST is allowed."}), 405

    envelope = request.get_json(silent=True)
    if envelope is None or "message" not in envelope:
        return jsonify({"error": "Invalid JSON payload."}), 400

    message = envelope["message"]

    if "data" not in message:
        return jsonify({"error": "Data field is missing in the message."}), 400

    try:
        decoded_data = base64.b64decode(message["data"]).decode("utf-8")
        payload = json.loads(decoded_data)
    except Exception as e:
        logging.error("Error decoding data: %s", e)
        return jsonify({"error": f"Error decoding data: {e}"}), 400

    user_id = payload.get("user_id")
    video_url = payload.get("video_url")
    title = payload.get("title")
    upload_id = payload.get(
        "upload_id"
    )  # Ensure upload_id is included in the Pub/Sub message

    if not user_id or not video_url or not title or not upload_id:
        return (
            jsonify(
                {
                    "error": "user_id, video_url, title, and upload_id are required in the JSON payload."
                }
            ),
            400,
        )

    result, status_code = process_video_upload(user_id, video_url, title, upload_id)

    return jsonify(result), status_code
