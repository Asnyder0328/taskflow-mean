import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Task, TaskStats } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = `${environment.apiUrl}/tasks`;
  constructor(private http: HttpClient) {}
  list(params: {status?:string; priority?:string; search?:string} = {}) {
    let p = new HttpParams(); Object.entries(params).forEach(([k,v]) => { if(v) p = p.set(k, v); });
    return this.http.get<{tasks: Task[]}>(this.base, { params: p });
  }
  stats() { return this.http.get<{stats: TaskStats}>(`${this.base}/stats`); }
  create(task: Partial<Task>) { return this.http.post<{task: Task}>(this.base, task); }
  update(id: string, task: Partial<Task>) { return this.http.put<{task: Task}>(`${this.base}/${id}`, task); }
  remove(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
