const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

router.get('/', (req, res, next)=>{
    Order.find()
    .select('_id productId quantity')
    .exec()
    .then(result => {
        res.status(200).json({
            count: result.length,
            orders: result.map(doc => {
                return {
                    _id: doc.id,
                    quantity: doc.quantity,
                    productId: doc.productId,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:'+process.env.PORT+'/orders/'+doc._id,
                        description: 'To get sepcific data'
                    }
                }
            })
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.post('/', (req, res, next)=>{
    Product.findById(req.body.productId).then(product => {
        if(!product){
            return res.status(404).json({message: "Product not found!"});
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            productId: req.body.productId
        });
        order.save()
        .then(result => {
            res.status(201).json({
                message:'Created orders successfully',
                createdOrders: {
                    _id: result._id,
                    productId: result.productId,
                    quantity: result.quantity,
                    request:{
                        type:'GET',
                        url: 'http://localhost:'+process.env.PORT+'/orders/'+result._id,
                        description: 'To get sepcific data'
                    }
                }
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
    }).catch(err => {
        res.status(500).json({
            message: 'Product not found',
            error:err
        });
    })
});

router.get('/:orderID', (req, res, next)=>{
    const id = req.params.orderID;
    Order.findById(id)
    .select('_id productId quantity')
    .then(data => {
        if(data){
            res.status(200).json({
                orders: data,
                request:{
                    type:"GET",
                    url:"http://localhost:" + process.env.PORT + "/orders",
                    description:"To get all data"
                }
            });
        } else {
            res.status(404).json({message:"Orders not found!"});
        }
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    })
});

router.delete('/:orderID', (req, res, next)=>{
    Order.deleteOne({_id:req.params.orderID})
    .exec()
    .then(result => {
        if(result.deletedCount >= 1){
            res.status(201).json({
                message:'Deleting data successfully',
                deletedCount:result.deletedCount,
                request:{
                    type:'POST',
                    url:"http://localhost:" + process.env.PORT + "/orders",
                    body: {
                        name: 'String',
                        price: "number"
                    },
                    description: 'Create new data'
                }
            });
        } else {
            res.status(404).json({
                message: 'Nothing deleted, Id not found',
                deletedCount: result.deletedCount
            });
        }
    }).catch(err => {
        res.status(500).json({error:err});
    })
});

module.exports = router