import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(JSON.parse(localStorage.getItem('tf_user') || 'null'));
  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user());
  constructor(private http: HttpClient, private router: Router) {}
  register(data: {name:string; email:string; password:string}) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data).pipe(tap(r => this.setSession(r)));
  }
  login(data: {email:string; password:string}) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, data).pipe(tap(r => this.setSession(r)));
  }
  logout() { localStorage.removeItem('tf_token'); localStorage.removeItem('tf_user'); this._user.set(null); this.router.navigate(['/login']); }
  get token() { return localStorage.getItem('tf_token'); }
  private setSession(r:any){ localStorage.setItem('tf_token', r.token); localStorage.setItem('tf_user', JSON.stringify(r.user)); this._user.set(r.user); }
}
