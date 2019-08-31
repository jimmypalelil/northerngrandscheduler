/* tslint:disable:no-string-literal prefer-for-of */
import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import * as _moment from 'moment';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDialog, MatSnackBar} from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {EmployeeService} from './services/employee.service';
import {ScheduleService} from './services/schedule.service';
import {TimeDialogComponent} from './dialogs/time-dialog/time-dialog.component';
import {LoginDialogComponent} from './dialogs/login-dialog/login-dialog.component';
import {NewEmployeeDialogComponent} from './dialogs/new-employee-dialog/new-employee-dialog.component';
import {SocketService} from './services/socket.service';

// Date configurations
const moment =  _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './app.component.mobile.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AppComponent implements OnInit {
  date = new FormControl(moment());
  fromDate: string;
  toDate: string;
  employees = [];
  schedule = [[]];
  daysOfWeek = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed'];
  statuses = ['OFF', 'Set Time', 'Vacation', 'Stat', 'On Call'];
  isAdmin = false;
  scheduleTitle = '';
  allEmployeeTotalHrs = [];

  constructor(private empService: EmployeeService, private scheduleService: ScheduleService, private snackBar: MatSnackBar,
              private dialog: MatDialog, private socketService: SocketService) {}

  ngOnInit(): void {
    this.setDates(this.date.value);
    this.getScheduleForDate();
    this.scheduleTitle = this.getScheduleTitle();
    this.initiateSubs();
    this.setIsAdmin();
  }

  initiateSubs() {

    this.socketService.initSocket();

    this.socketService.onEvent('statusUpdated').subscribe(data => {
      const date = data['date'];
      const status = data['status'];
      const rowIndex = data['rowIndex'];

      const empSchedule = this.schedule[rowIndex];

      for (let i = 0; i < empSchedule.length; i++) {
        if (empSchedule[i].date === date) {
          empSchedule[i].status = status;

          this.showSnackBar('Schedule was changed recently');
        }
      }
    });

    this.socketService.onEvent('employeeAdded').subscribe(() => {
      this.getScheduleForDate();
      this.showSnackBar('A New Employee was added');
    });

    this.socketService.onEvent('employeeRemoved').subscribe(() => {
      this.getScheduleForDate();
      this.showSnackBar('An Employee was removed');
    });
  }

  getScheduleTitle() {
    return `${this.getFormattedDateForTitle(moment(this.fromDate))} - ${this.getFormattedDateForTitle(moment(this.toDate))}`;
  }

  getScheduleForDate() {
    this.setDates(this.date.value);
    this.scheduleTitle = this.getScheduleTitle();
    this.empService.getEmployees(this.getServerFormattedDate(this.date.value)).then(data => {
      this.employees = data;
      this.loadSchedule(data);
    });
  }

  loadSchedule(data) {
    data.forEach((emp, index) => {
      const schedule = emp.schedule.concat(emp.schedule2);
      this.schedule[index] = new Array(7);
      const _id = emp._id;

      for (let i = 0, j = 0; i < 7; i++) {
        const day = schedule[j];

        const date = this.getServerFormattedDate(moment(this.fromDate).add(i, 'days'));
        let status = 'OFF';
        if (day && date === day.date) {
          status = day.status;
          j++;
        }
        this.schedule[index][i] = {_id, status, date};
      }
    });
  }

  setDates(date) {
    this.fromDate = this.getFormattedDate(date);
    this.toDate = this.getFormattedDate(moment(date).add(6, 'days'));

    this.daysOfWeek.forEach((day, index) => {
      this.daysOfWeek[index] = moment(date).add(index, 'days').format('ddd Do');
    });
  }

  getServerFormattedDate(date) {
    return date.format('YYYY-MM-DD');
  }

  getFormattedDate(date) {
    return date.format('LL');
  }

  getFormattedDateForTitle(date) {
    return date.format('ddd MMM Do, YYYY');
  }

  addEmployee() {

    const dialogRef = this.dialog.open(NewEmployeeDialogComponent);

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.empService.addEmployee(res).then(data => {
          this.getScheduleForDate();
          this.showSnackBar(data['msg']);
        });
      }
    });
  }

  showSnackBar(msg) {
    this.snackBar.open(msg, 'dismiss', {duration: 2000});
  }

  handleStatus(day, rowIndex, status: string) {
    day.rowIndex = rowIndex;

    if (status !== 'Set Time') {
      day.status = status;

      this.scheduleService.setStatus(day).then(data => {
        this.showSnackBar(data['msg']);
      });
    } else {
      const dialogRef = this.dialog.open(TimeDialogComponent, {
        data: this.employees[rowIndex]
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          day.status = result;

          this.scheduleService.setStatus(day).then(data => {
            this.showSnackBar(data['msg']);
          });
        }
      });
    }
  }

  login() {
    const dialogRef = this.dialog.open(LoginDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      const {username, password} = result;

      if (username.toLowerCase() === 'jennifer' && password.toLowerCase() === 'jennifer') {
        localStorage.setItem('userRole', 'admin');
        this.setIsAdmin();
        this.showSnackBar('Logged in successfully!!!');
      }
    });
  }

  logout() {
    localStorage.removeItem('userRole');
    this.setIsAdmin();
    this.showSnackBar('You have been logged out');
  }

  print() {
    window.print();
  }

  deleteEmployee(id: string) {
    const ans = confirm('Are you sure you want to delete this employee?');

    if (ans) {
      this.empService.deleteEmployee(id).then(data => {
        this.getScheduleForDate();
        this.showSnackBar(data['msg']);
      });
    }
  }

  getStatusStyles(status: string) {
    if (!status.includes('-')) {
      return 'status-' + status;
    } else {
      return 'status-time';
    }
  }

  getTotalWeekHours(scheduleElement: any[], index: number) {
    let totalHrs = 0;
    scheduleElement.forEach(day => {
      totalHrs += this.getTotalDayHours(day);
    });
    this.allEmployeeTotalHrs[index] = totalHrs;
    return totalHrs;
  }

  getTotalDayHours(day): number {
    let total = 0;
    if (day.status.includes('-')) {
      const times = day.status.split('-');
      const from = times[0];
      const to = times[1];

      const fromTime = from.split(':');
      const from1 = Number(fromTime[0]);
      let from2 = Number(fromTime[1]);

      const toTime = to.split(':');
      const to1 = Number(toTime[0]);
      let to2 = Number(toTime[1]);

      from2 = from2 === 30 ? .5 : 0;
      to2 = to2 === 30 ? .5 : 0;

      total = (to1 + to2) - (from1 + from2);
    }
    return total > 5 ? total - .5 : total;
  }

  getGrandTotalHrs() {
    let total = 0;
    this.allEmployeeTotalHrs.forEach(i => {
      total += i;
    });
    return total;
  }

  editEmployee(emp: any) {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      data: emp
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result._id = emp._id;
        emp.name = result.name;
        emp.wage = result.wage;
        this.empService.addEmployee(result).then(data => {
          this.showSnackBar(data['msg']);
        });
      }
    });
  }

  getTotalCost() {
    let total = 0;
    this.employees.forEach((emp, index) => {
      total += emp.wage * this.allEmployeeTotalHrs[index];
    });
    return total;
  }

  setIsAdmin() {
    this.isAdmin = localStorage.getItem('userRole') === 'admin';
  }
}
