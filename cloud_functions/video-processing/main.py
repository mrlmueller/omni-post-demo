import base64
import json
import logging
import os
import subprocess
import time
import uuid
from urllib.parse import unquote, urlparse

import ffmpeg
import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage as firebase_storage
from flask import jsonify, make_response, request
from google.cloud import firestore, pubsub_v1
from google.cloud import storage as gcs_storage

# Initialize logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)


# Firebase initialization
def initialize_firebase():
    if not firebase_admin._apps:
        logging.debug("Initializing Firebase Admin SDK.")
        # Use default credentials
        firebase_admin.initialize_app(
            options={"storageBucket": "omni-post-eu.appspot.com"}
        )
        logging.debug("Firebase initialized.")


def initialize_firestore():
    logging.debug("Initializing Firestore client.")
    db = firestore.Client()
    logging.debug("Firestore client initialized.")
    return db


def download_video_from_firebase(user_id, file_name, local_folder):
    try:
        logging.debug(f"Starting download of video {file_name} for user {user_id}.")
        firebase_file_path = f"videos/{user_id}/{file_name}"
        local_file_path = os.path.join(local_folder, file_name)

        bucket = firebase_storage.bucket()
        blob = bucket.blob(firebase_file_path)
        blob.download_to_filename(local_file_path)

        return local_file_path
    except Exception as e:
        logging.exception(f"Failed to download video from Firebase. Error: {e}")
        return None


def get_video_specs(video_path):
    try:
        logging.debug(f"Probing video file {video_path}.")
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

        logging.debug(f"Video specs: {video_specs}")
        return video_specs
    except Exception as e:
        logging.exception(f"Failed to get video specs. Error: {e}")
        return None


