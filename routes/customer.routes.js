const express = require('express')
const router = express.Router()
const { createCustomer, updateCustomer, verifyEmail, login, 
    startWalletFunding, getCustomer, completeWalletFunding, 
    getWallet, getAllServices, 
     purchaseService, getOperators, getBills , 
     validateCustomerBillDetails} = require('../controllers/customer.controller')
const { authorization } = require('../middleware/authorisation');
const { buyUtilityBills } = require('../services/reloadly.service');

router.post('/customer', createCustomer); 

router.patch('/verify-email/:email/:otp', verifyEmail);

router.patch('/customer', authorization,  updateCustomer);

router.get('/customer', authorization, getCustomer);

router.post('/customer/login', login);

router.post('/customer/wallet-funding/start', authorization, startWalletFunding);

router.post('/customer/wallet-funding/complete/:reference', authorization, completeWalletFunding);

router.get('/customer/wallet', authorization, getWallet);

router.get('/services', authorization, getAllServices);

router.get('/operators/:biller_code', authorization, getOperators);

router.get('/bills-information/:biller_code', authorization, getBills);

router.get('/bills/:item_code/:biller_code/:customer_unique_no/validate', authorization, validateCustomerBillDetails);

router.post('/purchase' , authorization, purchaseService); //purchaseService

// router.post('/purchase-data' , authorization, purchaseData)


// router.get('/billers', authorization, getUtilityBillers);

// router.post('/buy-utility', authorization, buyUtilityBills)


module.exports = router;