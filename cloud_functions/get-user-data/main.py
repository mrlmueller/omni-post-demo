import os
import firebase_admin
from firebase_admin import credentials, auth
import google.cloud.firestore
from flask import jsonify, request

firebase_admin.initialize_app()

db = google.cloud.firestore.Client()


def get_user_data(request):
    try:
        request_json = request.get_json()
        if not request_json:
            return {"error": "Invalid JSON payload"}, 400

        secret = request_json.get("secret")
        if secret != os.environ["FUNCTION_SHARED_SECRET"]:
            return {"error": "You have no permission to call this endpoint"}, 403

        token = request_json.get("token")
        if not token:
            return {"error": "Token is required"}, 400

        try:
            # Verify the ID token using Firebase Admin SDK
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token["uid"]
        except Exception as e:
            return {"error": f"The token is not valid: {e}"}, 400

        # Get user document from Firestore
        try:
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get().to_dict()

            if not user_doc:
                return {"error": "User not found"}, 404

            clean_socials = {}
            if "socials" in user_doc:
                for key, value in user_doc["socials"].items():
                    clean_socials[key] = {
                        "username": value.get("username"),
                        "profile_picture": value.get("channelImage"),
                    }
                    # Check if the platform is Instagram and has a facebookPageName field
                    if key == "instagram" and "facebookPageName" in value:
                        clean_socials[key]["facebookPageName"] = value[
                            "facebookPageName"
                        ]

                user_doc["socials"] = clean_socials
            else:
                user_doc["socials"] = {}

            return jsonify(user_doc), 200

        except Exception as e:
            return {"error": f"Error fetching user data: {e}"}, 500

    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}, 500
