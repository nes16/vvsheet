import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators} from '@angular/forms'
import { NavController } from 'ionic-angular';
import { SheetSrv } from '../../providers/sheet';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage  {

  sheetId:string;
  name:string='';

  date:string;
  distance:number=10;
  wotype:string='Running';
  form:FormGroup;
  names:Observable<string[]>;
  orNames:Observer<string[]>;
  constructor(public navCtrl: NavController, public sheetsrv:SheetSrv) {
    let oldVal = this.sheetsrv.getValue();
    this.sheetId = oldVal.sheetId;
    this.name = oldVal.name;
    let dt = new Date();
    this.date = new Date(dt.getTime() -(new Date().getTimezoneOffset()*60*1000)).toISOString().slice(0,10);
    this.names = Observable.create(or => {
      this.orNames = or;
      if(this.sheetId)
         this.sheetsrv.getSheetsName(this.sheetId, this.orNames);
    })

  }

  ngOnInit(){
    this.form = new FormGroup({
			name: new FormControl(this.name, [Validators.required
				, Validators.minLength(2)
				, Validators.maxLength(30)]),
      date: new FormControl(this.date, [Validators.required]),
      distance: new FormControl(this.distance, [Validators.required]),
      wotype: new FormControl(this.wotype, [Validators.required]),
      sheetId: new FormControl(this.sheetId, [Validators.required])
		})

  }

  idChange(evt){
    console.log('in id change')
    if(this.orNames)
      this.sheetsrv.getSheetsName(this.sheetId, this.orNames);
  }

  
  onSave(evt){
    let range = this.name+'!'+this.sheetsrv.getCell(this.date.toString(), this.wotype);
    this.sheetsrv.putValue(this.sheetId, range, this.distance.toString()).subscribe(res => {
      console.log('Log submitter successfully-', res)
      this.sheetsrv.setValue(this.sheetId, this.name, this.date, this.wotype, this.distance);
      alert('successfully save log in timesheet');
    }, err=>{
      console.log('Error while logging - ', err)
    }, () => {
      console.log('Log complete.')
    })
  }


}
