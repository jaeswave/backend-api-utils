const bcrypt = require('bcrypt');
const saltRound = 10    

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



module.exports = {
    generateOtp,
    hashPassword
}