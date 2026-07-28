import base64
import json
import logging
import requests
import time
from google.cloud import firestore
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager
import os

# Initialize logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)


def decrypt_token(encrypted_token: str) -> str:
    try:
        # Get the secret key from Google Secret Manager
        client = secretmanager.SecretManagerServiceClient()
        name = "projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        secret_key_base64 = response.payload.data.decode("UTF-8")
        logging.debug("Retrieved secret key from Secret Manager.")

        iv_base64, ciphertext_base64, auth_tag_base64 = encrypted_token.split(":")
        logging.debug(
            f"Encrypted token components - IV: {iv_base64}, Ciphertext: {ciphertext_base64}, Auth Tag: {auth_tag_base64}"
        )

        iv = base64.b64decode(iv_base64)
        ciphertext = base64.b64decode(ciphertext_base64)
        auth_tag = base64.b64decode(auth_tag_base64)

        secret_key = base64.b64decode(secret_key_base64)
        logging.debug("Decoded secret key.")

        if len(secret_key) != 32:
            logging.error(
                f"Invalid secret key length: {len(secret_key)} bytes. Expected 32 bytes."
            )
            raise ValueError("Invalid secret key length")

        aesgcm = AESGCM(secret_key)

        decrypted_token = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        return decrypted_token.decode("utf-8")

    except ValueError as ve:
        logging.exception(f"ValueError during decryption: {ve}")
    except Exception as e:
        logging.exception(f"Unexpected error during decryption: {e}")
    return None


def get_page_access_token(user_access_token, page_id):
    try:
        logging.info(f"Getting page access token for page_id: {page_id}")
        base_url = f"https://graph.facebook.com/v19.0/{page_id}"
        params = {"access_token": user_access_token, "fields": "access_token"}
        logging.debug(f"Requesting page access token with params: {params}")
        response = requests.get(base_url, params=params)
        logging.debug(f"Page access token response: {response.text}")
        if response.status_code == 200:
            logging.info("Successfully retrieved page access token.")
            return response.json().get("access_token")
        else:
            logging.error(
                f"Error fetching page access token: {response.status_code} - {response.text}"
            )
            return None
    except Exception as e:
        logging.exception("An error occurred while getting the page access token.")
        return None


def initialize_upload_session(page_access_token, page_id):
    url = f"https://graph.facebook.com/v21.0/{page_id}/video_reels"
    headers = {"Content-Type": "application/json"}
    params = {"upload_phase": "start", "access_token": page_access_token}
    response = requests.post(url, headers=headers, json=params)
    logging.debug(f"Initialize upload session response: {response.text}")

    if response.status_code == 200:
        data = response.json()
        video_id = data.get("video_id")
        upload_url = data.get("upload_url")
        return video_id, upload_url
    else:
        logging.error(f"Error initializing upload session: {response.status_code}")
        logging.error(response.text)
        return None, None


def upload_video_chunk(upload_url, page_access_token, video_file_path):
    try:
        file_size = os.path.getsize(video_file_path)
        headers = {
            "Authorization": f"OAuth {page_access_token}",
            "offset": "0",
            "file_size": str(file_size),
        }

        logging.info(f"Uploading video chunk. File size: {file_size} bytes.")

        with open(video_file_path, "rb") as video_file:
            response = requests.post(upload_url, headers=headers, data=video_file)
            logging.debug(
                f"Upload video chunk response status code: {response.status_code}"
            )
            logging.debug(f"Upload video chunk response headers: {response.headers}")
            logging.debug(f"Upload video chunk response text: {response.text}")

        if response.status_code == 200 and response.json().get("success"):
            logging.info("Video chunk uploaded successfully.")
            return True
        else:
            logging.error(f"Error uploading video: {response.status_code}")
            logging.error(f"Response content: {response.text}")
            return False
    except Exception as e:
        logging.exception("An exception occurred during video chunk upload.")
        return False


def publish_reel(page_access_token, page_id, video_id, description):
    url = f"https://graph.facebook.com/v21.0/{page_id}/video_reels"
    params = {
        "access_token": page_access_token,
        "upload_phase": "finish",
        "video_id": video_id,
        "video_state": "PUBLISHED",
        "description": description,
    }

    response = requests.post(url, params=params)
    logging.debug(f"Publish reel response: {response.text}")

    if response.status_code == 200 and response.json().get("success"):
        logging.info("Reel published successfully.")
        return True
    else:
        logging.error(f"Error publishing reel: {response.status_code}")
        logging.error(response.text)
        return False


