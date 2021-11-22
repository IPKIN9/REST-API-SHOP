const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const mongoose = require('mongoose');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin','X-Requested-With,Content-Type,Accept,Authorization");
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res(200).json({})
    }
    next();
});
mongoose.Promise = global.Promise;
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

mongoose.connect('mongodb+srv://rest-shop:' + process.env.MONGO_ATLAS_PW + '@rest-api-shop.f52br.mongodb.net/'+process.env.MONGO_ATLAS_DB+'?retryWrites=true&w=majority');

app.use((req, res, next)=>{
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;