const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const grievanceController = require('../controllers/grievance.controller');
const verifyToken = require('../middleware/auth.middleware');

// Public Routes (e.g. creating a grievance might be public? No, usually requires login or OTP. 
// Current app seems to allow public creation? 
// The prompt says "ensure there is no changes in the working". 
// If the current app creates grievances publicly, I should keep it public or check if it uses OTP.
// `router.post('/', ...)` is createGrievance.
// `router.post('/send-otp', ...)` suggests OTP based auth for public users?
// Let's protect internal routes like listing and updating.

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Public Routes
router.post('/', upload.single('attachment'), grievanceController.createGrievance); // Public submission
router.post('/send-otp', grievanceController.sendOTP); // Public OTP
router.post('/verify-otp', grievanceController.verifyOTP); // Public OTP
router.get('/:id', grievanceController.getGrievance); // Public tracking by ID? Helper logic needed if strictly private. 
// Usually tracking is public with an ID/Token. Leaving public to not break "Track Grievance" feature for citizens.

// Protected Routes (Officials)
router.put('/:id', verifyToken, upload.single('attachment'), grievanceController.updateGrievance);
// DELETE ROUTES DISABLED - Grievances cannot be deleted
// router.delete('/:id', verifyToken, grievanceController.deleteGrievance);
// router.delete('/', verifyToken, grievanceController.deleteAllGrievances);
router.get('/', verifyToken, grievanceController.listGrievances); // Dashboard list - Protected
router.post('/:id/feedback', grievanceController.submitFeedback); // User feedback - Public?
router.post('/:id/schedule-vc', verifyToken, grievanceController.scheduleSatisfactionVC);
router.post('/:id/complete-vc', verifyToken, grievanceController.completeSatisfactionVC);


module.exports = router;
