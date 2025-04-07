from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

from routes.upload import upload_bp
from routes.download import download_bp
from routes.auth import auth_bp
from flask_migrate import Migrate
import os
import secrets
from database import db
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    CORS(app)
    
    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["UPLOAD_FOLDER"] = 'uploads'
    
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
    app.register_blueprint(download_bp, url_prefix="/download")
    app.register_blueprint(upload_bp, url_prefix="/scan")
    
    @app.route('/')
    def home():
        return jsonify({"message": "Hello World!"})

    @app.route('/test-connection', methods=['GET'])
    def test_connection():
        return jsonify({"success": True, "message": "Connection successful"})
        
    return app



if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
