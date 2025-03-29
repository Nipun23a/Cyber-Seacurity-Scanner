from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

app = Flask(__name__)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize Database
from database import db
db.init_app(app)
from models import *

migrate = Migrate(app, db)  # Enable database migrations

@app.route('/')
def home():
    return jsonify({"message": "Hello World!"})

if __name__ == '__main__':
    app.run(debug=True)
