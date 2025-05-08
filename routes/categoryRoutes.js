// categoryRoutes.js
const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/add_category_ajax', categoryController.addCategory);
router.post('/get_all_category_ajax', categoryController.get_all_category_ajax);
router.post('/get_wall_menu_data', categoryController.get_wall_menu_data);
router.post('/category_menu_position', categoryController.category_menu_position);
router.post('/updateCategory/:CategoryId', categoryController.updateCategory);

router.get('/dashboard_details_data', categoryController.dashboard_details_data);
router.get('/edit_category/:id', categoryController.edit_category);
router.get('/status_change/:id/:Status', categoryController.status_change);


// Export the router
module.exports = router;
