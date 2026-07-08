import os
import json
import google.generativeai as genai
from typing import List, Dict, Any

def get_ai_service():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash')

def map_csv_batch(batch_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    model = get_ai_service()
    
    prompt = f"""
You are an expert data migration assistant. 
You are given a batch of raw, messy CSV rows represented as JSON objects. 
Your task is to map each object to a strict CRM schema and return a JSON array containing the mapped objects.

CRITICAL RULES:
1. Output a JSON array of objects.
2. Output EXACTLY the following keys for each object:
    - created_at: Must be parseable by JavaScript's `new Date()`.
    - name: String.
    - email: Use the first valid email found.
    - country_code: String (e.g., "+1", "+91").
    - mobile_without_country_code: Use the first valid mobile number found, without the country code.
    - company: String.
    - city: String.
    - state: String.
    - country: String.
    - lead_owner: String.
    - crm_status: MUST be EXACTLY ONE OF: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]. Pick the closest, default "GOOD_LEAD_FOLLOW_UP".
    - crm_note: Move ALL secondary emails, secondary phone numbers, remarks, or extra messy data here. Combine them into a single string.
    - data_source: MUST be EXACTLY ONE OF: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"].
    - possession_time: String.
    - description: String.
    
3. If any field is missing from the source data, output null or an empty string for that field, but the KEY MUST EXIST.
4. Data Cleaning: Move secondary emails/phones/remarks to `crm_note`.

Batch Data:
{json.dumps(batch_data)}
"""
    
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    
    try:
        mapped_data = json.loads(response.text)
        return mapped_data if isinstance(mapped_data, list) else []
    except Exception as e:
        print("Error parsing JSON from Gemini:", e)
        return []
