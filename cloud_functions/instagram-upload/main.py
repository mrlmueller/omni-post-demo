import firebase_admin
from firebase_admin import credentials, storage as firebase_storage
from google.cloud import storage as gcs_storage
from google.oauth2 import service_account
from google.cloud import firestore
import os
import ffmpeg
import subprocess
import uuid
import base64
import json
import requests
import logging
import time
from flask import jsonify, make_response, request
from urllib.parse import unquote, urlparse
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from google.cloud import secretmanager
import datetime


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


# Initialize logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


# Firebase initialization
def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("omni-post-eu-f52a98911375.json")
        firebase_admin.initialize_app(
            cred, {"storageBucket": "omni-post-eu.appspot.com"}
        )


def initialize_firestore():
    db = firestore.Client()
    return db


def download_video_from_firebase(user_id, file_name, local_folder):
    try:
        firebase_file_path = f"videos/{user_id}/{file_name}"
        local_file_path = os.path.join(local_folder, file_name)

        bucket = firebase_storage.bucket()
        blob = bucket.blob(firebase_file_path)
        blob.download_to_filename(local_file_path)

        return local_file_path
    except Exception as e:
        print(f"Failed to download video from Firebase. Error: {e}")
        return None


def get_video_specs(video_path):
    try:
        probe = ffmpeg.probe(video_path)
        format_info = probe["format"]
        video_streams = [
            stream for stream in probe["streams"] if stream["codec_type"] == "video"
        ]
        audio_streams = [
            stream for stream in probe["streams"] if stream["codec_type"] == "audio"
        ]

        video_specs = {
            "container": format_info.get("format_name"),
            "duration": float(format_info.get("duration", 0)),
            "size": int(format_info.get("size", 0)),
            "bit_rate": int(format_info.get("bit_rate", 0)),
            "video_codec": video_streams[0]["codec_name"] if video_streams else None,
            "audio_codec": audio_streams[0]["codec_name"] if audio_streams else None,
            "frame_rate": (
                eval(video_streams[0]["r_frame_rate"]) if video_streams else None
            ),
            "resolution": (
                (video_streams[0]["width"], video_streams[0]["height"])
                if video_streams
                else None
            ),
            "video_bit_rate": (
                int(video_streams[0]["bit_rate"])
                if video_streams and "bit_rate" in video_streams[0]
                else None
            ),
            "audio_bit_rate": (
                int(audio_streams[0]["bit_rate"])
                if audio_streams and "bit_rate" in audio_streams[0]
                else None
            ),
            "sample_rate": (
                int(audio_streams[0]["sample_rate"]) if audio_streams else None
            ),
        }

        return video_specs
    except Exception as e:
        print(f"Failed to get video specs. Error: {e}")
        return None


def process_video(video_path, specs, output_path):
    try:
        args = ["ffmpeg", "-i", video_path]

        if "mp4" not in specs["container"]:
            args.extend(["-f", "mp4"])

        if specs["video_codec"] != "h264":
            args.extend(["-c:v", "h264"])

        width, height = specs["resolution"]
        if width != 1080 or height != 1920:
            args.extend(["-vf", "scale=1080:1920"])

        if specs["video_bit_rate"] and specs["video_bit_rate"] > 25000000:
            args.extend(["-b:v", "16M"])

        if specs["frame_rate"] and not (23 <= specs["frame_rate"] <= 60):
            args.extend(["-r", "30"])

        if specs["audio_codec"] != "aac":
            args.extend(["-c:a", "aac"])

        if specs["audio_bit_rate"] and specs["audio_bit_rate"] != 128000:
            args.extend(["-b:a", "100k"])

        if specs["sample_rate"] and specs["sample_rate"] != 48000:
            args.extend(["-ar", "48000"])

        args.append(output_path)

        # Run the ffmpeg command and redirect both stderr and stdout to /dev/null
        with open(os.devnull, "w") as f:
            subprocess.run(args, stdout=f, stderr=f, check=True)

    except Exception as e:
        print(f"Failed to process video. Error: {e}")


def upload_video_to_firebase(local_file_path, user_id, file_name):
    try:
        gcs_client = gcs_storage.Client()  # No credentials needed here
        bucket = gcs_client.bucket("omni-post-eu.appspot.com")
        blob = bucket.blob(f"videos/{user_id}/{file_name}")

        blob.upload_from_filename(local_file_path, timeout=600)

        access_token = str(uuid.uuid4())

        blob.metadata = {"firebaseStorageDownloadTokens": access_token}
        blob.patch()

        url = f'https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{blob.name.replace("/", "%2F")}?alt=media&token={access_token}'

        return url
    except Exception as e:
        print(f"Failed to upload video to Firebase. Error: {e}")
        return None


