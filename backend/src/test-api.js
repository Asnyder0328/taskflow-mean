// Smoke test: exercises full flow. Uses MONGO_URI if set, otherwise in-memory Mongo.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const mongoose = require('mongoose');
(async()=>{
  let mem;
  if (process.env.MONGO_URI) { await mongoose.connect(process.env.MONGO_URI); await mongoose.connection.db.dropDatabase(); }
  else { const { MongoMemoryServer } = require('mongodb-memory-server'); mem = await MongoMemoryServer.create(); await mongoose.connect(mem.getUri()); }
  const { request } = require('node:http');
  const express = require('express'); const cors = require('cors');
  const app = express(); app.use(cors()); app.use(express.json());
  app.use('/api/auth', require('./routes/auth')); app.use('/api/tasks', require('./routes/tasks'));
  const srv = app.listen(0); const port = srv.address().port;
  const call = (method, path, body, token) => new Promise((res,rej)=>{
    const data = body ? JSON.stringify(body) : null;
    const r = request({host:'127.0.0.1',port,path,method,headers:{'Content-Type':'application/json', ...(data?{'Content-Length':Buffer.byteLength(data)}:{}), ...(token?{Authorization:`Bearer ${token}`}:{})}}, resp=>{ let b=''; resp.on('data',c=>b+=c); resp.on('end',()=>res({status:resp.statusCode, body: JSON.parse(b||'{}')})); });
    r.on('error',rej); if(data) r.write(data); r.end();
  });
  const assert=(cond,msg)=>{ if(!cond){ console.error('❌ FAIL:',msg); process.exit(1);} console.log('✅',msg); };
  let r = await call('POST','/api/auth/register',{name:'Test',email:'test@test.com',password:'secret123'});
  assert(r.status===201 && r.body.token, 'Register returns JWT');
  const token = r.body.token;
  r = await call('POST','/api/tasks',{title:'First task',priority:'high',tags:['work']},token);
  assert(r.status===201 && r.body.task.title==='First task','Create task');
  const id = r.body.task._id;
  r = await call('PUT',`/api/tasks/${id}`,{status:'done'},token);
  assert(r.body.task.status==='done' && r.body.task.completedAt,'Update status sets completedAt');
  r = await call('GET','/api/tasks/stats',null,token);
  assert(r.body.stats.done===1,'Stats endpoint counts correctly');
  r = await call('GET','/api/tasks',null,null);
  assert(r.status===401,'Unauthenticated request blocked');
  r = await call('DELETE',`/api/tasks/${id}`,null,token);
  assert(r.status===200,'Delete task');
  console.log('\n🎉 All API smoke tests passed');
  srv.close(); await mongoose.disconnect(); if(mem) await mem.stop(); process.exit(0);
})();
