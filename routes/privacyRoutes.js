// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data 
const privacyController = require('../controllers/privacyController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/add_about_ajax', upload.none(),privacyController.addterm);
router.post('/get_all_privacy_ajax', privacyController.get_all_privacy_ajax);
router.post('/get_wall_menu_data', privacyController.get_wall_menu_data);
router.post('/category_menu_position', privacyController.category_menu_position);
// router.post('/updateBlog/:id', blogController.updateBlog);
router.post('/updateAbout/:CategoryId', privacyController.updateAbout);


router.get('/dashboard_details_data', privacyController.dashboard_details_data);
router.get('/edit_term/:id', privacyController.edit_term);
router.get('/status_change/:id/:Status', privacyController.status_change);


// Export the router
module.exports = router;
