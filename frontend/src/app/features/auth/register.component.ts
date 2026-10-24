import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({ selector:'app-register', standalone:true, imports:[CommonModule, FormsModule, RouterLink],
  template:`
  <div class="auth-wrap"><form class="card" (ngSubmit)="submit()">
    <h1>✓ Create account</h1><p class="muted">Start managing tasks in under a minute</p>
    <label>Name<input [(ngModel)]="name" name="name" required></label>
    <label>Email<input [(ngModel)]="email" name="email" type="email" required></label>
    <label>Password<input [(ngModel)]="password" name="password" type="password" required minlength="6"></label>
    <p class="error" *ngIf="error">{{error}}</p>
    <button [disabled]="loading">{{loading ? 'Creating…' : 'Create account'}}</button>
    <p class="muted center">Already have one? <a routerLink="/login">Sign in</a></p>
  </form></div>`,
  styles:[`.auth-wrap{min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#6366f1,#ec4899);padding:20px}.card{background:#fff;padding:32px;border-radius:16px;width:100%;max-width:400px;display:flex;flex-direction:column;gap:14px}h1{margin:0}.muted{color:#64748b;font-size:14px}.center{text-align:center}label{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:14px}input{padding:11px;border:1px solid #e2e8f0;border-radius:8px}button{padding:12px;background:#6366f1;color:#fff;border:0;border-radius:8px;font-weight:700}.error{color:#dc2626;background:#fef2f2;padding:10px;border-radius:8px;margin:0}`]
})
export class RegisterComponent {
  name=''; email=''; password=''; error=''; loading=false;
  constructor(private auth: AuthService, private router: Router){}
  submit(){ this.loading=true; this.auth.register({name:this.name,email:this.email,password:this.password}).subscribe({
    next:()=>this.router.navigate(['/board']), error:e=>{ this.error=e.error?.message||'Registration failed'; this.loading=false; } }); }
}
