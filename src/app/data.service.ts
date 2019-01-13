import { Injectable } from '@angular/core';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
  //method to store data
  storeList( list:Array<Task> ){
    return new Promise( (resolve,reject)=>{
      let data = JSON.stringify( list );
      try{
        window.localStorage.setItem('list', data );
        if( window.localStorage.getItem('list') ){
          resolve( true );
        }
        else{
          throw('save failed');
        }
      }
      catch( error ){
        reject( error );
      }
    });
  }

  //method to read data
  loadList(){
    return new Promise( (resolve,reject)=>{
      let data = window.localStorage.getItem('list');
      if( data ){
        resolve( JSON.parse(data));
      }
      else{
        reject( null );
      }
    });
  }
}
