// Test script for Auth APIs using native fetch

async function testAuth() {
  console.log("🚀 Starting Auth API Tests...\n");

  const testUser = {
    name: "Admin User",
    email: `admin_${Date.now()}@lab.com`, // unique email every time
    password: "password123",
    role: "admin",
    phone: "9876543210"
  };

  try {
    // 1. Test Registration
    console.log("1️⃣ Testing Registration (POST /api/auth/register)...");
    const regRes = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    
    const regData = await regRes.json();
    console.log("Response:", regData);
    
    if (!regData.success) {
      console.log("❌ Registration failed. Stopping tests.");
      return;
    }
    console.log("✅ Registration successful!\n");

    // 2. Test Login
    console.log("2️⃣ Testing Login (POST /api/auth/login)...");
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginRes.json();
    console.log("Response:", loginData);

    if (!loginData.success) {
      console.log("❌ Login failed. Stopping tests.");
      return;
    }
    console.log("✅ Login successful! Token received.\n");

    // 3. Test Get My Profile (Protected Route)
    console.log("3️⃣ Testing Get Profile (GET /api/auth/me)...");
    const token = loginData.data.token;
    
    const profileRes = await fetch("http://localhost:5000/api/auth/me", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const profileData = await profileRes.json();
    console.log("Response:", profileData);

    if (profileData.success) {
      console.log("✅ Profile fetch successful!\n");
      console.log("🎉 ALL TESTS PASSED!");
    } else {
      console.log("❌ Profile fetch failed.");
    }

  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

testAuth();
