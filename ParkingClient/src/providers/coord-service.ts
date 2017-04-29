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
  	return new Promise(resolve => {
  		console.log("Sending Coordinates to server: " + lat.toString() + " , " + long.toString());

  		let request = "/api/park?lat=" + lat.toString() + "&long=" + long.toString();

  		console.log(request);

  		this.http.get(request)
  		.map(res => res.json())
  			.subscribe(data => {
  			console.log(data.results);
  			resolve(data);
  			});

  	});
  }

}
