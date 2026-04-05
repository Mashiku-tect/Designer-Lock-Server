const express = require('express');
const router = express.Router();
const { getPriceByImageId } = require('../controllers/FindProductPriceController');

router.get('/price/:id', getPriceByImageId);

module.exports = router;
