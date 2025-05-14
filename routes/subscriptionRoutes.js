// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data
const subscriptionController = require('../controllers/subscriptionController'); // Correct controller
// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));


// routes/userRoutes.js
router.post('/get_all_user_ajax', userController.get_all_user_ajax);
router.post('/add_plan_ajax',upload.none(),  subscriptionController.add_plan_ajax);
router.get('/edit_user/:id', userController.edit_user);
router.get('/status_change/:id/:Status', userController.status_change);
router.post('/updateUser/:id', userController.updateUser);


module.exports = router;
