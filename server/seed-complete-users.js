const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

const ENGINEERING_ZONES = [
    "CRF", "Housing", "Horticulture/ ABD", "Water - I", "Water - II", "Sewerage",
    "I-A", "I-B", "I-C", "I-D", "Headquarter", "II-A", "II-B", "III-A", "III-B",
    "III-C", "III-D", "IV-A", "IV-B", "IV-C", "Electricity"
];

const REVENUE_ZONES = [
    { name: 'TDR Zone 1', username: 'tdr_zone1', section: 'Deputy commissioner I' },
    { name: 'TDR Zone 2', username: 'tdr_zone2', section: 'Deputy commissioner I' },
    { name: 'TDR Zone 3', username: 'tdr_zone3', section: 'Deputy commissioner I' },
    { name: 'TDR Zone 4', username: 'tdr_zone4', section: 'Deputy commissioner I' },
    { name: 'AAO- Kota South', username: 'aao_south', section: 'Deputy commissioner II' },
    { name: 'AAO- Kota North', username: 'aao_north', section: 'Deputy commissioner II' },
    { name: 'AAO- Ladpura', username: 'aao_ladpura', section: 'Deputy commissioner II' },
    { name: 'AAO- Ramganjmandi', username: 'aao_ramganj', section: 'Deputy commissioner II' }
];

const PLANNING_ZONES = [
    { name: "Deputy Town Planner", username: "dtp", section: "Director Planning" },
    { name: "ATP Zone 1", username: "atp_zone1", section: "Director Planning" },
    { name: "ATP Zone 2", username: "atp_zone2", section: "Director Planning" },
    { name: "ATP Zone 3", username: "atp_zone3", section: "Director Planning" },
    { name: "ATP Zone 4", username: "atp_zone4", section: "Director Planning" }
];

const LEGAL_ZONES = [
    { name: "DLR", username: "dlr_legal", section: "Director Legal" },
    { name: "SLO", username: "slo_legal", section: "Director Legal" },
    { name: "JLO", username: "jlo_legal", section: "Director Legal" }
];

const FINANCE_ZONES = [
    { name: "Asst Accounts Officer-I", username: "aao_fin1", section: "Director Finance" },
    { name: "Asst Accounts Officer-II", username: "aao_fin2", section: "Director Finance" }
];

async function main() {
    const password = 'kda123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        { username: 'superadmin', password: hashedPassword, name: 'Master Admin', role: 'SUPER_ADMIN' },
        { username: 'admin', password: hashedPassword, name: 'System Moderator', role: 'MODERATOR' },
        { username: 'operator', password: hashedPassword, name: 'Data Entry Operator', role: 'OPERATOR' },
        { username: 'commissioner', password: hashedPassword, name: 'Commissioner KDA', role: 'COMMISSIONER' },
        
        // Officials (Directors & DCs)
        { username: 'dc1', password: hashedPassword, name: 'Deputy Commissioner I', role: 'SECTION_OFFICER', section: 'Deputy commissioner I' },
        { username: 'dc2', password: hashedPassword, name: 'Deputy Commissioner II', role: 'SECTION_OFFICER', section: 'Deputy commissioner II' },
        { username: 'eng', password: hashedPassword, name: 'Director Engineering', role: 'SECTION_OFFICER', section: 'Director Engineering' },
        { username: 'fin', password: hashedPassword, name: 'Director Finance', role: 'SECTION_OFFICER', section: 'Director Finance' },
        { username: 'plan', password: hashedPassword, name: 'Director Planning', role: 'SECTION_OFFICER', section: 'Director Planning' },
        { username: 'legal', password: hashedPassword, name: 'Director Legal', role: 'SECTION_OFFICER', section: 'Director legal' }
    ];

    // Add Revenue Officials
    REVENUE_ZONES.forEach(z => {
        users.push({
            username: z.username,
            password: hashedPassword,
            name: z.name,
            role: 'REVENUE_OFFICIAL',
            section: z.section,
            zone: z.name
        });
    });

    // Add Planning Officials
    PLANNING_ZONES.forEach(z => {
        users.push({
            username: z.username,
            password: hashedPassword,
            name: z.name,
            role: 'PLANNING_OFFICIAL',
            section: z.section,
            zone: z.name
        });
    });

    // Add Legal Officials
    LEGAL_ZONES.forEach(z => {
        users.push({
            username: z.username,
            password: hashedPassword,
            name: z.name,
            role: 'LEGAL_OFFICIAL',
            section: z.section,
            zone: z.name
        });
    });

    // Add Finance Officials
    FINANCE_ZONES.forEach(z => {
        users.push({
            username: z.username,
            password: hashedPassword,
            name: z.name,
            role: 'FINANCE_OFFICIAL',
            section: z.section,
            zone: z.name
        });
    });

    // Add Executive Engineers
    ENGINEERING_ZONES.forEach(zone => {
        const cleanZone = zone.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        users.push({
            username: `ee_${cleanZone}`,
            password: hashedPassword,
            name: `Ex. En. ${zone}`,
            role: 'EXECUTIVE_ENGINEER',
            section: 'Director Engineering',
            zone: zone
        });
    });

    console.log(`--- Seeding ${users.length} Users ---`);

    for (const u of users) {
        try {
            await prisma.user.upsert({
                where: { username: u.username },
                update: {
                    password: u.password,
                    name: u.name,
                    role: u.role,
                    section: u.section || null,
                    zone: u.zone || null
                },
                create: {
                    id: randomUUID(),
                    ...u,
                    section: u.section || null,
                    zone: u.zone || null
                }
            });
            // console.log(`Seeded: ${u.username}`);
        } catch (e) {
            console.error(`Error seeding ${u.username}:`, e.message);
        }
    }

    console.log('--- All Users Seeded Successfully ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
