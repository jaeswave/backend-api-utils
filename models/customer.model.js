// const { Sequelize, DataTypes } = require('sequelize');
// const  dbCon = require('../config/sequelize')
// const sequelize = new Sequelize(dbCon)

// const Customers = sequelize.define(
//   'Customer',
//   {
//     // Model attributes are defined here
//     sn: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     customer_id: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         uniqueKey: true
//     },
//     surname: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     othernames: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     is_email_verified: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false
//     },
//     hash: {
//       type: DataTypes.TEXT,
//       allowNull: false

//     },
//     salt: {
//       type: DataTypes.TEXT,
//       allowNull:false
//     },
//     created_at: {
//       type: DataTypes.STRING,

      
//     },
//     modified_at: {
//       type: DataTypes.STRING,
//       // allowNull defaults to true
//     },
//   },
//   {
//     // Other model options go here
//   },
// );


// module.exports =   Customers


const {Sequelize, DataTypes} = require("sequelize")
const sequelize = require('../config/sequelize')


const Customers = sequelize.define("Customer", 
    {
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.STRING,
        allowNull: false,
        uniqueKey: true
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    othernames: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hash: {
      type: DataTypes.TEXT,
      allowNull: false

    },
    salt: {
      type: DataTypes.TEXT,
      allowNull:false
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


module.exports = { Customers }
