const orderService = require('./order.service');
function create(req,res){ try{ res.status(201).json(orderService.createOrder(req.user, req.body)); }catch(e){ res.status(400).json({message:e.message}); } }
function my(req,res){ res.json(orderService.listMyOrders(req.user.id)); }
function all(req,res){ res.json(orderService.listAllOrders()); }
function detail(req,res){ try{ res.json(orderService.getOrder(req.user, req.params.id)); }catch(e){ res.status(404).json({message:e.message}); } }
function updateStatus(req,res){ try{ res.json(orderService.updateStatus(req.params.id, req.body.status)); }catch(e){ res.status(400).json({message:e.message}); } }
module.exports={create,my,all,detail,updateStatus};
