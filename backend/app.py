from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
import secrets

app = Flask(__name__)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Generate a secure JWT secret key
app.config["JWT_SECRET_KEY"] = secrets.token_hex(32)  # Secure secret key

# Initialize Database
from database import db
db.init_app(app)

# Import models AFTER initializing db
from models import *

# Enable database migrations
migrate = Migrate(app, db)

# Initialize JWT
jwt = JWTManager(app)

@app.route('/')
def home():
    return jsonify({"message": "Hello World!"})

if __name__ == '__main__':
    app.run(debug=True)
