

const {Sequelize, DataTypes} = require("sequelize")
const sequelize = require('../config/sequelize')


const Transactions = sequelize.define("Transaction", 
    {
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    wallet_id: {
        type: DataTypes.STRING,
        allowNull: true,
        /*
            we need to add a reference to the wallet table but we 
            decided to allow the wallet id to be null
            should in case other customer wants to make a 
            transaction without a wallet. So whne the wallet id is null
            we can assume that the customer is making a transaction without a wallet
            using others payment methods
        */
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
        /**
         * we need to add a reference to the customer table
         * so that we can easily get the customer details
         * but we decided to allow the email because
         * we can have a transaction without a customer id but
         * have the email of the customer instead
         */
    },
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0.00
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    transaction_type: {
        type: DataTypes.ENUM,
        values: ['credit', 'debit'],
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'completed', 'failed'],
        defaultValue: 'pending'
    },
    service: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_means: {
        type: DataTypes.ENUM,
        values: ['wallet', 'others']
    },
    payment_reference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
      type: DataTypes.STRING,
    
    },
    modified_at: {
      type: DataTypes.STRING
    }

},{
  timestamps: false,
  createdAt: false,
  updatedAt: false  
  
})


module.exports = { Transactions }
