const mongoose = require('mongoose');

const { Schema } = mongoose;

const Chat = new Schema({
	statement: String,
	type: String
});

// create a schema
const PatientSchema = new Schema(
	{
		/**
		 * calcutaed by name-telephone
		 * ex. name:- KuNaL TAwAtia
		 * 		 tel:- 1234567890
		 * => id:- kunal-1234567890
		 */
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
		contact_with_patient: String,
		symptomatic: Boolean,
		/**
		 * based on AIIMS delhi guidelines
		 * pre-assessment of patient is assessed
		 * if (s)he is a COVID-19 suspect
		 */
		suspect: Boolean,
		/**
		 * additional symptom information
		 * provided by patient* under covid-19 consultancy
		 */
		additional: String,
		name: String,
		email: String,
		telephone: String,
		gender: String,
		age: String,
		latitude: Number,
		longitude: Number,
		ip: String,
		/**
		 * patient registered at
		 */
		created_at: Number,
		/**
		 * records time patient last messaged at
		 * it is used in deciding the last active time of patient
		 */
		last_messaged_at: Number,
		/**
		 * time on which the patient was last emailed
		 * for a message from doctor
		 */
		last_notified_at: Number,
		/**
		 * this contains the socket id of patient while chatting
		 * it is used by IO to emit events.
		 */
		chat_id: {
			type: String,
			default: ''
		},
		/**
		 * doctor he is presently seeking
		 * this field changes only at referral
		 */
		doctor: String,
		hospital: String,
		aiims_id: String,
		/**
		 * value is either "OPD" or "COVID-19"
		 */
		type: String,
		opd_symptoms: String,
		opd_symptoms_age: String,
		chat: [Chat]
	},
	{ _id: false }
);

// create the model
const Patient = mongoose.model('Patient', PatientSchema, 'patients');

// export the model
module.exports = Patient;
