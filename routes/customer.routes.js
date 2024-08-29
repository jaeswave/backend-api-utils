const express = require('express')
const router = express.Router()
const { createCustomer, updateCustomer, verifyEmail, login, startWalletFunding, getCustomer, completeWalletFunding, getWallet } = require('../controllers/customer.controller')
const { authorization } = require('../middleware/authorisation')

router.post('/customer', createCustomer); 

router.patch('/verify-email/:email/:otp', verifyEmail);

router.patch('/customer', authorization,  updateCustomer);

router.get('/customer', authorization, getCustomer);

router.post('/customer/login', login);

router.post('/customer/wallet-funding/start', authorization, startWalletFunding);

router.post('/customer/wallet-funding/complete/:reference', authorization, completeWalletFunding);

router.get('/customer/wallet', authorization, getWallet);


module.exports = router;