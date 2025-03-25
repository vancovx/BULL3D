const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    username: {
        type: String,
        required: [true, 'Please add a user']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    numberphone: {
        type: Number,
        required: [false]
    },
    description: {
        type: String,
        required: [false]
    },
},
{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)
