const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Native fetch is available in Node 18+
// If for some reason it's not global, we'd need to import it, but v24 should have it.

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000/api';

async function main() {
    console.log('--- Starting Verification (using fetch) ---');

    let modUser, dirUser;
    let freshGrievance, assignedGrievance, otherGrievance;

    try {
        // 1. Setup Test Data
        const passwordHash = await bcrypt.hash('password123', 10);

        const timestamp = Date.now();

        // Create Users
        modUser = await prisma.user.create({
            data: {
                name: 'Test Moderator',
                username: `test_mod_${timestamp}`,
                password: passwordHash,
                role: 'MODERATOR',
                section: 'Admin',
                email: `mod_${timestamp}@test.com`
            }
        });

        dirUser = await prisma.user.create({
            data: {
                name: 'Test Director',
                username: `test_dir_${timestamp}`,
                password: passwordHash,
                role: 'SECTION_OFFICER',
                section: 'TestSection',
                email: `dir_${timestamp}@test.com`
            }
        });

        // Create Grievances
        freshGrievance = await prisma.grievance.create({
            data: {
                grievanceId: `TEST-FRESH-${timestamp}`,
                name: 'Citizen A',
                mobile: '1234567890',
                address: 'Test Address',
                category: 'General',
                description: 'Fresh Grievance',
                status: 'PENDING',
                assignedSection: null // FRESH
            }
        });

        assignedGrievance = await prisma.grievance.create({
            data: {
                grievanceId: `TEST-ASSIGNED-${timestamp}`,
                name: 'Citizen B',
                mobile: '1234567890',
                address: 'Test Address',
                category: 'General',
                description: 'Assigned Grievance',
                status: 'PENDING',
                assignedSection: 'TestSection' // ASSIGNED TO DIR
            }
        });

        otherGrievance = await prisma.grievance.create({
            data: {
                grievanceId: `TEST-OTHER-${timestamp}`,
                name: 'Citizen C',
                mobile: '1234567890',
                address: 'Test Address',
                category: 'General',
                description: 'Other Grievance',
                status: 'PENDING',
                assignedSection: 'OtherSection' // NOT FOR DIR
            }
        });

        console.log('Test Data Created.');

        // Helper for fetch
        const login = async (username) => {
            const res = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: 'password123' })
            });
            const data = await res.json();
            if (!data.success) throw new Error(`Login failed for ${username}: ${data.message}`);
            return data.data.token;
        };

        const getGrievances = async (token) => {
            const res = await fetch(`${BASE_URL}/grievances`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return data.data;
        };

        // 2. Test Moderator
        console.log('\nTesting MODERATOR Visibility...');
        const modToken = await login(modUser.username);
        const modGrievances = await getGrievances(modToken);

        const modSeesFresh = modGrievances.find(g => g.id === freshGrievance.id);
        const modSeesAssigned = modGrievances.find(g => g.id === assignedGrievance.id);
        const modSeesOther = modGrievances.find(g => g.id === otherGrievance.id);

        if (modSeesFresh && modSeesAssigned && modSeesOther) {
            console.log('✅ Moderator sees ALL grievances (Fresh, Assigned, Other).');
        } else {
            console.error('❌ Moderator visibility check FAILED.');
            console.log('Fresh:', !!modSeesFresh, 'Assigned:', !!modSeesAssigned, 'Other:', !!modSeesOther);
        }

        // 3. Test Director
        console.log('\nTesting DIRECTOR Visibility...');
        const dirToken = await login(dirUser.username);
        const dirGrievances = await getGrievances(dirToken);

        const dirSeesFresh = dirGrievances.find(g => g.id === freshGrievance.id);
        const dirSeesAssigned = dirGrievances.find(g => g.id === assignedGrievance.id);
        const dirSeesOther = dirGrievances.find(g => g.id === otherGrievance.id);

        if (!dirSeesFresh && dirSeesAssigned && !dirSeesOther) {
            console.log('✅ Director sees ONLY their assigned grievance.');
        } else {
            console.error('❌ Director visibility check FAILED.');
            if (dirSeesFresh) console.error('  - Director saw FRESH grievance (Should be hidden)');
            if (!dirSeesAssigned) console.error('  - Director MISSED assigned grievance (Should be visible)');
            if (dirSeesOther) console.error('  - Director saw OTHER section grievance (Should be hidden)');
        }

    } catch (error) {
        console.error('Test Execution Error:', error.message);
        if (error.cause) console.error(error.cause);
    } finally {
        // 4. Cleanup
        console.log('\nCleaning up...');
        try {
            if (freshGrievance) await prisma.actionLog.deleteMany({ where: { grievanceId: { in: [freshGrievance.id, assignedGrievance.id, otherGrievance.id] } } });
            if (freshGrievance) await prisma.grievance.deleteMany({ where: { id: { in: [freshGrievance.id, assignedGrievance.id, otherGrievance.id] } } });
            if (modUser) await prisma.user.deleteMany({ where: { id: { in: [modUser.id, dirUser.id] } } });
        } catch (cleanupErr) {
            console.error('Cleanup Error:', cleanupErr.message);
        }
        await prisma.$disconnect();
        console.log('Cleanup Done.');
    }
}

main();
