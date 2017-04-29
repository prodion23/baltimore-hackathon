import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private geolocation: Geolocation) {


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
      }, error => {
        console.log(error);
      }, options);
    }
  }
}
