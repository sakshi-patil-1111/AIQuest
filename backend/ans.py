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
