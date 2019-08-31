import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  url = environment.baseUrl + 'schedule/';

  constructor(private http: HttpClient) { }

  setStatus(day: any): Promise<any> {
    const url = this.url + 'status';
    return this.http.post(url, day).toPromise();
  }
}
