// using native fetch


const BASE_URL = 'http://localhost:3000/api/users/login';

const usersToTest = [
    { label: 'Super Admin', username: 'superadmin', password: 'kda123' },
    { label: 'Moderator', username: 'admin', password: 'kda123' },
    { label: 'Commissioner (Mock)', username: 'commissioner', password: '123' },
    { label: 'Director Engineering', username: 'eng', password: 'kda123' },
    { label: 'Director Finance', username: 'fin', password: 'kda123' },
    { label: 'Director Planning', username: 'plan', password: 'kda123' },
    { label: 'Director Legal', username: 'legal', password: 'kda123' },
    { label: 'DC I', username: 'dc1', password: 'kda123' },
    { label: 'DC II', username: 'dc2', password: 'kda123' },
    { label: 'Revenue (TDR)', username: 'tdr_zone1', password: 'kda123' },
    { label: 'Zone (Housing)', username: 'ee_housing', password: 'kda123' },
    { label: 'Operator', username: 'operator', password: 'kda123' }
];

async function testLogins() {
    console.log('--- Starting API Connectivity & Login Test ---\n');
    let successCount = 0;

    for (const user of usersToTest) {
        try {
            const start = Date.now();
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, password: user.password })
            });
            const data = await response.json();
            const duration = Date.now() - start;

            if (data.success) {
                console.log(`[PASS] ${user.label.padEnd(20)} | User: ${user.username.padEnd(12)} | ${duration}ms | Role: ${data.data.role}`);
                successCount++;
            } else {
                console.log(`[FAIL] ${user.label.padEnd(20)} | User: ${user.username.padEnd(12)} | Reason: ${data.message}`);
            }
        } catch (error) {
            console.log(`[ERROR] ${user.label.padEnd(20)} | Connection Failed: ${error.message}`);
        }
    }

    console.log(`\n--- Test Complete: ${successCount}/${usersToTest.length} Passed ---`);
}

testLogins();
