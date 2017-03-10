import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HistoryPage } from '../pages/history/history';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { SheetSrv } from '../providers/sheet';
import { GoogleAuth } from '../components/google_auth/google_auth';


@NgModule({
  declarations: [
    MyApp,
    HistoryPage,
    HomePage,
    TabsPage,
    GoogleAuth
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HistoryPage,
    HomePage,
    TabsPage
  ],
  providers: [
    {provide:'GAPI_ENDPOINT', useValue:'https://sheets.googleapis.com/v4/spreadsheets'},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SheetSrv
    ]
})
export class AppModule {}
