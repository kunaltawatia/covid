const redisAdapter = require('socket.io-redis');
const io = require('socket.io')({
	path: '/app_chat'
});

io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

const { mail, mailPatient } = require('../helper/mail');

Patient.updateMany({}, { $set: { chat_id: '' } }, (err, res) => {
	if (err) return console.error(err);
});

function giveDoctorAPatient(username, patientId) {
	Doctor.findOneAndUpdate({ username }, { $set: { attending: patientId } }, (err, doctor) => {
		if (err || !doctor) return console.error(err);
		const { chat_id } = doctor;
		if (chat_id) {
			Patient.findById(patientId, (err, patient) => {
				if (err || !patient || !patient.chat) return console.error(err);
				const { chat } = patient;
				io.to(chat_id).emit('userAlloted', { patientId, chat });
			});
		}
	});
}

function doctorFree(username, hospital) {
	Patient.find(
		{ doctor: username, hospital, chat_id: { $ne: '' } },
		{},
		{ limit: 1, sort: { created_at: 1 } },
		(err, patients) => {
			if (err || !patients) return console.error(err);
			if (patients[0]) {
				const { _id } = patients[0];
				giveDoctorAPatient(username, _id);
			}
		}
	);
}

function enterPatient(patientId, hospital, username) {
	Doctor.findOne(
		{
			username,
			attending: '',
			hospital,
			chat_id: { $ne: '' }
		},
		(err, doctor) => {
			if (err || !doctor) return console.error(err);
			giveDoctorAPatient(username, patientId);
		}
	);
}

function getPatientSocketById(patientId, callback) {
	Patient.findById(patientId, (err, patient) => {
		if (err || !patient) callback(null);
		else callback(patient.chat_id);
	});
}

function getDoctorSocketById(username, callback) {
	Doctor.findOne({ username }, (err, doctor) => {
		if (err || !doctor) callback(null);
		else callback(doctor.chat_id);
	});
}

function disconnectPatient(id) {
	Patient.findByIdAndUpdate(id, { $set: { chat_id: '' } }, (err, res) => {});
}

online_user_count = 0;

