from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from flask_migrate import Migrate
import os
import secrets
from database import db

def create_app():
    app = Flask(__name__)
    
    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Generate a secure JWT secret key
    app.config["JWT_SECRET_KEY"] = secrets.token_hex(32)  # Secure secret key
    
    # Initialize Database
    db.init_app(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize Migrate
    migrate = Migrate(app, db)
    
    # Import and register blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    
    @app.route('/')
    def home():
        return jsonify({"message": "Hello World!"})
        
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
