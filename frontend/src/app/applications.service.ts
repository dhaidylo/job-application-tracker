import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JobApplication } from './models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private readonly apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

  getById(id: string) {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  create(application: Partial<JobApplication>) {
    return this.http.post<JobApplication>(this.apiUrl, application);
  }

  update(id: string, application: Partial<JobApplication>) {
    return this.http.put<JobApplication>(`${this.apiUrl}/${id}`, application);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}