from flask import Blueprint, request, jsonify
from database import db
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    
    if not full_name or not email or not password:
        return jsonify({"error": 'Missing fields'}), 400
        
    existing_user = User.query.filter(User.email == email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 409
        
    new_user = User(full_name=full_name, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    # Convert user.id to string
    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))

    user_info = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
    
    return jsonify({"message": "Login successful", "access_token": access_token,"user":user_info}), 200

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()  # This will be a string
    # Convert back to int if needed for database queries
    # user_id = int(current_user)
    
    return jsonify({"message": f"Hello User {current_user}, you are authenticated!"}), 200

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    
    try:
        # Debug: print incoming data
        print("Request data:", request.data)
        
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 422
            
        print("Parsed JSON data:", data)
        
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        confirm_password = data.get('confirmPassword')
        
        print(f"Passwords received: old={bool(old_password)}, new={bool(new_password)}, confirm={bool(confirm_password)}")
       
        # Validate input
        if not old_password or not new_password or not confirm_password:
            return jsonify({"error": "All password fields are required"}), 400
           
        if new_password != confirm_password:
            return jsonify({"error": "New passwords do not match"}), 400
       
        # Find user and verify old password
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404
           
        if not user.check_password(old_password):
            return jsonify({"error": "Current password is incorrect"}), 401
       
        # Update password
        user.set_password(new_password)
        db.session.commit()
       
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        print(f"Error in change_password: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500