const Doctor = require('../models/doctor');

authenticate = async (req, res, next) => {
    if (req.session.username) {
        next();
    }
    else {
        const { username, password } = req.body;
        const doctor = await Doctor.findOne({ username, password });
        if (doctor) {
            req.session.username = username;
            next();
        }
        else
            res.json({});
    }
}

module.exports = authenticate