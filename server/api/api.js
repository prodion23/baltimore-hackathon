const express = require('express');
const router = express.Router();

const parking = require('./parking');

router.get('/park', parking.search);
router.options('*', function(result){
    res.send({status: 200});
});
module.exports = router;