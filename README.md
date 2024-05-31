# Toxic-Comment-Detection-Social-Media-App

## Steps to Run the Application

1. **Start the Flask App**:
   - Navigate to the directory containing `app.py`.
   - Run the Flask app:
     ```sh
     python app.py
     ```
   - You should see messages in the terminal indicating that the model and tokenizer have been loaded successfully:
     ```
     Model loaded successfully.
     Tokenizer loaded successfully.
     ```

2. **Setup and Run the Server**:
   - Open the `validate-Toxicity` folder that contains the `server` and `client` subfolders.
   - Navigate to the `server` folder:
     ```sh
     cd server
     ```
   - Install the necessary Node.js packages:
     ```sh
     npm install
     ```
   - Start the server using `nodemon`:
     ```sh
     nodemon
     ```

3. **Setup and Run the Client**:
   - Open a new terminal and navigate to the `client` folder:
     ```sh
     cd client
     ```
   - Install the necessary Node.js packages:
     ```sh
     npm install
     ```
   - Start the client application:
     ```sh
     npm run dev
     ```

By following these steps, you will have the Flask backend and the Node.js server and client up and running.
