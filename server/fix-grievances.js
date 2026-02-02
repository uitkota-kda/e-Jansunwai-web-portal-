const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Grievance Sections ---');

    const updates = [
        { old: 'Planning', new: 'Director Planning' },
        { old: 'Legal', new: 'Director Legal' },
        { old: 'Finance', new: 'Director Finance' },
        { old: 'Engineering', new: 'Director Engineering' },
        { old: 'Revenue', new: 'Deputy commissioner I' } // Mapping old 'Revenue' to DC I as a fallback
    ];

    for (const update of updates) {
        try {
            const result = await prisma.grievance.updateMany({
                where: { assignedSection: update.old },
                data: { assignedSection: update.new }
            });
            console.log(`Updated ${result.count} grievances from '${update.old}' to '${update.new}'`);
        } catch (e) {
            console.error(`Error updating ${update.old}: ${e.message}`);
        }
    }

    console.log('--- Fix Complete ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
