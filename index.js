require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const displayRoutes = require('express-routemap')
const port = process.env.APP_PORT || 3000
const sequelize = require('./config/sequelize')
const customerRoutes = require('./routes/customer.routes')
// const customer = require('./models/customer.model')
// const wallet = require('./models/wallets.model')
// const service = require('./models/services.model')
// const otp = require('./models/otp.model')
// const tempCus = require('./models/customer_temp.model')
//const transction = require('./models/transaction.model')
const cron = require('node-cron')
const {crawlAndUpdateUtilityStatus} = require('./controllers/customer.controller')

app.use(express.json())
app.use(cors())
app.use(helmet());
app.use(compression())
app.use(customerRoutes)


app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: 'Proudly 🇳🇬'
})
})

try {
  
  
  (async()=> {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection has been established successfully.');
    app.listen(port, () => {
      displayRoutes(app)
      console.log(`Example app listening on port ${port}`)

      // cron.schedule('* * * * *', () => {
      //   console.log('running a task every minute');
      //   crawlAndUpdateUtilityStatus()
       
      // });
      


    })
  })()


  // sequelize.authenticate()
  // .then(() => {
  //   console.log('Connection has been established successfully.');
  //   app.listen(port, () => {
  //     displayRoutes(app)
  //     console.log(`Example app listening on port ${port}`)
  //   })
  // })

} catch (error) {
  console.error('Unable to connect to the database:', error);
  process.exit(1)
}




  //swagger
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Utility service API",
        version: "1.0.0",
        description: "utility service API",
        license: {
          name: "Zulfah",
          url: "",
        },
        contact: {
          name: "rosh",
          url: "",
        },
      },
      servers: [
        {
          url: `http://localhost:${port}/api/v1`,
          description: "Development server",
        },
        {
          url: `https://api.utilityapps.com/api/v1`,
          description: "Production server",
        },
      ],
    },
    apis: [`./routes/*.js`],
  };
  const swaggerSpec = swaggerJSDoc(options);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// error handling middleware
app.use((err, req, res, next) => {

  if(err.sqlMessage || err.sqlState){
     return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
  })
}else{
  return res.status(err.code || 400).json({
    status: 'error',
    message: err.message
   
  })
}
})





// not found routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'You got lost in the jungle'
  })
})


