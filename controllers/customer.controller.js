const {createCustomerValidation, updateCustomerValidation } = require('../validations/customer.validation')
const {Customers}  = require('../models/customer.model')
const { TemporaryCustomers } = require('../models/customer_temp.model')
const { Otp } = require('../models/otp.model')
const {hashPassword, generateOtp} = require('../utils')
const { v4: uuidv4 } = require('uuid');
const data  = require('../messages')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Wallets } = require('../models/wallets.model');
const { initializePayment } =  require('../services/payment.service')
const ONE_HOUR = '1h'

const createCustomer = async(req, res) => {

   try{

    const { surname, othernames, email, password } = req.body
    const { error } = createCustomerValidation(req.body)
    if (error != undefined) throw new Error(error.details[0].message) 
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
    
        //insert into the customers table
        await Customers.create({
            customer_id: customerTemp.customer_id,
            surname: customerTemp.surname,
            othernames: customerTemp.othernames,
            email: customerTemp.email,
            hash: customerTemp.hash,
            salt: customerTemp.salt,
            is_email_verified: true
        })
        //insert into the wallets table
        await Wallets.create({
            wallet_id: uuidv4(),
            customer_id: customerTemp.customer_id,
            amount: 0.00
        }) 
        
         //delete from the otp table
         await Otp.destroy({
            where: {
                email: email
            }
        })
        //delete from the customerTemp table
        await TemporaryCustomers.destroy({
            where: {
                email: email
            }
        })
       


        res.status(200).json({
            status: data.successStatus,
            message: data.emailVerified
        })

    }catch(error){
        res.status(400).json({
            status: "error",
            message: error.message
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
    
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: ONE_HOUR });
    
   res.setHeader('access_token', token) 
    res.status(200).json({
        status: data.successStatus,
        message: 'Login successful'
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
    const { customer_id } = req.params
    const data = req.body
    //validate 
    const { error } = updateCustomerValidation(req.body)
    if (error != undefined) throw new Error(error.details[0].message)
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


 const startWalletFunding = async(req, res) => {  
    try{
        const { amount, email } = req.body
        if(amount < 1000) throw new Error('Amount must be greater than 1000')
        const response = await initializePayment(email, amount)
        console.log(response)
        res.status(200).json({
            status: true,
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



module.exports = {
    createCustomer,
    updateCustomer,
    verifyEmail,
    login,
    startWalletFunding
}