var { questions } = require('../data/questions.json');

function getDbValue(questionIndex, answerIndex) {
    if (answerIndex === undefined) return '';

    const { dbValue } = questions[questionIndex].answers[answerIndex];

    return dbValue || '';
}

module.exports.answersToModel = (answers, callback) => {

    if (!answers)
        callback({});
    else {

        fever = answers['4'] === '0' ? getDbValue(5, answers['5']) : '';
        cough = answers['6'] === '0' ? getDbValue(7, answers['7']) : '';
        shortness_of_breath = answers['8'] === '0' ? getDbValue(8, answers['8']) : '';
        fatigue = answers['9'] === '0' ? getDbValue(9, answers['9']) : '';
        headache = answers['10'] === '0' ? getDbValue(10, answers['10']) : '';
        sore_throat = answers['11'] === '0' ? getDbValue(11, answers['11']) : '';

        international_traveller = answers['12'] === '0' ? getDbValue(13, answers['13']) : '';
        patient_in_household = answers['14'] === '0' ? getDbValue(14, answers['14']) : '';
        contact_with_patient = answers['15'] === '0' ? getDbValue(15, answers['15']) : '';

        additional = answers['16']

        name = answers['0']
        gender = getDbValue(1, answers['1']);
        age = answers['2']
        telephone = answers['3']

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
            telephone
        });
    }

}