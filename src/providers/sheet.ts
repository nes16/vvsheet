import { Injectable, Inject } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable, Observer } from 'rxjs';
declare let gapi: any;

@Injectable()
export class SheetSrv {
  static dateStart: number = 2;
  static monthStart: number = 3;
  static wouts: string[] = ['Running', 'Cycling', 'Swimming']

  sheetId: string;
  constructor(public http: Http, @Inject('GAPI_ENDPOINT') public apiEndpoint: string) {

  }

  isAuthenticated() {
    return true;
  }
  isAuthenticated1() {
    if (gapi.auth2) {
      console.log('Signin auth2 initialized');
      var auth = gapi.auth2.getAuthInstance();
      if (!auth.isSignedIn.get()) {
        console.log('Signin required.');
        return false;
      }
      else {
        console.log('Signined');
        return true;
      }
    }
    else {
      console.log('Signin auth2 not initialized');

      return false;
    }
  }


  setSheetDoc(id: string) {
    this.sheetId = id;
  }

  /*
  sample sheet:Copy of Daily Workouts -2017.xls
  
  api key:
  AIzaSyARmiRY0FLh3HY8i_FL8sn9932V2jVHvwE
  
  1DexCOXWk1nOsN3n935LghtppIP1EY24JUWQrwY8euH4
  Senthil Ratnam!C3:C3
  
  GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}
  
  https://sheets.googleapis.com/v4/spreadsheets/1DexCOXWk1nOsN3n935LghtppIP1EY24JUWQrwY8euH4/values/Senthil%20Ratnam!C3:C3?valueInputOption=USER_ENTERED?includeValuesInResponse=true&alt=json&key=AIzaSyARmiRY0FLh3HY8i_FL8sn9932V2jVHvwE

  https://content-sheets.googleapis.com/v4/spreadsheets/1DexCOXWk1nOsN3n935LghtppIP1EY24JUWQrwY8euH4/values/Senthil%20Ratnam!C3%3AC3?valueInputOption=USER_ENTERED&includeValuesInResponse=true&alt=json&key=AIzaSyD-a9IF8KKYgoC3cpgS-Al7hLQDbugrDcw
  
  Spreadsheet
  ===========
  {
    "spreadsheetId": string,
    "properties": {
      object(SpreadsheetProperties)
    },
    "sheets": [
      {
        object(Sheet)
      }
    ],
    "namedRanges": [
      {
        object(NamedRange)
      }
    ],
    "spreadsheetUrl": string,
  }
  
  Sheet:
  ======
  {
    "properties": {
      object(SheetProperties)
    },
    "data": [
      {
        object(GridData)
      }
    ],
    "merges": [
      {
        object(GridRange)
      }
    ],
    "conditionalFormats": [
      {
        object(ConditionalFormatRule)
      }
    ],
    "filterViews": [
      {
        object(FilterView)
      }
    ],
    "protectedRanges": [
      {
        object(ProtectedRange)
      }
    ],
    "basicFilter": {
      object(BasicFilter)
    },
    "charts": [
      {
        object(EmbeddedChart)
      }
    ],
    "bandedRanges": [
      {
        object(BandedRange)
      }
    ],
  }
  
  SheetProperties:
  ===============
  {
    "sheetId": number,
    "title": string,
    "index": number,
    "sheetType": enum(SheetType),
    "gridProperties": {
      object(GridProperties)
    },
    "hidden": boolean,
    "tabColor": {
      object(Color)
    },
    "rightToLeft": boolean,
  }
  
  */
  getSheet(sheetId: string): Observable<any> {
    let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=AIzaSyARmiRY0FLh3HY8i_FL8sn9932V2jVHvwE`;
    return this.http.get(url);
  }

  getSheetsName(sheetId, or: Observer<string[]>) {
    let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=AIzaSyARmiRY0FLh3HY8i_FL8sn9932V2jVHvwE`;
    let oldNames = [];
    if (localStorage.getItem('names'))
      oldNames = JSON.parse(localStorage.getItem('names'));


    this.http.get(url).subscribe(sheet => {
      let names = JSON.parse(sheet['_body']).sheets.map(i => i.properties.title);
      names = names.filter(t => (t != 'Dashboard' && t != 'Template'))
      localStorage.setItem('names', JSON.stringify(names));
      or.next(names);
    }, err => {
      or.next(oldNames);
    }, () => {

    })

  }

  putValue(sheetId: string, range: string, value: string): Observable<any> {
    var auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      alert('Signin required.');
    }
    var accessToken = auth.currentUser.get().getAuthResponse().access_token;
    let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(range)}?valueInputOption=USER_ENTERED&includeValuesInResponse=true&alt=json`
    let body = {
      values: [
        [value],
      ],
    };
    let options = new RequestOptions();
    options.headers = new Headers();
    options.headers.append('Content-Type', 'application/json');
    options.headers.append('Authorization', 'Bearer ' + accessToken);
    return this.http.put(url, body, options);
  }

  setValue(sheetId: string, name: string) {
    localStorage.setItem("sheetId", sheetId);
    localStorage.setItem("name", name);
  }

  getValue(): { name: string, sheetId: string } {
    return { name: localStorage.getItem('name'), sheetId: localStorage.getItem('sheetId') };
  }

  getCell(dateStr: string, workoutType: string) {
    let date: Date = new Date(dateStr);
    let woIndex = SheetSrv.wouts.indexOf(workoutType);
    let colCode = this.getCodeForIndex(date.getDate() - 1 + SheetSrv.dateStart);
    let rowIndex = SheetSrv.monthStart + date.getMonth() * 3 + woIndex;
    return colCode + rowIndex.toString();
  }

  getCodeForIndex(i: number): string {
    let lastCode: number = 'Z'.charCodeAt(0);
    let startCode: number = 'A'.charCodeAt(0);
    let len = lastCode - startCode;
    let mul = Math.floor(i / len);
    let mod = i % len;
    let charIndex: string = String.fromCharCode(startCode + mod);
    if (mul) {
      charIndex += String.fromCharCode(startCode + mul - 1);
    }
    return charIndex;
  }
}