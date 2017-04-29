import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MapsService } from '../providers/maps-service';
import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html',
  providers: [MapsService]
})
export class MyApp {
  rootPage:any = HomePage;
  tacos:string = "asd";
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private GMaps : MapsService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

