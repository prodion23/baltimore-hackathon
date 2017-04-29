import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng } from '@ionic-native/google-maps';
import 'rxjs/add/operator/map';


@Injectable()
export class MapsService {
	
  public map: GoogleMap;                                                                                                                                                                                                                                                                                                                                 Map;
  public apiKey : string;

  constructor(public http: Http, private gMap : GoogleMaps) {
    this.LoadAPIKey();
  }

  LoadAPIKey()
  {
  	this.http.get('assets/data/park.json') // env vars
      .map(res => res.json())
      	.subscribe(data => 
      	{	
      	 this.apiKey = data.api;
      	});
  }




  getGoogleMap(lat : number, long : number)
  {
    let element: HTMLElement = document.getElementById('map');
    let location : LatLng = new LatLng(lat,long);
 
        this.map = new GoogleMap('map', {
          'backgroundColor': 'white',
          'controls': {
            'compass': true,
            'myLocationButton': true,
            'indoorPicker': true,
            'zoom': true
          },
          'gestures': {
            'scroll': true,
            'tilt': true,
            'rotate': true,
            'zoom': true
          },
          'camera': {
            'latLng': location,
            'tilt': 30,
            'zoom': 15,
            'bearing': 50
          }
        });

        this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
            console.log('Map is ready!');
            this.gMap.create(element);  
        });
  }


}
