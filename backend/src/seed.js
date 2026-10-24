require('dotenv').config({ path: require('path').join(__dirname,'../.env') });
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');
(async()=>{
  await connectDB();
  await Task.deleteMany({}); await User.deleteMany({});
  const user = await User.create({ name:'Demo User', email:'demo@taskflow.app', password:'demo1234' });
  const tasks = [
    { title:'Design landing page', description:'Hero, pricing, CTA — Angular standalone component', status:'done', priority:'high', tags:['design','frontend'] },
    { title:'Build auth flow', description:'JWT register/login + route guard + interceptor', status:'in-progress', priority:'urgent', tags:['backend','security'] },
    { title:'Kanban board drag & drop', description:'Move tasks between Todo / In Progress / Done', status:'todo', priority:'high', tags:['frontend'], dueDate: new Date(Date.now()+3*864e5) },
    { title:'Write API tests', description:'Cover CRUD + auth edge cases', status:'todo', priority:'medium', tags:['testing'], dueDate: new Date(Date.now()+5*864e5) },
    { title:'Deploy to Render + Vercel', description:'API on Render, Angular on Vercel, Atlas for Mongo', status:'todo', priority:'medium', tags:['devops'] },
  ];
  for(const t of tasks) await Task.create({ ...t, user: user._id });
  console.log('🌱 Seeded — login: demo@taskflow.app / demo1234');
  process.exit(0);
})();
