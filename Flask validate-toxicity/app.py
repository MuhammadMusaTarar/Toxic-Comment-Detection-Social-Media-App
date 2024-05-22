from flask import Flask, request, jsonify
import tensorflow as tf
from keras.preprocessing.sequence import pad_sequences
import pickle
import logging

app = Flask(__name__)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load the model
logger.info("Loading model...")
model = tf.keras.models.load_model('lstm_model.h5')
logger.info("Model loaded successfully.")

# Load the tokenizer
logger.info("Loading tokenizer...")
with open('tokenizer.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)
logger.info("Tokenizer loaded successfully.")

def preprocess_text(text):
    tokenized_comment = tokenizer.texts_to_sequences([text])
    padded_comment = pad_sequences(tokenized_comment, maxlen=250)
    return padded_comment

@app.route('/classify-comment', methods=['POST'])
def classify_comment():
    try:
        data = request.get_json()
        comment = data.get('comment')
        
        if not comment:
            logger.error("No comment provided in the request.")
            return jsonify({'error': 'No comment provided.'}), 400

        logger.info(f"Received comment for classification: {comment}")
        
        processed_comment = preprocess_text(comment)
        prediction = model.predict(processed_comment).tolist()[0]

        response = {
            'toxic': prediction[0],
            'severe_toxic': prediction[1],
            'obscene': prediction[2],
            'threat': prediction[3],
            'insult': prediction[4],
            'identity_hate': prediction[5],
        }

        logger.info(f"Classification result: {response}")
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error during classification: {e}", exc_info=True)
        return jsonify({'error': 'An error occurred during classification.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
