const express = require('express')
const router = express.Router()
const { createCustomer, updateCustomer, verifyEmail, login, 
    startWalletFunding, getCustomer, completeWalletFunding, 
    getWallet, getAllServices, 
     purchaseService, getOperators, getBills , 
     validateCustomerBillDetails} = require('../controllers/customer.controller')
const { authorization } = require('../middleware/authorisation');
const { buyUtilityBills } = require('../services/reloadly.service');



/**
 * @openapi
 * /customer:
 *  post:
 *   summary: Create a customer
 *   description: This endpoint will Create a customer
 *   parameters:	 
 *       - name: lastname	 
 *         in: body	 
 *         required: true
 *       - name: othernames	 
 *         in: body	 
 *         required: true
 *       - name: email	 
 *         in: body	 
 *         required: true
 *       - name: phone_number	 
 *         in: body	 
 *         required: true
 *       - name: password	 
 *         in: body	 
 *         required: true 
 *         type: number
 *   responses:
 *    200:
 *    description: Customer account created successfully
 */
router.post('/customer', createCustomer); 

router.patch('/verify-email/:email/:otp', verifyEmail);

router.patch('/customer', authorization,  updateCustomer);

router.get('/customer', authorization, getCustomer);

router.post('/customer/login', login);


/**
 * @openapi
 * /customer/wallet-funding/start:
 *  post:
 *   summary: Create a customer
 *   description: This endpoint will Create a customer
 *   parameters:	 
 *       - name: amount	 
 *         in: body	 
 *         required: true
 *   headers:
 *      Authorization: token
 *   responses:
 *    200:
 *    description: Customer account created successfully
 */
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