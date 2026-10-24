import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, TaskStatus, TaskStats } from '../../core/models/task.model';

@Component({ selector:'app-board', standalone:true, imports:[CommonModule, FormsModule],
  template:`
  <header>
    <div class="logo">✓ TaskFlow</div>
    <div class="search"><input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Search tasks, tags…"></div>
    <div class="user"><span class="avatar" [style.background]="auth.user()?.avatarColor">{{auth.user()?.name?.charAt(0)}}</span> {{auth.user()?.name}} <button class="ghost" (click)="auth.logout()">Logout</button></div>
  </header>

  <section class="stats" *ngIf="stats() as s">
    <div class="stat"><strong>{{s.total}}</strong><span>Total</span></div>
    <div class="stat"><strong>{{s.todo}}</strong><span>To Do</span></div>
    <div class="stat"><strong>{{s.inProgress}}</strong><span>In Progress</span></div>
    <div class="stat"><strong>{{s.done}}</strong><span>Done</span></div>
    <div class="stat warn"><strong>{{s.overdue}}</strong><span>Overdue</span></div>
    <div class="stat pct"><strong>{{s.total ? Math.round(s.done/s.total*100) : 0}}%</strong><span>Complete</span></div>
  </section>

  <form class="new-task" (ngSubmit)="create()">
    <input [(ngModel)]="draft.title" name="title" placeholder="New task title…" required class="grow">
    <select [(ngModel)]="draft.priority" name="priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
    <input [(ngModel)]="draft.dueDate" name="due" type="date">
    <input [(ngModel)]="tagsInput" name="tags" placeholder="tags, comma, separated">
    <button>Add Task</button>
  </form>

  <main class="board">
    <section class="col" *ngFor="let col of columns">
      <h2>{{col.label}} <span class="count">{{byStatus(col.key).length}}</span></h2>
      <article class="card" *ngFor="let t of byStatus(col.key)">
        <div class="row"><span class="badge badge-{{t.priority}}">{{t.priority}}</span><small *ngIf="t.dueDate" [class.overdue]="isOverdue(t)">{{t.dueDate | date:'MMM d'}}</small></div>
        <h3 [class.done]="t.status==='done'">{{t.title}}</h3>
        <p *ngIf="t.description">{{t.description}}</p>
        <div class="tags"><span *ngFor="let tag of t.tags">#{{tag}}</span></div>
        <div class="actions">
          <button *ngIf="t.status!=='todo'" (click)="move(t,-1)">←</button>
          <button *ngIf="t.status!=='done'" (click)="move(t,1)">Move →</button>
          <button class="danger" (click)="remove(t)">Delete</button>
        </div>
      </article>
      <p class="empty" *ngIf="!byStatus(col.key).length">No tasks here yet</p>
    </section>
  </main>`,
  styles:[`
  header{display:flex;gap:16px;align-items:center;padding:14px 20px;background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:5;flex-wrap:wrap}
  .logo{font-weight:900;font-size:20px;color:#6366f1}.search{flex:1;min-width:200px}.search input{width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px}
  .user{display:flex;align-items:center;gap:8px;font-weight:600}.avatar{width:32px;height:32px;border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:800}
  .ghost{background:none;border:1px solid #e2e8f0;border-radius:8px;padding:7px 10px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;padding:16px 20px}.stat{background:#fff;border-radius:12px;padding:14px;display:flex;flex-direction:column}.stat strong{font-size:24px}.stat span{color:#64748b;font-size:13px}.stat.warn strong{color:#dc2626}
  .new-task{display:flex;gap:10px;padding:0 20px 16px;flex-wrap:wrap}.new-task input,.new-task select{padding:11px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}.grow{flex:1;min-width:220px}.new-task button{background:#6366f1;color:#fff;border:0;padding:11px 18px;border-radius:8px;font-weight:700}
  .board{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;padding:0 20px 24px;align-items:start}
  .col{background:#f1f5f9;border-radius:14px;padding:14px;min-height:300px}.col h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#475569}.count{background:#fff;padding:2px 8px;border-radius:999px}
  .card{background:#fff;border-radius:12px;padding:14px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)}.card h3{margin:8px 0 4px}.card h3.done{text-decoration:line-through;color:#94a3b8}.card p{color:#475569;font-size:14px;margin:4px 0}
  .row{display:flex;justify-content:space-between;align-items:center}.overdue{color:#dc2626;font-weight:700}
  .tags span{font-size:12px;color:#6366f1;margin-right:6px}.actions{display:flex;gap:6px;margin-top:10px}.actions button{border:1px solid #e2e8f0;background:#fff;border-radius:7px;padding:6px 9px;font-size:13px}.actions .danger{color:#dc2626;margin-left:auto}.empty{color:#94a3b8;text-align:center;padding:20px}
  `]
})
export class BoardComponent implements OnInit {
  Math = Math;
  tasks = signal<Task[]>([]);
  stats = signal<TaskStats | null>(null);
  search = '';
  draft: Partial<Task> = { title:'', priority:'medium', status:'todo' };
  tagsInput = '';
  columns: {key: TaskStatus; label: string}[] = [{key:'todo',label:'To Do'},{key:'in-progress',label:'In Progress'},{key:'done',label:'Done'}];
  constructor(public taskSvc: TaskService, public auth: AuthService){}
  ngOnInit(){ this.load(); }
  load(){ this.taskSvc.list({search:this.search}).subscribe(r=>this.tasks.set(r.tasks)); this.taskSvc.stats().subscribe(r=>this.stats.set(r.stats)); }
  byStatus(s: TaskStatus){ return this.tasks().filter(t=>t.status===s); }
  isOverdue(t: Task){ return !!t.dueDate && t.status!=='done' && new Date(t.dueDate) < new Date(); }
  create(){ if(!this.draft.title?.trim()) return; const payload={...this.draft, tags: this.tagsInput.split(',').map(x=>x.trim()).filter(Boolean)};
    this.taskSvc.create(payload).subscribe(()=>{ this.draft={title:'',priority:'medium',status:'todo'}; this.tagsInput=''; this.load(); }); }
  move(t: Task, dir: number){ const order: TaskStatus[]=['todo','in-progress','done']; const next=order[order.indexOf(t.status)+dir]; if(next) this.taskSvc.update(t._id,{status:next}).subscribe(()=>this.load()); }
  remove(t: Task){ if(confirm(`Delete "${t.title}"?`)) this.taskSvc.remove(t._id).subscribe(()=>this.load()); }
}
