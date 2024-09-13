const {createCustomerValidation, updateCustomerValidation } = require('../validations/customer.validation')
const {Customers}  = require('../models/customer.model')
const { TemporaryCustomers } = require('../models/customer_temp.model')
const { Otp } = require('../models/otp.model')
const {hashPassword, generateOtp} = require('../utils')
const { v4: uuidv4 } = require('uuid');
const data  = require('../messages')
const bcrypt = require('bcrypt');
const  sequelize  = require('../config/sequelize')
const jwt = require('jsonwebtoken');
const { Wallets } = require('../models/wallets.model');
const { Services } = require('../models/services.model')
const { initializePayment, verifyPayment } =  require('../services/payment.service')
const { buyAirtime } = require('../services/reloadly.service')
const { Transactions } = require('../models/transaction.model')
const { operators } = require('../services/reloadly.service')
const ONE_HOUR = '1h'
const NAIRA_CONVERSION = 100
const {paymentMeans} = require('../enum')
const { debitWallet, creditWallet, checkTransactionStatus } = require('../utils')

const createCustomer = async(req, res) => {

   try{

    const { surname, othernames, email, password } = req.body
    const { error } = createCustomerValidation(req.body)
    if (error != undefined) throw new Error(error.details[0].message || "Something went wrong") 
     const checkIfEmailExist = await Customers.findOne({where:{ email: email} })
 
    if(checkIfEmailExist != null ) throw new Error(data.customerExist)
    const [hash, salt] = await hashPassword(password)
    await TemporaryCustomers.create({
        customer_id: uuidv4(),
        surname: surname,
        othernames: othernames,
        email: email,
        hash: hash,
        salt: salt
    })
    //generate otp
    const otp = generateOtp()
    await Otp.create({
        email: email,
        otp: otp
    })
//seem the otp as notification

    
     res.status(200).json({
            status: data.successStatus,
            message: data.otpSent
     })

   }catch(error){

    res.status(400).json({
        status: "error",
        message: error.message
    })
   }
   
}

const verifyEmail = async(req, res) => {

    try{
        const { email, otp } = req.params
        const checkIfEmailAndOtpExist =  await Otp.findOne({where:{ email: email, otp: otp} })
       
        if(checkIfEmailAndOtpExist == null ) throw new Error(data.otpInvalidOrExpired)
    
        //get all the daata by emeail from the customerTemp table
        const customerTemp = await TemporaryCustomers.findOne({where:{ email: email} })
        if(customerTemp == null ) throw new Error(data.customerNotExist)
    
    //start a database transaction
   await sequelize.transaction( async(t) => {

        //insert into the customers table
        await Customers.create({
            customer_id: customerTemp.customer_id,
            surname: customerTemp.surname,
            othernames: customerTemp.othernames,
            email: customerTemp.email,
            hash: customerTemp.hash,
            salt: customerTemp.salt,
            is_email_verified: true
        }, {transaction: t})
        //insert into the wallets table
        await Wallets.create({
            wallet_id: uuidv4(),
            customer_id: customerTemp.customer_id,
            amount: 0.00 //
        }, {transaction: t}) 
        //delete from the otp table
         await Otp.destroy({
            where: {
                email: email
            }
        }, {transaction: t})
        //delete from the customerTemp table
        await TemporaryCustomers.destroy({
            where: {
                email: email
            }
        }, {transaction: t})

    })

        res.status(200).json({
            status: data.successStatus,
            message: data.emailVerified
        })

    }catch(error){
        res.status(400).json({
            status: "error",
            message: error.message || "Something went wrong, try again later"
        })
    }
    
}

