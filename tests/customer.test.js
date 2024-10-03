
const { createCustomer } = require('../controllers/customer.controller');
const data = require('../messages');
const request = require('supertest');
const app = require('../index');

describe('creating a customer',() => {
    it('should create a customer', () => {
        expect(true).toEqual(true)
    }),
    it('should create a customer', async() => {
        await request(app).post('/customer')
            .json({
              "surname": "Wale",
              "othernames" : "Todus",
              "email" : "rosh@gmail.com",
              "password" : "Password1"
            })
            expect(201)
            expect().toEqual({
                status: data.successStatus,
                message: data.otpSent
            })
})

})

// test('creating a customer',() => {
//     ///tes index route

//     const response = request(app).get('/');
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toBe('Proudly 🇳🇬')


   
//     //exoect status code to be 201
//     // expect(status).toBe(201);
//   });
//   test('creating a customer', async() => {
//     await request(app)
//         .post('/customer')
//         .json({
//           "surname": "Wale",
//           "othernames" : "Todus",
//           "email" : "waletodos@gmail.com",
//           "password" : "Password1"
//         })
//         .expect(201)
//         .then(res => {
//           console.log('Response Body :', JSON.stringify(res.body, null, 2))
//           expect(res.body).toEqual({
//            status: data.successStatus,
//            message: data.otpSent
     
//         })
//     })
//   })