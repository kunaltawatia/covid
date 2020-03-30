var express = require('express');
var questions = require('../data/questions.json');

var router = express.Router();

function checkForSuspect(answers, callback) {

  let cough = false, fever = false, shortnessOfBreath = false;
  let symptomatic = false, traveller = false, contactWithPatient = false, familyPatient = false;
  let suspect = false;

  if (answers) {
    fever = answers['0'] === '0';
    cough = answers['2'] === '0';
    shortnessOfBreath = answers['4'] === '0';

    traveller = answers['8'] === '0';
    familyPatient = answers['10'] === '0';
    contactWithPatient = answers['11'] === '0';

    symptomatic = fever || cough || shortnessOfBreath;

    suspect =
      (traveller && symptomatic) ||
      (contactWithPatient && symptomatic) ||
      (familyPatient)

    callback(suspect);
  }

  else callback(false);

}

router.post('/pre-assessment', (req, res) => {
  const { answers } = req.body;
  checkForSuspect(answers, (suspect) => {
    res.json({
      suspect,
      questionIndex: 13,
      incomingChats: suspect ?
        [
          {
            statement: 'सभी उपलब्ध चिकित्सक वर्तमान में व्यस्त हैं',
            type: 'incoming'
          },
          {
            statement: 'कृपया हमें कुछ विवरण दें ताकि हम आपसे संपर्क कर सकें',
            type: 'incoming'
          }
        ]
        :
        [

        ]

      /*
        incoming chats:
        > give assurance that 
          13% corona virus patient don't have fever etc...
        > jaaniye kaise dhake muu ko...
        > 
      */
    });
  })
});

router.post('/post-suspection', (req, res) => {
  console.log(req.body);
  res.json({
    incomingChats: [
      {
        statement: 'डॉक्टर जल्द ही आपसे संपर्क करेंगे',
        type: 'incoming'
      }
    ]
  });
})

module.exports = router;
