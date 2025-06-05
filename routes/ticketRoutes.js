// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For non-file form data
const ticketController = require('../controllers/ticketController'); // Correct controller
// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));


// routes/userRoutes.js
router.post('/get_all_ticket_ajax', ticketController.get_all_ticket_ajax);
router.post('/add_user_ajax',upload.none(),  ticketController.add_user_ajax);
router.get('/edit_ticket/:id', ticketController.edit_ticket);
router.get('/status_change/:id/:Status', ticketController.status_change);
router.post('/updateTicket/:id', ticketController.updateTicket);


module.exports = router;
