var io = require('socket.io')({
    path: '/app_chat'
});

var Patient = require('../models/patient');
var Doctor = require('../models/doctor');

Patient.updateMany({}, { $set: { chat_id: '' } }, (err, res) => {
    if (err) return console.error(err);
});

function giveDoctorAPatient(username, patientId) {
    Doctor.findOneAndUpdate({ username }, { $set: { attending: patientId } }, (err, doctor) => {
        if (err || !doctor) return console.error(err);
        const { chat_id } = doctor;
        io.to(chat_id).emit('userAlloted', patientId);
        Patient.findById(patientId, (err, patient) => {
            if (err || !patient) return console.error(err);
            const { chat } = patient;
            io.to(chat_id).emit('chatsFromUser', JSON.stringify({ chat }));
        })
    });
};

function givePatientADoctor(patientId, username) {
    Patient.findByIdAndUpdate(patientId, { $set: { doctor: username } }, (err, patient) => {
        if (err || !patient) return console.error(err);
        const { chat_id } = patient;
        io.to(chat_id).emit('doctorAlloted', username);
        io.to(chat_id).emit('message', 'आप अब डॉक्टर से बात कर रहे है, अपनी बात कहिये');
    });
};

function doctorFree(username, hospital) {
    Patient.find({ doctor: { $in: ['', username] }, hospital, chat_id: { $ne: '' } }, {}, { limit: 1, sort: { created_at: 1 } }, (err, patients) => {
        if (err || !patients) return console.error(err);
        if (patients[0]) {
            const { _id } = patients[0];
            giveDoctorAPatient(username, _id);
            givePatientADoctor(_id, username);
        }
        else {
            /* no patient found */
        }
    })
}

function enterPatient(patientId, hospital, username = null) {
    Doctor.findOne({ ...(username ? { username } : {}), attending: '', hospital, chat_id: { $ne: '' } }, (err, doctor) => {
        if (err) return console.error(err);
        if (doctor) {
            const { username } = doctor;
            giveDoctorAPatient(username, patientId);
            givePatientADoctor(patientId, username);
        }
        else {
            /* no doctor found */
        }
    });
}

function getPatientSocketById(patientId, callback) {
    Patient.findById(patientId, (err, patient) => {
        if (err || !patient) callback(null);
        else callback(patient.chat_id);
    })
}

function getDoctorSocketById(username, callback) {
    Doctor.findOne({ username }, (err, doctor) => {
        if (err || !doctor) callback(null);
        else callback(doctor.chat_id);
    });
}

function getDoctorsPatient(username, callback) {
    Doctor.findOne({ username }, (err, doctor) => {
        if (err || !doctor)
            callback(null);
        else {
            getPatientSocketById(doctor.attending, (chat_id) => {
                callback(chat_id);
            })
        }
    });
}

function getPatientsDoctor(patientId, callback) {
    Patient.findById(patientId, (err, patient) => {
        if (err || !patient)
            callback(null);
        else {
            getDoctorSocketById(patient.doctor, (chat_id) => {
                callback(chat_id);
            });
        }
    });
}

function disconnectPatient(id) {
    Patient.findByIdAndUpdate(id, { $set: { chat_id: '' } }, (err, res) => {
    });
};

online_user_count = 0;

