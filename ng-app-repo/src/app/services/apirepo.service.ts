import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApirepoService {
  private apiUrl = 'http://localhost:5001/api/hello';

  constructor(private http: HttpClient) {}

  getHelloMessage(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
