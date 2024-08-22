
const axios = require('axios');
const TO_KOBO = 100


const initializePayment = async(email, amount) =>{

return axios({
        method: 'post',
        url: 'https://api.paystack.co/transaction/initialize',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_API_SECRET_KEY}`
        },
        data: {
            email: email,
            amount: amount * TO_KOBO
        }
  });

}


module.exports = {
    initializePayment
}