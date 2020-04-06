var { questions } = require('../data/questions.json');

function getDbValue(questionIndex, dbQuestionIndex, answers) {
    try {
        if (answers && answers[questionIndex + ''] === '0') {
            if (answers[dbQuestionIndex + ''] !== undefined) {
                return questions[
                    dbQuestionIndex + ''
                ].answers[
                    answers[dbQuestionIndex + '']
                ].dbValue || '';
            } else return '';
        } else return '';
    } catch (err) {
        return '';
    }
}

module.exports.answersToModel = (answers, callback) => {

    if (!answers)
        callback({});
    else {

        type = questions[4].answers[answers['4']].dbValue;
        fever = getDbValue(5, 6, answers);
        cough = getDbValue(7, 8, answers);
        shortness_of_breath = getDbValue(9, 9, answers);
        fatigue = getDbValue(10, 10, answers);
        headache = getDbValue(11, 11, answers);
        sore_throat = getDbValue(12, 12, answers);

        international_traveller = getDbValue(13, 14, answers);
        patient_in_household = getDbValue(15, 15, answers);
        contact_with_patient = getDbValue(16, 16, answers);

        additional = answers['17']

        name = answers['0']
        gender = questions[1].answers[answers['1']].dbValue;
        age = answers['2']
        telephone = answers['3']

        opd_symptoms = answers['19'] || ''
        opd_symptoms_age = answers['20'] || ''

        symptomatic = (fever && true) || (cough && true) || (shortness_of_breath && true) || false;

        suspect = (international_traveller && symptomatic && true) ||
            (contact_with_patient && symptomatic && true) ||
            (patient_in_household && true) || false

        callback({
            fever,
            cough,
            shortness_of_breath,
            fatigue,
            headache,
            sore_throat,
            international_traveller,
            patient_in_household,
            contact_with_patient,
            symptomatic,
            suspect,
            additional,
            name,
            age,
            gender,
            telephone,
            type,
            opd_symptoms,
            opd_symptoms_age
        });
    }

}