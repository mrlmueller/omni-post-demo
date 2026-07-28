import os
import firebase_admin
from firebase_admin import auth, firestore
from flask import jsonify, request

firebase_admin.initialize_app()

db = firestore.client()


def save_user_data(request):
    request_json = request.get_json(silent=True)

    if request_json["secret"] != os.environ["FUNCTION_SHARED_SECRET"]:
        return jsonify({"error": "You have no permission to call this endpoint"}), 403

    if request_json and "token" in request_json and "uid" in request_json:
        token = request_json["token"]
        uid = request_json["uid"]
        displayName = request_json.get("displayName")
        email = request_json.get("email")
        photoURL = request_json.get("photoURL")
        providerId = request_json.get("providerId")
        acceptedTerms = request_json.get("acceptedTerms")

        try:
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token["uid"]

            if user_id != uid:
                return jsonify({"error": "Token UID does not match provided UID"}), 400

            try:
                user_record = auth.get_user(uid)
                user_ref = db.collection("users").document(uid)
                user_ref.set(
                    {
                        "uid": uid,
                        "displayName": displayName,
                        "email": email,
                        "photoURL": photoURL,
                        "providerId": providerId,
                        "lastLogin": firestore.SERVER_TIMESTAMP,
                        "acceptedTerms": acceptedTerms,
                    },
                    merge=True,
                )

                return jsonify({"message": "User saved successfully"}), 200

            except auth.UserNotFoundError:
                return (
                    jsonify({"error": "User UID does not exist in Firebase Auth"}),
                    400,
                )

        except Exception as e:
            return (
                jsonify({"error": f"Error verifying token or saving user data: {e}"}),
                500,
            )

    return jsonify({"error": "Invalid request payload"}), 400
