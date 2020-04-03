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

function doctorFree(username) {
    Patient.find({ doctor: '', chat_id: { $ne: '' } }, {}, { limit: 1, sort: { created_at: 1 } }, (err, patients) => {
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

function enterPatient(patientId) {
    Doctor.findOne({ attending: '', chat_id: { $ne: '' } }, (err, doctor) => {
        if (err) return console.error(err);
        if (doctor) {
            const { username } = doctor;
            giveDoctorAPatient(username, patientId);
            givePatientADoctor(patientId, username);
        }
        else {
            /* no doctor found */
        }
    })
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
    io.to(id).emit('message', 'आपसे डॉक्टर ने बात रद्द करदी है');
    io.to(id).emit('inactivity');
    Patient.findByIdAndUpdate(id, { $set: { chat_id: '' } }, (err, res) => {
    });
};

online_user_count = 0;

io.on('connection', function (socket) {

    /* Manage the count of online users. */
    online_user_count = online_user_count + 1;
    io.emit('onlineUsers', online_user_count);

    const { type, patientId, username } = socket.handshake.query;
    console.log(type, socket.id, patientId, username, 'connected');

    if (type === 'doctor' && username) {

        Doctor.findOneAndUpdate({ username }, { $set: { chat_id: socket.id } }, (err, doctor) => {
            if (err || !doctor)
                return socket.disconnect();
            else {
                if (!doctor.attending)
                    doctorFree(username);
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
                                    doctorFree(username);
                                })
                        });
                    }, 2000);
                }
            }
        });
    }
    else if (type === 'patient' && patientId) {

        Patient.findByIdAndUpdate(patientId, { $set: { chat_id: socket.id } }, (err, patient) => {
            if (err || !patient)
                return socket.disconnect();
            else
                if (!patient.doctor)
                    enterPatient(patientId);
        });
    }
    else {
        socket.disconnect();
    }

    /* from patient to doctor */
    socket.on('sendChatsToDoctor', (data) => {
        getPatientsDoctor(patientId, (doctor_chat_id) => {
            socket.to(doctor_chat_id).emit('chatsFromUser', data);
        });
    });

    /* from doctor to patient */
    socket.on('disconnectUser', () => {
        getDoctorsPatient(username, patient_chat_id => {
            disconnectPatient(patient_chat_id);
        });

        socket.emit('userDisconnected');

        Doctor.findOneAndUpdate({ username }, { $set: { attending: '' } }, (err, doctor) => {
            if (err || !doctor) return console.error(err);
            setTimeout(() => {
                doctorFree(doctor.username);
            }, 1000);
        })

    });

    /* common */
    socket.on('message', message => {
        if (type === 'doctor') {
            getDoctorsPatient(username, (patient_chat_id) => {
                socket.to(patient_chat_id).emit('message', message);
            });
        }
        else {
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

        if (type === 'patient') {
            getPatientsDoctor(patientId, doctor_chat_id => {
                Doctor.findOneAndUpdate({ chat_id: doctor_chat_id, attending: patientId }, { $set: { attending: '' } }, (err, doctor) => {
                    if (err || !doctor) return console.error(err);
                    io.to(doctor_chat_id).emit('userDisconnected');
                    setTimeout(() => {
                        doctorFree(doctor.username);
                    }, 1000);
                })
            });

            disconnectPatient(patientId);
        }
        else if (type === 'doctor') {
            getDoctorsPatient(username, patient_chat_id => {
                disconnectPatient(patient_chat_id);
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