import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent {
  data = {
    username: '',
    password: ''
  };

  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
