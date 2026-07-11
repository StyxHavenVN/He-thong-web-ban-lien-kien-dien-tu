const cartService = require('./cart.service');
function getCart(req,res){ res.json(cartService.getCart(req.user.id)); }
function addItem(req,res){ try{ res.status(201).json(cartService.addItem(req.user.id, req.body.productId, req.body.quantity)); }catch(e){ res.status(400).json({message:e.message}); } }
function updateItem(req,res){ try{ res.json(cartService.updateItem(req.user.id, req.params.productId, req.body.quantity)); }catch(e){ res.status(400).json({message:e.message}); } }
function removeItem(req,res){ try{ res.json(cartService.removeItem(req.user.id, req.params.productId)); }catch(e){ res.status(400).json({message:e.message}); } }
module.exports={getCart,addItem,updateItem,removeItem};
