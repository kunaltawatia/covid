const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const DoctorSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    attending: String,
    chat_id: String
});

// create the model
const Doctor = mongoose.model('Doctor', DoctorSchema, 'doctors');

// export the model
module.exports = Doctor;