const mongoose = require('mongoose');

const { Schema } = mongoose;

const Chat = new Schema({
    statement: String,
    type: String
});

// create a schema
const PatientSchema = new Schema({
    _id: {
        type: String,
        unique: true,
        required: true
    },
    fever: String,
    cough: String,
    shortness_of_breath: String,
    fatigue: String,
    headache: String,
    sore_throat: String,
    change_in_smell: String,
    change_in_taste: String,
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
    doctor: String,
    hospital: String,
    type: String,
    opd_symptoms: String,
    opd_symptoms_age: String,
    chat: [Chat]
}, { _id: false });

// create the model
const Patient = mongoose.model('Patient', PatientSchema, 'patients');

// export the model
module.exports = Patient;