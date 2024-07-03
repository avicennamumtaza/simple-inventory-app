const mongoose = require('mongoose')

const Product = require('./models/products')

mongoose.connect('mongodb://localhost:27017/farmdb')
    .then(() => {
        console.log('database connected successfully.')
    })
    .catch(error => {
        console.log('database connection error.')
        console.log(error)
    })

// const p = new Product({
//     name: 'Fresh Orange',
//     price: 1000,
//     category: 'fruit'
// })

// p.save()
//     .then(res => console.log(res))
//     .catch(err => console.log(err))

const seedProducts = [
    {
        name: "Apple",
        price: 15000,
        category: "fruit"
    },
    {
        name: "Carrot",
        price: 8000,
        category: "vegetable"
    },
    {
        name: "Milk",
        price: 20000,
        category: "dairy"
    },
    {
        name: "Banana",
        price: 12000,
        category: "fruit"
    },
    {
        name: "Spinach",
        price: 10000,
        category: "vegetable"
    },
    {
        name: "Cheese",
        price: 30000,
        category: "dairy"
    },
    {
        name: "Broccoli",
        price: 15000,
        category: "vegetable"
    },
    {
        name: "Yogurt",
        price: 25000,
        category: "dairy"
    }
];

Product.insertMany(seedProducts)
    .then(res => console.log(res))
    .catch(err => console.log(err))