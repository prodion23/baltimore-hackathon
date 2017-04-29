var http = require('http');
var token = process.env['OPEN_DATA_API_KEY'];

var rp = require('request-promise');

var addressResolver = require('./../helpers/addressResolver');

function search(req, res) {

    getAddress(req.params.lat, req.params.long);

    
}

function findRules(){
    var options = {
        url: 'https://data.baltimorecity.gov/resource/fxmk-qkxu.json',
        headers: {
            'User-Agent': 'request'
        },
        params: {
            '$limit': 5,
            '$$app_token': token
        }
    };

   rp(options, function(error, data, body){
       res.send(body);
   });
}

function getAddress(lat, long){
    addressResolver.resolve(lat, long).then(function(response){
        //findRules()
    }).catch(function(error){
        console.log('error resolving address');
    });
}

module.exports.search = search;