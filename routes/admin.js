const express = require('express')
const router = express.Router()

router.get('/secret', (req, res) => {
    res.send('Here is our top secret...')
})

router.use((req, res, next) => {
    if (req.query.isAdmin) {
        next()
    }
    res.send("Sorry you aren't admin.")
})

module.exports = router