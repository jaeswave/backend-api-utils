const express = require('express')
const router = express.Router()
const { createCustomer, updateCustomer, verifyEmail, login, startWalletFunding } = require('../controllers/customer.controller')


router.post('/customer', createCustomer); 

router.patch('/verify-email/:email/:otp', verifyEmail);

router.patch('/customer/:customer_id', updateCustomer);

router.post('/customer/login', login);

router.post('/customer/wallet-funding/start', startWalletFunding);

module.exports = router;