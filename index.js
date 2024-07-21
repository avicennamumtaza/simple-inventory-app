const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const AppError = require('./error')
const mongoose = require('mongoose')
const Product = require('./models/products')
const Supplier = require('./models/suppliers')
const methodOverride = require('method-override')
const categories = ['fruit', 'vegetable', 'dairy']
const cities = ['malang', 'surabaya', 'pasuruan', 'sidoarjo']

mongoose.connect('mongodb://localhost:27017/carrefour')
    .then(() => {
        console.log('database connected successfully.')
    })
    .catch(error => {
        console.log('database connection error.')
        console.log(error)
    })

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// TRY CATCH SIMPLIFY
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

// ======================
// == SUPPLIERS ROUTES ==
// ======================

// ALL SUPPLIERS
app.get('/suppliers', async(req, res) => {
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
app.get('/suppliers/new', (req, res) => {
    res.render('suppliers/new', {cities, title: 'create supplier'.toUpperCase()})
})

// SAVING CREATED SUPPLIER
app.post('/suppliers', async(req, res) => {
    // res.send(req.body)
    const newSupplier = new Supplier(req.body)
    await newSupplier.save()
    res.redirect('/suppliers')
})

// SHOWING SUPPLIER DETAIL
app.get('/suppliers/:id', async(req, res) => {
    // const {id} = req.params
    const showingSupplier = await Supplier.findById(req.params.id).populate('products')
    // console.log(showingSupplier)
    res.render('suppliers/show', {...showingSupplier.toObject(), title: 'supplier detail'.toUpperCase()})
})

// ADDING SUPPLIER'S PRODUCT
app.get('/suppliers/:supplier_id/products/new', async(req, res) => {
    const { supplier_id } = req.params
    const supplier = await Supplier.findById(supplier_id)
    res.render('products/new', {categories, supplier, title: 'add product'})
})

// SAVING ADDED SUPPLIER'S PRODUCT
app.post('/suppliers/:supplier_id/products', async(req, res) => {
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
app.get('/suppliers/:id/edit', async(req, res) => {
    const editingSupplier = await Supplier.findById(req.params.id)
    res.render('suppliers/edit', {...editingSupplier.toObject(), cities, title: 'edit supplier'.toUpperCase()})
})

// UPDATING EDITED SUPPLIER
app.put('/suppliers/:id', async(req, res) => {
    const updatingSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
    res.redirect(`/suppliers/${updatingSupplier._id}`)
})

// DELETING SUPPLIER
app.delete('/suppliers/:id', async(req, res) => {
    const deletingSupplier = await Supplier.findByIdAndDelete(req.params.id)
    res.redirect('/suppliers')
})



// =====================
// == PRODUCTS ROUTES ==
// =====================

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
app.get('/products', wrapAsync(async (req, res, next) => {
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
app.get('/products/new', (req, res) => {
    // throw new AppError('Not Allowed', 403)
    res.render('products/new', { title: 'new product', categories })
})

// SAVING CREATED PRODUCT
app.post('/products', wrapAsync(async (req, res, next) => {
    // const {name, price, category} = req.body
    const newProduct = new Product(req.body)
    await newProduct.save()
    console.log(`${newProduct.name} has been saved.`)
    res.redirect(`/products/${newProduct._id}`)
}))

// SHOWING PRODUCT DETAIL
app.get('/products/:id', wrapAsync(async (req, res, next) => {
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
app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
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
app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    // const {name, price, category} = req.body
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    console.log(`${updatedProduct.name} has been updated.`)
    res.redirect(`/products/${updatedProduct._id}`)
}))

// DELETING PRODUCT
app.delete('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const deletedProduct = await Product.findByIdAndDelete(id).populate('supplier', '_id')
    if (!deletedProduct) {
        // throw new AppError('Product Not Found!', 404)
        throw new AppError('Product Not Found!', 404)
    }
    console.log(`${deletedProduct.name} has been deleted.`)
    res.redirect(`/suppliers/${deletedProduct.supplier._id}`)
}))

// ERROR HANDLER
const handleValidationError = err => {
    // console.dir(err)
    return new AppError(`Validation Failed! ${err.message}`, 400)
}
app.use((err, req, res, next) => {
    console.log(err.name) // different error type from mongo
    if (err.name === 'ValidationError') err = handleValidationError(err)
    next(err)
})
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong!' } = err
    res.status(status).send(message)
})

// APP PORT
app.listen(8090, () => {
    console.log('listening on port 8090...')
})