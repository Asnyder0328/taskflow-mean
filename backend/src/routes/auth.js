const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: process.env.JWT_EXPIRE || '7d' });
const fail = (req,res) => { const e = validationResult(req); if(!e.isEmpty()){ res.status(400).json({ success:false, errors:e.array() }); return true; } return false; };

router.post('/register', [body('name').trim().notEmpty(), body('email').isEmail(), body('password').isLength({min:6})], async(req,res)=>{
  if(fail(req,res)) return;
  try{
    const { name, email, password } = req.body;
    if(await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ success:true, token: sign(user._id), user:{ id:user._id, name:user.name, email:user.email, avatarColor:user.avatarColor } });
  }catch(e){ res.status(500).json({ success:false, message:e.message }); }
});
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], async(req,res)=>{
  if(fail(req,res)) return;
  try{
    const user = await User.findOne({ email:req.body.email }).select('+password');
    if(!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ success:false, message:'Invalid email or password' });
    res.json({ success:true, token: sign(user._id), user:{ id:user._id, name:user.name, email:user.email, avatarColor:user.avatarColor } });
  }catch(e){ res.status(500).json({ success:false, message:e.message }); }
});
router.get('/me', auth, async(req,res)=>{
  const user = await User.findById(req.user.id);
  if(!user) return res.status(404).json({ success:false, message:'User not found' });
  res.json({ success:true, user:{ id:user._id, name:user.name, email:user.email, avatarColor:user.avatarColor, createdAt:user.createdAt } });
});
module.exports = router;
