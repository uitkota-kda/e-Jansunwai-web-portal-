async function testUpdate() {
    try {
        const listRes = await fetch('http://localhost:3000/api/grievances');
        const listData = await listRes.json();
        const g = listData.data[0];
        if (!g) return console.log('No grievances found');

        console.log(`Testing ID: ${g.id} (${g.grievanceId})`);

        const res = await fetch(`http://localhost:3000/api/grievances/${g.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: g.status, remarks: 'Verified test remarks with 20+ characters', performedBy: 'DebugScript' })
        });

        const data = await res.json();
        console.log('--- PUT Response ---');
        console.log(JSON.stringify(data, null, 2));

    } catch (e) {
        console.log('Error: ' + e.message);
    }
}
testUpdate();
