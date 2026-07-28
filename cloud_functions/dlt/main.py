import base64
import json
from google.cloud import firestore


def handle_dead_letter_message(request):
    try:
        # Verify the request is from Pub/Sub
        envelope = request.get_json()
        if not envelope:
            raise ValueError("Invalid Pub/Sub message format")

        # Decode the Pub/Sub message
        pubsub_message = envelope.get("message")
        if not pubsub_message:
            raise ValueError("Invalid Pub/Sub message format")

        data = base64.b64decode(pubsub_message.get("data")).decode("utf-8")
        attributes = pubsub_message.get("attributes")

        print("Received data:", data)
        print("Received attributes:", attributes)

        # Log the failed message to Firestore (or any other persistent storage)
        db = firestore.Client()
        doc_ref = db.collection("dead_letter_messages").document()
        doc_ref.set(
            {
                "data": data,
                "attributes": attributes,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
        )

        # Return success response
        return "Message processed and logged", 200

    except Exception as e:
        print(f"Error processing dead letter message: {e}")
        return "Error processing message", 500
