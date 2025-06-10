// categoryRoutes.js
const express = require('express');
const router = express.Router();

const testimonialController = require('../controllers/testimonialController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/add_testimonial_ajax', testimonialController.add_testimonial_ajax);
router.post('/get_all_testimonial_ajax', testimonialController.get_all_testimonial_ajax);
router.post('/get_wall_menu_data', testimonialController.get_wall_menu_data);
router.post('/testimonial_menu_position', testimonialController.testimonial_menu_position);
router.post('/updateTestimonial/:CategoryId', testimonialController.updateTestimonial);

router.get('/dashboard_details_data', testimonialController.dashboard_details_data);
router.get('/edit_testimonial/:id', testimonialController.edit_testimonial);
router.get('/status_change/:id/:Status', testimonialController.status_change);


// Export the router
module.exports = router;
