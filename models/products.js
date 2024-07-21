const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'input cannot be blank!'],
    },
    price: {
        type: Number,
        required: [true, 'input cannot be blank!'],
        min: 0,
    },
    category: {
        type: String,
        lowercase: true,
        enum: ['fruit', 'vegetable', 'dairy']
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    }
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product