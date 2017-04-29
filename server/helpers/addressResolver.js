var http = require('http');
var token = process.env['GOOGLE_MAPS_API_KEY'];

var rp = require('request-promise');

function resolve(lat, long) {
    //?latlng=40.714224,-73.961452&key=API_KEY
    var options = {
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        headers: {
            'User-Agent': 'request'
        },
        qs: {
            'latlng': lat+","+long,
            'key': token
        }
    };
   return rp(options);
}

module.exports.resolve = resolve;