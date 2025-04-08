from flask import Blueprint, send_from_directory, abort, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

download_bp = Blueprint('download', __name__)

@download_bp.route('/scannerGUI.exe', methods=["GET"])
@jwt_required()
def download_scanner_exe():
    try:
        current_user = get_jwt_identity()
        # Make sure the directory exists and has the file
        download_dir = os.path.join(current_app.root_path, 'protected_downloads')
        file_path = os.path.join(download_dir, 'scannerGUI.exe')
        
        if not os.path.exists(file_path):
            current_app.logger.error(f"File not found: {file_path}")
            return jsonify({"error": "File not found"}), 404
            
        return send_from_directory(
            directory=download_dir,
            path='scannerGUI.exe',
            as_attachment=True
        )
    except Exception as e:
        current_app.logger.error(f"Download error: {str(e)}")
        return jsonify({"error": str(e)}), 500