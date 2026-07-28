import base64
import json
import logging
import requests
import time
from google.cloud import firestore
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager

# Initialize logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)


def decrypt_token(encrypted_token: str) -> str:
    try:
        logging.debug("Starting token decryption.")
        # Get the secret key from Google Secret Manager
        client = secretmanager.SecretManagerServiceClient()
        name = "projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        secret_key_base64 = response.payload.data.decode("UTF-8")
        logging.debug("Retrieved secret key from Secret Manager.")

        # Split the encrypted data into IV, ciphertext, and auth tag
        iv_base64, ciphertext_base64, auth_tag_base64 = encrypted_token.split(":")
        logging.debug(
            f"Encrypted token components - IV: {iv_base64}, Ciphertext: {ciphertext_base64}, Auth Tag: {auth_tag_base64}"
        )

        # Decode the base64-encoded components
        iv = base64.b64decode(iv_base64)
        ciphertext = base64.b64decode(ciphertext_base64)
        auth_tag = base64.b64decode(auth_tag_base64)

        # Decode the secret key from base64
        secret_key = base64.b64decode(secret_key_base64)
        logging.debug("Decoded secret key.")

        # Check the length of the secret key
        if len(secret_key) != 32:
            logging.error(
                f"Invalid secret key length: {len(secret_key)} bytes. Expected 32 bytes."
            )
            raise ValueError("Invalid secret key length")

        # Initialize AESGCM with the secret key
        aesgcm = AESGCM(secret_key)

        # Combine ciphertext and auth tag, then decrypt
        decrypted_token = aesgcm.decrypt(iv, ciphertext + auth_tag, None)

        # Return the decrypted token as a UTF-8 string
        logging.debug("Decryption successful.")
        return decrypted_token.decode("utf-8")

    except ValueError as ve:
        logging.exception(f"ValueError during decryption: {ve}")
    except Exception as e:
        logging.exception(f"Unexpected error during decryption: {e}")
    return None


def check_status(container_id, access_token):
    try:
        logging.info(f"Checking status for container_id: {container_id}")
        status_url = f"https://graph.facebook.com/v19.0/{container_id}"
        params = {"fields": "status_code", "access_token": access_token}
        status_response = requests.get(status_url, params=params)
        logging.debug(f"Status response: {status_response.text}")
        status_response.raise_for_status()
        status_data = status_response.json()

        if "error" in status_data:
            logging.error(f"Error details: {status_data['error']}")
            raise Exception(status_data["error"].get("message", "Unknown error"))

        return status_data.get("status_code")
    except requests.exceptions.RequestException as e:
        logging.exception(f"RequestException while checking status: {e}")
        raise


def upload_video_to_instagram(instagram_id, access_token, video_url, title):
    try:
        media_url = f"https://graph.facebook.com/v19.0/{instagram_id}/media"
        media_data = {
            "video_url": video_url,
            "caption": title,
            "media_type": "REELS",
            "access_token": access_token,
        }
        logging.info(f"Sending media creation request to URL: {media_url}")
        logging.debug(
            f"Media request data (excluding access_token): { {k: v for k, v in media_data.items() if k != 'access_token'} }"
        )
        media_response = requests.post(media_url, data=media_data)
        logging.debug(f"Media response: {media_response.text}")
        media_response_data = media_response.json()
        logging.debug(f"Media response data: {media_response_data}")

        if "error" in media_response_data:
            logging.error(
                f"Error creating media container: {media_response_data['error']}"
            )
            return {"success": False, "error": media_response_data["error"]}

        container_id = media_response_data.get("id")
        if not container_id:
            logging.error("No container_id returned from media creation.")
            return {
                "success": False,
                "error": "No container_id returned from media creation.",
            }
        logging.info(f"Media container created with id: {container_id}")

        # Update status to UPLOADING
        # Note: You may need to pass db, user_id, upload_id to this function
        # video_upload_status(db, user_id, upload_id, "instagram", 2)

        # Check status and wait until it's finished
        status = check_status(container_id, access_token)
        logging.info(f"Initial status: {status}")
        while status == "IN_PROGRESS":
            logging.info(
                "Status is IN_PROGRESS, waiting for 3 seconds before checking again."
            )
            time.sleep(3)
            status = check_status(container_id, access_token)
            logging.info(f"Checked status: {status}")

        if status == "FINISHED":
            # Publish the media
            publish_url = (
                f"https://graph.facebook.com/v19.0/{instagram_id}/media_publish"
            )
            publish_data = {
                "creation_id": container_id,
                "access_token": access_token,
            }
            logging.info(f"Publishing media with container_id: {container_id}")
            logging.debug(
                f"Publish request data (excluding access_token): { {k: v for k, v in publish_data.items() if k != 'access_token'} }"
            )
            publish_response = requests.post(publish_url, data=publish_data)
            logging.debug(f"Publish response: {publish_response.text}")
            publish_response_data = publish_response.json()
            logging.debug(f"Publish response data: {publish_response_data}")

            if "error" in publish_response_data:
                logging.error(
                    f"Error publishing media: {publish_response_data['error']}"
                )
                return {"success": False, "error": publish_response_data["error"]}

            logging.info("Media published successfully.")
            return {
                "success": True,
                "instagramMediaId": publish_response_data.get("id"),
            }

        elif status in ["EXPIRED", "ERROR", "RATE_LIMITED"]:
            logging.error(f"Cannot publish media: {status}")
            return {"success": False, "error": f"Cannot publish media: {status}"}

        elif status == "PUBLISHED":
            logging.info("Media has already been published.")
            return {"success": True, "message": "Media has already been published"}

        else:
            logging.error(f"Unexpected status: {status}")
            return {"success": False, "error": f"Unexpected status: {status}"}

    except Exception as e:
        logging.exception("An error occurred during the Instagram upload.")
        return {"success": False, "error": str(e)}


def instagram_upload(event, context):
    logging.info("Started Instagram upload function")

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
        video_upload_status(db, user_id, upload_id, "instagram", 2, title)
        logging.info("Updated upload status to PROCESSING.")

        # Fetch user data from Firestore
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        logging.info(f"Fetched user document for user_id: {user_id}")

        if not user_doc.exists:
            logging.error(f"User document with user_id {user_id} does not exist.")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return

        user_data = user_doc.to_dict().get("socials", {}).get("instagram", {})
        logging.debug(f"Retrieved user_data: {user_data}")

        instagram_id = user_data.get("instagramId")
        encrypted_access_token = user_data.get("accessToken")

        if not instagram_id or not encrypted_access_token:
            logging.error("Instagram credentials are missing.")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return

        access_token = decrypt_token(encrypted_access_token)
        if not access_token:
            logging.error("Failed to decrypt access token.")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return

        # Perform Instagram video upload
        instagram_result = upload_video_to_instagram(
            instagram_id, access_token, video_url, title
        )
        if not instagram_result["success"]:
            logging.error(f"Instagram upload failed: {instagram_result['error']}")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return

        # Update status to SUCCESS
        video_upload_status(db, user_id, upload_id, "instagram", 4)  # SUCCESS
        logging.info("Updated upload status to SUCCESS.")

    except Exception as e:
        logging.exception("An unexpected error occurred in instagram_upload.")
        video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
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
