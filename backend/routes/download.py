from flask import Blueprint, send_from_directory, abort, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import boto3
from botocore.exceptions import ClientError

download_bp = Blueprint('download', __name__)


@download_bp.route('/scannerGUI.exe', methods=["GET"])
@jwt_required()
def download_scanner_exe():
    try:
        current_user = get_jwt_identity()
        
        # Direct S3 URL
        direct_url = "https://scannerbuckethashadilakme.s3.ap-southeast-1.amazonaws.com/scannerGUI.exe"
        
        return jsonify({"download_url": direct_url})
   
    except Exception as e:
        current_app.logger.error(f"Download error: {str(e)}")
        return jsonify({"error": str(e)}), 500