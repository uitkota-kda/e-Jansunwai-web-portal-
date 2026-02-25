const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');

// Public Routes
router.post('/login', userController.login);
// router.post('/', userController.createUser); // Potentially public for registration? Or admin only? 
// Provided app seems to be an internal tool. Let's assume registration is Admin only, BUT `create-ee-user.js` scripts exist.
// If I protect `createUser`, existing scripts (if they use this API) might break if they don't auth.
// However scripts seem to use Prisma directly.
// Let's protect user creation to be safe, assuming only Admins create users.
// WAIT: If I protect ALL user routes, including create, then initial setup might be hard via API.
// But `login` must be public.

// Protected Routes

router.get('/', verifyToken, userController.getAllUsers);
router.get('/role/:role', verifyToken, userController.getUsersByRole);
router.post('/', verifyToken, userController.createUser); // Protected: Only admins should create users
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
// router.post('/login', userController.login); // Already defined above as public

module.exports = router;
