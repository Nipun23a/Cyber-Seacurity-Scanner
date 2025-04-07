from flask import Blueprint, request, jsonify
from database import db
from flask_jwt_extended import jwt_required,get_jwt_identity
import os

from werkzeug.utils import secure_filename

from models import Scan
from models import Files

upload_bp = Blueprint('upload',__name__)

@upload_bp.route('/upload',methods=['POST'])
@jwt_required
def upload_scan():
    current_user_id = get_jwt_identity()
    try:
        data = request.json
        if not data:
            return jsonify({"success": False,"error":"No data provided"}),400

        # Extract scan type from data
        scan_type = data('scan_type')
        if scan_type not in ['full_health','full_scan','custom_scan']:
            return jsonify({"success": False,"error":"Invalid scan type"}),400

        new_scan = Scan(
            user_id=current_user_id,
            scan_type=scan_type,
            results=data.get('results')
        )
        db.session.add(new_scan)
        db.session.flush()  # Flush to get the scan ID

        # If there are files associated with the scan
        if 'files' in data and isinstance(data['files'], list):
            for file_info in data['files']:
                file_path = file_info.get('path')
                if file_path:
                    new_file = Files(
                        user_id=current_user_id,
                        scan_id=new_scan.id,
                        file_path=secure_filename(file_path)
                    )
                    db.session.add(new_file)

        db.session.commit()

        return jsonify({
            "success": True,
            "scan_id": new_scan.id,
            "message": "Scan results uploaded successfully"
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


