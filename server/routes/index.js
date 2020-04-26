const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images/');
	},
	filename: function (req, file, cb) {
		const name = file.originalname.split('.'),
			customFileName = crypto.randomBytes(18).toString('hex');
		const extension = name[name.length - 1];
		cb(null, customFileName + '.' + extension);
	}
});
const upload = multer({ storage });

const { answersToModel, getId } = require('../helper');
const { mail } = require('../helper/mail');
const authenticate = require('../helper/auth');

const { questions } = require('../data/questions');

const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const { Hits } = require('../models/miscellaneous');

const router = express.Router();

require('../helper/corona_data');

/* Common */
router.get('/cases', (req, res) => {
	fs.readFile(path.join(__dirname, '../data/cases.json'), 'utf8', (err, doc) => {
		if (err) return res.json({ err });
		res.json({
			...JSON.parse(doc)
		});
	});
});

router.get('/hits', (req, res) => {
	Hits.findOneAndUpdate({}, { $inc: { hits: 1 } }, (err, result) => {
		if (err) return res.json({});
		const { hits } = result;
		res.json({ hits });
	});
});

router.post('/image', upload.any(), (req, res) => {
	if (req.files.length) {
		const image = req.files[0];
		console.log(image);
		res.json({ image });
	} else {
		res.json({});
	}
});

/* Patient */
router.post('/assessment', (req, res) => {
	const { answers, latitude, longitude, chat } = req.body;
	const oldPatient = answers['24'] === '0' ? getId(answers['22'], answers['23']) : null;

	/* add emojis */

	if (oldPatient) {
		Patient.findById(oldPatient, (err, patient) => {
			if (err || !patient) {
				return res.json({
					incomingChats: [
						{
							statement: 'हम आपके पिछले रिकॉर्ड नहीं ढूंढ पा रहे हैं 🙁',
							type: 'incoming'
						}
					]
				});
			}
			const { _id, doctor, name, telephone } = patient;
			mail(
				doctor,
				'Your Patient is Online',
				`Your patient ${name.toUpperCase()}, ${telephone}, has paid a visit, and is waiting for you.`
			);
			res.json({
				connectToDoctor: true,
				patientId: _id,
				incomingChats: patient.chat,
				question: questions[questions.length - 1]
			});
		});
	} else {
		answersToModel(answers, (model) => {
			const { name, telephone, hospital } = model;

			Doctor.findOne({ hospital }, (err, doc) => {
				if (err || !doc)
					return res.json({
						incomingChats: [
							{
								statement: 'हम किसी भी डॉक्टर का पता नहीं लगा सके 🙁',
								type: 'incoming'
							}
						]
					});

				Patient.create(
					{
						_id: getId(name, telephone),
						...model,
						latitude,
						longitude,
						ip: req.headers['x-real-ip'] || req.ip,
						created_at: Date.now(),
						last_notified_at: Date.now() - 2000,
						chat_id: '',
						doctor: doc.username,
						last_messaged_at: Date.now(),
						chat: chat.slice(4)
					},
					(err, patient) => {
						if (err) {
							console.error(err);
							return res.json({
								incomingChats: [
									{
										statement: 'हम किसी भी डॉक्टर का पता नहीं लगा सके 🙁',
										type: 'incoming'
									}
								]
							});
						}

						const { _id } = patient;

						req.session.patientId = patient;

						mail(
							doc.username,
							'Your Patient is Online',
							`Your patient ${name.toUpperCase()}, ${telephone}, has paid a visit, and is waiting for you.`
						);

						res.json({
							question: questions[questions.length - 1],
							patientId: _id,
							connectToDoctor: true,
							incomingChats: [
								{
									statement: `अब आप ${doc.name} से बात करेंगे,`,
									type: 'incoming'
								}
							]
						});
					}
				);
			});
		});
	}
});

router.get('/questions', (req, res) => {
	/* doctor's availability status and welcome message */
	Doctor.find().distinct('hospital', (err, hospitals) => {
		if (err || !hospitals) return res.json({});

		res.json({
			questions: questions.map((question) => {
				if (question.id === 25) {
					return {
						...question,
						answers: hospitals.map((hospital, index) => {
							return {
								nextQuestion: hospital === 'AIIMS Jodhpur' ? 28 : 21,
								value: index,
								statement: hospital,
								dbValue: hospital
							};
						})
					};
				} else return question;
			}),
			incomingChats: [
				{
					statement:
						'अस्वीकरण: हम आपकी व्यक्तिगत जानकारी जैसे नाम, आयु, फोन नंबर पंजीकरण के प्रयोजनों के लिए एकत्र करते हैं। हम इस जानकारी को किसी अन्य तीसरे पक्ष के साथ साझा नहीं करते हैं और न ही हम इसका उपयोग व्यावसायिक उद्देश्यों में करते हैं। हम आपकी जानकारी का उपयोग हमारे शोध के उद्देश्य और नवीन और उन्नत सेवाओं को बनाने के लिए कर सकते हैं। हम गूगल एनालिटिक्स जैसी थर्ड पार्टी वेब विश्लेषणात्मक सेवाओं का भी उपयोग करते हैं जो इस वेबसाइट के आपके उपयोग से संबंधित जानकारी एकत्र कर सकती हैं।',
					type: 'incoming'
				},
				{
					statement: 'आपका स्वागत है 👩‍⚕️',
					type: 'incoming'
				}
			]
		});
	});
});

/* Doctor */
router.get('/patient-list', authenticate, (req, res) => {
	const { page } = req.query;
	const pageSize = 30;
	const { username: doctor } = req.user;
	Patient.find(
		{ doctor },
		{ chat: 0, last_notified_at: 0, __v: 0, chat_id: 0 },
		{
			limit: pageSize,
			skip: pageSize * Math.max(0, page - 1),
			sort: {
				last_messaged_at: -1
			}
		},
		(err, patients) => {
			if (err) return res.json({ error: true });
			res.json({
				patients: patients.map(({ _doc: patient }) => {
					const { created_at, last_messaged_at } = patient;
					delete patient['created_at'];
					delete patient['last_messaged_at'];
					patient['Last Visited'] = new Date(last_messaged_at).toLocaleString();
					patient['Registered'] = new Date(created_at).toLocaleString();
					return patient;
				})
			});
		}
	);
});

router.get('/doctor-list', authenticate, (req, res) => {
	const { hospital, username } = req.user;
	Doctor.find({ hospital, username: { $ne: username } }, (err, doctors) => {
		if (err) return res.json({ error: true });
		res.json({
			doctors
		});
	});
});

router.get('/logout', authenticate, (req, res) => {
	// req.session.destroy();
	req.session.username = null;
	res.json({ loggedOut: true });
});

router.post('/login', authenticate, (req, res) => {
	const { username, hospital } = req.user;
	res.json({ login: true, username, hospital });
});

module.exports = router;
