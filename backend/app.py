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

def create_app(config_name="production"):
    app = Flask(__name__)
    CORS(app)
   
    # Environment-specific configuration
    if config_name == "production":
        # Production database (MySQL on AWS)
        # Use Heroku environment variables
        DATABASE_URL = os.getenv("DATABASE_URL")
        
        if not DATABASE_URL:
            # Fallback to direct AWS RDS connection if DATABASE_URL is not set
            db_user = os.getenv("DB_USER")
            db_password = os.getenv("DB_PASSWORD")
            db_host = os.getenv("DB_HOST")
            db_name = os.getenv("DB_NAME")
            
            # MySQL configuration
            DATABASE_URL = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
       
        app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
        app.config["DEBUG"] = False
        app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_EXPIRY", "3600"))  # 1 hour default
    elif config_name == "development":
        # Development database 
        DATABASE_URL = os.getenv("DATABASE_URL")
        
        if not DATABASE_URL:
            # Fallback to direct connection parameters
            db_user = os.getenv("DB_USER")
            db_password = os.getenv("DB_PASSWORD")
            db_host = os.getenv("DB_HOST") 
            db_name = os.getenv("DB_NAME")
            
            # MySQL configuration for development
            DATABASE_URL = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
        
        app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
        app.config["DEBUG"] = True
        app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_EXPIRY", "86400"))  # 24 hours default
    else:
        # Default fallback configuration (MySQL)
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///fallback.db")
        app.config["DEBUG"] = False
    
    # Common configurations
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Use ephemeral file system for Heroku or configurable path
    upload_folder = os.getenv("UPLOAD_FOLDER", "uploads")
    app.config["UPLOAD_FOLDER"] = upload_folder
    
    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
   
    # JWT Configuration - always use environment variable in production
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
   
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
        return jsonify({"message": "Network Scanner API", "status": "online"})
       
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "environment": config_name})
       
    return app

if __name__ == "__main__":
    # Get environment from env var or default to development
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(env)
    
    port = int(os.getenv("PORT", 5000))
    
    # For production, you should use Gunicorn (via Procfile)
    # This direct Flask server should only be used for development
    if env != "production":
        app.run(host="0.0.0.0", port=port, debug=(env == "development"))
    else:
        print("WARNING: Running in production mode with Flask's development server")
        print("In production, use: gunicorn 'app:create_app(\"production\")'")
        app.run(host="0.0.0.0", port=port, debug=False)