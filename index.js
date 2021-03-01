const createError = require('http-errors');
const passport=require('passport');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const cookieSession=require('cookie-session');
const hbs = require('express-handlebars');

require('dotenv').config();
require('./config/passport');

const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  maxAge:24 * 60 * 60 * 1000,
  keys:['clave']
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);

app.get('/',(req,res)=>{
    res.render('home',{template:req.user?'logout':'login'})
});

app.get('/profile',(req,res)=>{
    console.log(req.user);
  const profile = req.user;
  const imagen = profile.imagen;
  const name = profile.fullname;
  const email = profile.email;
  //console.log("profairu",profile);
  res.render('profile',{name:name,imagen:imagen,email:email});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('The route was not found 404, index');
  next();
});

// // error handler
app.use(function(err, req, res, next) {
  req.logout();
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3001, () => {
    console.log('escuchando en el puerto 3001');
})