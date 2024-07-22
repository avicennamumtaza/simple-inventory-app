const express = require('express')
const router = express.Router()
const AppError = require('../error')
const Product = require('../models/products')
const wrapAsync = require('../utils/catchAsync')
const categories = ['fruit', 'vegetable', 'dairy']

// =====================
// == PRODUCTS ROUTES ==
// =====================

// ALL PRODUCTS
// router.get('', async (req, res) => {
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
router.get('/', wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    // console.log(req.query);
    let products;
    if (!category || category === 'all') {
        products = await Product.find({});
    } else {
        products = await Product.find({ category });
    }
    res.render('products/index', { products, title: 'products', category, categories });
}))

// CREATING NEW PRODUCT
router.get('/new', (req, res) => {
    // throw new AppError('Not Allowed', 403)
    res.render('products/new', { title: 'new product', categories })
})

// SAVING CREATED PRODUCT
router.post('/', wrapAsync(async (req, res, next) => {
    // const {name, price, category} = req.body
    const newProduct = new Product(req.body)
    await newProduct.save()
    console.log(`${newProduct.name} has been saved.`)
    res.redirect(`/products/${newProduct._id}`)
}))

// SHOWING PRODUCT DETAIL
router.get('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    // const product = await Product.findOne({_id: id})
    const product = await Product.findById(id).populate('supplier', 'name')
    // console.log(product)
    if (!product) {
        // throw new AppError('Product Not Found!', 404)
        throw new AppError('Product Not Found!', 404)
    }
    res.render('products/show', { product, title: 'detail product' })
}))

// EDITING PRODUCT
router.get('/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    // const product = await Product.findOne({_id: id})
    const product = await Product.findById(id)
    // console.log(product)
    if (!product) {
        // throw new AppError('Product Not Found!', 404)
        throw new AppError('Product Not Found!', 404)
    } else {
        res.render('products/edit', { product, title: 'edit product', categories })
    }
}))

// UPDATING EDITED PRODUCT
router.put('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    // const {name, price, category} = req.body
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    console.log(`${updatedProduct.name} has been updated.`)
    res.redirect(`/products/${updatedProduct._id}`)
}))

// DELETING PRODUCT
router.delete('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const deletedProduct = await Product.findByIdAndDelete(id).populate('supplier', '_id')
    if (!deletedProduct) {
        // throw new AppError('Product Not Found!', 404)
        throw new AppError('Product Not Found!', 404)
    }
    console.log(`${deletedProduct.name} has been deleted.`)
    res.redirect(`/suppliers/${deletedProduct.supplier._id}`)
}))

module.exports = router