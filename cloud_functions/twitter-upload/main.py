import os
import base64
import json
import requests
from google.cloud import firestore
from google.oauth2 import service_account
from requests_oauthlib import OAuth1Session
import time
from requests_oauthlib import OAuth1
from flask import Flask, request
import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager
import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_key_from_url(url: str) -> str:
    return url.split("/")[-1].split("?")[0]


def upload_video_to_twitter(oauth_token, oauth_token_secret, video_url, twitter_id_str):
    media_url = "https://upload.twitter.com/1.1/media/upload.json"
    media_data = requests.get(video_url).content
    media_size = len(media_data)
    chunk_size = 5 * 1024 * 1024  # 5MB

    # Initialize upload
    init_params = {
        "command": "INIT",
        "media_type": "video/mp4",
        "total_bytes": media_size,
        "media_category": "tweet_video",
    }
    oauth = OAuth1Session(
        os.environ["TWITTER_CONSUMER_KEY"],
        client_secret=os.environ["TWITTER_CONSUMER_SECRET"],
        resource_owner_key=oauth_token,
        resource_owner_secret=oauth_token_secret,
    )
    init_response = oauth.post(media_url, data=init_params)
    init_response_json = init_response.json()
    media_id = init_response_json["media_id_string"]

    # Upload chunks
    for i, chunk_start in enumerate(range(0, media_size, chunk_size)):
        chunk_data = media_data[chunk_start : chunk_start + chunk_size]
        append_params = {
            "command": "APPEND",
            "media_id": media_id,
            "segment_index": i,
        }
        files = {"media": chunk_data}
        append_response = oauth.post(media_url, data=append_params, files=files)
        if append_response.status_code not in [200, 204]:
            raise Exception(
                f"Error APPENDing segment {i}: Status code {append_response.status_code}, Response: {append_response.text}"
            )

    # Finalize upload
    finalize_params = {
        "command": "FINALIZE",
        "media_id": media_id,
    }
    finalize_response = oauth.post(media_url, data=finalize_params)
    finalize_response_json = finalize_response.json()

    # Check upload status
    if "processing_info" in finalize_response_json:
        state = finalize_response_json["processing_info"].get("state", "")
        if state == "succeeded":
            return media_id
        else:
            while state not in ["succeeded", "failed"]:
                time.sleep(5)
                status_response = oauth.get(
                    f"{media_url}?command=STATUS&media_id={media_id}"
                )
                status_response_json = status_response.json()
                state = status_response_json["processing_info"].get("state", "")
            if state == "succeeded":
                return media_id
            else:
                raise Exception("Media processing failed")
    else:
        return finalize_response_json["media_id_string"]


def make_post(endpoint, params, auth, success_status_codes=[200, 201, 202, 204]):
    response = requests.post(endpoint, json=params, auth=auth)
    if response.status_code not in success_status_codes:
        logger.error(f"Failed at {endpoint}: {response.json()}")
        response.raise_for_status()
    return response.json()


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

    # Reverse mapping for validation
    VALID_STATUS_CODES = {v: k for k, v in STATUS_CODES.items()}
    # Validate status code
    if status_code not in VALID_STATUS_CODES:
        raise ValueError(
            f"Invalid status code: {status_code}. Must be one of {list(VALID_STATUS_CODES.keys())}"
        )

    # Reference to the user's document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    # Check if the user document exists
    if not user_doc.exists:
        raise ValueError("User not found")

    # Reference to the 'uploads' collection within the user's document
    uploads_ref = user_ref.collection("uploads").document(upload_id)

    # Check if the upload document already exists
    upload_doc = uploads_ref.get()

    if upload_doc.exists:
        # If the upload exists, update the document with the new status for the specific platform
        platform_data = {
            f"{platform}.status_code": status_code,
            f"{platform}.timestamp": datetime.datetime.now().isoformat(),
            f"{platform}.read": False,  # Mark it as unread initially
        }
        if title:  # Optionally update the title if provided
            platform_data["title"] = title

        # Update the existing document with the new platform data
        uploads_ref.update(platform_data)
    else:
        # Create a new upload entry if it doesn't exist, including the platform-specific data
        new_upload = {
            "upload_id": upload_id,
            "title": title if title else "Untitled",
            platform: {
                "status_code": status_code,
                "timestamp": datetime.datetime.now().isoformat(),
                "read": False,
            },
        }

        # Add the new upload document to the 'uploads' collection
        uploads_ref.set(new_upload)


