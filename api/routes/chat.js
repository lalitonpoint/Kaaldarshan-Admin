// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data 
const chatController = require('../controller/chatController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));


router.post('/starttt', chatController.content);
router.post('/start', chatController.start); // Twilio TwiML entry point
router.post('/speech', chatController.speech); // Speech response route


// Export the router
module.exports = router;
