var express = require('express');
var fs = require('fs');
var path = require('path');

var { answersToModel } = require('../helper');
var authenticate = require('../helper/auth');

var { questions } = require('../data/questions.json');

var Patient = require('../models/patient');
var { Hits } = require('../models/miscellaneous');

var router = express.Router();

require('../helper/corona_data');

router.get('/cases', (req, res) => {
  fs.readFile(path.join(__dirname, '../data/cases.json'), 'utf8', (err, doc) => {
    if (err) return res.json({ err });
    res.json({
      ...JSON.parse(doc)
    })
  });
})


router.post('/assessment', (req, res) => {

  const { answers, latitude, longitude } = req.body;

  answersToModel(answers, (model) => {
    Patient.create({
      ...model,
      latitude,
      longitude,
      ip: req.headers['x-real-ip'] || req.ip,
      created_at: Date.now(),
      chat_id: '',
      doctor: ''
    }, (err, doc) => {

      if (err) return res.json({ error: true });

      const { suspect, _id } = doc;

      res.json({
        questionIndex: 17,
        patientId: _id,
        suspect: true,
        incomingChats: suspect ?
          [
            {
              statement: 'हमें संदेह है कि आप नए कोरोना वायरस से संक्रमित होंगे',
              type: 'incoming'
            }
          ]
          :
          [
            {
              statement: 'आपको कोरोना वायरस से संक्रमित होने का तत्काल खतरा नहीं है :)',
              type: 'incoming'
            },
            {
              statement: 'कृपया स्वास्थ्य मंत्रालय द्वारा जारी इस वेबसाइट में नीचे दिए गए पोस्टर को देखें, और स्वच्छता का अच्छे से ध्यान रखें',
              type: 'incoming'
            },
            {
              statement: 'धन्यवाद',
              type: 'incoming'
            }
          ]
      });
    })
  });
})

router.get('/questions', (req, res) => {
  /* doctor's availability status and welcome message */
  res.json({
    questions,
    incomingChats: [
      {
        statement: 'अस्वीकरण: हम आपकी व्यक्तिगत जानकारी जैसे नाम, आयु, फोन नंबर पंजीकरण के प्रयोजनों के लिए एकत्र करते हैं। हम इस जानकारी को किसी अन्य तीसरे पक्ष के साथ साझा नहीं करते हैं और न ही हम इसका उपयोग व्यावसायिक उद्देश्यों में करते हैं। हम आपकी जानकारी का उपयोग हमारे शोध के उद्देश्य और नवीन और उन्नत सेवाओं को बनाने के लिए कर सकते हैं। हम गूगल एनालिटिक्स जैसी थर्ड पार्टी वेब विश्लेषणात्मक सेवाओं का भी उपयोग करते हैं जो इस वेबसाइट के आपके उपयोग से संबंधित जानकारी एकत्र कर सकती हैं।',
        type: 'incoming'
      },
      {
        statement: 'आपका स्वागत है',
        type: 'incoming'
      }
    ]
  })
})

router.get('/patient-list', authenticate, (req, res) => {
  const { page } = req.query, pageSize = 30;
  Patient.find({}, {}, {
    limit: pageSize,
    skip: pageSize * Math.max(0, page - 1),
    sort: {
      created_at: -1
    }
  }, (err, patients) => {
    if (err) return res.json({ error: true });
    res.json({
      patients
    })
  })
});

router.get('/hits', (req, res) => {
  Hits.findOneAndUpdate({}, { $inc: { hits: 1 } }, (err, result) => {
    if (err) return res.json({});
    const { hits } = result;
    res.json({ hits });
  });
});

router.post('/login', authenticate, (req, res) => {
  res.json({ login: true, username: req.session.username });
});

module.exports = router;
