const productService = require('./product.service');
function list(req,res){ res.json(productService.listProducts(req.query)); }
function detail(req,res){ try{ res.json(productService.getProduct(req.params.id)); }catch(e){ res.status(404).json({message:e.message}); } }
function recommendations(req,res){ try{ res.json(productService.getRecommendations(req.params.id)); }catch(e){ res.status(404).json({message:e.message}); } }
function categories(req,res){ res.json(productService.listCategories()); }
function create(req,res){ try{ res.status(201).json(productService.createProduct(req.body)); }catch(e){ res.status(400).json({message:e.message}); } }
function update(req,res){ try{ res.json(productService.updateProduct(req.params.id, req.body)); }catch(e){ res.status(400).json({message:e.message}); } }
function remove(req,res){ try{ res.json(productService.deleteProduct(req.params.id)); }catch(e){ res.status(400).json({message:e.message}); } }
module.exports={list,detail,recommendations,categories,create,update,remove};
