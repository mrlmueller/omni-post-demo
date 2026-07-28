import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.oauth2 import service_account
from flask import jsonify, request
from datetime import datetime
import pytz

# Initialize Firebase Admin SDK using the default service account
firebase_admin.initialize_app()

# Initialize Firestore client using default credentials
db = firestore.Client()


def video_upload_status(user_id, upload_id, platforms, title="Untitled"):

    user_ref = db.collection("users").document(user_id)
    upload_ref = user_ref.collection("uploads").document(upload_id)

    current_time = datetime.now(pytz.utc).isoformat()

    update_data = {
        "title": title,
    }

    for platform, included in platforms.items():
        if included == "true":
            update_data[platform] = {
                "status_code": 0,
                "timestamp": current_time,
                "read": False,
            }

    upload_doc = upload_ref.get()

    if upload_doc.exists:
        upload_ref.update(update_data)
    else:
        new_upload = {"upload_id": upload_id, "title": title, **update_data}
        upload_ref.set(new_upload)

    return jsonify({"status": "success"}), 200


def update_video_upload_status(request):
    request_json = request.get_json(silent=True)

    # Security check
    if (
        request_json.get("secret")
        != os.environ["FUNCTION_SHARED_SECRET"]
    ):
        return jsonify({"error": "You have no permission to call this endpoint"}), 500

    try:
        user_id = request_json["user_id"]
        upload_id = request_json["upload_id"]
        platforms = request_json["attributes"]
        title = request_json.get("videoTitle", "Untitled")

        return video_upload_status(user_id, upload_id, platforms, title)

    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
