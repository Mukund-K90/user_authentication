const joi = require('joi');

const userValidation = (req, res, next) => {
    const { name, email, mobile, password } = req.body;

    const schema = joi.object({
        name: joi.string().required().min(3),
        email: joi.string().required().email({
            minDomainSegments: 2,
            tlds: ['com', 'in']
        }).lowercase(),
        mobile: joi.string().required().length(10),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).min(3).max(15)
    });

    const { error } = schema.validate({
        name,
        email,
        mobile,
        password
    });
    if (error) {
        return res.status(500).send({
            success: false,
            error: error.details[0].message,
        })
    }
    next();
}

module.exports = { userValidation };