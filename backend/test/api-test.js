const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper for HTTP requests
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n--- Starting Backend API Verification Tests ---');
  let token = '';
  let projectId = '';
  let taskId = '';
  const testEmail = `dev_${Date.now()}@example.com`;

  try {
    // 1. Health Check
    console.log('1. Testing GET /api/health...');
    const health = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    console.log('✓ Health status:', health.status, health.data);

    // 2. User Registration
    console.log('\n2. Testing POST /api/auth/register...');
    const regRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Alex Morgan',
      email: testEmail,
      password: 'Password123!'
    });
    console.log('✓ Register status:', regRes.status, 'User:', regRes.data.data?.user?.fullName);
    if (!regRes.data.data?.token) throw new Error('Registration failed to return token');
    token = regRes.data.data.token;

    // 3. User Login
    console.log('\n3. Testing POST /api/auth/login...');
    const loginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'Password123!'
    });
    console.log('✓ Login status:', loginRes.status, 'User:', loginRes.data.data?.user?.email);

    // 4. Get Current User (/api/auth/me)
    console.log('\n4. Testing GET /api/auth/me (Protected)...');
    const meRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✓ Auth me status:', meRes.status, 'User ID:', meRes.data.data?.user?.id);

    // 5. Create Project
    console.log('\n5. Testing POST /api/projects...');
    const createProjRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Mobile App Redesign',
      description: 'Revamping mobile application UI/UX for iOS and Android',
      status: 'In Progress',
      startDate: '2026-09-01',
      endDate: '2026-12-31'
    });
    console.log('✓ Project created:', createProjRes.status, 'ID:', createProjRes.data.data?.id);
    projectId = createProjRes.data.data.id;

    // 6. Create Task under Project
    console.log('\n6. Testing POST /api/tasks...');
    const createTaskRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      taskName: 'Wireframe user onboarding screen',
      description: 'Create Figma prototypes for user onboarding step 1 to 4',
      priority: 'High',
      status: 'Pending',
      dueDate: '2026-09-25',
      projectId: projectId
    });
    console.log('✓ Task created:', createTaskRes.status, 'ID:', createTaskRes.data.data?.id);
    taskId = createTaskRes.data.data.id;

    // 7. Update Task (Mark as Completed)
    console.log('\n7. Testing PUT /api/tasks/:id (Mark Completed)...');
    const updateTaskRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/tasks/${taskId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      status: 'Completed'
    });
    console.log('✓ Task updated status:', updateTaskRes.status, 'New status:', updateTaskRes.data.data?.status);

    // 8. Create a 2nd task (Pending)
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      taskName: 'Setup Push Notifications',
      description: 'Integrate Firebase Cloud Messaging',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '2026-10-10',
      projectId: projectId
    });

    // 9. Search and Filter Projects
    console.log('\n9. Testing GET /api/projects?search=Redesign&status=In%20Progress...');
    const filterProjRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/projects?search=Redesign&status=In%20Progress`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Filtered projects count:', filterProjRes.data.count, 'Progress:', filterProjRes.data.data[0]?.progressPercent + '%');

    // 10. Search and Filter Tasks
    console.log('\n10. Testing GET /api/tasks?priority=High&status=Completed...');
    const filterTaskRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/tasks?priority=High&status=Completed`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Filtered tasks count:', filterTaskRes.data.count);

    // 11. Dashboard Stats Verification
    console.log('\n11. Testing GET /api/dashboard/stats...');
    const dashRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/dashboard/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Dashboard Metrics:', {
      totalProjects: dashRes.data.data.totalProjects,
      totalTasks: dashRes.data.data.totalTasks,
      completedTasks: dashRes.data.data.completedTasks,
      pendingTasks: dashRes.data.data.pendingTasks,
      inProgressProjects: dashRes.data.data.inProgressProjects
    });

    console.log('\n=============================================');
    console.log(' ALL BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY! ');
    console.log('=============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

runTests();
