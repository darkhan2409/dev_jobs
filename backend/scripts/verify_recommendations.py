import asyncio
import httpx
import sys

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test_rec_user@example.com"
TEST_PASSWORD = "Password123!"

async def verify_recommendations():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print(f"Checking API health at {BASE_URL}...")
        try:
            resp = await client.get("/health")
            resp.raise_for_status()
            print("✅ API is healthy.")
        except Exception as e:
            print(f"❌ API is not accessible: {e}")
            return

        # 1. Register/Login
        print(f"\nAuthenticating user {TEST_EMAIL}...")
        # Try login first
        login_data = {
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        resp = await client.post("/api/auth/token", data=login_data)
        
        if resp.status_code == 401:
            # Try register
            print("User not found, registering...")
            reg_resp = await client.post("/api/auth/register", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            if reg_resp.status_code not in [200, 201]:
                print(f"❌ Registration failed: {reg_resp.text}")
                return
            # Login again
            resp = await client.post("/api/auth/token", data=login_data)

        if resp.status_code != 200:
            print(f"❌ Authentication failed: {resp.text}")
            return
            
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Authenticated.")

        # 2. Setup Profile: Middle Python Developer
        print("\nSetting up profile: Grade='Middle', Skills=['Python', 'FastAPI']")
        profile_data = {
            "full_name": "Test Recommendation User",
            "grade": "Middle",
            "skills": ["Python", "FastAPI", "React"]
        }
        resp = await client.put("/api/users/me/profile", json=profile_data, headers=headers)
        if resp.status_code != 200:
            print(f"❌ Failed to update profile: {resp.text}")
            return
        print("✅ Profile updated.")

        # 3. Get Recommendations
        print("\nFetching recommendations...")
        resp = await client.get("/api/recommendations", headers=headers)
        if resp.status_code != 200:
            print(f"❌ Failed to get recommendations: {resp.text}")
            return
            
        vacancies = resp.json()
        print(f"Received {len(vacancies)} recommendations.")

        # 4. Verify Logic
        print("\nVerifying Logic:")
        passed = True
        
        if not vacancies:
            print("⚠️ No vacancies found to verify (Database might be empty).")
        
        for i, v in enumerate(vacancies[:5]):
            title = v.get('title', 'No Title')
            grade = v.get('grade')
            skills = v.get('key_skills') or []
            
            print(f"  {i+1}. [{grade}] {title} | Skills: {skills}")
            
            # Check Grade (Middle should see Junior, Middle, Senior)
            if grade and grade not in ["Junior", "Middle", "Senior"]:
                print(f"     ❌ Grade mismatch! 'Middle' user shouldn't see '{grade}'")
                passed = False
            
            # Check Skills (Ideally should contain Python/FastAPI/React)
            # Note: This is soft scoring, so it's not strictly required to match ALL, but high rank should match some.
            matches = set(s.lower() for s in skills) & {"python", "fastapi", "react"}
            print(f"     -> Matched skills: {matches}")

        if passed:
            print("\n✅ Verification PASSED: Logic seems correct.")
        else:
            print("\n❌ Verification FAILED: Logic errors detected.")

if __name__ == "__main__":
    asyncio.run(verify_recommendations())
