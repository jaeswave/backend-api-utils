

const {Sequelize, DataTypes} = require("sequelize")
const sequelize = require('../config/sequelize')


const Services = sequelize.define("Service", 
    {
    sn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    service_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    service_name: {
        type: DataTypes.STRING,
        allowNull: false,
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


module.exports = { Services }
