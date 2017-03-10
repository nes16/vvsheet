import {  Component,NgZone } from '@angular/core';

declare let window:any;

@Component({
  selector: 'google-auth-ng2',
  template: '<span *ngIf="authenticated">Welcome {{name}}</span><button id="googleSignInButton" (click)="onAuthClick($event)" class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></button>'
})
export class GoogleAuth {
 initAPI: Promise<any>;
 name:string;
 authenticated:boolean = false;

  constructor(private _ngZone: NgZone) {

  }


  ngOnInit()
  {
    this.initAPI = new Promise(
        (resolve) => {
          window['onLoadGoogleAPI'] =
              () => {
                  resolve(window.gapi);
          };
          this.init();
        }
    )
  }

  init(){
    let meta = document.createElement('meta');
    meta.name = 'google-signin-client_id';
    meta.content = '233380418266-7vhpeeb7hmmj248uacdjpi9m5jjl8pms.apps.googleusercontent.com';
    document.getElementsByTagName('head')[0].appendChild(meta);
    let meta1 = document.createElement('meta');
    meta1.name = 'google-signin-scope';
    meta1.content = 'https://www.googleapis.com/auth/spreadsheets';
    document.getElementsByTagName('head')[0].appendChild(meta1);

    let meta2 = document.createElement('meta');
    meta2.name = 'google-signin-ux_mode';
    meta2.content = 'redirect';
    document.getElementsByTagName('head')[0].appendChild(meta2);
    let node = document.createElement('script');
    node.src = 'https://apis.google.com/js/platform.js?onload=onLoadGoogleAPI';
    node.type = 'text/javascript';
    document.getElementsByTagName('body')[0].appendChild(node);
  }

  ngAfterViewInit() {
    this.initAPI.then(
      (gapi) => {
        gapi.load('auth2', () =>
        {
          var auth2 = gapi.auth2.getAuthInstance();
          auth2.attachClickHandler(document.getElementById('googleSignInButton'), {},
              this.onSuccess,
              this.onFailure
          );
          // Listen for sign-in state changes.
          auth2.isSignedIn.listen(this.updateSigninStatus);
        });
      }
    )
  }

  onAuthClick(evt){
    if(this.authenticated){
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log('User signed out.');
      });
    }
    else{
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signIn();
    }

  }

  updateSigninStatus = (isSignedIn:boolean) => {
    this._ngZone.run(
          () => {
            if(isSignedIn){
              this.authenticated = true;
              let user:any = window.gapi.auth2.getAuthInstance().currentUser.get();
              this.name = user.getBasicProfile().getName();
              //document.getElementById('googleSignInButton').innerHTML='Signout'
            }
            else{
              this.authenticated = false;
              //document.getElementById('googleSignInButton').innerHTML='Sign In'
            }
          }
      );
  };

  onSuccess = (user) => {
      this._ngZone.run(
          () => {
              this.name = user.getBasicProfile().getName();
          }
      );
  };

  onFailure = (error) => {
    this._ngZone.run(() => {
        //display spinner
         alert('=====Login failed====\n'+error);
    });
  }

  printProfile(googleUser){
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
  }
}