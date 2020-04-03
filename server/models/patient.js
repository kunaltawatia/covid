const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const PatientSchema = new Schema({
    fever: String,
    cough: String,
    shortness_of_breath: String,
    fatigue: String,
    headache: String,
    sore_throat: String,
    international_traveller: String,
    patient_in_household: String,
    contact_with_atient: String,
    symptomatic: Boolean,
    suspect: Boolean,
    additional: String,
    name: String,
    telephone: String,
    gender: String,
    age: String,
    latitude: Number,
    longitude: Number,
    ip: String,
    created_at: Number,
    chat_id: String,
    doctor: String
});

// create the model
const Patient = mongoose.model('Patient', PatientSchema, 'patients');

// export the model
module.exports = Patient;