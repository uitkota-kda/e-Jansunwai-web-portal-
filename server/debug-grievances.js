const fetch = require('node-fetch'); // Assuming node-fetch is available, or use native fetch if node 18+

async function testGrievances() {
    try {
        const response = await fetch('http://localhost:3000/api/grievances');
        const data = await response.json();
        console.log('Success:', data.success);
        if (data.success) {
            console.log('Count:', data.data.length);
            if (data.data.length > 0) {
                console.log('First Item Sample:');
                console.log(JSON.stringify(data.data[0], null, 2));
            } else {
                console.log('Data array is empty.');
            }
        }
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

testGrievances();
