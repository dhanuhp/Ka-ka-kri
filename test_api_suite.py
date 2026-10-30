import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline():
    print("[1/10] Testing Health Endpoint...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    assert r.json()["status"] == "healthy"
    print("  -> Health OK!")

    print("[2/10] Testing Candidate Login...")
    r = client.post("/api/auth/login", json={
        "email": "candidate@prepsense.ai",
        "password": "Candidate123!"
    })
    assert r.status_code == 200, f"Candidate login failed: {r.text}"
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("  -> Login & JWT token issued OK!")

    print("[3/10] Testing User Profile & Progress...")
    r = client.get("/api/users/profile", headers=headers)
    assert r.status_code == 200, f"Profile fetch failed: {r.text}"
    profile = r.json()
    assert "skills" in profile
    print(f"  -> Profile loaded with target role: {profile.get('target_role')}")

    r = client.get("/api/users/progress", headers=headers)
    assert r.status_code == 200
    progress = r.json()
    print(f"  -> Readiness score: {progress.get('readiness_score')}%")

    print("[4/10] Testing Code Execution Engine (Local Sandbox)...")
    code_req = {
        "language": "python",
        "code": "def solve(x):\n    return x * 2\nimport sys\nval = int(sys.stdin.read().strip())\nprint(solve(val))",
        "test_cases": [
            {"input": "5", "expected": "10"},
            {"input": "21", "expected": "42"}
        ]
    }
    r = client.post("/api/coding/run", headers=headers, json=code_req)
    assert r.status_code == 200, f"Code runner failed: {r.text}"
    code_res = r.json()
    assert code_res["status"] == "accepted", f"Code status was {code_res['status']}"
    assert code_res["tests_passed"] == 2
    print(f"  -> Passed {code_res['tests_passed']}/{code_res['total_tests']} tests in {code_res['runtime_ms']}ms!")

    print("[5/10] Testing Interview Creation & Question Synthesis...")
    int_req = {
        "role": "Senior Backend Engineer",
        "interview_type": "mixed",
        "difficulty": "medium",
        "total_questions": 2,
        "duration_minutes": 20,
        "focus_topics": ["FastAPI", "PostgreSQL", "Concurrency"]
    }
    r = client.post("/api/interviews/create", headers=headers, json=int_req)
    assert r.status_code == 200, f"Interview creation failed: {r.text}"
    interview = r.json()
    int_id = interview["id"]
    assert len(interview["questions"]) >= 2
    print(f"  -> Created interview #{int_id} with {len(interview['questions'])} synthesized questions!")

    print("[6/10] Testing Candidate Answer Submission & Evaluation...")
    q1 = interview["questions"][0]
    ans_req = {
        "question_id": q1["id"],
        "answer_text": "We handle concurrency using non-blocking asynchronous event loop with async and await, and manage database connection pooling to avoid resource starvation under high I/O workloads.",
        "duration_seconds": 90
    }
    r = client.post(f"/api/interviews/{int_id}/answer", headers=headers, json=ans_req)
    assert r.status_code == 200, f"Answer submission failed: {r.text}"
    ans_res = r.json()
    assert ans_res["evaluation"] is not None
    print(f"  -> Evaluated with score: {ans_res['evaluation']['score']}/100!")

    print("[7/10] Testing Interview Completion & PDF Generation...")
    r = client.post(f"/api/interviews/{int_id}/complete", headers=headers)
    assert r.status_code == 200, f"Completion failed: {r.text}"
    comp_res = r.json()
    print(f"  -> Recommendation: {comp_res['recommendation']}, PDF URL: {comp_res['pdf_url']}")

    print("[8/10] Testing Performance Analytics & Knowledge Gaps...")
    r = client.get("/api/analytics/overview", headers=headers)
    assert r.status_code == 200, f"Analytics overview failed: {r.text}"
    anal_res = r.json()
    assert "category_scores" in anal_res
    print(f"  -> Total Interviews in Analytics: {anal_res['total_interviews']}, Avg Score: {anal_res['average_score']}%")

    print("[9/10] Testing Personalized Learning Roadmap...")
    r = client.get("/api/roadmaps/current", headers=headers)
    assert r.status_code == 200, f"Roadmap fetch failed: {r.text}"
    roadmap = r.json()
    assert len(roadmap["tasks"]) > 0
    t1 = roadmap["tasks"][0]
    print(f"  -> Roadmap has {len(roadmap['tasks'])} tasks. Updating Task #{t1['id']} to completed...")
    r = client.patch(f"/api/roadmaps/tasks/{t1['id']}", headers=headers, json={"status": "completed"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"
    print("  -> Task completed and readiness updated!")

    print("[10/10] Testing Admin Dashboard & Question Bank...")
    r = client.post("/api/auth/login", json={
        "email": "admin@prepsense.ai",
        "password": "Admin123!"
    })
    assert r.status_code == 200
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    r = client.get("/api/admin/stats", headers=admin_headers)
    assert r.status_code == 200, f"Admin stats failed: {r.text}"
    stats = r.json()
    print(f"  -> Admin stats: {stats['total_users']} users, {stats['total_interviews']} interviews")

    r = client.get("/api/admin/questions", headers=admin_headers)
    assert r.status_code == 200
    print(f"  -> Question bank contains {len(r.json())} curated questions!")

    print("\n==========================================")
    print("ALL 10 API TEST SUITES PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    test_full_pipeline()
