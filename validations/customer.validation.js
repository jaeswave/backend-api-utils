const Joi = require('joi');


const createCustomerValidation = (data) =>  {
    const customerSchema =  Joi.object({
        surname: Joi.string().required(),
        othernames: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
    return customerSchema.validate(data)
}


const updateCustomerValidation = (data) =>  {
    const customerSchema =  Joi.object({
        surname: Joi.string(),
        othernames: Joi.string(),
        phone: Joi.string()
    })
    return customerSchema.validate(data)
}

module.exports = {
    createCustomerValidation,
    updateCustomerValidation
}