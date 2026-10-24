const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

router.get('/', async(req,res)=>{
  const { status, priority, search, sort='-createdAt', page=1, limit=50 } = req.query;
  const q = { user: req.user.id };
  if(status) q.status = status;
  if(priority) q.priority = priority;
  if(search) q.$or = [{ title: new RegExp(search,'i') }, { description: new RegExp(search,'i') }, { tags: new RegExp(search,'i') }];
  const tasks = await Task.find(q).sort(sort).skip((page-1)*limit).limit(Number(limit));
  const total = await Task.countDocuments(q);
  res.json({ success:true, count: tasks.length, total, page:Number(page), tasks });
});

router.get('/stats', async(req,res)=>{
  const [byStatus, byPriority, overdue] = await Promise.all([
    Task.aggregate([{ $match:{ user: require('mongoose').Types.ObjectId.createFromHexString(req.user.id)} }, { $group:{ _id:'$status', count:{ $sum:1 } } }]),
    Task.aggregate([{ $match:{ user: require('mongoose').Types.ObjectId.createFromHexString(req.user.id)} }, { $group:{ _id:'$priority', count:{ $sum:1 } } }]),
    Task.countDocuments({ user:req.user.id, status:{ $ne:'done' }, dueDate:{ $lt:new Date() } })
  ]);
  const toObj = a => Object.fromEntries(a.map(x=>[x._id, x.count]));
  const s = toObj(byStatus);
  res.json({ success:true, stats:{ total:Object.values(s).reduce((a,b)=>a+b,0), todo:s.todo||0, inProgress:s['in-progress']||0, done:s.done||0, overdue, byPriority: toObj(byPriority) } });
});

router.post('/', [body('title').trim().notEmpty().withMessage('Title required')], async(req,res)=>{
  const e = validationResult(req); if(!e.isEmpty()) return res.status(400).json({ success:false, errors:e.array() });
  const task = await Task.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success:true, task });
});

router.get('/:id', async(req,res)=>{
  const task = await Task.findOne({ _id:req.params.id, user:req.user.id });
  if(!task) return res.status(404).json({ success:false, message:'Task not found' });
  res.json({ success:true, task });
});
router.put('/:id', async(req,res)=>{
  const update = { ...req.body };
  if (update.status) update.completedAt = update.status === 'done' ? new Date() : null; // findOneAndUpdate bypasses save hooks
  const task = await Task.findOneAndUpdate({ _id:req.params.id, user:req.user.id }, update, { new:true, runValidators:true });
  if(!task) return res.status(404).json({ success:false, message:'Task not found' });
  res.json({ success:true, task });
});
router.delete('/:id', async(req,res)=>{
  const task = await Task.findOneAndDelete({ _id:req.params.id, user:req.user.id });
  if(!task) return res.status(404).json({ success:false, message:'Task not found' });
  res.json({ success:true, message:'Task deleted' });
});
module.exports = router;
