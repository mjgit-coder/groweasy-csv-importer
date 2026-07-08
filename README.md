# GrowEasy CSV Importer

A web application designed to extract and normalize CRM data from CSV files. It maps columns to a strict CRM schema, cleans data, and filters invalid records.

## Project Structure

- `/frontend` - Next.js frontend with Tailwind CSS.
- `/backend` - Python Flask API backend.

## Prerequisites

- Node.js (v18 or higher)
- Python (3.9 or higher)
- API Key (loaded via `.env`)

## Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Configure environment variables
# Add your GEMINI_API_KEY to a .env file

python app.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Features
- **Client-side Parsing**: Parses CSVs in the browser.
- **Batch Processing**: Dispatches records in small batches.
- **Validation**: Skips records missing both an email and mobile number.
- **Mapping**: Enforces CRM enums and maps extraneous data to a notes field.