def update_video_in_firestore(db, user_id, original_url, processed_url):
    try:
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            print(f"User document with ID {user_id} does not exist.")
            return False

        user_data = user_doc.to_dict()
        videos = user_data.get("videos", [])

        video_updated = False
        for video in videos:
            if video.get("url") == original_url:
                video["processed_url"] = processed_url
                video_updated = True
                break

        if not video_updated:
            print(f"Video with URL {original_url} not found for user {user_id}.")
            return False

        user_ref.update({"videos": videos})

        return True
    except Exception as e:
        print(f"Failed to update Firestore. Error: {e}")
        return False


# Function to handle video processing
def handle_video_processing(video_url, user_id):
    initialize_firebase()
    db = initialize_firestore()

    local_folder = os.path.join(os.getcwd(), "temp")
    if not os.path.exists(local_folder):
        os.makedirs(local_folder)

    video_filename = os.path.basename(unquote(urlparse(video_url).path))
    local_video_path = os.path.join(local_folder, video_filename)

    try:
        if not os.path.exists(local_video_path):
            local_video_path = download_video_from_firebase(
                user_id, video_filename, local_folder
            )

        if local_video_path:
            video_specs = get_video_specs(local_video_path)
            if video_specs:
                processed_video_filename = video_filename.replace(".mp4", "_p.mp4")
                processed_video_path = os.path.join(
                    local_folder, processed_video_filename
                )

                process_video(local_video_path, video_specs, processed_video_path)
                processed_url = upload_video_to_firebase(
                    processed_video_path, user_id, processed_video_filename
                )

                if processed_url:
                    update_successful = update_video_in_firestore(
                        db, user_id, video_url, processed_url
                    )
                    if not update_successful:
                        logging.error(f"Failed to update Firestore for user {user_id}.")
                    return processed_url
                else:
                    logging.error("Failed to upload processed video.")
                    return None
            else:
                logging.error("Failed to retrieve video specs.")
                return None
        else:
            logging.error("Video download failed.")
            return None
    except Exception as e:
        logging.error(f"Error during video processing: {e}")
        return None
    finally:
        if os.path.exists(local_video_path):
            os.remove(local_video_path)
        if os.path.exists(processed_video_path):
            os.remove(processed_video_path)


def decrypt_token(encrypted_token: str) -> str:
    try:
        # Get the secret key from Google Secret Manager
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        secret_key_base64 = response.payload.data.decode("UTF-8")
        logging.info("Retrieved secret key from Secret Manager.")

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
        logging.info("Decryption successful.")
        return decrypted_token.decode("utf-8")

    except ValueError as ve:
        logging.exception(f"ValueError during decryption: {ve}")
    except Exception as e:
        logging.exception(f"Unexpected error during decryption: {e}")
    return None


def check_status(container_id, access_token):
    try:
        logging.info(f"Checking status for container_id: {container_id}")
        status_url = f"https://graph.facebook.com/{container_id}"
        params = {"fields": "status_code", "access_token": access_token}
        logging.debug(f"Status request URL: {status_url}, params: {params}")
        status_response = requests.get(status_url, params=params)
        logging.info(f"Status response status code: {status_response.status_code}")
        status_response.raise_for_status()
        status_data = status_response.json()
        logging.debug(f"Status response data: {status_data}")
        if "error" in status_data:
            logging.error(f"Error checking status: {status_data['error']}")
            raise Exception(status_data["error"]["message"])
        return status_data.get("status_code")
    except requests.exceptions.RequestException as e:
        logging.error(f"RequestException while checking status: {e}")
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
        logging.info(f"Media response status code: {media_response.status_code}")
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

        # Update status to UPLOADING (optional, implement if needed)
        # video_upload_status(db, user_id, upload_id, 'instagram', 2)
        # logging.info("Updated upload status to UPLOADING.")

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
            logging.info(
                f"Publish response status code: {publish_response.status_code}"
            )
            publish_response_data = publish_response.json()
            logging.debug(f"Publish response data: {publish_response_data}")

            if "error" in publish_response_data:
                logging.error(
                    f"Error publishing media: {publish_response_data['error']}"
                )
                return {"success": False, "error": publish_response_data["error"]}

            return {"success": True}

        else:
            logging.error(f"Unexpected status: {status}")
            return {"success": False, "error": f"Unexpected status: {status}"}

    except Exception as e:
        logging.exception("An error occurred during the Instagram upload.")
        return {"success": False, "error": str(e)}


