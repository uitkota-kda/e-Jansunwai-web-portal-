const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const engineeringZones = [
    "CRF",
    "Housing",
    "Horticulture/ ABD",
    "Water - I",
    "Water - II",
    "Sewerage",
    "I-A",
    "I-B",
    "I-C",
    "I-D",
    "Headquarter",
    "II-A",
    "II-B",
    "III-A",
    "III-B",
    "III-C",
    "III-D",
    "IV-A",
    "IV-B",
    "IV-C",
    "Electricity"
];

async function main() {
    console.log('--- Starting Engineering & Section Fix Seed ---');

    const hashedPassword = await bcrypt.hash('kda123', 10);

    // 1. Fix Section Names for Directors
    const directorUpdates = [
        { old: 'Planning', new: 'Director Planning', user: 'dtp_planning' }, // dtp might be sub-official so check roles
        { user: 'plan', section: 'Director Planning' },
        { user: 'legal', section: 'Director Legal' },
        { user: 'fin', section: 'Director Finance' },
        { user: 'eng', section: 'Director Engineering' },
    ];

    console.log('Fixing Director Sections...');
    for (const update of directorUpdates) {
        if (update.user) {
            try {
                await prisma.user.updateMany({
                    where: { username: update.user },
                    data: { section: update.section }
                });
                console.log(`Updated ${update.user} -> ${update.section}`);
            } catch (e) {
                console.log(`Could not update ${update.user}: ${e.message}`);
            }
        }
    }

    // 2. Create Executive Engineers (Users)
    console.log(`Creating ${engineeringZones.length} Executive Engineers...`);

    for (const zone of engineeringZones) {
        // Generate a username like 'ee_crf', 'ee_water1', etc.
        const cleanZone = zone.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        const username = `ee_${cleanZone}`;

        try {
            await prisma.user.upsert({
                where: { username: username },
                update: {
                    password: hashedPassword,
                    role: 'EXECUTIVE_ENGINEER', // New Role
                    section: 'Director Engineering', // Parent Section
                    zone: zone // Specific Zone
                },
                create: {
                    name: `Ex. En. ${zone}`,
                    username: username,
                    password: hashedPassword,
                    role: 'EXECUTIVE_ENGINEER',
                    section: 'Director Engineering',
                    zone: zone
                }
            });
            console.log(`Created/Ensured EE: ${username} (${zone})`);
        } catch (e) {
            console.error(`Failed to create ${username}: ${e.message}`);
        }
    }

    console.log('--- Seed Completed ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
