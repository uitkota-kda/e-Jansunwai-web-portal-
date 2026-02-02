const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Sample Grievances...');

    const grievances = [
        {
            grievanceId: '2026/KDA/001',
            name: 'Rahul Verma',
            mobile: '9876543210',
            address: 'Plot 4, Indra Vihar, Kota',
            category: 'Sanitation',
            description: 'Garbage not collected for 3 days.',
            status: 'PENDING',
            source: 'WEB_PORTAL'
        },
        {
            grievanceId: '2026/KDA/002',
            name: 'Priya Singh',
            mobile: '9898989898',
            address: 'Sector 2, Talwandi, Kota',
            category: 'Road Maintenance',
            description: 'Large pothole causing traffic issues near circle.',
            status: 'IN_PROGRESS',
            assignedOfficer: 'Director Engineering',
            assignedSection: 'Director Engineering',
            expectedDate: '2026-02-05',
            source: 'WEB_PORTAL'
        },
        {
            grievanceId: '2026/KDA/003',
            name: 'Amit Kumar',
            mobile: '9123456780',
            address: 'Dadabari, Kota',
            category: 'Street Light',
            description: 'Street lights not working in lane 4.',
            status: 'RESOLVED',
            assignedOfficer: 'Director Engineering',
            assignedSection: 'Director Engineering',
            remarks: 'Lights replaced.',
            source: 'APP_MOBILE'
        },
        {
            grievanceId: '2026/KDA/004',
            name: 'Suresh Gupta',
            mobile: '8887776665',
            address: 'Rangbari, Kota',
            category: 'Encroachment',
            description: 'Illegal shop extension on public road.',
            status: 'ESCALATED',
            isEscalated: true,
            escalationLevel: 1,
            assignedOfficer: 'Commissioner',
            assignedSection: 'Encroachment Wing',
            source: 'WEB_PORTAL'
        },
        {
            grievanceId: '2026/KDA/005',
            name: 'Anita Sharma',
            mobile: '7778889990',
            address: 'Ex. Eng. Office Zone 1',
            category: 'Water Supply',
            description: 'Low water pressure in morning supply.',
            status: 'PENDING',
            source: 'CALL_CENTER'
        },
        {
            grievanceId: '2026/KDA/007',
            name: 'Vikram Singh',
            mobile: '9988776611',
            address: 'Zone 1 Revenue Office',
            category: 'Revenue Issue',
            description: 'TDR certificate issuance pending for 2 months.',
            status: 'IN_PROGRESS',
            assignedSection: 'Revenue',
            assignedZone: 'Revenue Desk', // Matches aao_revenue
            source: 'WEB_PORTAL'
        },
        {
            grievanceId: '2026/KDA/008',
            name: 'Meera Devi',
            mobile: '7766554433',
            address: 'Housing Board Colony',
            category: 'Housing',
            description: 'Allotment letter not received after full payment.',
            status: 'IN_PROGRESS',
            assignedSection: 'Director Engineering',
            assignedZone: 'Housing', // Matches ee_housing
            source: 'WEB_PORTAL'
        },
        {
            grievanceId: '2026/KDA/009',
            name: 'Rajesh Koothrappali',
            mobile: '8899001122',
            address: 'Planning Dept',
            category: 'Layout Approval',
            description: 'Commercial layout approval pending at directorate.',
            status: 'IN_PROGRESS',
            assignedSection: 'Director Planning', // Matches plan
            source: 'WEB_PORTAL'
        }
    ];

    for (const g of grievances) {
        await prisma.grievance.upsert({
            where: { grievanceId: g.grievanceId },
            update: {},
            create: g
        });
    }

    console.log(`Seeded ${grievances.length} grievances.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