def upload_video_to_facebook(page_id, user_access_token, video_url, description):
    try:
        # Get the page access token
        page_access_token = get_page_access_token(user_access_token, page_id)
        if not page_access_token:
            logging.error("Failed to get page access token.")
            return {"success": False, "error": "Failed to get page access token."}

        # Download the video to a local file
        local_video_path = "/tmp/temp_video.mp4"
        logging.info(f"Downloading video from {video_url}")
        response = requests.get(video_url, stream=True)
        if response.status_code == 200:
            with open(local_video_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            logging.info(f"Video downloaded to {local_video_path}")
        else:
            logging.error(
                f"Failed to download video. Status code: {response.status_code}"
            )
            logging.error(f"Response content: {response.text}")
            return {"success": False, "error": "Failed to download video."}

        # Initialize the upload session
        video_id, upload_url = initialize_upload_session(page_access_token, page_id)
        if not video_id or not upload_url:
            logging.error("Failed to initialize upload session.")
            return {"success": False, "error": "Failed to initialize upload session."}

        # Upload the video chunk
        if not upload_video_chunk(upload_url, page_access_token, local_video_path):
            logging.error("Failed to upload video chunk.")
            return {"success": False, "error": "Failed to upload video chunk."}

        # Publish the reel
        if not publish_reel(page_access_token, page_id, video_id, description):
            logging.error("Failed to publish reel.")
            return {"success": False, "error": "Failed to publish reel."}

        logging.info("Video uploaded and reel published successfully.")
        return {"success": True}

    except Exception as e:
        logging.exception("An error occurred while uploading the video to Facebook.")
        return {"success": False, "error": str(e)}
    finally:
        if os.path.exists(local_video_path):
            os.remove(local_video_path)
            logging.debug(f"Deleted local video file {local_video_path}.")


def facebook_upload(event, context):
    logging.info("Started Facebook upload function")

    try:
        message = base64.b64decode(event["data"]).decode("utf-8")
        logging.debug(f"Decoded message: {message}")
        payload = json.loads(message)
        logging.debug(f"Payload: {payload}")

        user_id = payload.get("user_id")
        video_url = payload.get("video_url")
        title = payload.get("title")
        upload_id = payload.get("upload_id")

        if not user_id or not video_url or not title or not upload_id:
            logging.error("Missing required fields in the payload.")
            return

        db = firestore.Client()
        logging.debug("Firestore client initialized.")

        # Update status to PROCESSING
        video_upload_status(db, user_id, upload_id, "facebook", 2, title)
        logging.info("Updated upload status to PROCESSING.")

        # Fetch user data from Firestore
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        logging.info(f"Fetched user document for user_id: {user_id}")

        if not user_doc.exists:
            logging.error(f"User document with user_id {user_id} does not exist.")
            video_upload_status(db, user_id, upload_id, "facebook", 3)  # FAILED
            return

        user_data = user_doc.to_dict().get("socials", {}).get("instagram", {})
        logging.debug(f"Retrieved user_data: {user_data}")

        facebook_page_id = user_data.get("facebookPageId")
        encrypted_access_token = user_data.get("accessToken")

        if not facebook_page_id or not encrypted_access_token:
            logging.error("Facebook credentials are missing.")
            video_upload_status(db, user_id, upload_id, "facebook", 3)  # FAILED
            return

        access_token = decrypt_token(encrypted_access_token)
        if not access_token:
            logging.error("Failed to decrypt access token.")
            video_upload_status(db, user_id, upload_id, "facebook", 3)  # FAILED
            return

        # Perform Facebook video upload
        facebook_result = upload_video_to_facebook(
            facebook_page_id, access_token, video_url, title
        )
        if not facebook_result["success"]:
            logging.error(f"Facebook upload failed: {facebook_result['error']}")
            video_upload_status(db, user_id, upload_id, "facebook", 3)  # FAILED
            return

        # Update status to SUCCESS
        video_upload_status(db, user_id, upload_id, "facebook", 4)  # SUCCESS
        logging.info("Updated upload status to SUCCESS.")

    except Exception as e:
        logging.exception("An unexpected error occurred in facebook_upload.")
        video_upload_status(db, user_id, upload_id, "facebook", 3)  # FAILED
        return


def video_upload_status(db, user_id, upload_id, platform, status_code, title=None):
    try:
        logging.debug(
            f"Updating upload status for {platform}, status_code: {status_code}"
        )
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

        platform_data = {
            f"{platform}.status_code": status_code,
            f"{platform}.timestamp": firestore.SERVER_TIMESTAMP,
            f"{platform}.read": False,  # Mark it as unread initially
        }
        if title:  # Optionally update the title if provided
            platform_data["title"] = title

        if upload_doc.exists:
            # Update the existing document with the new platform data
            logging.debug("Upload document exists. Updating platform data.")
            uploads_ref.update(platform_data)
        else:
            # Create a new upload entry if it doesn't exist
            logging.debug("Upload document does not exist. Creating new document.")
            new_upload = {
                "upload_id": upload_id,
                "title": title if title else "Untitled",
                platform: {
                    "status_code": status_code,
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "read": False,
                },
            }
            uploads_ref.set(new_upload)
        logging.debug("Upload status updated successfully.")
    except Exception as e:
        logging.exception(f"Failed to update upload status. Error: {e}")
