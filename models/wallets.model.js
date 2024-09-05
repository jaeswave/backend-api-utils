

const {Sequelize, DataTypes} = require("sequelize")
const sequelize = require('../config/sequelize')


const Wallets = sequelize.define("Wallet", 
    {
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    wallet_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    customer_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references:{
            model: 'Customers',
            key: 'customer_id'
          }
    },
    amount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0.00
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


module.exports = { Wallets }