def process_video(video_path, specs, output_path):
    try:
        logging.debug(f"Starting video processing for {video_path}.")
        args = ["ffmpeg", "-y", "-i", video_path]

        if "mp4" not in specs["container"]:
            args.extend(["-f", "mp4"])
            logging.debug("Adding container format conversion to mp4.")

        if specs["video_codec"] != "h264":
            args.extend(["-c:v", "h264"])
            logging.debug("Converting video codec to h264.")

        width, height = specs["resolution"]

        # --- Original Code (Comment this block to use the new aspect ratio adjustment) ---
        # if width != 1080 or height != 1920:
        #     args.extend(["-vf", "scale=1080:1920"])
        #     logging.debug("Rescaling video to 1080x1920.")
        # -------------------------------------------------------------------------------

        # --- New Code to Adjust Aspect Ratio to 9:16 ---
        # To revert back to the original code, comment out this block and uncomment the original code above.
        current_aspect_ratio = width / height
        target_aspect_ratio = 9 / 16

        if abs(current_aspect_ratio - target_aspect_ratio) > 0.01:
            logging.debug("Adjusting video to 9:16 aspect ratio.")

            # Build the ffmpeg filter
            vf_filter = (
                "scale='if(gt(a,9/16),1080,-2)':'if(gt(a,9/16),-2,1920)',"
                "pad=1080:1920:(ow-iw)/2:(oh-ih)/2"
            )
            args.extend(["-vf", vf_filter])
            logging.debug(f"Applying video filter: {vf_filter}")
        else:
            # Video is already 9:16, but check resolution
            if width != 1080 or height != 1920:
                args.extend(["-vf", "scale=1080:1920"])
                logging.debug("Rescaling video to 1080x1920.")
        # -------------------------------------------------

        if specs["video_bit_rate"] and specs["video_bit_rate"] > 25000000:
            args.extend(["-b:v", "16M"])
            logging.debug("Adjusting video bitrate to 16M.")

        if specs["frame_rate"] and not (23 <= specs["frame_rate"] <= 60):
            args.extend(["-r", "30"])
            logging.debug("Adjusting frame rate to 30 fps.")

        if specs["audio_codec"] != "aac":
            args.extend(["-c:a", "aac"])
            logging.debug("Converting audio codec to aac.")

        if specs["audio_bit_rate"] and specs["audio_bit_rate"] != 128000:
            args.extend(["-b:a", "100k"])
            logging.debug("Adjusting audio bitrate to 100k.")

        if specs["sample_rate"] and specs["sample_rate"] != 48000:
            args.extend(["-ar", "48000"])
            logging.debug("Adjusting audio sample rate to 48000 Hz.")

        args.append(output_path)

        # Run the ffmpeg command and capture output
        result = subprocess.run(
            args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        if result.returncode != 0:
            logging.error(f"ffmpeg error: {result.stderr}")
            raise Exception("ffmpeg processing failed.")

    except Exception as e:
        logging.exception(f"Failed to process video. Error: {e}")
        raise


def upload_video_to_firebase(local_file_path, user_id, file_name):
    try:
        logging.debug(f"Uploading {local_file_path} to Firebase Storage.")
        gcs_client = gcs_storage.Client()
        bucket = gcs_client.bucket("omni-post-eu.appspot.com")
        blob = bucket.blob(f"videos/{user_id}/{file_name}")

        blob.upload_from_filename(local_file_path, timeout=600)

        access_token = str(uuid.uuid4())

        blob.metadata = {"firebaseStorageDownloadTokens": access_token}
        blob.patch()

        url = f'https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{blob.name.replace("/", "%2F")}?alt=media&token={access_token}'

        logging.debug(f"Generated download URL: {url}")
        return url
    except Exception as e:
        logging.exception(f"Failed to upload video to Firebase. Error: {e}")
        return None


def publish_to_pubsub(topic_name, message):
    try:
        logging.debug(f"Publishing message to Pub/Sub topic {topic_name}.")
        publisher = pubsub_v1.PublisherClient()
        project_id = "omni-post-eu"
        topic_path = publisher.topic_path(project_id, topic_name)
        message_bytes = json.dumps(message).encode("utf-8")
        future = publisher.publish(topic_path, data=message_bytes)
        message_id = future.result()
        return message_id
    except Exception as e:
        logging.exception(f"Failed to publish message to Pub/Sub. Error: {e}")


def handle_video_processing(user_id, video_url, title, upload_id, attributes):
    initialize_firebase()
    db = initialize_firestore()

    # Set initial processing status based on attributes
    if attributes.get("instagram") == "true":

        video_upload_status(db, user_id, upload_id, "instagram", 1)
    if attributes.get("facebook") == "true":

        video_upload_status(db, user_id, upload_id, "facebook", 1)

    local_folder = os.path.join(os.getcwd(), "temp")
    if not os.path.exists(local_folder):
        os.makedirs(local_folder)
        logging.debug(f"Created temporary directory at {local_folder}.")

    video_filename = os.path.basename(unquote(urlparse(video_url).path))
    local_video_path = os.path.join(local_folder, video_filename)
    logging.debug(f"Local video path: {local_video_path}")

    try:
        # Download and process the video
        if not os.path.exists(local_video_path):
            local_video_path = download_video_from_firebase(
                user_id, video_filename, local_folder
            )
            if not local_video_path:
                logging.error("Failed to download the video from Firebase.")
                # Set failed status
                if attributes.get("instagram") == "true":
                    video_upload_status(db, user_id, upload_id, "instagram", 3)
                if attributes.get("facebook") == "true":
                    video_upload_status(db, user_id, upload_id, "facebook", 3)
                return False

        video_specs = get_video_specs(local_video_path)
        if not video_specs:
            logging.error("Failed to get video specs.")
            # Set failed status
            if attributes.get("instagram") == "true":
                video_upload_status(db, user_id, upload_id, "instagram", 3)
            if attributes.get("facebook") == "true":
                video_upload_status(db, user_id, upload_id, "facebook", 3)
            return False

        processed_video_filename = video_filename.replace(".mp4", "_p.mp4")
        processed_video_path = os.path.join(local_folder, processed_video_filename)

        process_video(local_video_path, video_specs, processed_video_path)

        processed_url = upload_video_to_firebase(
            processed_video_path, user_id, processed_video_filename
        )
        if not processed_url:
            logging.error("Failed to upload processed video.")
            # Set failed status
            if attributes.get("instagram") == "true":
                video_upload_status(db, user_id, upload_id, "instagram", 3)
            if attributes.get("facebook") == "true":
                video_upload_status(db, user_id, upload_id, "facebook", 3)
            return False

        # Publish message to Instagram upload function if selected
        if attributes.get("instagram") == "true":
            instagram_message = {
                "user_id": user_id,
                "video_url": processed_url,
                "title": title,
                "upload_id": upload_id,
            }
            publish_to_pubsub("instagram-upload-topic", instagram_message)

        # Publish message to Facebook upload function if selected
        if attributes.get("facebook") == "true":
            facebook_message = {
                "user_id": user_id,
                "video_url": processed_url,
                "title": title,
                "upload_id": upload_id,
            }
            publish_to_pubsub("facebook-upload-topic", facebook_message)

        return True

    except Exception as e:
        logging.exception(f"Error during video processing: {e}")
        # Set failed status
        if attributes.get("instagram") == "true":
            video_upload_status(db, user_id, upload_id, "instagram", 3)
        if attributes.get("facebook") == "true":
            video_upload_status(db, user_id, upload_id, "facebook", 3)
        return False
    finally:
        if os.path.exists(local_video_path):
            os.remove(local_video_path)
            logging.debug(f"Deleted local video file {local_video_path}.")
        processed_video_path = os.path.join(
            local_folder, video_filename.replace(".mp4", "_p.mp4")
        )
        if os.path.exists(processed_video_path):
            os.remove(processed_video_path)
            logging.debug(f"Deleted processed video file {processed_video_path}.")


def video_processing(request):
    start_time = time.time()

    if request.method != "POST":
        logging.error("Invalid request method.")
        return make_response(
            jsonify({"error": "Invalid request method. Only POST is allowed."}), 405
        )

    envelope = request.get_json(silent=True)
    logging.debug(f"Received envelope: {envelope}")

    if envelope is None or "message" not in envelope:
        logging.error("Invalid JSON payload.")
        return make_response(jsonify({"error": "Invalid JSON payload."}), 400)

    message = envelope["message"]

    if "data" not in message:
        logging.error("Data field is missing in the message.")
        return make_response(
            jsonify({"error": "Data field is missing in the message."}), 400
        )

    try:
        decoded_data = base64.b64decode(message["data"]).decode("utf-8")
        logging.debug(f"Decoded data: {decoded_data}")
        payload = json.loads(decoded_data)
        logging.debug(f"Payload: {payload}")
    except Exception as e:
        logging.exception(f"Error decoding data: {e}")
        return make_response(jsonify({"error": f"Error decoding data: {e}"}), 400)

    user_id = payload.get("user_id")
    video_url = payload.get("video_url")
    title = payload.get("title")
    upload_id = payload.get("upload_id")
    attributes = payload.get("attributes", {})

    if not user_id or not video_url or not title or not upload_id:
        logging.error("Missing required fields in the payload.")
        return make_response(
            jsonify(
                {
                    "error": "Missing user_id, video_url, title, or upload_id in the payload."
                }
            ),
            400,
        )

    success = handle_video_processing(user_id, video_url, title, upload_id, attributes)

    if success:
        execution_time = time.time() - start_time

        return make_response(jsonify({"message": "Video processing completed."}), 200)
    else:
        logging.error("Video processing failed.")
        return make_response(jsonify({"error": "Video processing failed."}), 500)


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

        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise ValueError("User not found")

        uploads_ref = user_ref.collection("uploads").document(upload_id)
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
