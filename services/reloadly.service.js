
const axios = require('axios');

const getAccessToken = async () => {

   const response = await axios({
        method: "POST",
        url: "https://auth.reloadly.com/oauth/token",
        headers:{
            'Content-Type': 'application/json'
        },
        data:{
            "client_id": process.env.RELOADLY_CLIENT_ID,
            "client_secret": process.env.RELOADLY_CLIENT_SECRET,
            "grant_type": "client_credentials",
            "audience": "https://topups-sandbox.reloadly.com"
          }
    })
return  response.data.access_token

}


const operators = async() => {
    const token = await getAccessToken()

    const response = await axios({
        method: "GET",
        url:"https://topups-sandbox.reloadly.com/operators/countries/NG",
        headers:{
             Accept: 'application/com.reloadly.topups-v1+json',
             Authorization: `Bearer ${token}`
        },
    })

    return response.data

            
}

const buyAirtime = async(operatorId, amount, email, recipientPhone) => {

    const token = await getAccessToken()

    const response = await axios({
        method: "POST",
        url: "https://topups-sandbox.reloadly.com/topups ",
        headers:{
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data:{
            "operatorId": operatorId,
            "amount": Number(amount),
            // "useLocalAmount": false,
            // "customIdentifier": email,
            "recipientEmail": email,
            "recipientPhone": {
              "countryCode": "NG",
              "number": recipientPhone
            },
            // "senderPhone": {
            //   "countryCode": "CA",
            //   "number": 11231231231
            // }
            //we commented out because they are not compulsory on reloadly documentation
          }
    
    })


    return response.data



}

const buyData = () => {}



const buyUtilityBills = () => {}

const buyCableTV = () => {}


module.exports = {
    buyData,
    buyAirtime,
    buyUtilityBills,
    buyCableTV,
    operators
}