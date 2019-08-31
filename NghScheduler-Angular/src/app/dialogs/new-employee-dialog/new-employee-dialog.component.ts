import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Times} from '../Data/Times';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './new-employee-dialog.component.html',
  styleUrls: ['./new-employee-dialog.component.css']
})
export class NewEmployeeDialogComponent {
  title = 'Add';
  data = {
    name: '',
    wage: '15',
    from: '7:00',
    to: '15:30'
  };
  times = Times;

  constructor(public dialogRef: MatDialogRef<NewEmployeeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public input: any) {
    if (input) {
      this.data.name = input.name;
      this.data.wage = input.wage;
      this.data.from = input.from;
      this.data.to = input.to;
      this.title = 'Edit';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  handleFromSelect() {
    const fromHour = this.data.from.split(':')[0];
    const toTime = (Number(fromHour) + 8) % 24;
    this.data.to = toTime + ':30';
  }
}
