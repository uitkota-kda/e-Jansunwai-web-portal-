const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const grievanceController = require('../controllers/grievance.controller');

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

router.post('/', upload.single('attachment'), grievanceController.createGrievance);
router.post('/send-otp', grievanceController.sendOTP);
router.post('/verify-otp', grievanceController.verifyOTP);
router.get('/:id', grievanceController.getGrievance);
router.put('/:id', upload.single('attachment'), grievanceController.updateGrievance);
// DELETE ROUTES DISABLED - Grievances cannot be deleted
// router.delete('/:id', grievanceController.deleteGrievance);
// router.delete('/', grievanceController.deleteAllGrievances);
router.get('/', grievanceController.listGrievances);
router.post('/:id/feedback', grievanceController.submitFeedback);
router.post('/:id/schedule-vc', grievanceController.scheduleSatisfactionVC);
router.post('/:id/complete-vc', grievanceController.completeSatisfactionVC);


module.exports = router;