io.on('connection', function (socket) {
	/* Manage the count of online users. */
	online_user_count = online_user_count + 1;
	io.emit('onlineUsers', online_user_count);

	const { type, patientId, username } = socket.handshake.query;
	console.log(type, type === 'patient' ? patientId : username, 'connected');

	if (type === 'doctor' && username) {
		Doctor.findOneAndUpdate({ username }, { $set: { chat_id: socket.id } }, (err, doctor) => {
			if (err || !doctor) return socket.disconnect();
			else {
				if (!doctor.attending) doctorFree(username, doctor.hospital);
				else {
					giveDoctorAPatient(username, doctor.attending);
				}
			}
		});
	} else if (type === 'patient' && patientId) {
		Patient.findByIdAndUpdate(patientId, { $set: { chat_id: socket.id } }, (err, patient) => {
			if (err || !patient) return socket.disconnect();
			else {
				const { doctor, hospital } = patient;
				if (doctor) {
					socket.emit('doctorAlloted', doctor);
					enterPatient(patientId, hospital, doctor);
				} else {
					socket.disconnect();
				}
			}
		});
	} else {
		socket.disconnect();
	}

	/* from doctor to patient */
	socket.on('disconnectUser', () => {
		socket.emit('userDisconnected');

		Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doctor) => {
			if (err || !doctor) return console.error(err);
		});
	});

	socket.on('changePatient', (patient) => {
		giveDoctorAPatient(username, patient);
	});

	socket.on('referUser', ({ doctorSelected, patientId }) => {
		Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doctor) => {
			if (err || !doctor) return console.error(err);
			socket.emit('userDisconnected');
			const { name: doctorsname } = doctor;
			Patient.findByIdAndUpdate(patientId, { $set: { doctor: doctorSelected } }, (err, patient) => {
				if (err || !patient) return console.error(err);
				const { name: patientsname, telephone, chat_id } = patient;
				mail(
					doctorSelected,
					'New Patient',
					`Patient ${patientsname}, ${telephone}, was reffered to you by ${doctorsname}.`
				);
				if (chat_id) {
					socket.to(chat_id).emit('message', 'आपके परामर्श को किसी अन्य चिकित्सक को भेजा जाता है');
					socket.to(chat_id).emit('referUser', doctorSelected);
					enterPatient(patient._id, patient.hospital, doctorSelected);
				}
			});
		});
	});

	/* common */
	socket.on('message', ({ message, to }) => {
		if (type === 'doctor') {
			Patient.findById(to, (err, patient) => {
				if (err || !patient) return console.error(err);

				const { chat_id, _id } = patient;
				if (!chat_id) {
					const { last_messaged_at = Date.now() + 2000, last_notified_at = Date.now() } = patient;
					if (last_messaged_at > last_notified_at) {
						mailPatient(
							_id,
							'डॉक्टर से संदेश!',
							'डॉक्टर ने हाल ही में आपको संदेश भेजे हैं, कृपया http://covid.iitj.ac.in पर अपना परामर्श जारी रखें'
						);
					}
				} else {
					socket.to(chat_id).emit('message', { message, from: username });
					patient.last_notified_at = Date.now();
				}
				patient.chat.push({
					statement: message,
					type: 'incoming'
				});
				patient.save((err) => {
					if (err) console.error(err);
				});
			});
		} else {
			Patient.findById(patientId, (err, patient) => {
				if (err || !patient) return console.error(err);
				getDoctorSocketById(patient.doctor, (doctor_chat_id) => {
					if (doctor_chat_id) {
						socket.to(doctor_chat_id).emit('message', { message, from: patientId });
					}
				});
				patient.chat.push({
					statement: message,
					type: 'outgoing'
				});
				patient.last_messaged_at = Date.now();
				patient.save((err) => {
					if (err) console.error(err);
				});
			});
		}
	});

	socket.on('typingChange', ({ state, to }) => {
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id)
					socket.to(patient_chat_id).emit('typingChange', { state, from: username });
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id)
					socket.to(doctor_chat_id).emit('typingChange', { state, from: patientId });
			});
		}
	});

	socket.on('request', (to) => {
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id) socket.to(patient_chat_id).emit('request', username);
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id) socket.to(doctor_chat_id).emit('request', patientId);
			});
		}
	});

	socket.on('call', ({ data, to }) => {
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id) socket.to(patient_chat_id).emit('call', { data, from: username });
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id) socket.to(doctor_chat_id).emit('call', { data, from: patientId });
			});
		}
	});

	socket.on('end', (to) => {
		if (type === 'doctor') {
			getPatientSocketById(to, (patient_chat_id) => {
				if (patient_chat_id) socket.to(patient_chat_id).emit('end', username);
			});
		} else {
			getDoctorSocketById(to, (doctor_chat_id) => {
				if (doctor_chat_id) socket.to(doctor_chat_id).emit('end', patientId);
			});
		}
	});

	socket.on('disconnect', () => {
		console.log(type, type === 'patient' ? patientId : username, 'disconnected');

		if (type === 'patient' && patientId) {
			disconnectPatient(patientId);
			Doctor.find({ attending: patientId }, (err, doctor) => {
				if (err || !doctor) return;
				getDoctorSocketById(doctor.username, (doctor_chat_id) => {
					io.to(doctor_chat_id).emit('end', patientId);
				});
			});
		} else if (type === 'doctor' && username) {
			Doctor.findOneAndUpdate(
				{ username },
				{ $set: { attending: '', chat_id: '' } },
				(err, doctor) => {
					if (err || !doctor) return console.error(err);
					const { attending: prevAttending } = doctor;
					getPatientSocketById(prevAttending, (patient_chat_id) => {
						io.to(patient_chat_id).emit('end', doctor.username);
					});
				}
			);
		}

		online_user_count = online_user_count - 1;
		io.emit('onlineUsers', online_user_count);
	});
});

module.exports.io = io;
