const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');

// get all data
router.get('/', (req, res, next)=>{
    Product.find()
    .select('_id name price')
    .exec()
    .then(data => {
        if (data.length >= 1){
            const response = {
                count: data.length,
                products: data.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request:{
                            type: 'GET',
                            url: 'http://localhost:'+process.env.PORT+'/products/'+doc._id,
                            description: 'To get specific data'
                        }
                    }
                })
            }
            res.status(200).json(response);
        } else {
            res.status(404).json({message: "This table is empity data"});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

// post data
router.post('/', (req, res, next)=>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:'+process.env.PORT+'/products/'+result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err});
    });
});

// get specific data
router.get('/:productID', (req, res, next)=>{
    const id = req.params.productID;
    Product.findById(id)
    .select('_id name price')
    .then(data => {
        if (data) {
            res.status(200).json({
                product: data,
                request: {
                    type: 'GET',
                    url: 'http://localhost:'+process.env.PORT+'/products/',
                    description: 'To get all data'
                }
            });
        } else {
            console.log("Data not found");
            res.status(404).json({message: "Data not found, please check the id inputs"});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

// Updata/patch data
router.patch('/:productID', (req, res, next)=>{
    const id = req.params.productID;
    const data = {
        name: req.body.name,
        price: req.body.price
    };
    Product.where({_id:id}).update(data)
    .then(
        res.status(200).json({
        message: 'Data successfully updated!',
        request: {
            type: 'GET',
            url: 'http://localhost:'+process.env.PORT+'/products/'+id
        }
        })
    )
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// deleting data
router.delete('/:productID', (req, res, next)=>{
    const id = req.params.productID;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        if (result.deletedCount >= 1){
            res.status(200).json({
                message: 'Deleting data successfully',
                deletedCount: result.deletedCount,
                request: {
                    type: 'POST',
                    url: 'http://localhost:'+process.env.PORT+'/products/',
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
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({message:err});
    })
});

module.exports = router;