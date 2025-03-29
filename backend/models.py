from database import db
from datetime import datetime
from enum import Enum

# Enum for scan severity levels
class SeverityLevel(Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("user", "admin", name="user_roles"), default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    scans = db.relationship("Scan", backref="user", lazy=True)
    files = db.relationship("Files", backref="user", lazy=True)
    activity_logs = db.relationship('ActivityLog', backref="user", lazy=True)
    notifications = db.relationship('Notification', backref="user", lazy=True)

# Scan Model
class Scan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    device_name = db.Column(db.String(255), nullable=False)
    scan_type = db.Column(db.Enum("malware", "vulnerability", name="scan_type"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    scan_result = db.Column(db.JSON)
    severity = db.Column(db.Enum(SeverityLevel), nullable=True)
    scan_details = db.relationship("ScanDetails", backref="scan", lazy=True)
    recommendations = db.relationship('Recommendations', backref="scan", lazy=True)
    files = db.relationship("Files", backref="scan", lazy=True)

# Scan Details Model
class ScanDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'), nullable=False)
    issue_type = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.Enum(SeverityLevel), nullable=False)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)

# Recommendation Model
class Recommendations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'), nullable=False)
    issue = db.Column(db.String(255), nullable=False)
    severity = db.Column(db.Enum(SeverityLevel), nullable=False)
    solution = db.Column(db.Text, nullable=False)

# File Upload Model
class Files(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    upload_at = db.Column(db.DateTime, default=datetime.utcnow)

# Activity Log Model
class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Notification Model
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('unread', 'read', name='notification_status'), default='unread')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)