const login = async(req, res) => {
    try{
    const { email, password } = req.body
    if(!email.trim() || !password.trim()) throw new Error('Email and password are required')
    const customer = await Customers.findOne({where:{ email: email} })
    if(customer == null ) throw new Error('Invalid email or password')
        
    const match = await bcrypt.compare(password, customer.hash);
    if(!match) throw new Error('Invalid email or password')
    
    const token = jwt.sign({ _id: uuidv4(), email: email }, process.env.JWT_SECRET, { expiresIn: ONE_HOUR });
 
    res.setHeader('access_token', token) 
    res.status(200).json({
        status: data.successStatus,
        message: 'Login successful',
        data: getCustomer
    })

    }catch(error){
        res.status(400).json({
            status: data.errorStatus,
            message: error.message
        })
    }   
}
 
const updateCustomer = async(req, res) => { 
    //assignment
    try{
    const { customer_id } = req.params // passed from the authorization middleware
    const data = req.body
    //validate 
    const { error } = updateCustomerValidation(req.body)
    if (error != undefined) throw new Error(error.details[0].message || "Something went wrong")
    await Customers.update(req.body, {
            where: {
            customer_id: customer_id,
            },
        },
        );
    
    res.status(200).json({
        status: data.successStatus,
        message: data.customerUpdated
    })

    }catch(error){
        res.status(400).json({
            status: data.errorStatus,
            message: error.message
        })
    }


 }

 const getCustomer = async(req, res) => {
    try{
        const { customer_id } = req.params // passed from the authorization middleware
        const customer = await Customers.findOne({where:{ customer_id: customer_id}, attributes: { exclude: ['sn', 'hash', 'salt', 'customer_id', 'created_at', 'modified_at'] } })
        if(customer == null ) throw new Error(data.customerNotExist)

        res.status(200).json({  
            status: data.successStatus,
            message: data.customerFound,
            data: customer
        })
    }catch(error){
        res.status(400).json({
            status: data.errorStatus,
            message: error.message
        })
    }
 }

 /**
  * We decided not to initiate the payment trasactionin the tabele at the initiaize stage
  * We will only insert into the transaction table when the payment is completed
  * This is to avoid inserting into the transaction table when the payment fails
  * And also to avoid inserting into the transaction table when the payment is not completed
  * So we inserted during the completion stage
  * 
  */

 const startWalletFunding = async(req, res) => {  
    try{
        const { email, customer_id } = req.params // passed from the authorization
        const { amount } = req.body
        if(amount < 1000) throw new Error('Amount must be greater than 1000')
        const response = await initializePayment(email, amount)

        res.status(200).json({
            status: data.successStatus,
            message: "Payment initialized successfully",
            data: {
                payment_url : response.data.data.authorization_url,
                access_code: response.data.data.reference
            }
        })


    } catch(error){
        res.status(400).json({
            status: false,
            message: error.message
        
        })
  }
}

const completeWalletFunding = async(req, res) => {

  try{
    const { customer_id, email } = req.params // passed from the authorization
    const { reference } = req.params

    const transaction = await checkTransactionStatus(reference)
    if(transaction != null ) throw new Error('Invalid transaction')

    const response = await verifyPayment(reference)

    if(response.data.data.status != 'success') throw new Error('Invalid transaction or payment failed')

     await sequelize.transaction(async t => {
    
        const getWallet = await Wallets.findOne({where:{ customer_id: customer_id} }, {transaction: t})

        await Transactions.create({
            transaction_id: uuidv4(),
            customer_id: customer_id,
            wallet_id: getWallet.wallet_id,
            payment_reference: reference,
            email: email,
            description: 'Wallet funding',
            transaction_type: 'credit',
            service: 'wallet',
            payment_means: 'others',
            amount: response.data.data.amount / NAIRA_CONVERSION,
            status: 'completed'
        }, {transaction: t})
        const updatedAmount =   Number(getWallet.amount) + (response.data.data.amount / NAIRA_CONVERSION)

        await  Wallets.update({ amount:updatedAmount }, {
            where: {
                customer_id: customer_id
            }
        }, {transaction: t})
    })
   

    res.status(200).json({
        status: data.successStatus,
        message: "Wallet successfully funded"
    })
  }catch(error){
    res.status(400).json({
        status: "error",
        message: error.message
    })
  }

    


    
}

