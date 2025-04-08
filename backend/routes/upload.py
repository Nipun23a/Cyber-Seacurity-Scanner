from flask import Blueprint, request, jsonify
from database import db
from sqlalchemy import desc
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import traceback
import json
from werkzeug.utils import secure_filename
from flask import jsonify, request
from datetime import datetime
import traceback


from werkzeug.utils import secure_filename

from models import Scan
from models import Files

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/upload', methods=['POST'])
@jwt_required()


def upload_scan():
    current_user_id = get_jwt_identity()
    try:
        print(f"[Upload] Starting upload process for user {current_user_id}")

        if not request.data:
            print("[Upload] Error: No data provided in request")
            return jsonify({"success": False, "error": "No data provided in request"}), 400

        if not request.is_json:
            print(f"[Upload] Error: Invalid content type - {request.content_type}")
            return jsonify({"success": False,
                            "error": f"Expected content type 'application/json', got '{request.content_type}'"}), 415

        data = request.get_json()
        if data is None:
            print("[Upload] Error: Invalid JSON format")
            return jsonify({"success": False, "error": "Invalid JSON format"}), 400

        # Check for required fields
        if 'scan_type' not in data:
            print("[Upload] Error: Missing scan_type field")
            return jsonify({"success": False, "error": "Missing required field: scan_type"}), 422

        if 'scan_result' not in data:
            print("[Upload] Error: Missing scan_result field")
            return jsonify({"success": False, "error": "Missing required field: scan_result"}), 422

        scan_type = data['scan_type']
        scan_result = data['scan_result']

        if scan_type not in ['quick', 'directory', 'full']:
            print(f"[Upload] Error: Invalid scan type - {scan_type}")
            return jsonify({"success": False, "error": f"Invalid scan type: {scan_type}"}), 422

        # Store the scan result as a JSON string
        scan_result_json = json.dumps(scan_result)

        # Create and save the new file record
        new_file = Files(
            user_id=current_user_id,
            scan_type=scan_type,
            scan_result=scan_result_json  # Store the scan result as JSON string
        )
        db.session.add(new_file)
        db.session.commit()

        print(f"[Upload] Successfully saved scan result to database")

        return jsonify({
            "success": True,
            "message": "Scan results uploaded successfully"
        })

    except Exception as e:
        db.session.rollback()
        error_traceback = traceback.format_exc()
        print(f"[Upload] Error in upload_scan: {str(e)}")
        print(f"[Upload] Traceback: {error_traceback}")
        return jsonify({"success": False, "error": str(e)}), 500 

@upload_bp.route('/result', methods=['GET'])
@jwt_required()
def get_scan_result():
    current_user_id = get_jwt_identity()
    try:
        # Get Scan Result Based on User ID
        scan_results = Files.query.filter_by(user_id=current_user_id).order_by(desc(Files.upload_at)).all()
        if not scan_results:
            return jsonify({"success": False, "message": "No scan results found for this user"}), 404
        
        # Serialize the results
        results = []
        for scan in scan_results:
            results.append({
                "id": scan.id,
                "scan_type": scan.scan_type.value,  # Assuming ScanType is an Enum
                "scan_result": scan.scan_result,
                "upload_at": scan.upload_at.isoformat()
            })
        
        return jsonify({"success": True, "results": results}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving scan results: {str(e)}"}), 500


        


