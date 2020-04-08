const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const DoctorSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 1
    },
    hospital: {
        type: String,
        required: true,
        minlength: 1
    },
    attending: {
        type: String,
        default: ''
    },
    chat_id: {
        type: String,
        default: ''
    },
    created_at: Number,
    name: String,
    department: String,
    email: String,
    telephone: Number,
    post: String
});

// create the model
const Doctor = mongoose.model('Doctor', DoctorSchema, 'doctors');

// export the model
module.exports = Doctor;