const getWallet= async(req, res) => {

  try{
    const { customer_id, email } = req.params // passed from the authorization

    const wallet = await Wallets.findOne({where:{ customer_id: customer_id}, attributes: { exclude: ['sn', 'customer_id', 'created_at', 'modified_at'] } })

    const transaction = await Transactions.findAll( { where:{ email: email}, attributes: { exclude: [ 'customer_id', 'wallet_id', 'modified_at']}})
    //limit and sort

    res.status(200).json({
        status: data.successStatus,
        message: data.walletFound,
        data: {
            wallet: wallet,
            transactions: transaction
        }
    })
  }catch(error){
    res.status(400).json({
        status: "error",
        message: error.message
    })
  }

}

const getAllServices = async(req, res) => {
    try{
        const allServices = await Services.findAll({attributes: { exclude: ['sn', 'created_at', 'modified_at'] } })
        res.status(200).json({
            status: data.successStatus,
            message: "All services",
            data: allServices
        })

    }catch(err){
        res.status(400).json({
            status: "error",
            message: err.message || "Sorry, we cannot process your request at the moment"
        })
    }
}


const getOperators = async(req, res) => {
   try{
    const operatorType = Boolean(req.query.data) || null
    let filteredOperators = null
    const allOps = await operators()
    if(operatorType == true){
          //data operators
         filteredOperators = allOps.filter(op =>  op.data == true || op.bundle == true)

    }else{
        //airtime operators
        filteredOperators = allOps.filter(op =>  op.data == false && op.bundle == false && !op.name.includes('Bundle'))
    }
    
    res.status(200).json({
        status: data.successStatus,
        message: "All operators",
        data: filteredOperators
    })
   }catch(err){
    res.status(400).json({
        status: "error",
        message: err.message || "Sorry, we cannot process your request at the moment"
    })
   }
}

const purchaseAirtime = async(req, res) => {
    try{
        const { customer_id, email } = req.params // passed from the authorization
        const {  amount, operatorId, recipientPhone , payment_means } = req.body //ser
        const service = "AIRTIME"
        switch(payment_means){

            case paymentMeans.WALLET:
                const transaction_reference = await debitWallet(amount, customer_id, email, service, "Wallet Debit for Airtime Purchase")
        
                if(transaction_reference == null) throw new Error('Insufficient balance')
                const response = await processAirtimePurchase(customer_id,operatorId, amount, email, recipientPhone, payment_means, transaction_reference)
                if(!response) throw new Error("Airtime Purchase failed") 
                break;
            case paymentMeans.OTHERS:
                const  { reference } = req.body
                if(!reference) throw new Error("Invalid Reference")
                const transaction = await checkTransactionStatus(reference) //check if transaction reference has not been used on our system
                
                if(transaction != null ) throw new Error('Invalid transaction')
                
                const verifyPaymentReference = await verifyPayment(reference)
                if(verifyPaymentReference.data.data.status != 'success') throw new Error('Invalid transaction or payment failed')
                
                let amountToBePurchased = verifyPaymentReference.data.data.amount / NAIRA_CONVERSION
                const response2 = await processAirtimePurchase(customer_id, operatorId, amountToBePurchased, email, recipientPhone, payment_means, reference)
                if(!response2) throw new Error("Airtime Purchase failed") 

                
                break;
            default:
                throw new Error('Invalid payment means')
               
        }


        res.status(200).json({
            status: data.successStatus,
            message: "Airtime purchased successfully"
        })
    
    }catch(error){
        res.status(400).json({
            status: "error",
            message: error.message || "Sorry, we cannot process your request at the moment"
        })
    }
}

