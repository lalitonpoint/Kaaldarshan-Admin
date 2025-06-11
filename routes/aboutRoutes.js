// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data 
const aboutController = require('../controllers/aboutController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/add_about_ajax', upload.none(),aboutController.addabout);
router.post('/get_all_about_ajax', aboutController.get_all_about_ajax);
router.post('/get_wall_menu_data', aboutController.get_wall_menu_data);
router.post('/category_menu_position', aboutController.category_menu_position);
// router.post('/updateBlog/:id', blogController.updateBlog);
router.post('/updateAbout/:CategoryId', aboutController.updateAbout);


router.get('/dashboard_details_data', aboutController.dashboard_details_data);
router.get('/edit_about/:id', aboutController.edit_about);
router.get('/status_change/:id/:Status', aboutController.status_change);


// Export the router
module.exports = router;
