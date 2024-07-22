const express = require('express')
const router = express.Router()
const Product = require('../models/products')
const Supplier = require('../models/suppliers')
const categories = ['fruit', 'vegetable', 'dairy']
const cities = ['malang', 'surabaya', 'pasuruan', 'sidoarjo']

// ======================
// == SUPPLIERS ROUTES ==
// ======================

// ALL SUPPLIERS
router.get('/', async(req, res) => {
    const { city } = req.query;
    // console.log(req.query);
    let suppliers;
    if (!city || city === 'all') {
        suppliers = await Supplier.find({});
    } else {
        suppliers = await Supplier.find({ city });
    }
    res.render('suppliers/index', {suppliers, city, cities, title: 'suppliers data'.toUpperCase()})
})

// CREATING NEW SUPPLIER
router.get('/new', (req, res) => {
    res.render('suppliers/new', {cities, title: 'create supplier'.toUpperCase()})
})

// SAVING CREATED SUPPLIER
router.post('/', async(req, res) => {
    // res.send(req.body)
    const newSupplier = new Supplier(req.body)
    await newSupplier.save()
    res.redirect('/suppliers')
})

// SHOWING SUPPLIER DETAIL
router.get('/:id', async(req, res) => {
    // const {id} = req.params
    const showingSupplier = await Supplier.findById(req.params.id).populate('products')
    // console.log(showingSupplier)
    res.render('suppliers/show', {...showingSupplier.toObject(), title: 'supplier detail'.toUpperCase()})
})

// ADDING SUPPLIER'S PRODUCT
router.get('/:supplier_id/products/new', async(req, res) => {
    const { supplier_id } = req.params
    const supplier = await Supplier.findById(supplier_id)
    res.render('products/new', {categories, supplier, title: 'add product'})
})

// SAVING ADDED SUPPLIER'S PRODUCT
router.post('/:supplier_id/products', async(req, res) => {
    const { supplier_id } = req.params
    const supplierFound = await Supplier.findById(supplier_id)
    const { name, price, category } = req.body
    const newProduct = new Product({name, price, category})
    supplierFound.products.push(newProduct)
    newProduct.supplier = supplierFound
    await supplierFound.save()
    await newProduct.save()
    // res.send(`${supplierFound} ${newProduct}`)
    res.redirect(`/suppliers/${supplierFound._id}`)
})

// EDITING SUPPLIER
router.get('/:id/edit', async(req, res) => {
    const editingSupplier = await Supplier.findById(req.params.id)
    res.render('suppliers/edit', {...editingSupplier.toObject(), cities, title: 'edit supplier'.toUpperCase()})
})

// UPDATING EDITED SUPPLIER
router.put('/:id', async(req, res) => {
    const updatingSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
    res.redirect(`/suppliers/${updatingSupplier._id}`)
})

// DELETING SUPPLIER
router.delete('/:id', async(req, res) => {
    const deletingSupplier = await Supplier.findByIdAndDelete(req.params.id)
    res.redirect('/suppliers')
})

module.exports = router