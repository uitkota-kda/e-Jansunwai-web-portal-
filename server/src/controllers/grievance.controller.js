const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Grievance
exports.createGrievance = async (req, res) => {
    try {
        console.log('--- Incoming Grievance Request ---');
        console.log('Body:', req.body);

        const { name, mobile, address, category, description, source } = req.body;
        const attachmentPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        // Basic Validation
        if (!name || !address || !description) {
            console.log('Validation Failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, address, or description'
            });
        }

        // Generate Sequential ID: KDA-YYYY-XXXX
        const currentYear = new Date().getFullYear();

        // Find the most recently created grievance for the current year
        const lastGrievance = await prisma.grievance.findFirst({
            where: {
                grievanceId: {
                    startsWith: `KDA-${currentYear}-`
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let nextNumber = 1;
        if (lastGrievance && lastGrievance.grievanceId) {
            const parts = lastGrievance.grievanceId.split('-');
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum)) {
                nextNumber = lastNum + 1;
            }
        }

        const grievanceId = `KDA-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;

        const newGrievance = await prisma.grievance.create({
            data: {
                grievanceId,
                name: String(name),
                mobile: String(mobile || 'NOT_PROVIDED'),
                address: String(address),
                category: String(category || 'General'),
                description: String(description),
                source: String(source || 'WEB_PORTAL'),
                status: 'PENDING',
                attachmentPath
            }
        });

        console.log('Success: Grievance created with ID:', newGrievance.grievanceId);

        res.status(201).json({
            success: true,
            message: 'Grievance submitted successfully',
            grievanceId: newGrievance.grievanceId,
            data: newGrievance
        });
    } catch (error) {
        console.error('--- Backend Create Error ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.code) console.error('Prisma Error Code:', error.code);

        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Get Grievance by Public ID or UUID
exports.getGrievance = async (req, res) => {
    try {
        const { id } = req.params;
        if (/^\d{10}$/.test(id)) {
            // It's a mobile number, search for all matching grievances
            const grievances = await prisma.grievance.findMany({
                where: { mobile: id },
                include: {
                    logs: {
                        orderBy: {
                            timestamp: 'asc'
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (grievances.length === 0) {
                return res.status(404).json({ success: false, message: 'No grievances found for this mobile number' });
            }

            // Return list
            return res.json({ success: true, data: grievances, type: 'list' });
        }

        // Try Public ID or UUID
        let grievance = await prisma.grievance.findUnique({
            where: { grievanceId: id },
            include: { logs: { orderBy: { timestamp: 'asc' } } }
        });

        if (!grievance) {
            grievance = await prisma.grievance.findUnique({
                where: { id: id },
                include: { logs: { orderBy: { timestamp: 'asc' } } }
            });
        }

        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found' });
        }

        // Return single object
        res.json({ success: true, data: grievance, type: 'single' });
    } catch (error) {
        console.error('Get error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update Grievance
exports.updateGrievance = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const attachmentPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        const cleanId = id?.trim();
        console.log(`[UpdateGrievance] Request ID: "${id}" (len: ${id?.length}), Clean ID: "${cleanId}"`);

        let grievance = await prisma.grievance.findUnique({
            where: { id: cleanId } // Try internal UUID
        });

        if (!grievance) {
            console.log(`[UpdateGrievance] UUID not found for "${cleanId}", trying public grievanceId...`);
            grievance = await prisma.grievance.findUnique({
                where: { grievanceId: cleanId } // Try Public ID
            });
        }

        if (!grievance) {
            console.error(`[UpdateGrievance] 404: No grievance found for ID: "${cleanId}"`);
            return res.status(404).json({
                success: false,
                message: `Grievance not found (ID: ${cleanId}). Please refresh the page.`,
                debug: { receivedId: id, cleanedId: cleanId, idLength: id?.length }
            });
        }

        // Prevent updates to RESOLVED or REJECTED grievances (Unless it's being re-opened)
        if ((grievance.status === 'RESOLVED' || grievance.status === 'REJECTED') && !updates.isReopened) {
            return res.status(403).json({
                success: false,
                message: `Cannot modify grievance. This grievance has been ${grievance.status.toLowerCase()} and is now closed.`
            });
        }

        if (!updates || typeof updates !== 'object') {
            console.error('[UpdateGrievance] 400: Invalid update data received:', updates);
            return res.status(400).json({ success: false, message: 'Invalid update data' });
        }

        // Handle Status Update & Logging
        const statusChanged = updates.status && updates.status !== grievance.status;

        // Clean up updates object to only include fields present in Prisma model
        const validFields = [
            'status', 'subStatus', 'assignedToId', 'category', 'description',
            'hearingDate', 'hearingTime', 'hearingLink', 'isEscalated',
            'escalationLevel', 'assignedOfficer', 'assignedSection', 'assignedZone',
            'expectedDate', 'remarks', 'eeRemarks', 'eeStatus', 'eeActionDate', 'directorNote',
            'isReopened', 'reopenedBy', 'reopenReason',
            'satisfactionStatus', 'citizenFeedback', 'vcScheduledDate', 'vcMeetingLink'
        ];
        const dataToUpdate = {};
        validFields.forEach(field => {
            if (updates[field] !== undefined) {
                // Robustness check: if the field is expected to be a string but is an object, try to extract the value
                // (This handles cases where the frontend sends the whole state object into a single field)
                if (typeof updates[field] === 'object' && updates[field] !== null && updates[field][field] !== undefined) {
                    dataToUpdate[field] = String(updates[field][field]);
                } else {
                    dataToUpdate[field] = updates[field];
                }
            }
        });

        // Determine effective attachment path for the Grievance model.
        // If this is an EE action (eeStatus present), we preserve the original attachmentPath.
        // The new attachment will ONLY go to ActionLog.
        let grievanceAttachmentPath = attachmentPath || grievance.attachmentPath;
        if (updates.eeStatus) {
            grievanceAttachmentPath = grievance.attachmentPath; // Keep original
        }

        console.log(`[UpdateGrievance] Performing update on UUID: ${grievance.id}`);
        const updatedGrievance = await prisma.grievance.update({
            where: { id: grievance.id }, // Use found UUID
            data: {
                ...dataToUpdate,
                attachmentPath: grievanceAttachmentPath,
                updatedAt: new Date()
            }
        });

        if (updates.status === 'RESOLVED' && grievance.status !== 'RESOLVED') {
            await prisma.grievance.update({
                where: { id: updatedGrievance.id },
                data: { satisfactionStatus: 'PENDING_FEEDBACK' }
            });
            console.log(`[Satisfaction Workflow] Triggered feedback request for ${grievance.grievanceId}`);
        }

        // Add to ActionLog if status changed or specific action taken
        if (statusChanged || updates.remarks || updates.eeRemarks || attachmentPath) {
            let actionText = updates.status || 'Updated';
            if (updates.status === 'PENDING' && !updates.assignedSection && grievance.assignedSection) {
                actionText = `Returned by ${grievance.assignedSection}`;
            }

            await prisma.actionLog.create({
                data: {
                    grievanceId: updatedGrievance.id,
                    action: actionText,
                    performedBy: updates.performedBy || 'Officer',
                    attachmentPath: attachmentPath || (updates.eeRemarks ? `Official Report: ${updates.eeRemarks}` : (updates.remarks ? `Remarks: ${updates.remarks}` : null)),
                    timestamp: new Date()
                }
            });
        }

        // Refetch with logs to return the full object
        const finalGrievance = await prisma.grievance.findUnique({
            where: { id: grievance.id }, // Use found UUID
            include: { logs: { orderBy: { timestamp: 'desc' } } }
        });

        res.json({ success: true, data: finalGrievance });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Submit Citizen Feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body; // 'YES' or 'NO'

        let grievance = await prisma.grievance.findUnique({ where: { id: id } });
        if (!grievance) {
            grievance = await prisma.grievance.findUnique({ where: { grievanceId: id } });
        }

        if (!grievance) return res.status(404).json({ success: false, message: 'Grievance not found' });

        let newStatus = grievance.satisfactionStatus;
        let actionLog = '';

        // Case 1: Initial Feedback
        if (!grievance.satisfactionStatus || grievance.satisfactionStatus === 'PENDING_FEEDBACK') {
            if (feedback === 'YES') {
                newStatus = 'SATISFIED';
                actionLog = 'Citizen marked SATISFIED';
            } else {
                newStatus = 'NOT_SATISFIED';
                actionLog = 'Citizen marked NOT SATISFIED. Flagged for Section Officer VC.';
            }
        }
        // Case 2: Post-VC Feedback (Section Officer)
        else if (grievance.satisfactionStatus === 'VC_DONE_SO' || grievance.satisfactionStatus === 'VC_SCHEDULED_SO') {
            if (feedback === 'YES') {
                newStatus = 'SATISFIED_POST_VC_SO';
                actionLog = 'Citizen SATISFIED after Section Officer VC.';
            } else {
                newStatus = 'NOT_SATISFIED_POST_VC_SO';
                actionLog = 'Citizen NOT SATISFIED after SO VC. Esculated to Commissioner.';
            }
        }

        let mainStatus = grievance.status;
        if (feedback === 'NO') {
            mainStatus = 'UNSATISFIED';
        } else if (feedback === 'YES') {
            mainStatus = 'RESOLVED';
        }

        await prisma.grievance.update({
            where: { id: grievance.id },
            data: {
                satisfactionStatus: newStatus,
                citizenFeedback: feedback,
                status: mainStatus
            }
        });

        await prisma.actionLog.create({
            data: {
                grievanceId: grievance.id,
                action: feedback === 'NO' ? 'Marked as UNSATISFIED' : 'Marked as RESOLVED (Satisfied)',
                performedBy: 'Citizen',
                attachmentPath: `Feedback: ${feedback}. ${actionLog}`
            }
        });

        res.json({ success: true, message: 'Feedback recorded', status: newStatus });

    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Schedule Satisfaction VC
exports.scheduleSatisfactionVC = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, link, level } = req.body; // level: 'SO' or 'COMMISSIONER'

        let grievance = await prisma.grievance.findUnique({ where: { id: id } });
        if (!grievance) {
            grievance = await prisma.grievance.findUnique({ where: { grievanceId: id } });
        }

        if (!grievance) return res.status(404).json({ success: false, message: 'Grievance not found' });

        let newStatus = grievance.satisfactionStatus;
        if (level === 'SO') newStatus = 'VC_SCHEDULED_SO';
        if (level === 'COMMISSIONER') newStatus = 'VC_SCHEDULED_COMMISSIONER';

        await prisma.grievance.update({
            where: { id: grievance.id },
            data: {
                satisfactionStatus: newStatus,
                vcScheduledDate: new Date(date),
                vcMeetingLink: link
            }
        });

        // Notify Citizen
        console.log(`[VC Scheduled] Level: ${level}, Date: ${date}, Link: ${link}`);

        await prisma.actionLog.create({
            data: {
                grievanceId: grievance.id,
                action: `VC Scheduled (${level})`,
                performedBy: req.body.performedBy || 'System',
                attachmentPath: `Date: ${date}, Link: ${link}`
            }
        });

        res.json({ success: true, message: 'VC Scheduled' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error scheduling VC' });
    }
};

// Complete VC and Trigger Next Feedback
exports.completeSatisfactionVC = async (req, res) => {
    try {
        const { id } = req.params;
        const { level } = req.body; // 'SO' or 'COMMISSIONER'

        let grievance = await prisma.grievance.findUnique({ where: { id: id } });
        if (!grievance) {
            grievance = await prisma.grievance.findUnique({ where: { grievanceId: id } });
        }

        if (!grievance) return res.status(404).json({ success: false, message: 'Grievance not found' });

        let newStatus = grievance.satisfactionStatus;

        if (level === 'SO') {
            newStatus = 'VC_DONE_SO'; // Now explicitly waiting for feedback
            // Trigger "Are you satisfied now?" message
        } else if (level === 'COMMISSIONER') {
            newStatus = 'CLOSED_HIGHER_W_VC'; // Workflow Ends
        }

        await prisma.grievance.update({
            where: { id: grievance.id },
            data: { satisfactionStatus: newStatus }
        });

        res.json({ success: true, message: 'VC Marked as Done', status: newStatus });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error completing VC' });
    }
};

// List all Grievances (Protected & Filtered by Role)
exports.listGrievances = async (req, res) => {
    try {
        // req.user is set by verifyToken middleware (contains id, role, section)
        // We fetch the full user to get 'zone' or other details if needed, 
        // and to ensure we have the latest role/section info.
        if (!req.user || !req.user.id) {
            console.error('[listGrievances] No user in request');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let whereClause = {};

        // ROLE-BASED FILTERING
        // 1. Moderators / Admins / Commissioners: See ALL
        if (['MODERATOR', 'ADMIN', 'COMMISSIONER'].includes(user.role)) {
            // No filter, they see everything
            whereClause = {};
        }
        // 2. Section Officers (Directors, DCs, etc.): See ONLY assigned to their section (or zone if they have one)
        else if (user.role === 'SECTION_OFFICER') {
            if (user.zone && user.section) {
                whereClause = {
                    OR: [
                        { assignedSection: user.section },
                        { assignedZone: user.zone }
                    ]
                };
            } else if (user.section) {
                whereClause = {
                    assignedSection: user.section
                };
            } else if (user.zone) {
                whereClause = {
                    assignedZone: user.zone
                };
            } else {
                whereClause = { id: 'NO_MATCH' };
            }
        }
        // 3. Sub-Officials (Executive Engineers, etc.): See ONLY assigned to their Zone
        else if (['EXECUTIVE_ENGINEER', 'REVENUE_OFFICIAL', 'PLANNING_OFFICIAL', 'LEGAL_OFFICIAL', 'FINANCE_OFFICIAL'].includes(user.role)) {
            if (user.zone) {
                whereClause = {
                    assignedZone: user.zone
                };
            } else {
                whereClause = { id: 'NO_MATCH' };
            }
        }
        // 4. Fallback for other roles (e.g., OPERATOR) - limit visibility or show all? 
        // Assuming Operators might need to see all or specific logic. 
        // For safety, let's restriction to configured roles. 
        // If role is unknown, maybe show nothing?
        // Let's assume other roles can't login or verified upstream.

        console.log(`[listGrievances] User: ${user.username} (${user.role}), Section: ${user.section}, Zone: ${user.zone}`);
        console.log(`[listGrievances] Filter:`, JSON.stringify(whereClause));

        const grievances = await prisma.grievance.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { logs: { orderBy: { timestamp: 'desc' } } }
        });

        res.json({ success: true, data: grievances });
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// OTP Storage (In-memory for demo)
const otpStore = new Map();

// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(mobile, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

        console.log(`[OTP] Sent to ${mobile}: ${otp}`);

        // In a real app, you'd call an SMS gateway here.
        // For this demo, we'll assume it's sent.
        res.json({ success: true, message: 'OTP sent successfully', otp }); // Returning OTP for demo ease
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { mobile, otp } = req.body;
    const stored = otpStore.get(mobile);

    if (!stored) return res.status(400).json({ success: false, message: 'No OTP found for this number' });
    if (Date.now() > stored.expires) {
        otpStore.delete(mobile);
        return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (stored.otp === otp) {
        otpStore.delete(mobile);
        res.json({ success: true, message: 'OTP verified' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
};

// Delete Single Grievance
exports.deleteGrievance = async (req, res) => {
    try {
        const { id } = req.params; // Public grievanceId (KDA-...)

        // Find internal ID first for related data cleanup
        const grievance = await prisma.grievance.findUnique({
            where: { grievanceId: id },
            select: { id: true }
        });

        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found' });
        }

        // Delete related logs first to avoid foreign key errors
        await prisma.actionLog.deleteMany({
            where: { grievanceId: grievance.id }
        });

        // Now delete the grievance
        await prisma.grievance.delete({
            where: { id: grievance.id }
        });

        res.json({ success: true, message: 'Grievance deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete grievance' });
    }
};

// Bulk Delete Grievances
exports.deleteAllGrievances = async (req, res) => {
    try {
        const { ids } = req.body; // Array of public grievanceIds

        if (ids && Array.isArray(ids) && ids.length > 0) {
            // Get internal IDs for selected grievances
            const grievances = await prisma.grievance.findMany({
                where: { grievanceId: { in: ids } },
                select: { id: true }
            });

            const internalIds = grievances.map(g => g.id);

            // Delete all related logs
            await prisma.actionLog.deleteMany({
                where: { grievanceId: { in: internalIds } }
            });

            // Delete the grievances
            await prisma.grievance.deleteMany({
                where: { id: { in: internalIds } }
            });

            return res.json({ success: true, message: `${ids.length} grievances deleted` });
        }

        // Wipe everything (Logs first, then Grievances)
        await prisma.actionLog.deleteMany();
        await prisma.grievance.deleteMany();

        res.json({ success: true, message: 'All grievances deleted' });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete grievances' });
    }
};
