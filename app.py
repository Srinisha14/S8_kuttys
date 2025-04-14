from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

app.config["MONGO_URI"] = "mongodb://mahitha:Mah!tha18@ac-wddabw8-shard-00-00.rsjw0ll.mongodb.net:27017,ac-wddabw8-shard-00-01.rsjw0ll.mongodb.net:27017,ac-wddabw8-shard-00-02.rsjw0ll.mongodb.net:27017/course_db?replicaSet=atlas-p76ejr-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=courserec"
app.config["JWT_SECRET_KEY"] = "18282214_mahiskgayusrini"

mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# User Registration
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        # Check if user already exists
        if mongo.db.users.find_one({"email": data["email"]}):
            return jsonify({"error": "Email already registered"}), 409

        # Hash password
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')

        # Create new user document
        user_data = {
            "email": data["email"],
            "password": hashed_password,
            "username": data.get("username", ""),
            "enrolled_courses": [],
            "created_at": datetime.datetime.utcnow()
        }

        # Insert into database
        mongo.db.users.insert_one(user_data)
        
        # Automatically log in the user
        access_token = create_access_token(identity=data["email"])
        return jsonify({
            "message": "Registration successful",
            "token": access_token,
            "email": data["email"]
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = mongo.db.users.find_one({"email": data["email"]})
    if user and bcrypt.check_password_hash(user["password"], data["password"]):
        access_token = create_access_token(identity=user["email"])
        return jsonify({"token": access_token})
    return jsonify({"error": "Invalid credentials"}), 401

# Protected route example
@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user}, {"_id": 0, "password": 0})
    return jsonify(user)

# Search courses
@app.route('/search', methods=['GET'])
def search_courses():
    query = request.args.get('query', '')
    vakg_filter = request.args.getlist('vakg')
    page = int(request.args.get('page', 1))
    per_page = 10

    query_filter = {"Title": {"$regex": query, "$options": "i"}}
    if vakg_filter:
        query_filter["Category"] = {"$in": vakg_filter}

    courses_cursor = mongo.db.courses.find(query_filter, {"_id": 0}).skip((page - 1) * per_page).limit(per_page)
    courses = list(courses_cursor)
    total_count = mongo.db.courses.count_documents(query_filter)

    return jsonify({
        "courses": courses,
        "total_pages": (total_count // per_page) + (1 if total_count % per_page > 0 else 0),
        "current_page": page
    })

# New endpoint for questionnaire-based course recommendations
@app.route('/questionnaire-recommend', methods=['POST'])
@jwt_required()
def questionnaire_recommend():
    data = request.json
    education_level = data.get('education_level', '')  # High school, Under graduate, Post graduate
    domain = data.get('domain', '')                   # Machine Learning, Data Analysis, etc.
    knowledge_level = data.get('knowledge_level', '') # Beginner, Intermediate, Advanced
    learning_style = data.get('learning_style', '')   # Visual, Auditory, Kinesthetic, General
    
    # Build a query that prioritizes the selected domain as Sub_Category
    # and considers the learning style as Category
    query = {}
    
    # Domain maps to Sub_Category
    if domain:
        query["Sub_Category"] = domain
    
    # Learning style maps to Category
    if learning_style and learning_style != "General":
        query["Category"] = learning_style
    
    # If we don't have enough results with the specific category and sub-category,
    # we'll fallback to just using the sub-category (domain)
    courses = list(mongo.db.courses.find(query, {"_id": 0}).limit(6))
    
    # If we still don't have 5 courses, try with just the learning style
    if len(courses) < 6 and learning_style:
        remaining_needed = 6 - len(courses)
        more_courses = list(mongo.db.courses.find(
            {"Category": learning_style, "Sub_Category": {"$ne": domain}} if domain else {"Category": learning_style},
            {"_id": 0}
        ).limit(remaining_needed))
        courses.extend(more_courses)
    
    # If we still don't have 5 courses, add some general recommendations
    if len(courses) < 5:
        remaining_needed = 5 - len(courses)
        existing_ids = [c["Title"] for c in courses]  # Avoid duplicates
        general_courses = list(mongo.db.courses.find(
            {"Title": {"$nin": existing_ids}},
            {"_id": 0}
        ).limit(remaining_needed))
        courses.extend(general_courses)
    
    return jsonify(courses)

# Enroll course (JWT required)
@app.route('/enroll', methods=['POST'])
@jwt_required()
def enroll_course():
    data = request.json
    current_user = get_jwt_identity()
    mongo.db.users.update_one({"email": current_user}, {"$push": {"enrolled_courses": data["course"]}}, upsert=True)
    return jsonify({"message": "Enrolled successfully"})

# Get user progress
@app.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user}, {"_id": 0, "enrolled_courses": 1})
    if not user:
        return jsonify({"Visual": 0, "Auditory": 0, "Kinesthetic": 0, "General": 0})
    vakg_count = {"Visual": 0, "Auditory": 0, "Kinesthetic": 0, "General": 0}
    for course in user.get("enrolled_courses", []):
        vakg_count[course["Category"]] += 1
    return jsonify(vakg_count)

