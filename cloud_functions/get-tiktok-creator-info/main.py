import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import jsonify, request
import base64
from google.cloud import secretmanager
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import logging
import requests
import os

# Chnage from local

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)
db = firestore.client()


# Function to decrypt the access token
def decrypt_token(encrypted_token: str) -> str:
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        secret_key_base64 = response.payload.data.decode("UTF-8")

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
        logging.error(f"Error during decryption: {e}")
        return None


# Function to encrypt the access token
def encrypt_token(token: str) -> str:
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/omni-post-eu/secrets/encryption-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        key_base64 = response.payload.data.decode("UTF-8")
        key = base64.b64decode(key_base64)

        if len(key) != 32:
            raise ValueError("Invalid key size for AES. Must be 32 bytes.")

        iv = os.urandom(12)
        aesgcm = AESGCM(key)
        encrypted_token = aesgcm.encrypt(iv, token.encode("utf-8"), None)

        iv_base64 = base64.b64encode(iv).decode("utf-8")
        encrypted_base64 = base64.b64encode(encrypted_token[:-16]).decode("utf-8")
        auth_tag_base64 = base64.b64encode(encrypted_token[-16:]).decode("utf-8")

        return f"{iv_base64}:{encrypted_base64}:{auth_tag_base64}"
    except Exception as e:
        logging.error(f"Error during encryption: {e}")
        raise


# Function to refresh the access token
def get_access_token(refresh_token, client_key, client_secret):
    try:
        token_url = "https://open.tiktokapis.com/v2/oauth/token/"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "client_key": client_key,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }

        response = requests.post(token_url, headers=headers, data=data)
        response.raise_for_status()

        response_data = response.json()
        access_token = response_data.get("access_token")
        new_refresh_token = response_data.get("refresh_token")

        if not access_token or not new_refresh_token:
            raise Exception("Invalid response: Missing access_token or refresh_token")

        return access_token, new_refresh_token
    except requests.RequestException as e:
        logging.error(f"Error while refreshing token: {e}")
        raise


# Function to query creator info from TikTok API
def query_creator_info(access_token: str):
    try:
        url = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        }

        response = requests.post(url, headers=headers)

        if response.status_code == 200:
            return response.json()
        else:
            logging.error(
                f"Failed to query creator info. Status code: {response.status_code}, Response: {response.text}"
            )
            return None
    except requests.RequestException as e:
        logging.error(f"RequestException during TikTok API call: {e}")
        return None


# Main function to handle the cloud function request
def get_tiktok_data_for_user(request):
    request_json = request.get_json()
    if not request_json:
        return jsonify({"error": "Invalid JSON payload"}), 400

    secret = request_json.get("secret")
    if secret != os.environ["FUNCTION_SHARED_SECRET"]:
        return jsonify({"error": "You have no permission to call this endpoint"}), 403

    try:
        token = request_json.get("token")
        if not token:
            return jsonify({"error": "Token is required"}), 400

        # Verify the token and get user_id
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]

        # Get user data from Firestore
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        socials = user_doc.get("socials")
        if not socials or "tiktok" not in socials:
            return jsonify({"error": "TikTok data not found for user"}), 400

        encrypted_access_token = socials["tiktok"].get("access_token")
        refresh_token = decrypt_token(socials["tiktok"].get("refresh_token"))
        if not encrypted_access_token or not refresh_token:
            return jsonify({"error": "Access token or refresh token not found"}), 400

        # Decrypt access token
        access_token = decrypt_token(encrypted_access_token)

        # If access token is invalid, refresh it
        creator_info = query_creator_info(access_token)
        if not creator_info:
            CLIENT_KEY = os.environ["TIKTOK_CLIENT_KEY"]
            CLIENT_SECRET = os.environ["TIKTOK_CLIENT_SECRET"]
            access_token, new_refresh_token = get_access_token(
                refresh_token, CLIENT_KEY, CLIENT_SECRET
            )

            # Encrypt and update tokens in Firestore
            user_ref.update(
                {
                    "socials.tiktok.access_token": encrypt_token(access_token),
                    "socials.tiktok.refresh_token": encrypt_token(new_refresh_token),
                }
            )

            # Query TikTok API with the new access token
            creator_info = query_creator_info(access_token)
            if not creator_info:
                return jsonify({"error": "Failed to query creator info"}), 500

        # Return the creator info
        return jsonify({"creator_info": creator_info}), 200

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500
