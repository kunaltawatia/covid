var express = require('express');

var Doctor = require('../models/doctor');
var Admin = require('../models/admin');
var Patient = require('../models/patient');

var router = express.Router();

router.use((req, res, next) => {
    if (req.session.admin_username) {
        Admin.findOne({ username: req.session.admin_username }, (err, admin) => {
            if (err)
                return res.json({});
            else if (!admin) {
                // req.session.destroy();
                req.session.admin_username = null;
                return res.json({ error: 'EXPIRED' });
            }
            else {
                req.user = admin._doc;
                next();
            }
        })
    }
    else {
        const { username, password } = req.body;
        Admin.findOne({ username, password }, (err, admin) => {
            if (err || !admin)
                return res.json({ error: 'INVALID CREDENTIALS' });
            req.session.admin_username = username;
            req.user = admin._doc;
            next();
        });
    }
});

router.post('/doctor/:id', (req, res) => {
    const { username, password, hospital, telephone, email, name, post, department } = req.body;
    const { id } = req.params;
    Doctor.findByIdAndUpdate(id, {
        $set: {
            username,
            password,
            hospital,
            telephone,
            email,
            name,
            post,
            department
        }
    }, (err, doctor) => {
        if (err) console.error(err);
        res.json({});
    })
})

router.delete('/doctor/:id', (req, res) => {
    const { id } = req.params;
    Doctor.findByIdAndDelete(id, (err) => {
        if (err) console.error(err);
        res.json({});
    })
})

router.put('/doctor', (req, res) => {
    const { username, password, hospital, telephone, email, name, post, department } = req.body;
    Doctor.create({
        username,
        password,
        hospital,
        telephone,
        email,
        name,
        post,
        department,
        created_at: Date.now()
    }, (err, doctor) => {
        if (err) console.error(err);
        res.json({});
    })
});

router.get('/doctor-list', (req, res) => {
    const { page } = req.query, pageSize = 30;
    Doctor.find({}, {}, {
        limit: pageSize,
        skip: pageSize * Math.max(0, page - 1),
        sort: {
            created_at: -1
        }
    }, (err, doctors) => {
        if (err) return res.json({ error: true });
        res.json({
            doctors
        })
    })
});

router.get('/chats', (req, res) => {
    Patient.find({}, { chat: 1 }, (err, chats) => {
        if (err || !chats) return res.json({ error: true });
        res.json({ chats });
    })
});

router.get('/logout', (req, res) => {
    // req.session.destroy();
    req.session.admin_username = null;
    res.json({ loggedOut: true });
});

router.post('/login', (req, res) => {
    const { username } = req.user;
    res.json({ login: true, username });
});

module.exports = router;
