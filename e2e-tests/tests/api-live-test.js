const testLive = async () => {
  const baseUrl = 'https://pathology-lab-r16i.onrender.com/api';
  console.log('🚀 Starting Live API E2E Test (Registration -> Patient -> Booking)...');

  const testUser = {
    name: 'E2E Admin',
    email: `e2e_${Date.now()}@lab.com`,
    password: 'password123',
    role: 'admin',
    phone: '9876543210'
  };

  try {
    // 1. Register
    console.log('1️⃣ Registering Admin...');
    let res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    let data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log('✅ Registered successfully.');

    // 2. Login
    console.log('2️⃣ Logging in...');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    data = await res.json();
    if (!data.success) throw new Error(data.message);
    const token = data.data.token;
    console.log('✅ Logged in successfully.');

    // 3. Create Patient with the USER'S REAL EMAIL
    console.log('3️⃣ Creating Patient with email: kasimshah998@gmail.com...');
    const patientData = {
      name: `Test Patient ${Date.now()}`,
      age: 25,
      gender: 'male',
      email: 'kasimshah998@gmail.com', // REAL EMAIL HERE
      phone: '9876543210'
    };
    res = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });
    data = await res.json();
    if (!data.success) throw new Error(data.message);
    const patientId = data.data._id;
    console.log('✅ Patient created successfully.');

    // 4. Create a Dummy Test (Since we need a test to book)
    console.log('4️⃣ Creating a Test...');
    const testPayload = {
      testName: `Test ${Date.now()}`,
      testCode: `TST-${Date.now()}`,
      category: 'hematology',
      price: 500
    };
    res = await fetch(`${baseUrl}/tests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testPayload)
    });
    data = await res.json();
    if (!data.success) throw new Error(data.message);
    const testId = data.data._id;
    console.log('✅ Test created successfully.');

    // 5. Create Booking (THIS TRIGGERS THE EMAIL)
    console.log('5️⃣ Creating Booking (Should trigger email)...');
    const bookingPayload = {
      patientId: patientId,
      tests: [testId]
    };
    res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingPayload)
    });
    data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log('✅ Booking created successfully!');
    console.log('\n🎉 ALL DONE! Check kasimshah998@gmail.com for the Booking Confirmation email!');

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }
};

testLive();
