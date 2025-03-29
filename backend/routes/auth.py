from flask import Blueprint,request,jsonify
from database import db
from app import app
from models import User
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity
from datetime import timedelta

auth_bp = Blueprint("auth",__name__)

# User Registration
@auth_bp.route("/register",methods=["POST"])
def register():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if not full_name or not email or not password:
        return jsonify({"error":'Missing fields'}),400
    
    existing_user = User.query.filter(User.email == email).first()
    if existing_user:
        return jsonify({"error":"User already exists"}),409
    
    new_user = User(full_name = full_name,email = email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message":"User registered successfully"}),201

# User Login
@auth_bp.route("/login",methods = ["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email = email).first()
    if not user or not user.check_password(password):
        return jsonify({"error":"Invalid email or password"}),401
    
    # Generate JWT Token
    access_token = create_access_token(identity=user.id,expires_delta=timedelta(days=1))

    return jsonify({"message": "Login successful", "access_token": access_token}), 200

@auth_bp.route("/protected",methods = ["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello User {current_user}, you are authenticated!"}), 200

# Add the Blueprint to Flask App
app.register_blueprint(auth_bp,url_prefix = "/auth")
    
    
