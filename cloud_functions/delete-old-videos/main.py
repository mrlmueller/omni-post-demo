import datetime
from google.cloud import storage as gcs_storage
from google.cloud import firestore
from flask import jsonify
import base64
import json
import logging


def delete_old_videos(data, context):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    try:
        # Decode the Pub/Sub message data
        if "data" not in data:
            logger.error("Data field is missing in the message.")
            return jsonify({"error": "Data field is missing in the message."}), 400

        try:
            decoded_data = base64.b64decode(data["data"]).decode("utf-8")
            payload = json.loads(decoded_data)
        except Exception as e:
            logger.error(f"Error decoding data: {e}")
            return jsonify({"error": f"Error decoding data: {e}"}), 400

        time_threshold_minutes = payload.get("time_threshold_minutes")
        if not time_threshold_minutes:
            logger.error("Time threshold is missing in the payload.")
            return jsonify({"error": "Time threshold is missing in the payload."}), 400

        bucket_name = "omni-post-eu.appspot.com"

        gcs_client = gcs_storage.Client()
        bucket = gcs_client.bucket(bucket_name)

        # Firestore client
        firestore_client = firestore.Client()

        now = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)
        time_threshold = now - datetime.timedelta(minutes=time_threshold_minutes)

        blobs = bucket.list_blobs(prefix="videos/")

        deleted_count = 0
        # Collect names of deleted videos
        deleted_video_names = []

        for blob in blobs:
            # Check if the blob is a video file (you can add more conditions if needed)
            if not blob.name.endswith("/"):
                # Get the blob's creation time
                blob_time = blob.time_created

                # Delete the blob if it's older than the time threshold
                if blob_time < time_threshold:
                    logger.info(f"Deleting {blob.name} created on {blob_time}")
                    blob.delete()
                    deleted_count += 1
                    # Collect the name of the deleted video (excluding the 'videos/' prefix)
                    deleted_video_names.append(blob.name.split("videos/")[1])

        logger.info(f"Total deleted videos: {deleted_count}")

        # After deleting from Storage, update Firestore for each user
        users_ref = firestore_client.collection("users")
        users = users_ref.stream()

        for user in users:
            user_data = user.to_dict()
            if "videos" in user_data and isinstance(user_data["videos"], list):
                # Filter out the videos that have been deleted
                updated_videos = [
                    video
                    for video in user_data["videos"]
                    if video["name"] not in deleted_video_names
                ]

                if len(updated_videos) < len(user_data["videos"]):
                    # Update the Firestore document with the filtered list
                    users_ref.document(user.id).update({"videos": updated_videos})
                    logger.info(
                        f'Updated videos for user {user.id}: {len(user_data["videos"]) - len(updated_videos)} video(s) removed'
                    )

        return jsonify({"message": f"Total deleted videos: {deleted_count}"}), 200

    except Exception as e:
        logger.error(f"Error processing function: {e}")
        return jsonify({"error": f"Error processing function: {e}"}), 500
