// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const termController = require('../controllers/termconditionController');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/add_term_ajax', upload.none(), termController.addterm);
router.post('/get_all_term_ajax', termController.get_all_term_ajax);
router.post('/get_wall_menu_data', termController.get_wall_menu_data);
router.post('/category_menu_position', termController.category_menu_position);
router.post('/updateAbout/:CategoryId', termController.updateAbout);

router.get('/dashboard_details_data', termController.dashboard_details_data);
router.get('/edit_term/:id', termController.edit_term);
router.get('/status_change/:id/:Status', termController.status_change);

module.exports = router;
