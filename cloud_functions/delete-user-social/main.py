import os
import base64
import logging
import requests
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from requests_oauthlib import OAuth1Session
import firebase_admin
from firebase_admin import credentials, auth
from google.oauth2 import service_account
import google.cloud.firestore
from flask import jsonify, request

# Initialize Firebase Admin SDK
firebase_admin.initialize_app()
db = google.cloud.firestore.Client()

# Configure logging
logging.basicConfig(level=logging.ERROR)


def decrypt_token(encrypted_token: str) -> str:
    try:
        secret_key_base64 = os.getenv("ENCRYPTION_KEY")
        if not secret_key_base64:
            raise ValueError("Encryption key not found in environment variables")

        iv_base64, ciphertext_base64, auth_tag_base64 = encrypted_token.split(":")

        iv = base64.b64decode(iv_base64)
        ciphertext = base64.b64decode(ciphertext_base64)
        auth_tag = base64.b64decode(auth_tag_base64)
        secret_key = base64.b64decode(secret_key_base64)

        if len(secret_key) != 32:
            raise ValueError("Invalid secret key length")

        aesgcm = AESGCM(secret_key)
        decrypted_token = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        return decrypted_token.decode("utf-8")

    except Exception as e:
        logging.error(f"Error during token decryption: {e}")
        raise


def invalidate_twitter_oauth_token(user_data):
    try:
        client_key = os.getenv("CONSUMER_KEY")
        client_secret = os.getenv("CONSUMER_SECRET")
        if not client_key or not client_secret:
            raise ValueError("Twitter consumer keys not found in environment variables")

        oauth_token = user_data["oauthToken"]
        oauth_token_secret = decrypt_token(user_data["oauthTokenSecret"])

        oauth = OAuth1Session(
            client_key,
            client_secret=client_secret,
            resource_owner_key=oauth_token,
            resource_owner_secret=oauth_token_secret,
        )

        url = "https://api.twitter.com/1.1/oauth/invalidate_token.json"
        response = oauth.post(url)

        if response.status_code != 200:
            logging.error(
                f"Failed to invalidate Twitter token: {response.status_code} - {response.text}"
            )
            response.raise_for_status()

    except Exception as e:
        logging.error(f"Error invalidating Twitter token: {e}")
        raise


def invalidate_instagram_oauth_token(user_data):
    try:
        access_token = decrypt_token(user_data["accessToken"])
        get_url = f"https://graph.facebook.com/v20.0/me?fields=id,name&access_token={access_token}"
        response = requests.get(get_url)
        response.raise_for_status()

        user_data = response.json()
        user_id = user_data.get("id")
        if not user_id:
            raise ValueError("User ID not found in Instagram response")

        delete_url = f"https://graph.facebook.com/{user_id}/permissions?access_token={access_token}"
        delete_response = requests.delete(delete_url)
        delete_response.raise_for_status()

    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error occurred with Instagram: {http_err}")
        raise
    except Exception as err:
        logging.error(f"Error invalidating Instagram token: {err}")
        raise


def get_access_token(refresh_token):
    try:
        token_url = "https://open.tiktokapis.com/v2/oauth/token/"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "client_key": os.getenv("TIKTOK_CLIENT_KEY"),
            "client_secret": os.getenv("TIKTOK_CLIENT_SECRET"),
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        response = requests.post(token_url, headers=headers, data=data)
        response.raise_for_status()
        response_data = response.json()

        access_token = response_data.get("access_token")
        new_refresh_token = response_data.get("refresh_token")
        if not access_token or not new_refresh_token:
            raise ValueError("Missing access_token or refresh_token in TikTok response")

        return access_token, new_refresh_token

    except Exception as e:
        logging.error(f"Error obtaining TikTok access token: {e}")
        raise


def invalidate_tiktok_oauth_token(user_data):
    try:
        refresh_token = decrypt_token(user_data["refresh_token"])
        access_token, _ = get_access_token(refresh_token)

        url = "https://open.tiktokapis.com/v2/oauth/revoke/"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        }
        data = {
            "client_key": os.getenv("TIKTOK_CLIENT_KEY"),
            "client_secret": os.getenv("TIKTOK_CLIENT_SECRET"),
            "token": access_token,
        }

        response = requests.post(url, headers=headers, data=data)
        if response.status_code != 200:
            logging.error(
                f"Failed to revoke TikTok token: {response.status_code} - {response.json()}"
            )
            response.raise_for_status()

    except Exception as e:
        logging.error(f"Error invalidating TikTok token: {e}")
        raise


def invalidate_youtube_oauth_token(user_data):
    try:
        refresh_token = decrypt_token(user_data["refresh_token"])
        revoke_endpoint = "https://oauth2.googleapis.com/revoke"
        params = {"token": refresh_token}
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        response = requests.post(revoke_endpoint, data=params, headers=headers)
        if response.status_code != 200:
            logging.error(
                f"Failed to revoke YouTube token: {response.status_code} - {response.text}"
            )
            response.raise_for_status()

    except Exception as e:
        logging.error(f"Error invalidating YouTube token: {e}")
        raise


def delete_user_social(request):
    try:
        request_json = request.get_json(silent=True)
        if (
            request_json.get("secret")
            != os.environ["FUNCTION_SHARED_SECRET"]
        ):
            return {"error": "Unauthorized access"}, 403

        if request_json and "token" in request_json and "social_name" in request_json:
            token = request_json["token"]
            social_name = request_json["social_name"]

            # Verify the ID token using Firebase Admin SDK
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token["uid"]

            # Get user document from Firestore
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return {"error": "User document does not exist."}, 404

            # Invalidate the token before deleting it
            user_data = user_doc.to_dict().get("socials", {}).get(social_name, {})
            if social_name == "twitter":
                invalidate_twitter_oauth_token(user_data)
            elif social_name == "instagram":
                invalidate_instagram_oauth_token(user_data)
            elif social_name == "tiktok":
                invalidate_tiktok_oauth_token(user_data)
            elif social_name == "youtube":
                invalidate_youtube_oauth_token(user_data)
            else:
                return {"error": "Unsupported social network"}, 400

            # Delete the specific social entry
            user_ref.update(
                {f"socials.{social_name}": google.cloud.firestore.DELETE_FIELD}
            )

            return (
                jsonify(
                    {
                        "message": f"{social_name} entry has been deleted successfully",
                        "social_name": social_name,
                    }
                ),
                200,
            )

        return jsonify({"error": "Invalid request payload", "social_name": None}), 400

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
