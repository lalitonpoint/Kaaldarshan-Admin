// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data
const userController = require('../controllers/userController'); // Correct controller
// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));


// routes/userRoutes.js
router.post('/get_all_user_ajax', userController.get_all_user_ajax);
router.post('/add_user_ajax',upload.none(),  userController.add_user_ajax);
router.get('/edit_user/:id', userController.edit_user);
router.get('/status_change/:id/:Status', userController.status_change);
router.post('/updateUser/:id', userController.updateUser);
router.post('/billing_details', userController.aws_billing_details);
router.post('/get_aws_billing_data_from_db', userController.get_aws_billing_data_from_db);
router.post('/generate_custom_qr',upload.single('logo'),userController.generate_custom_qr);


module.exports = router;
