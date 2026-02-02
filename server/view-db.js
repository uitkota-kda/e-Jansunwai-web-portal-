require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Database connected successfully!');

    // Count records
    const grievanceCount = await prisma.grievance.count();
    const userCount = await prisma.user.count();

    console.log(`\nDatabase Statistics:`);
    console.log(`- Grievances: ${grievanceCount}`);
    console.log(`- Users: ${userCount}`);

    // Find grievance with attachment
    const withAttachment = await prisma.grievance.findFirst({
        where: { NOT: { attachmentPath: null } }
    });

    if (withAttachment) {
        console.log(`\nGrievance with Attachment:`);
        console.log(`- ID: ${withAttachment.grievanceId}`);
        console.log(`  Path: ${withAttachment.attachmentPath}`);
    } else {
        console.log(`\nNo grievances with attachments found in database.`);
    }


}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
