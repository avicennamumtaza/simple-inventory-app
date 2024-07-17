const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Product = require('./models/products')
const AppError = require('./error')
const categories = ['fruit', 'vegetable', 'dairy']

mongoose.connect('mongodb://localhost:27017/farmdb')
    .then(() => {
        console.log('database connected successfully.')
    })
    .catch(error => {
        console.log('database connection error.')
        console.log(error)
    })

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

// ALL PRODUCTS
// app.get('/products', async (req, res) => {
//     const {category} = req.query
//     console.log(req.query)
//     if (!category) {
//         const products = await Product.find({})
//         res.render('products/index', {products, title: 'products', category, categories})
//     } else {        
//         const products = await Product.find({category: category})
//         res.render('products/index', {products, title: 'products', category: 'all', categories})
//     }
//     // console.log(products)
// })
app.get('/products', async (req, res) => {
    const { category } = req.query;
    // console.log(req.query);

    let products;
    if (!category || category === 'all') {
        products = await Product.find({});
    } else {
        products = await Product.find({ category });
    }

    res.render('products/index', { products, title: 'products', category, categories});
});


// NEW PRODUCT
app.get('/products/new', (req, res) => {
    // throw new AppError('Not Allowed', 403)
    res.render('products/new', {title: 'new product', categories})
})

// SAVING NEW PRODUCT
app.post('/products', async (req, res) => {
    // const {name, price, category} = req.body
    const newProduct = new Product(req.body)
    await newProduct.save()
    console.log(`${newProduct.name} has been saved.`)
    res.redirect(`/products/${newProduct._id}`)
})

// SHOW DETAIL PRODUCT
app.get('/products/:id', async (req, res, next) => {
    const {id} = req.params
    // const product = await Product.findOne({_id: id})
    const product = await Product.findById(id)
    // console.log(product)
    if (!product) {
        // throw new AppError('Product Not Found!', 404)
        return next(new AppError('Product Not Found!', 404))
    }
    res.render('products/show', {product, title: 'detail product'})
})

// EDIT PRODUCT
app.get('/products/:id/edit', async (req, res, next) => {
    const {id} = req.params
    // const product = await Product.findOne({_id: id})
    const product = await Product.findById(id)
    // console.log(product)
    if (!product) {
        // throw new AppError('Product Not Found!', 404)
        next(new AppError('Product Not Found!', 404))
    } else {
        res.render('products/edit', {product, title: 'edit product', categories})
    }
})

// UPDATING EDITED PRODUCT
app.put('/products/:id', async (req, res) => {
    const {id} = req.params
    // const {name, price, category} = req.body
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {runValidators: true, new: true})
    console.log(`${updatedProduct.name} has been updated.`)
    res.redirect(`/products/${updatedProduct._id}`)
})

// DELETING PRODUCT
app.delete('/products/:id', async (req, res, next) => {
    const {id} = req.params
    const deletedProduct = await Product.findByIdAndDelete(id)
    if (!deletedProduct) {
        // throw new AppError('Product Not Found!', 404)
        return next(new AppError('Product Not Found!', 404))
    }
    console.log(`${deletedProduct.name} has been deleted.`)
    res.redirect(`/products`)
})

// ERROR HANDLER
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong!' } = err
    res.status(status).send(message)
})

// APP PORT
app.listen(8090, () => {
    console.log('listening on port 8090...')
})