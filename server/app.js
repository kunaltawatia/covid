var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/covid', {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true
});

mongoose.connection
    .once('open', () => console.log('Connected!'))
    .on('error', err => console.error(err));

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();

app.use(cors());
app.use(session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    name: 'sid',
    saveUninitialized: false,
    resave: false,
    secret: 'admin',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        sameSite: true,
        secure: false,
    }
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'data')));

app.use('/api', indexRouter);
app.use('/admin', adminRouter);

module.exports = app;
