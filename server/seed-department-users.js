const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const users = [
    // Revenue (Deputy Commissioner I & II)
    { name: 'TDR Zone 1', username: 'tdr_zone1', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'TDR Zone 2', username: 'tdr_zone2', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'TDR Zone 3', username: 'tdr_zone3', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'TDR Zone 4', username: 'tdr_zone4', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'AAO- Kota South', username: 'aao_south', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'AAO- Kota North', username: 'aao_north', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'AAO- Ladpura', username: 'aao_ladpura', role: 'REVENUE_OFFICIAL', section: 'Revenue' },
    { name: 'AAO- Ramganjmandi', username: 'aao_ramganj', role: 'REVENUE_OFFICIAL', section: 'Revenue' },

    // Planning (Director Planning)
    { name: 'Deputy Town Planner', username: 'dtp_planning', role: 'PLANNING_OFFICIAL', section: 'Planning' },
    { name: 'ATP Zone 1', username: 'atp_zone1', role: 'PLANNING_OFFICIAL', section: 'Planning' },
    { name: 'ATP Zone 2', username: 'atp_zone2', role: 'PLANNING_OFFICIAL', section: 'Planning' },
    { name: 'ATP Zone 3', username: 'atp_zone3', role: 'PLANNING_OFFICIAL', section: 'Planning' },
    { name: 'ATP Zone 4', username: 'atp_zone4', role: 'PLANNING_OFFICIAL', section: 'Planning' },

    // Legal (Director Legal)
    { name: 'DLR', username: 'dlr_legal', role: 'LEGAL_OFFICIAL', section: 'Legal' },
    { name: 'SLO', username: 'slo_legal', role: 'LEGAL_OFFICIAL', section: 'Legal' },
    { name: 'JLO', username: 'jlo_legal', role: 'LEGAL_OFFICIAL', section: 'Legal' },

    // Finance (Director Finance)
    { name: 'Asst Accounts Officer-I', username: 'aao_finance1', role: 'FINANCE_OFFICIAL', section: 'Finance' },
    { name: 'Asst Accounts Officer-II', username: 'aao_finance2', role: 'FINANCE_OFFICIAL', section: 'Finance' },
];

async function main() {
    console.log('Seeding Department Users with Hashed Passwords...');

    // Hash password once
    const hashedPassword = await bcrypt.hash('kda123', 10);

    for (const u of users) {
        try {
            await prisma.user.upsert({
                where: { username: u.username },
                update: {
                    password: hashedPassword,
                    role: u.role,
                    section: u.section,
                    zone: u.name
                },
                create: {
                    name: u.name,
                    username: u.username,
                    password: hashedPassword,
                    role: u.role,
                    section: u.section,
                    zone: u.name // Storing actual designation in 'zone' field for tracking
                }
            });
            console.log(`Created/Ensured: ${u.username}`);
        } catch (e) {
            console.error(`Error creating ${u.username}: ${e.message}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
