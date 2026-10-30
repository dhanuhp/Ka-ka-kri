# PrepWise

PrepWise is a Django-based technical interview preparation MVP with authentication, real persisted interview responses, answer evaluation, analytics, profiles, resumes, learning roadmaps, interview history, settings, and staff administration.

## Run locally

```powershell
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open `http://127.0.0.1:8000`.

## Environment variables

Copy `.env.example` to `.env`, or set these values in your shell.

- `DJANGO_SECRET_KEY`: secret key used by Django.
- `DJANGO_DEBUG`: `True` for development, `False` for production.
- `DJANGO_ALLOWED_HOSTS`: comma-separated host names.
- `OPENAI_API_KEY`: optional server-side AI provider key.
- `GEMINI_API_KEY`: optional server-side AI provider key.
- `JUDGE0_API_URL`: optional Judge0 API base URL.
- `JUDGE0_API_KEY`: optional Judge0 API key.

API keys are only read by server-side Django settings/services and must never be included in templates or JavaScript.
