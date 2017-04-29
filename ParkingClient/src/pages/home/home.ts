import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { CoordService } from '../../providers/coord-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [CoordService]
})
export class HomePage {

  constructor(public navCtrl: NavController, private geolocation: Geolocation, private xyz : CoordService) {


  }



  getLocation() {
	if (navigator.geolocation) {
      var options = {
        enableHighAccuracy: true
      };

      navigator.geolocation.getCurrentPosition(position=> {
        console.info('using navigator');
        console.info(position.coords.latitude);
        console.info(position.coords.longitude);
        let lat = position.coords.latitude;
        let long = position.coords.longitude;
        this.xyz.sendCoords(lat, long);
      }, error => {
        console.log(error);
      }, options);
    }
  }
}
