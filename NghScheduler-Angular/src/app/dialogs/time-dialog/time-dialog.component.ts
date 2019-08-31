import {Component, Inject, OnInit} from '@angular/core';
import {Times} from '../Data/Times';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-time-dialog',
  templateUrl: './time-dialog.component.html',
  styleUrls: ['./time-dialog.component.css']
})
export class TimeDialogComponent implements OnInit {
  times = Times;
  from = '7:00';
  to = '15:30';

  constructor(public dialogRef: MatDialogRef<TimeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private input: any) {
    if (input && input.from) {
      this.from = input.from;
      this.to = input.to;
    }
  }

  ngOnInit() {

  }

  cancel(): void {
    this.dialogRef.close();
  }

  sendTime() {
    return this.from + '-' + this.to;
  }

  handleFromSelect() {
    const fromHour = this.from.split(':')[0];
    const toTime = (Number(fromHour) + 8) % 24;
    this.to = toTime + ':30';
  }
}
