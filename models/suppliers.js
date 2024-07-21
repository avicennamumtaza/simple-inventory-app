const mongoose = require('mongoose')
const Product = require('./products')
const { Schema } = mongoose

const supplierSchema = new Schema({
    name: {
        type: String,
        required: [true, 'input cannot be blank!'],
    },
    contact: {
        type: String,
        required: [true, 'input cannot be blank!'],
    },
    city: {
        type: String,
        required: [true, 'input cannot be blank!'],
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

supplierSchema.post('findOneAndDelete', async(supplier) => {
    if (supplier.products.length) {
        const result = await Product.deleteMany({_id: {$in: supplier.products}})
        console.log(result)
    }
})

const Supplier = mongoose.model('Supplier', supplierSchema)
module.exports = Supplier