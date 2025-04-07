from flask import Blueprint,send_from_directory,abort,current_app
from flask_jwt_extended import jwt_required,get_jwt_identity
import os

download_bp = Blueprint('download', __name__)

@download_bp.route('/scannerGUI.exe', methods=["GET"])
@jwt_required()
def download_scanner_exe():
    try:
        current_user = get_jwt_identity()
        download_dir = os.path.join(current_app.root_path, 'protected_downloads')
        return send_from_directory(
            directory=download_dir,
            path='scannerGUI.exe',
            as_attachment=True
        )
    except Exception as e:
        current_app.logger.error(f"Download error: {str(e)}")
        abort(500)

