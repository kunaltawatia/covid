const { questions } = require('../data/questions');
const Doctor = require('../models/doctor');

function getDbValue(questionIndex, dbQuestionIndex, answers) {
	try {
		if (answers && answers[questionIndex + ''] === '0') {
			if (answers[dbQuestionIndex + ''] !== undefined) {
				return (
					getQuestionById(dbQuestionIndex).answers[answers[dbQuestionIndex + '']].dbValue || ''
				);
			} else return '';
		} else return '';
	} catch (err) {
		return '';
	}
}

function getQuestionById(id) {
	for (let i = 0; i < questions.length; i++) {
		if (questions[i].id === id) {
			return questions[i];
		}
	}
	return null;
}

function getId(name, number) {
	const cleansedName = name.trim();
	if (cleansedName) {
		return `${cleansedName.split(' ')[0]}-${number}`.toLowerCase();
	}
	return null;
}

function answersToModel(answers, callback) {
	if (!answers) {
		callback({});
	} else {
		Doctor.find().distinct('hospital', (err, hospitals) => {
			if (err || !hospitals) return callback({});

			name = answers['21'];
			gender = getQuestionById(1).answers[answers['1']].dbValue;
			hospital = hospitals[answers['25']];
			age = answers['2'];
			email = answers['29'] === '0' ? answers['30'] : '';
			telephone = answers['3'];
			aiims_id = hospital === 'AIIMS Jodhpur' ? answers['28'] : '';

			type = getQuestionById(4).answers[answers['4']].dbValue;

			if (type === 'OPD') {
				opd_symptoms = answers['19'];
				opd_symptoms_age = answers['20'];
				callback({
					name,
					age,
					gender,
					telephone,
					email,
					hospital,
					type,
					opd_symptoms,
					opd_symptoms_age,
					aiims_id
				});
			} else {
				fever = getDbValue(5, 6, answers);
				cough = getDbValue(7, 8, answers);
				shortness_of_breath = getDbValue(9, 9, answers);
				fatigue = getDbValue(10, 10, answers);
				headache = getDbValue(11, 11, answers);
				sore_throat = getDbValue(12, 12, answers);
				change_in_smell = getDbValue(27, 27, answers);
				change_in_taste = getDbValue(26, 26, answers);

				international_traveller = getDbValue(13, 14, answers);
				patient_in_household = getDbValue(15, 15, answers);
				contact_with_patient = getDbValue(16, 16, answers);

				additional = answers['17'];

				symptomatic = (fever && true) || (cough && true) || (shortness_of_breath && true) || false;

				suspect =
					(international_traveller && symptomatic && true) ||
					(contact_with_patient && symptomatic && true) ||
					(patient_in_household && true) ||
					false;

				callback({
					name,
					age,
					gender,
					telephone,
					email,
					hospital,
					type,
					fever,
					cough,
					shortness_of_breath,
					fatigue,
					headache,
					sore_throat,
					change_in_smell,
					change_in_taste,
					international_traveller,
					patient_in_household,
					contact_with_patient,
					symptomatic,
					suspect,
					additional,
					aiims_id
				});
			}
		});
	}
}

module.exports = {
	getId,
	answersToModel
};
