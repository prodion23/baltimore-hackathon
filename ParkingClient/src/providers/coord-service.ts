import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class CoordService {

  constructor(public http: Http) {
    console.log('Hello CoordService Provider');
  }


  sendCoords(lat: number, long: number)
  {
		// Testing Data //
		//lat = 39.2773571;
		//long = -76.6114423;
  	return new Promise(resolve => {
  		console.log("Sending Coordinates to server: " + lat.toString() + " , " + long.toString());

  		let request = "https://stormy-ridge-40922.herokuapp.com/api/park?lat=" + lat.toString() + "&long=" + long.toString();

  		console.log(request);

  		this.http.get(request)
  		.map(res => res.json())
  			.subscribe(data => {
  			//console.log(data.results);
  			resolve(data);
  			});

  	});
  }

}
