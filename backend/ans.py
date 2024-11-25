import os
import json
import nltk
import string
import re
import tensorflow as tf
from flask import Flask, jsonify, request
from transformers import BertTokenizer, TFBertModel
import faiss
import numpy as np
from flask_cors import CORS

# Set proxy environment variables
# os.environ['HTTP_PROXY'] = 'http://edcguest:edcguest@172.31.100.25:3128'
# os.environ['HTTPS_PROXY'] = 'http://edcguest:edcguest@172.31.100.25:3128'

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Load BERT model and tokenizer once
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = TFBertModel.from_pretrained('bert-base-uncased')

# FAISS setup
dimension = 768  # BERT base embedding dimension
index = faiss.IndexFlatL2(dimension)
index.reset()

# Proxy dataset (simplified and static for now)
proxy_dataset = {
    "Login issues": "Check the authentication server and logs.",
    "File upload delays": "Inspect server load and optimize file handling.",
    "Search returns incorrect results": "Rebuild the search index and enhance filtering.",
    "Users are reporting issues with the application's login process. When attempting to log in with their credentials, the system fails to authenticate and displays an error message. This problem seems to occur intermittently across different devices and browsers. The login button appears unresponsive in some instances, preventing users from accessing their accounts. We need to investigate and resolve this issue promptly to ensure seamless user experience and maintain customer satisfaction.":
    "Check the authentication server logs and ensure the server is running. Restart the server if necessary. Verify that the login endpoint is properly configured and not experiencing downtime. Test the login process across various devices and browsers to identify any specific issues. Consider implementing a backup authentication server to handle login requests if the primary server fails.",

    "Users are experiencing delays when trying to upload files to the application. The upload process takes an unusually long time, and in some cases, it fails completely without any error message. This issue is affecting productivity as users rely on file uploads for their daily tasks.":
    "Inspect the server load and bandwidth usage to identify any bottlenecks. Ensure the file upload service is optimized for handling large files. Check for any network issues that might be causing delays. Implement error handling to provide feedback to users when uploads fail. Consider using a content delivery network (CDN) to improve upload speeds.",

    "The application's search functionality is returning incomplete or incorrect results. Users are unable to find the information they need, which is impacting their ability to perform their tasks effectively. This issue seems to be related to the indexing of the search data.":
    "Verify that the search indexing service is running correctly and is up-to-date. Rebuild the search index to ensure all data is accurately indexed. Check for any errors in the search algorithm that might be causing incorrect results. Enhance the search functionality by implementing advanced search filters and options.",

    "Customers are complaining about receiving duplicate email notifications from the system. This issue is causing confusion and frustration among users as they receive multiple emails for the same event or action.":
    "Review the email notification system to identify any configuration errors. Ensure that duplicate notifications are not being triggered by multiple events. Implement checks to prevent the same notification from being sent more than once. Monitor the email queue and logs to detect and resolve any issues promptly.",

    "The application's user interface is not displaying correctly on certain mobile devices. Some elements are misaligned, and the layout appears broken, making it difficult for users to navigate and use the application effectively.":
    "Test the application's user interface on various mobile devices to identify specific issues. Adjust the CSS and responsive design settings to ensure compatibility with different screen sizes. Fix any misaligned elements and broken layouts. Implement a mobile-first design approach to improve usability on mobile devices.",

    "Users are reporting that the application crashes unexpectedly during usage. This issue occurs sporadically and does not follow a predictable pattern, making it difficult to identify the root cause.":
    "Collect and analyze crash logs to identify any common patterns or errors. Ensure that all dependencies and libraries are up-to-date and compatible. Implement additional logging and monitoring to capture detailed information about the crashes. Perform thorough testing to replicate and resolve the issue.",

    "The application's performance has degraded significantly during peak usage times. Users experience slow response times and lag, which affects their ability to use the application efficiently.":
    "Evaluate the application's performance metrics to identify bottlenecks. Optimize the database queries and server configuration to handle higher loads. Implement load balancing to distribute traffic evenly across servers. Consider scaling up the infrastructure to accommodate peak usage times.",

    "Users are unable to reset their passwords using the password recovery feature. The system does not send the password reset email, leaving users unable to regain access to their accounts.":
    "Verify that the email service is configured correctly and is operational. Check the logs for any errors related to the password reset process. Ensure that the password reset tokens are being generated and sent correctly. Provide users with alternative methods for password recovery if needed.",

    "The application's API is returning errors when third-party services attempt to connect. This issue is preventing integrations with other systems and affecting functionality that relies on external data.":
    "Review the API documentation and ensure that all endpoints are correctly implemented. Check the API logs for any errors or issues. Verify that the API keys and authentication methods are working as expected. Test the API integration with third-party services to identify and resolve any compatibility issues.",

    "Users are experiencing issues with the application's payment processing. Transactions are failing, and users are unable to complete their purchases, leading to lost sales and revenue.":
    "Inspect the payment gateway configuration to ensure it is set up correctly. Check the transaction logs for any errors or failed attempts. Verify that the payment gateway is not experiencing downtime or technical issues. Implement fallback payment options to ensure users can complete their purchases."
}

# Function to preprocess and tokenize text
def data_preprocess(description):
    description = description.lower()
    description = re.sub(r"<[^>]+>", "", description)
    tokens = nltk.word_tokenize(description)
    stopwords = nltk.corpus.stopwords.words("english")
    tokens = [token for token in tokens if token not in string.punctuation and token not in stopwords]
    lemmatizer = nltk.stem.WordNetLemmatizer()
    lemmatized_tokens = [lemmatizer.lemmatize(token) for token in tokens]
    return lemmatized_tokens

# Function to get BERT embeddings
def get_bert_embeddings(tokens):
    inputs = tokenizer(tokens, return_tensors='tf', padding=True, truncation=True, is_split_into_words=True)
    outputs = model(inputs)
    pooled_output = outputs.last_hidden_state[:, 0, :]
    return pooled_output.numpy()

# Store embeddings in FAISS
solutions = []
embedding_vectors = []

for query, solution in proxy_dataset.items():
    preprocessed_query = data_preprocess(query)
    tokens = [" ".join(preprocessed_query)]
    query_embedding = get_bert_embeddings(tokens)
    embedding_vectors.append(query_embedding)
    solutions.append(solution)

if embedding_vectors:
    embedding_vectors = np.vstack(embedding_vectors)
    index.add(embedding_vectors)
else:
    print("No valid embeddings found to add to the FAISS index.")

# Function to find the solution for a query
def find_solution(query):
    preprocessed_query = data_preprocess(query)
    tokens = [" ".join(preprocessed_query)]
    query_embedding = get_bert_embeddings(tokens)

    if query_embedding is None or len(query_embedding) == 0:
        return "Unable to generate embeddings for the given query."

    distances, indices = index.search(query_embedding, 1)
    if indices[0][0] < 0 or indices[0][0] >= len(solutions):
        return "No matching solution found."
    return solutions[indices[0][0]]

# API route to find a solution
@app.route('/find-solution', methods=['POST'])
def find_solution_route():
    try:
        data = request.get_json()
        query = data.get('query')
        if not query:
            return jsonify({"error": "No query provided"}), 400
        solution = find_solution(query)
        return jsonify({"solution": solution}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
