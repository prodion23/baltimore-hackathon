const express = require('express');
const router = express.Router();

const parking = require('./parking');

router.get('/park', parking.search);

module.exports = router;