const purchaseData = async (req, res) => {
    try{
        const { customer_id, email } = req.params // passed from the authorization
        const { amount, operatorId, recipientPhone , payment_means } = req.body //ser
        const service = "DATA SUBSCRIPTION"

        switch(payment_means){

            case paymentMeans.WALLET:
                const transaction_reference = await debitWallet(amount, customer_id, email, service, "Wallet Debit for Data Subscription")
        
                if(transaction_reference == null) throw new Error('Insufficient balance')
                const response = await processAirtimeOrDataPurchase(customer_id,operatorId, amount, email, recipientPhone, payment_means, transaction_reference)
                if(!response) throw new Error("Data Subscription Purchase failed") 
                break;
            case paymentMeans.OTHERS:
                const  { reference } = req.body
                if(!reference) throw new Error("Invalid Reference")
                const transaction = await checkTransactionStatus(reference) //check if transaction reference has not been used on our system
                
                if(transaction != null ) throw new Error('Invalid transaction')
                
                const verifyPaymentReference = await verifyPayment(reference)
                if(verifyPaymentReference.data.data.status != 'success') throw new Error('Invalid transaction or payment failed')
                
                let amountToBePurchased = verifyPaymentReference.data.data.amount / NAIRA_CONVERSION
                const response2 = await processAirtimeOrDataPurchase(customer_id, operatorId, amountToBePurchased, email, recipientPhone, payment_means, reference)
                if(!response2) throw new Error("Airtime Purchase failed") 

                
                break;
            default:
                throw new Error('Invalid payment means')
               
        }


        res.status(200).json({
            status: data.successStatus,
            message: "Airtime purchased successfully"
        })

        
        res.status(200).json({
            status: "success",
            message: "Data successfully purchased"
        })

    }catch(err){
        res.status(400).json({
            status: "error",
            message: err.message
        })
    }
}
    

const purchaseService = async(req, res) => {
try{
    const { customer_id, email } = req.params // passed from the authorization
    const { service, amount, payment_means } = req.body //ser

    if(payment_means === paymentMeans.WALLET){
        //debit the customer wallet
        const wallet = await Wallets.findOne({where:{ customer_id: customer_id} })
        const canBuyService =  Number(wallet.amount) - amount

        if(canBuyService  < 0) throw new Error('Insufficient balance')

    }
    
    switch(service){
        case 'AIRTIME':
            const { operatorId, recipientPhone } = req.body //ser
            break;
        case 'DATA':
            break;
        case 'service3':
            break;
        case 'service4':
            break;
        default:

    }



    res.status(200).json({
        status: data.successStatus,
        message: "Service purchased successfully"
    })

}catch(error){
    res.status(400).json({
        status: "error",
        message: error.message || "Sorry, we cannot process your request at the moment"
    })
}
}








async function processAirtimeOrDataPurchase (customer_id, operatorId, amountToBePurchased, email, recipientPhone, payment_means, transaction_reference) {
    const response = await buyAirtime(operatorId, amountToBePurchased, email, recipientPhone)
    const isSuccess = Object.keys(response).includes('status')
    if(!isSuccess) {
        //refund him 
        if(payment_means == paymentMeans.WALLET){ //only credit wallet back whne payment is only wallet
             await creditWallet(amount, customer_id, email, 'Refund for failed airtime purchase')
        }
        return false
    }else{
        //update the transaction table
        if(payment_means == paymentMeans.WALLET){
        await Transactions.update({ status: 'completed'}, {where: { payment_reference: transaction_reference}})
        }else{
            await Transactions.create({
                transaction_id: uuidv4(),
                wallet_id: null,
                amount: amountToBePurchased,
                description: 'Airtime purchase',
                email: email,
                transaction_type: 'debit',
                status: 'completed',
                service: 'AIRTIME',
                payment_means: paymentMeans.OTHERS,
                payment_reference: transaction_reference
            })
        }
        return true
    }
}

module.exports = {
    createCustomer,
    updateCustomer,
    verifyEmail,
    login,
    startWalletFunding,
    getCustomer,
    completeWalletFunding,
    getWallet,
    getAllServices,
    getOperators,
    purchaseService,
    purchaseAirtime,
    purchaseData
}