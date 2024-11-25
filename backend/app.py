from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from ans import find_solution
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend interaction
app.config['MONGO_URI'] = 'mongodb://localhost:27017/qna_platform'  # MongoDB URI
app.config['JWT_SECRET_KEY'] = 'secret_key'

mongo = PyMongo(app)
jwt = JWTManager(app)

# MongoDB collections (users, questions, answers, votes)
users = mongo.db.users
questions = mongo.db.questions
answers = mongo.db.answers


# User model: Store users in MongoDB
@app.route('/signup', methods=['POST'])
def signup():
    try:
        # Get the data from the request
        data = request.get_json()
        print("Received data:", data)  # Log the incoming data
        
        if not data:
            return jsonify({"message": "No data provided"}), 400

        username = data['username']
        password = data['password']
        role = data.get('role', 'employee')  # Default role 'employee'      
        
        # Check if username already exists
        existing_user = users.find_one({'username': username})
        if existing_user:
            return jsonify({"message": "Username already exists!"}), 400

        # Hash the password before storing it
        hashed_password = generate_password_hash(password)

        # Create the new user document
        new_user = {
            'username': username,
            'password': hashed_password,
            'role': role
        }
        
        # Insert the new user into MongoDB
        result = users.insert_one(new_user)
        
        # Check if user was inserted successfully
        if result.inserted_id:
            return jsonify({"message": "User registered successfully!"}), 201
        else:
            return jsonify({"message": "Failed to register user."}), 500
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("Received login data:", data)  # Log the incoming data
        
        user = users.find_one({'username': data['username']})
        if not user:
            return jsonify({"message": "Invalid username"}), 401
        
        print(check_password_hash(user['password'], data['password']))
        if not check_password_hash(user['password'], data['password']):
            return jsonify({"message": "Invalid password"}), 401
        
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({"access_token": access_token}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500



# Question model: Store questions in MongoDB
@app.route('/questions', methods=['POST'])
@jwt_required()
def post_question():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    print(data)
    question = {
        'title': data['title'],
        'description': data['description'],
        'category': data.get('category', None),
        'tags': data.get('tags', []),
        'user_id': current_user_id
    }
    result = questions.insert_one(question)
    return jsonify({'message': 'Question posted successfully', 'id': str(result.inserted_id)}), 201


@app.route('/questions', methods=['GET'])
def get_questions():
    all_questions = questions.find()
    result = []
    
    for q in all_questions:
        # Fetch user details using the user_id from the question
        user = users.find_one({'_id': ObjectId(q['user_id'])})
        num_of_answers = answers.count_documents({'question_id': str(q['_id'])})
        
        # Add question details to result list, including the 'posted_by' field
        result.append({
            'id': str(q['_id']),
            'title': q['title'],
            'description': q['description'],
            'category': q.get('category', ''),
            'tags': q.get('tags', []),
            'posted_by': user['username'] if user else 'Unknown',  # Add posted_by field
            'no_of_ans': num_of_answers
        })
    
    return jsonify(result), 200



@app.route('/questions/<question_id>', methods=['GET'])
def get_question(question_id):
    print(question_id)
    question = questions.find_one({'_id': ObjectId(question_id)})
    
    if not question:
        return jsonify({"message": "Question not found"}), 404
    
    # Fetch user details using the user_id from the question
    user = users.find_one({'_id': ObjectId(question['user_id'])})
    
    return jsonify({
        'id': str(question['_id']),
        'title': question['title'],
        'description': question['description'],
        'category': question.get('category', ''),
        'tags': question.get('tags', []),
        'posted_by': user['username'] if user else 'Unknown'  # Add posted_by field
    }), 200


@app.route('/questions/<question_id>/ai-answer', methods=['GET'])
def get_ai_answer(question_id):
    question = questions.find_one({'_id': ObjectId(question_id)})
    if not question:
        return jsonify({"message": "Question not found"}), 404
    solution = find_solution(question['description'])
    return jsonify({'ai_answer': solution}), 200


@app.route('/answers/vote', methods=['POST'])
def vote_answer():
    data = request.get_json()
    answer_id = data['answer_id']
    vote_type = data['vote_type']

    if vote_type == 'upvote':
        update = {'$inc': {'upvotes': 1, 'net_votes': 1}}
    elif vote_type == 'downvote':
        update = {'$inc': {'downvotes': 1, 'net_votes': -1}}
    else:
        return jsonify({"message": "Invalid vote type"}), 400

    answers.update_one({'_id': ObjectId(answer_id)}, update)
    return jsonify({"message": f"{vote_type.capitalize()} recorded!"}), 200


@app.route('/questions/<question_id>/answers', methods=['POST'])
@jwt_required()
def post_answer(question_id):
    try:
        data = request.get_json()
        print(data)
        current_user_id = get_jwt_identity()
        answer = {
            'question_id': question_id,
            'content': data['content'],
            'user_id': current_user_id,
            'is_official': False,
            'is_ai_generated': False,
            'upvotes': 0,
            'downvotes': 0,
            'net_votes': 0
        }
        result = answers.insert_one(answer)
        return jsonify({'message': 'Answer posted successfully', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        print(e)

@app.route('/answers/<answer_id>', methods=['DELETE'])
@jwt_required()
def delete_answer(answer_id):
    current_user_id = get_jwt_identity()
    answer = answers.find_one({'_id': ObjectId(answer_id)})
    if not answer:
        return jsonify({"message": "Answer not found"}), 404
    if str(answer['user_id']) != current_user_id:
        return jsonify({"message": "You can only delete your own answer"}), 403
    
    answers.delete_one({'_id': ObjectId(answer_id)})
    return jsonify({"message": "Answer deleted successfully"}), 200

@app.route('/questions/<question_id>/answers', methods=['GET'])
def get_answers(question_id):
    all_answers = answers.find({'question_id': question_id}).sort('net_votes', -1)
    result = []
    for ans in all_answers:
        user = users.find_one({'_id': ObjectId(ans['user_id'])})  # Fetch user data by user_id
        result.append({
            'id': str(ans['_id']),
            'content': ans['content'],
            'upvotes': ans['upvotes'],
            'downvotes': ans['downvotes'],
            'net_votes': ans['net_votes'],
            'posted_by': user['username'] if user else 'Unknown'  # Include 'posted_by' field
        })
    return jsonify(result), 200

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()  # Get the current logged-in user's ID

    # Fetch the username of the logged-in user
    user = users.find_one({'_id': ObjectId(current_user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    username = user.get('username', 'Unknown')  # Get the username from the user document, default to 'Unknown'

    # Fetch all questions posted by the logged-in user
    user_questions = questions.find({'user_id': current_user_id})
    
    # Fetch all answers posted by the logged-in user
    user_answers = answers.find({'user_id': current_user_id})
    
    # Prepare the result for questions
    questions_result = [
        {
            'id': str(q['_id']),
            'title': q['title'],
            'description': q['description'],
            'category': q.get('category', ''),
            'tags': q.get('tags', []),
            'no_of_answers': answers.count_documents({'question_id': q['_id']}) 
        }
        for q in user_questions
    ]
    
    # Prepare the result for answers
    answers_result = [
        {
            'id': str(a['_id']),
            'question_id': str(a['question_id']),
            'content': a['content'],
            'upvotes': a['upvotes'],
            'downvotes': a['downvotes'],
            'net_votes': a['net_votes']
        }
        for a in user_answers
    ]
    
    # Return the profile data including username, questions, and answers
    return jsonify({
        'username': username,
        'questions': questions_result,
        'answers': answers_result
    }), 200



# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
