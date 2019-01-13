import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { Task } from '../../models/task';
import { ToastController } from '@ionic/angular';
// import { FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  title:string = 'Todo List';
  tasks:Array<Task> = [];
  taskInput:string = '';
  listTitle = 'Todo List';
  timeInput:number;
  // taskForm:FormGroup;
  now:number;
  constructor(
    public dataService:DataService,
    private toaster:ToastController,
  ){
    this.readTasks();
    this.now = new Date().getTime();
    this.sortItems();
  }
  //create a new task object
  createTask(taskName:string,timeInput:number){
    let taskDate:number = new Date().getTime();
    let task = {name: taskName, date: taskDate, status:false,timeleft:timeInput,istimeout:false };
    return task;
  }
  //add a new task to list
  addTask(){
    if( this.taskInput.length > 0 ){
      this.tasks.push( this.createTask( this.taskInput ,this.timeInput) );
      this.taskInput = '';
      this.timeInput = null;
      this.isTimeout();
      this.sortItems();
      this.dataService.storeList(this.tasks)
      .then( ( response ) => {
        // this.showToast('task saved');
      })
      .catch( (error) => {
        console.log( error );
      });
    }
  }
  //caculate left time
  timeleft( date:number,limitetime:number ){
    let diff = this.now - date;
    let seconds = (limitetime*60)-(diff / 1000);
    if( seconds < 60 ){
      return 'Time out';
    }
    //if between 60 secs and 1 hour (3600 secs) to go
    else if( seconds >= 60 && seconds < 3600 ){
      let mins = Math.floor( seconds / 60 );
      let mUnit = mins == 1 ? 'minute' : 'minutes';
      return mins + ' ' + mUnit + ' to go';
    }
    //if between an hour and 1 day to go
    else if( seconds >= 3600 && seconds <= 24*3600 ){
      let hours = Math.floor( seconds / 3600 );
      let hUnit = hours == 1 ? 'hour' : 'hours';
      let mins = Math.floor( (seconds - ( hours * 3600 )) / 60 );
      let mUnit = mins == 1 ? 'minute' : 'minutes';
      return hours + ' ' + hUnit + ' ' + mins + ' ' + mUnit + ' to go';
    }
    //if  1 day and 1 week to go
    else if( seconds >= 24 * 3600 ){
      let days = Math.floor( seconds / (3600 * 24) );
      let dUnit = days == 1 ? 'day' : 'days';
      let hours = Math.floor( (seconds - ( days * 24 * 3600 )) / 3600);
      let hUnit = hours == 1 ? 'hour' : 'hours';
      return days + ' ' + dUnit + ' ' + hours + ' ' + hUnit + ' ' + 'to go';
    }
  }

  //load tasks from storage
  readTasks(){
    this.dataService.loadList()
    .then( (response) => {
      if( response !== null ){
        this.tasks = <Array<Task>> response;
      }
    })
    .catch( (error) => {
      console.log(error);
    });
  }

  //change a task's status
  changeStatus(date){
    this.tasks.forEach( (task) => {
      if( task.date == date ){
        let diff = this.now - task.date;
        let seconds = (task.timeleft*60)-(diff / 1000);
        if(task.status==true){
          task.status=false;
        }
        else if(task.status==false){
          task.status=true;
        }
        if(seconds<60)
        {
          task.istimeout=true;
        }
      }
    });
    this.dataService.storeList(this.tasks);
    this.sortItems();
  }
  //delete a task
  deleteItem( date ){
    this.tasks.forEach( (task,index) => {
      if( task.date == date ){
        this.tasks.splice( index, 1 );
      }
    });
    this.isTimeout();
    this.sortItems();
    this.dataService.storeList( this.tasks )
    .then(  (response) => {
      //delete successful
    })
    .catch( (error) => {
      //there is an error
    });
  }
  //take a timestamp and return human readable interval
  formatDate( date:number ){
    let diff = this.now - date;
    let seconds = diff / 1000;
    //if less than 60 seconds, return 'just now'
    if( seconds < 60 ){
      return 'just now';
    }
    //if between 60 secs and 1 hour (3600 secs)
    else if( seconds >= 60 && seconds < 3600 ){
      let mins = Math.floor( seconds / 60 );
      let mUnit = mins == 1 ? 'minute' : 'minutes';
      return mins + ' ' + mUnit + ' ago';
    }
    //if between an hour and 1 day
    else if( seconds >= 3600 && seconds <= 24*3600 ){
      let hours = Math.floor( seconds / 3600 );
      let hUnit = hours == 1 ? 'hour' : 'hours';
      let mins = Math.floor( (seconds - ( hours * 3600 )) / 60 );
      let mUnit = mins == 1 ? 'minute' : 'minutes';
      return hours + ' ' + hUnit + ' ' + mins + ' ' + mUnit + ' ago';
    }
    //if between 1 day and 1 week
    else if( seconds >= 24 * 3600 ){
      let days = Math.floor( seconds / (3600 * 24) );
      let dUnit = days == 1 ? 'day' : 'days';
      let hours = Math.floor( (seconds - ( days * 24 * 3600 )) / 3600);
      let hUnit = hours == 1 ? 'hour' : 'hours';
      return days + ' ' + dUnit + ' ' + hours + ' ' + hUnit + ' ' + 'ago';
    }
  }

  //sort tasks first by date, then by status
  sortItems(){
    //add delay
    setTimeout( () => {
      //sort by time left
      this.tasks.sort((task1,task2)=>{
        let diff1 = this.now - task1.date;
        let seconds1 = (task1.timeleft*60)-(diff1 / 1000);
        let diff2 = this.now - task2.date;
        let seconds2 = (task2.timeleft*60)-(diff2 / 1000);
        if(seconds1<seconds2){return 1}
        if(seconds1>seconds2){return -1}
        if(seconds1==seconds2){return 0}
      });

      //sort by date
      this.tasks.sort( ( task1, task2 ) => {
        if( task1.date < task2.date ){ return 1}
        if( task1.date > task2.date ){ return -1}
        if( task1.date == task2.date ){ return 0}
      });
      //sort by status
      this.tasks.sort( (task1, task2 ) => {
        let status1:number = task1.status ? 1 : 0;
        let status2:number = task2.status ? 1 : 0;
        return status1 - status2;
      });
      
    }, 1000);
  }
  //
  isTimeout(){
    this.tasks.forEach( (task,index) => {
      let diff = this.now - task.date;
      let seconds = (task.timeleft*60)-(diff / 1000);
      if(seconds<60)
      task.istimeout=true;
    });
  }

 
}