def get_page_access_token(user_access_token, page_id):
    try:
        base_url = f"https://graph.facebook.com/v21.0/{page_id}"
        params = {"access_token": user_access_token, "fields": "access_token"}
        response = requests.get(base_url, params=params)
        logging.info(
            f"Get page access token response status code: {response.status_code}"
        )
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


def upload_video_to_facebook(page_id, user_access_token, video_url, description):
    try:
        # Get the page access token
        page_access_token = get_page_access_token(user_access_token, page_id)
        if not page_access_token:
            logging.error("Failed to get page access token.")
            return {"success": False, "error": "Failed to get page access token."}

        # Step 1: Initialize an upload session
        init_url = f"https://graph.facebook.com/v21.0/{page_id}/video_reels"
        init_params = {"upload_phase": "start", "access_token": page_access_token}
        logging.info(f"Initializing upload session for page_id: {page_id}")
        init_response = requests.post(init_url, data=init_params)
        logging.info(
            f"Upload session response status code: {init_response.status_code}"
        )
        init_data = init_response.json()
        logging.debug(f"Upload session response data: {init_data}")

        if init_response.status_code != 200 or "video_id" not in init_data:
            logging.error(
                f"Failed to initialize upload session: {init_response.status_code} - {init_response.text}"
            )
            return {"success": False, "error": "Failed to initialize upload session."}

        video_id = init_data["video_id"]
        logging.info(f"Upload session initialized successfully, video_id: {video_id}")

        # Step 2: Upload the Video (Hosted File)
        upload_endpoint = f"https://rupload.facebook.com/video-upload/v21.0/{video_id}"
        upload_headers = {
            "Authorization": f"OAuth {page_access_token}",
            "file_url": video_url,
        }
        logging.info(f"Uploading video to Facebook via upload_url")
        upload_response = requests.post(upload_endpoint, headers=upload_headers)
        logging.info(
            f"Video upload response status code: {upload_response.status_code}"
        )
        upload_data = upload_response.json()
        logging.debug(f"Video upload response data: {upload_data}")

        if upload_response.status_code != 200 or not upload_data.get("success"):
            logging.error(
                f"Failed to upload video: {upload_response.status_code} - {upload_response.text}"
            )
            return {"success": False, "error": "Failed to upload video."}

        # Step 3: Publish the Reel
        publish_url = f"https://graph.facebook.com/v21.0/{page_id}/video_reels"
        publish_params = {
            "access_token": page_access_token,
            "upload_phase": "finish",
            "video_id": video_id,
            "video_state": "PUBLISHED",
            "description": description,
        }
        logging.info(f"Publishing reel for page_id: {page_id}, video_id: {video_id}")
        publish_response = requests.post(publish_url, data=publish_params)
        logging.info(
            f"Reel publish response status code: {publish_response.status_code}"
        )
        publish_data = publish_response.json()
        logging.debug(f"Reel publish response data: {publish_data}")

        if publish_response.status_code == 200 and publish_data.get("success"):
            logging.info("Reel published successfully.")
            return {"success": True}
        else:
            logging.error(
                f"Failed to publish reel: {publish_response.status_code} - {publish_response.text}"
            )
            return {"success": False, "error": "Failed to publish reel."}

    except Exception as e:
        logging.exception("An error occurred while uploading the video to Facebook.")
        return {"success": False, "error": str(e)}


