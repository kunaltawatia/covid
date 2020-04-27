const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const HitSchema = new Schema({
	/**
	 * website hits
	 */
	hits: Number
});

// create and export the model
module.exports.Hits = mongoose.model('Hits', HitSchema, 'hits');
