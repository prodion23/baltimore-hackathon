const express = require('express');
const router = express.Router();

const parking = require('./parking');

router.options('*', function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'DNT'); // If needed
    res.send('cors');
});

router.get('/park', parking.search);

module.exports = router;