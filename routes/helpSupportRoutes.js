// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data 
const helpController = require('../controllers/helpController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/add_help_ajax',upload.none(),helpController.addsupport);
router.post('/get_all_support_ajax', helpController.get_all_support_ajax);
router.post('/get_wall_menu_data', helpController.get_wall_menu_data);
router.post('/category_menu_position', helpController.category_menu_position);
// router.post('/updateBlog/:id', blogController.updateBlog);
router.post('/updateAbout/:CategoryId', helpController.updateAbout);


router.get('/dashboard_details_data', helpController.dashboard_details_data);
router.get('/edit_term/:id', helpController.edit_about);
router.get('/status_change/:id/:Status', helpController.status_change);


// Export the router
module.exports = router;