def process_video_upload(
    user_id, video_url, title, upload_id, upload_to_facebook=False
):
    try:
        logging.info(
            f"Starting process_video_upload for user_id: {user_id}, upload_id: {upload_id}, title: {title}"
        )
        db = firestore.Client()

        # Update status to PROCESSING
        video_upload_status(db, user_id, upload_id, "instagram", 1, title)
        logging.info("Updated upload status to PROCESSING.")

        # Fetch user data from Firestore
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        logging.info(f"Fetched user document for user_id: {user_id}")

        if not user_doc.exists:
            logging.error(f"User document with user_id {user_id} does not exist.")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return {
                "error": f"User document with user_id {user_id} does not exist."
            }, 404

        user_data = user_doc.to_dict().get("socials", {}).get("instagram", {})
        logging.info(f"Retrieved user_data: {user_data}")

        instagram_id = user_data.get("instagramId")
        encrypted_access_token = user_data.get("accessToken")
        facebook_page_id = user_data.get(
            "facebookPageId"
        )  # Retrieve the Facebook Page ID
        logging.info(
            f"Retrieved instagram_id: {instagram_id}, encrypted_access_token_present: {bool(encrypted_access_token)}"
        )

        if not instagram_id or not encrypted_access_token:
            logging.error("Instagram credentials are missing.")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return {"error": "Instagram credentials are missing."}, 400

        access_token = decrypt_token(encrypted_access_token)
        if not access_token:
            logging.error("Failed to decrypt access token.")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return {"error": "Failed to decrypt access token."}, 400

        # Perform Instagram video upload
        instagram_result = upload_video_to_instagram(
            instagram_id, access_token, video_url, title
        )
        if not instagram_result["success"]:
            logging.error(f"Instagram upload failed: {instagram_result['error']}")
            video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
            return {
                "error": "Instagram upload failed.",
                "details": instagram_result["error"],
            }, 500

        # If upload to Facebook is requested, proceed with the Facebook upload
        if upload_to_facebook and facebook_page_id:
            logging.info("Uploading video to Facebook.")
            facebook_result = upload_video_to_facebook(
                facebook_page_id, access_token, video_url, title
            )
            if not facebook_result["success"]:
                logging.error(f"Facebook upload failed: {facebook_result['error']}")
                video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
                return {
                    "error": "Facebook upload failed.",
                    "details": facebook_result["error"],
                }, 500

        # Update status to SUCCESS
        video_upload_status(db, user_id, upload_id, "instagram", 4)  # SUCCESS
        logging.info("Updated upload status to SUCCESS.")
        return {
            "message": "Video published successfully on Instagram and Facebook"
        }, 200

    except Exception as e:
        logging.exception("An unexpected error occurred in process_video_upload.")
        video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
        return {"error": f"Error processing video upload: {str(e)}"}, 500


# Main function to handle the complete flow
def upload_video(request):
    logging.info("Started processing the request")
    start_time = time.time()

    if request.method != "POST":
        return make_response(
            jsonify({"error": "Invalid request method. Only POST is allowed."}), 405
        )

    envelope = request.get_json(silent=True)
    if envelope is None or "message" not in envelope:
        return make_response(jsonify({"error": "Invalid JSON payload."}), 400)

    message = envelope["message"]

    if "data" not in message:
        return make_response(
            jsonify({"error": "Data field is missing in the message."}), 400
        )

    try:
        decoded_data = base64.b64decode(message["data"]).decode("utf-8")
        payload = json.loads(decoded_data)
    except Exception as e:
        return make_response(jsonify({"error": f"Error decoding data: {e}"}), 400)

    user_id = payload.get("user_id")
    video_url = payload.get("video_url")
    title = payload.get("title")
    upload_id = payload.get(
        "upload_id"
    )  # Ensure upload_id is included in the Pub/Sub message
    upload_to_facebook = payload.get("upload_to_facebook", False)

    if not user_id or not video_url or not title or not upload_id:
        return make_response(
            jsonify(
                {
                    "error": "Missing user_id, video_url, title, or upload_id in the payload."
                }
            ),
            400,
        )

    try:
        db = initialize_firestore()
        video_upload_status(db, user_id, upload_id, "instagram", 1)
        doc_ref = db.collection("videos").document(user_id)
        doc = doc_ref.get()
        if doc.exists and "processed_video_url" in doc.to_dict():
            processed_video_url = doc.to_dict()["processed_video_url"]
        else:
            processed_video_url = handle_video_processing(video_url, user_id)
            if not processed_video_url:
                video_upload_status(db, user_id, upload_id, "instagram", 3)  # FAILED
                return make_response(
                    jsonify({"error": "Video processing failed."}), 500
                )

        result, status_code = process_video_upload(
            user_id, processed_video_url, title, upload_id, upload_to_facebook
        )
        logging.info(f"Function execution time: {time.time() - start_time:.4f} seconds")
        return make_response(jsonify(result), status_code)

    except Exception as e:
        logging.exception("Error processing request.")
        return make_response(
            jsonify({"error": f"Error processing request: {str(e)}"}), 500
        )
