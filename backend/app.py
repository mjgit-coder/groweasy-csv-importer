import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from services.ai_service import map_csv_batch

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/import', methods=['POST'])
def import_csv_batch():
    try:
        data = request.json
        if not data or not isinstance(data, list):
            return jsonify({"error": "Invalid input. Expected a JSON array of records."}), 400

        mapped_batch = map_csv_batch(data)
        
        validated_batch = []
        skipped_count = 0
        
        for record in mapped_batch:
            has_email = bool(record.get('email') and str(record.get('email')).strip())
            has_mobile = bool(record.get('mobile_without_country_code') and str(record.get('mobile_without_country_code')).strip())
            
            if has_email or has_mobile:
                validated_batch.append(record)
            else:
                skipped_count += 1
                
        return jsonify({
            "status": "success",
            "processed": len(mapped_batch),
            "validated": len(validated_batch),
            "skipped": skipped_count,
            "data": validated_batch
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
