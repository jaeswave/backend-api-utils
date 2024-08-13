const express = require('express')
const router = express.Router()
const { createCustomer, updateCustomer, verifyEmail, login } = require('../controllers/customer.controller')


router.post('/customer', createCustomer); 

router.patch('/verify-email/:email/:otp', verifyEmail);

router.patch('/customer/:customer_id', updateCustomer);

router.post('/customer/login', login);

module.exports = router;