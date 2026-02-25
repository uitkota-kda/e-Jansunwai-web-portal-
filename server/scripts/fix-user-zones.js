const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fixing user zones consistency...');

    const fixes = [
        { username: 'tdr_zone1', zone: 'TDR Zone 1' },
        { username: 'tdr_zone2', zone: 'TDR Zone 2' },
        { username: 'tdr_zone3', zone: 'TDR Zone 3' },
        { username: 'tdr_zone4', zone: 'TDR Zone 4' },
        { username: 'aao_south', zone: 'AAO- Kota South' },
        { username: 'aao_north', zone: 'AAO- Kota North' },
        { username: 'aao_ladpura', zone: 'AAO- Ladpura' },
        { username: 'aao_ramganj', zone: 'AAO- Ramganjmandi' },
        { username: 'aao_revenue', zone: 'AAO- Kota South' } // Match seed.js update
    ];

    for (const f of fixes) {
        await prisma.user.updateMany({
            where: { username: f.username },
            data: { zone: f.zone }
        });
        console.log(`Ensured ${f.username} has zone: ${f.zone}`);
    }

    console.log('User zones fix complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
