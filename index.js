const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const adminRoutes = require('./routes/admin')
const productRoutes = require('./routes/products')
const supplierRoutes = require('./routes/suppliers')

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

app.use('/products', productRoutes)
app.use('/suppliers', supplierRoutes)
app.use('/admin', adminRoutes) // example middleware for check isAdmin







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