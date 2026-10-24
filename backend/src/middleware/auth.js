const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
  const h = req.headers.authorization;
  if(!h || !h.startsWith('Bearer ')) return res.status(401).json({ success:false, message:'Not authorized, no token' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET || 'dev-secret'); next(); }
  catch(e){ return res.status(401).json({ success:false, message:'Token invalid or expired' }); }
};
