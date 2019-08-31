import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MaterialModule} from './app.material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {EmployeeService} from './services/employee.service';
import {ScheduleService} from './services/schedule.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TimeDialogComponent} from './dialogs/time-dialog/time-dialog.component';
import {LoginDialogComponent} from './dialogs/login-dialog/login-dialog.component';
import {NewEmployeeDialogComponent} from './dialogs/new-employee-dialog/new-employee-dialog.component';
import {SocketService} from './services/socket.service';

@NgModule({
  declarations: [
    AppComponent,
    TimeDialogComponent,
    LoginDialogComponent,
    NewEmployeeDialogComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  entryComponents: [TimeDialogComponent, LoginDialogComponent, NewEmployeeDialogComponent],
  providers: [EmployeeService, ScheduleService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
