const nodemailer = require("nodemailer");
const Doctors = require('../models/doctor');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'telemedicine.iitj@gmail.com',
        pass: 'temp2020'
    }
});

module.exports.mail = (username, subject, text) => {

    Doctors.findOne({ username }, (err, doctor) => {
        if (err || !doctor) console.error(err);

        const { email, name } = doctor;
        const mailOptions = {
            from: 'telemedicine.iitj@gmail.com', // sender address
            to: email, // list of receivers
            cc: 'tawatia.1@iitj.ac.in',
            subject,
            text
        };

        // console.log(mailOptions);

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
        });
    });

}