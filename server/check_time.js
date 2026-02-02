const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const grievances = await prisma.grievance.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { grievanceId: true, createdAt: true, updatedAt: true }
    });
    console.log('Last 5 grievances:');
    grievances.forEach(g => {
        console.log(`ID: ${g.grievanceId}`);
        console.log(`  createdAt: ${g.createdAt.toISOString()}`);
        console.log(`  updatedAt: ${g.updatedAt.toISOString()}`);
        console.log(`  Local Parsed: ${new Date(g.createdAt).toLocaleString()}`);
    });

    const now = new Date();
    console.log('\nServer Current Time:');
    console.log(`  Date(): ${now.toString()}`);
    console.log(`  ISO: ${now.toISOString()}`);
    console.log(`  toLocaleString: ${now.toLocaleString()}`);

    process.exit(0);
}

check();