io.on('connection', function (socket) {

    /* Manage the count of online users. */
    online_user_count = online_user_count + 1;
    io.emit('onlineUsers', online_user_count);

    const { type, patientId, username, hospital } = socket.handshake.query;
    console.log(type, socket.id, patientId, username, hospital, 'connected');

    if (type === 'doctor' && username && hospital) {

        Doctor.findOneAndUpdate({ username }, { $set: { chat_id: socket.id } }, (err, doctor) => {
            if (err || !doctor)
                return socket.disconnect();
            else {
                if (!doctor.attending)
                    doctorFree(username, hospital);
                else {
                    setTimeout(() => {
                        getPatientSocketById(doctor.attending, (patient_chat_id) => {
                            if (patient_chat_id) {
                                giveDoctorAPatient(username, doctor.attending);
                                givePatientADoctor(doctor.attending, username);
                            }
                            else
                                Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doc) => {
                                    if (err) return console.error(err);
                                    doctorFree(username, hospital);
                                })
                        });
                    }, 2000);
                }
            }
        });
    }
    else if (type === 'patient' && patientId && hospital) {
        socket.emit('message', 'हम आपके परामर्श के लिए डॉक्टरों की खोज कर रहे हैं')
        Patient.findByIdAndUpdate(patientId, { $set: { chat_id: socket.id } }, (err, patient) => {
            if (err || !patient)
                return socket.disconnect();
            else {
                const { doctor } = patient;
                if (doctor)
                    enterPatient(patientId, hospital);
                else {
                    enterPatient(patientId, hospital, doctor);
                }
            }
        });
    }
    else {
        socket.disconnect();
    }

    /* from doctor to patient */
    socket.on('disconnectUser', () => {
        getDoctorsPatient(username, patient_chat_id => {
            disconnectPatient(patient_chat_id);
            socket.to(patient_chat_id).emit('message', 'आपसे डॉक्टर ने बात रद्द करदी है');
            socket.to(patient_chat_id).emit('inactivity');
        });

        // socket.emit('userDisconnected');

        // Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doctor) => {
        //     if (err || !doctor) return console.error(err);
        //     doctorFree(doctor.username, hospital);
        // });

    });

    /* common */
    socket.on('message', message => {
        if (type === 'doctor') {
            getDoctorsPatient(username, (patient_chat_id) => {
                socket.to(patient_chat_id).emit('message', message);
                Patient.findOne({ chat_id: patient_chat_id }, (err, patient) => {
                    if (err || !patient) return console.error(err);
                    patient.chat.push({
                        statement: message,
                        type: 'incoming'
                    });
                    patient.save(err => { if (err) console.error(err) });
                });
            });
        }
        else {
            Patient.findById(patientId, (err, patient) => {
                if (err || !patient) return console.error(err);
                patient.chat.push({
                    statement: message,
                    type: 'outgoing'
                });
                patient.save(err => { if (err) console.error(err) });
            });
            getPatientsDoctor(patientId, (doctor_chat_id) => {
                socket.to(doctor_chat_id).emit('message', message);
            });
        }
    });

    socket.on('typingChange', state => {
        if (type === 'doctor') {
            getDoctorsPatient(username, (patient_chat_id) => {
                socket.to(patient_chat_id).emit('typingChange', state);
            });
        }
        else {
            getPatientsDoctor(patientId, (doctor_chat_id) => {
                socket.to(doctor_chat_id).emit('typingChange', state);
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(type, socket.id, patientId, username, 'disconnected');

        if (type === 'patient' && hospital && patientId) {
            getPatientsDoctor(patientId, doctor_chat_id => {

                io.to(doctor_chat_id).emit('userDisconnected');

                setTimeout(() => {
                    Doctor.findOneAndUpdate({ chat_id: doctor_chat_id, attending: patientId }, { $set: { attending: '' } }, (err, doctor) => {
                        if (err || !doctor) return console.error(err);
                        doctorFree(doctor.username, hospital);
                    });
                }, 2000);
            });

            disconnectPatient(patientId);
        }
        else if (type === 'doctor' && hospital && username) {
            getDoctorsPatient(username, patient_chat_id => {
                disconnectPatient(patient_chat_id);
                socket.to(patient_chat_id).emit('message', 'आपसे डॉक्टर ने बात रद्द करदी है');
                socket.to(patient_chat_id).emit('inactivity');
            });
            Doctor.findOneAndUpdate({ username }, { $set: { attending: '', chat_id: '' } }, (err, doctor) => {
                if (err || !doctor) return console.error(err);
            });
        }

        online_user_count = online_user_count - 1;
        io.emit('onlineUsers', online_user_count);
    });

});

module.exports.io = io;