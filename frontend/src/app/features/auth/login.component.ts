import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({ selector:'app-login', standalone:true, imports:[CommonModule, FormsModule, RouterLink],
  template:`
  <div class="auth-wrap"><form class="card" (ngSubmit)="submit()">
    <h1>✓ TaskFlow</h1><p class="muted">Sign in to your board</p>
    <label>Email<input [(ngModel)]="email" name="email" type="email" required placeholder="demo&#64;taskflow.app"></label>
    <label>Password<input [(ngModel)]="password" name="password" type="password" required placeholder="••••••••"></label>
    <p class="error" *ngIf="error">{{error}}</p>
    <button [disabled]="loading">{{loading ? 'Signing in…' : 'Sign in'}}</button>
    <p class="muted center">No account? <a routerLink="/register">Register</a> · Demo: demo&#64;taskflow.app / demo1234</p>
  </form></div>`,
  styles:[`.auth-wrap{min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#6366f1,#ec4899);padding:20px}.card{background:#fff;padding:32px;border-radius:16px;width:100%;max-width:400px;display:flex;flex-direction:column;gap:14px;box-shadow:0 20px 40px rgba(0,0,0,.2)}h1{margin:0}.muted{color:#64748b;font-size:14px}.center{text-align:center}label{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:14px}input{padding:11px;border:1px solid #e2e8f0;border-radius:8px}button{padding:12px;background:#6366f1;color:#fff;border:0;border-radius:8px;font-weight:700}.error{color:#dc2626;background:#fef2f2;padding:10px;border-radius:8px;margin:0}`]
})
export class LoginComponent {
  email=''; password=''; error=''; loading=false;
  constructor(private auth: AuthService, private router: Router){}
  submit(){ this.loading=true; this.error=''; this.auth.login({email:this.email,password:this.password}).subscribe({
    next:()=>this.router.navigate(['/board']), error:e=>{ this.error=e.error?.message||'Login failed'; this.loading=false; } }); }
}
