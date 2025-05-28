// categoryRoutes.js
const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blogController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/add_blog_ajax', blogController.addBlog);
router.post('/get_all_category_ajax', blogController.get_all_category_ajax);
router.post('/get_wall_menu_data', blogController.get_wall_menu_data);
router.post('/category_menu_position', blogController.category_menu_position);
router.post('/updateCategory/:CategoryId', blogController.updateCategory);

router.get('/dashboard_details_data', blogController.dashboard_details_data);
router.get('/edit_category/:id', blogController.edit_category);
router.get('/status_change/:id/:Status', blogController.status_change);


// Export the router
module.exports = router;
