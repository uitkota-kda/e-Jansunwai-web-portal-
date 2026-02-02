const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                section: true,
                email: true,
                createdAt: true
            }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await prisma.user.findMany({
            where: { role },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                section: true,
                zone: true
            }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create User
exports.createUser = async (req, res) => {
    try {
        const { name, username, password, role, section, email } = req.body;

        // Basic validation
        if (!name || !username || !password || !role) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role,
                section,
                email
            }
        });

        res.status(201).json({
            success: true, data: {
                id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Username or Email already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update User (Reset credentials)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, password, role, section, email } = req.body;

        const updateData = {
            name,
            username,
            role,
            section,
            email
        };

        // Only hash and update password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true, data: {
                id: updatedUser.id,
                name: updatedUser.name,
                username: updatedUser.username,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                role: user.role,
                section: user.section,
                zone: user.zone, // Critical for sub-official task filtering
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
