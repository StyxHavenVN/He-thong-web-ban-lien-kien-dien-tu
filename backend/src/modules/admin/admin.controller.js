const { readDb, writeDb } = require('../../repositories/jsonRepository');
const reportService = require('../report/report.service');
const authService = require('../auth/auth.service');
function customers(req,res){ const db=readDb(); res.json(db.users.filter(u=>u.role==='CUSTOMER').map(authService.publicUser)); }
function toggleCustomerLock(req,res){ const db=readDb(); const user=db.users.find(u=>u.id===req.params.id); if(!user) return res.status(404).json({message:'Không tìm thấy khách hàng.'}); user.locked=!user.locked; writeDb(db); res.json(authService.publicUser(user)); }
function report(req,res){ res.json(reportService.revenueReport()); }
module.exports={customers,toggleCustomerLock,report};
