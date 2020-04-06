const Doctor = require('../models/doctor');

authenticate = async (req, res, next) => {
    if (req.session.username) {
        Doctor.findOne({ username: req.session.username }, (err, doctor) => {
            if (err) return res.json({});
            if (!doctor) {
                // req.session.destroy();
                req.session.username = null;
                res.json({});
            }
            else {
                req.user = doctor._doc;
                next();
            }
        })
    }
    else {
        const { username, password } = req.body;
        const doctor = await Doctor.findOne({ username, password });
        if (doctor) {
            req.session.username = username;
            req.user = doctor._doc;
            next();
        }
        else
            res.json({});
    }
}

module.exports = authenticate