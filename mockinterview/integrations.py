import os
import requests


def execute_code(source, language='python', stdin=''):
    api_url = os.getenv('JUDGE0_API_URL')
    if not api_url:
        return {'status': 'not_configured',
                'message': 'Judge0 is not configured. Configure JUDGE0_API_URL and JUDGE0_API_KEY on the server.'}
    language_ids = {'c': 50, 'cpp': 54, 'javascript': 63, 'java': 62, 'python': 71}
    payload = {'source_code': source, 'language_id': language_ids.get(language, 71), 'stdin': stdin}
    headers = {'X-RapidAPI-Key': os.getenv('JUDGE0_API_KEY', '')}
    response = requests.post(f'{api_url.rstrip("/")}/submissions?base64_encoded=false&wait=true',
                             json=payload, headers=headers, timeout=20)
    response.raise_for_status()
    data = response.json()
    return {'status': data.get('status', {}).get('description', 'unknown'), 'output': data.get('stdout') or '',
            'compile_output': data.get('compile_output') or '', 'error': data.get('stderr') or ''}
