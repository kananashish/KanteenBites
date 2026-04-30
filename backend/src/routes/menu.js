const express = require('express');
const MenuController = require('../controllers/MenuController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', MenuController.getMenu);
router.get('/categories', MenuController.getCategories);
router.get('/:id', MenuController.getMenuItem);

router.post('/', authMiddleware, adminMiddleware, MenuController.createMenuItem);
router.patch('/:id', authMiddleware, adminMiddleware, MenuController.updateMenuItem);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, MenuController.toggleAvailability);

module.exports = router;
