const bcrypt = require('bcrypt');
const saltRound = 10   
const { Wallets } = require('../models/wallets.model')
const { Transactions } = require('../models/transaction.model')
const { v4: uuidv4 } = require('uuid');
const {paymentMeans} = require('../enum')
const  sequelize  = require('../config/sequelize');

const generateOtp = ()=> {
    //generate 6 digit otp
    return Math.floor(100000 + Math.random() * 900000)
}

const hashPassword = async(password) => {
    return new Promise((resolve,  reject) => {
        bcrypt.genSalt(saltRound, (err, salt) => {     
            if(err) reject(err)
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) reject(err)
                resolve([hash, salt])
             })
        })
    })
   
}

const comparePassword = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, 
            (err, result) => {
            if(err) reject(err)
            resolve(result)
        })
    })

}


const debitWallet = async (amt, customer_id, email, service, description) => {
 try{


        const transaction_reference = uuidv4()
        await sequelize.transaction(async (t) => {

      //debit the wallet and update the amount with the new value in sequelize

        const wallet = await Wallets.findOne({where: {customer_id}}, {transaction: t})
        const walletBalance = Number(wallet.amount)

        if(walletBalance - amt < 0) throw new Error("Insufficient Balance")
        const newBalance = walletBalance - amt
        await Transactions.create({
            transaction_id: uuidv4(),
            wallet_id: wallet.wallet_id,
            amount: amt,
            description: description,
            email: email,
            transaction_type: 'debit',
            status: 'pending',
            service: service,
            payment_means: paymentMeans.WALLET,
            payment_reference: transaction_reference
        }, {transaction: t})
        await Wallets.update({amount: newBalance}, {where: {customer_id}}, {transaction: t})
        
       
     
    })

    return transaction_reference

 }catch(err){
   
     return null
 }
}     

const creditWallet = async (amt, customer_id, email, description) => {
    try{
   
           await sequelize.transactions(async (t) => {
   
         //credit the wallet and update the amount with the new value in sequelize
           const wallet = await Wallets.findOne({where: {customer_id}}, {transaction: t})
           const newBalance =  Number(wallet.amount) + amt
           await Transactions.create({
               transaction_id: uuidv4(),
               wallet_id: wallet.wallet_id,
               amount: amt,
               description: description,
               email: email,
               transaction_type: 'credit',
               status: 'completed',
               payment_means: paymentMeans.WALLET,
               payment_reference: uuidv4()
           }, {transaction: t})
           await Wallets.update({amount: newBalance}, {where: {customer_id}}, {transaction: t})
           
           return true
       })
   
    }catch(err){
        return false
    }
   } 


const checkTransactionStatus = async(reference)=>{
    return  await Transactions.findOne({where:{ payment_reference: reference, status: "completed"} })

   
}


module.exports = {
    generateOtp,
    hashPassword,
    debitWallet,
    creditWallet,
    checkTransactionStatus
}