@app.route('/recommend', methods=['GET'])
@jwt_required()
def recommend_courses():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user}, {"_id": 0, "enrolled_courses": 1})
    
    if not user or not user.get("enrolled_courses"):
        return jsonify([])
    
    enrolled_courses = user.get("enrolled_courses", [])
    
    # Extract important keywords from user's enrolled courses
    user_keywords = set()
    for course in enrolled_courses:
        # Extract keywords from title
        if course.get("Title"):
            words = course["Title"].lower().split()
            user_keywords.update([w for w in words if len(w) > 3 and w not in 
                                 ["with", "and", "the", "to", "for", "in", "of", "on", "introduction"]])
        
        # Extract keywords from skills
        if course.get("Skills"):
            skills = course["Skills"].lower().split(",")
            for skill in skills:
                user_keywords.update([w.strip() for w in skill.split() if len(w) > 3])
    
    # Get user's preferred learning style (Category)
    categories = [c.get("Category") for c in enrolled_courses if c.get("Category")]
    preferred_category = max(set(categories), key=categories.count) if categories else "General"
    
    # Get all courses
    all_courses = list(mongo.db.courses.find({}, {"_id": 0}))
    
    # Calculate relevance score for each course
    scored_courses = []
    for course in all_courses:
        # Skip courses the user has already enrolled in
        if any(ec.get("Title") == course.get("Title") for ec in enrolled_courses):
            continue
            
        score = 0
        
        # Category match bonus
        if course.get("Category") == preferred_category:
            score += 3
        
        # Calculate keyword matching score
        course_keywords = set()
        
        # Extract keywords from title
        if course.get("Title"):
            words = course["Title"].lower().split()
            course_keywords.update([w for w in words if len(w) > 3 and w not in 
                                   ["with", "and", "the", "to", "for", "in", "of", "on", "introduction"]])
        
        # Extract keywords from skills
        if course.get("Skills"):
            skills = course["Skills"].lower().split(",")
            for skill in skills:
                course_keywords.update([w.strip() for w in skill.split() if len(w) > 3])
        
        # Calculate keyword overlap
        common_keywords = user_keywords.intersection(course_keywords)
        score += len(common_keywords) * 2
        
        # Add to scored courses list
        scored_courses.append((course, score))
    
    # Sort by score and take top 5
    scored_courses.sort(key=lambda x: x[1], reverse=True)
    
    # Use a dictionary to ensure uniqueness of courses by title
    unique_recommendations = {}
    for course, _ in scored_courses:
        title = course.get("Title")
        if title not in unique_recommendations:
            unique_recommendations[title] = course
        
        # Break if we have enough unique recommendations
        if len(unique_recommendations) >= 5:
            break
    
    recommendations = list(unique_recommendations.values())
    
    return jsonify(recommendations)

# User updates progress manually
@app.route('/update-progress', methods=['POST'])
@jwt_required()
def update_progress():
    data = request.json
    current_user = get_jwt_identity()
    mongo.db.users.update_one(
        {"email": current_user, "enrolled_courses.Title": data["course"]},
        {"$set": {"enrolled_courses.$.progress": data["progress"]}}
    )
    return jsonify({"message": "Progress updated successfully"})

# Mark course as completed with certificate
@app.route('/complete-course', methods=['POST'])
@jwt_required()
def complete_course():
    data = request.json
    current_user = get_jwt_identity()
    course_title = data.get("course_title")
    certificate_link = data.get("certificate_link")
    
    if not course_title or not certificate_link:
        return jsonify({"error": "Course title and certificate link are required"}), 400
    
    # Update the course in the user's enrolled courses list
    result = mongo.db.users.update_one(
        {"email": current_user, "enrolled_courses.Title": course_title},
        {"$set": {
            "enrolled_courses.$.status": "completed",
            "enrolled_courses.$.certificate_link": certificate_link
        }}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Course not found or already completed"}), 404
    
    return jsonify({"message": "Course marked as completed successfully"}), 200


# User submits quiz answers
@app.route('/submit-quiz', methods=['POST'])
@jwt_required()
def submit_quiz():
    data = request.json
    current_user = get_jwt_identity()
    course = data.get("course")
    score = data.get("score")
    
    if score >= 80:
        progress_update = 100
    elif score >= 50:
        progress_update = 75
    elif score >= 30:
        progress_update = 50
    else:
        progress_update = 25
    
    mongo.db.users.update_one(
        {"email": current_user, "enrolled_courses.Title": course},
        {"$set": {"enrolled_courses.$.progress": progress_update}}
    )
    
    return jsonify({"message": "Quiz results updated", "progress": progress_update})


if __name__ == '__main__':
    app.run(debug=True)
