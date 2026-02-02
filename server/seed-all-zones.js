const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const users = [
    // Revenue (Deputy Commissioner I & II)
    { name: 'TDR Zone 1', username: 'tdr_zone1', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner I', zone: 'TDR Zone 1' },
    { name: 'TDR Zone 2', username: 'tdr_zone2', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner I', zone: 'TDR Zone 2' },
    { name: 'TDR Zone 3', username: 'tdr_zone3', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner I', zone: 'TDR Zone 3' },
    { name: 'TDR Zone 4', username: 'tdr_zone4', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner I', zone: 'TDR Zone 4' },
    { name: 'AAO Kota South', username: 'aao_south', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner II', zone: 'AAO- Kota South' },
    { name: 'AAO Kota North', username: 'aao_north', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner II', zone: 'AAO- Kota North' },
    { name: 'AAO Ladpura', username: 'aao_ladpura', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner II', zone: 'AAO- Ladpura' },
    { name: 'AAO Ramganjmandi', username: 'aao_ramganjmandi', role: 'REVENUE_OFFICIAL', section: 'Deputy commissioner II', zone: 'AAO- Ramganjmandi' },

    // Planning (Director Planning)
    { name: 'Deputy Town Planner', username: 'dtp', role: 'PLANNING_OFFICIAL', section: 'Director Planning', zone: 'Deputy Town Planner' },
    { name: 'ATP Zone 1', username: 'atp_zone1', role: 'PLANNING_OFFICIAL', section: 'Director Planning', zone: 'ATP Zone 1' },
    { name: 'ATP Zone 2', username: 'atp_zone2', role: 'PLANNING_OFFICIAL', section: 'Director Planning', zone: 'ATP Zone 2' },
    { name: 'ATP Zone 3', username: 'atp_zone3', role: 'PLANNING_OFFICIAL', section: 'Director Planning', zone: 'ATP Zone 3' },
    { name: 'ATP Zone 4', username: 'atp_zone4', role: 'PLANNING_OFFICIAL', section: 'Director Planning', zone: 'ATP Zone 4' },

    // Legal (Director Legal)
    { name: 'DLR Legal', username: 'dlr_legal', role: 'LEGAL_OFFICIAL', section: 'Director Legal', zone: 'DLR' },
    { name: 'SLO Legal', username: 'slo_legal', role: 'LEGAL_OFFICIAL', section: 'Director Legal', zone: 'SLO' },
    { name: 'JLO Legal', username: 'jlo_legal', role: 'LEGAL_OFFICIAL', section: 'Director Legal', zone: 'JLO' },

    // Finance (Director Finance)
    { name: 'AAO I Finance', username: 'aao_fin1', role: 'FINANCE_OFFICIAL', section: 'Director Finance', zone: 'Asst Accounts Officer-I' },
    { name: 'AAO II Finance', username: 'aao_fin2', role: 'FINANCE_OFFICIAL', section: 'Director Finance', zone: 'Asst Accounts Officer-II' }
];

async function main() {
    const password = 'kda123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('--- Seeding All Departmental Zones ---');

    for (const u of users) {
        try {
            const user = await prisma.user.upsert({
                where: { username: u.username },
                update: {
                    name: u.name,
                    role: u.role,
                    section: u.section,
                    zone: u.zone
                },
                create: {
                    ...u,
                    password: hashedPassword
                }
            });
            console.log(`User created/updated: ${user.username} (${user.role} - ${user.zone})`);
        } catch (e) {
            console.error(`Error for ${u.username}: ${e.message}`);
        }
    }

    console.log('--- Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
