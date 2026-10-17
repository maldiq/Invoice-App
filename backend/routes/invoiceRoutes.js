const express = require('express');
const controller = require('../controllers/invoiceController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired);

router.get('/', controller.getAll);
router.get('/next-number', controller.getNextNumber);
router.get('/report/by-status', controller.getReportByStatus);
router.get('/dashboard', controller.getDashboard);
router.post('/:id/email', controller.sendEmail);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
