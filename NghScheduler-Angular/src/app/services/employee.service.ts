import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  url = environment.baseUrl + 'employee/';

  constructor(private http: HttpClient) { }

  addEmployee(data: {name: string, wage: number}) {
    const url = this.url + 'add';
    return this.http.post(url, data).toPromise();
  }

  getEmployees(date): Promise<any> {
    const url = this.url + 'getAll/' + date;
    return this.http.get(url).toPromise();
  }

  deleteEmployee(id: string) {
    const url = this.url + 'delete/' + id;
    return this.http.get(url).toPromise();
  }
}