# Integrate the status updates in the process_video_upload function
def process_video_upload(user_id: str, video_url: str, title: str, upload_id: str):

    db = firestore.Client()

    video_upload_status(db, user_id, upload_id, "twitter", 1, title)
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        logger.error("User document does not exist.")
        return {"error": "User document does not exist."}, 404

    user_data = user_doc.to_dict().get("socials", {}).get("twitter", {})

    # Check if all required Twitter data is present
    required_keys = ["oauthToken", "oauthTokenSecret", "twitterIdStr"]
    for key in required_keys:
        if key not in user_data:
            logger.error(f"Missing {key} in user_data.")
            return {"error": f"Missing {key} in user data."}, 400

    consumer_key = os.environ["TWITTER_CONSUMER_KEY"]
    consumer_secret = os.environ["TWITTER_CONSUMER_SECRET"]
    oauth_token = user_data["oauthToken"]

    oauth_token_secret = decrypt_token(user_data["oauthTokenSecret"])

    try:
        # Upload video to Twitter
        media_id = upload_video_to_twitter(
            oauth_token, oauth_token_secret, video_url, user_data["twitterIdStr"]
        )
        # Update status to UPLOADING
        video_upload_status(db, user_id, upload_id, "twitter", 2)
    except Exception as e:
        logger.error(f"Error uploading video to Twitter: {e}")
        # Update status to FAILED
        video_upload_status(db, user_id, upload_id, "twitter", 3)
        return {"error": "Error uploading video to Twitter"}, 500

    auth = OAuth1(consumer_key, consumer_secret, oauth_token, oauth_token_secret)

    tweet_data = {
        "text": title,
        "media": {
            "media_ids": [media_id],
        },
    }

    endpoint_url = "https://api.twitter.com/2/tweets"

    try:
        response = make_post(endpoint_url, tweet_data, auth)
        # Update status to SUCCESS
        video_upload_status(db, user_id, upload_id, "twitter", 4)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            logger.warning("Rate limited by Twitter API. Retrying once...")
            time.sleep(60)  # Wait for a minute before retrying
            try:
                response = make_post(endpoint_url, tweet_data, auth)
                # Update status to SUCCESS if retry works
                video_upload_status(db, user_id, upload_id, "twitter", 4)
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    logger.error("Rate limited by Twitter API again. Stopping process.")
                    # Update status to FAILED after repeated failure
                    video_upload_status(db, user_id, upload_id, "twitter", 3)
                    return {"error": "Rate limited by Twitter API"}, 429
                else:
                    logger.error(f"Failed at {endpoint_url}: {e.response.json()}")
                    video_upload_status(db, user_id, upload_id, "twitter", 3)
                    return {
                        "error": f"Failed at {endpoint_url}"
                    }, e.response.status_code
        else:
            logger.error(f"Failed at {endpoint_url}: {e.response.json()}")
            video_upload_status(db, user_id, upload_id, "twitter", 3)
            return {"error": f"Failed at {endpoint_url}"}, e.response.status_code

    return {
        "message": "Video uploaded and tweet posted successfully",
        "tweet_response": response,
    }, 200


def handle_video_post(request):
    try:
        # Verify the request is from Pub/Sub
        envelope = request.get_json()
        if not envelope:
            raise ValueError("Invalid Pub/Sub message format")

        # Decode the Pub/Sub message
        pubsub_message = envelope.get("message")
        if not pubsub_message:
            raise ValueError("Invalid Pub/Sub message format")

        data = base64.b64decode(pubsub_message.get("data")).decode("utf-8")

        # Process the message
        video_info = json.loads(data)
        user_id = video_info["user_id"]
        video_url = video_info["video_url"]
        title = video_info["title"]
        upload_id = video_info[
            "upload_id"
        ]  # Ensure upload_id is included in the Pub/Sub message

        # Pass the upload_id to the processing function
        result, status_code = process_video_upload(user_id, video_url, title, upload_id)
        return result, status_code

    except Exception as e:
        logger.error(f"Error processing message: {e}")
        return "Error processing message", 500
