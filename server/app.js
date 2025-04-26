import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';

// Load env variables first
dotenv.config();

//create express app
const app = express();

//function to manipulate database
import { addClient, addMedic, addProgram, enrollClient} from './db.js';

//deal with input validation
import {verifyPassword, isAuthenticated} from './validators/verification.js';

//enables parse data from forms and json requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//register a view
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static files from the 'public' directory
app.use(express.static('public'));

//Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET, // ⚡ keep this secret safe
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: { 
      secure: false, // Set true if you're using HTTPS
      maxAge: 1000 * 60 * 60 * 2 // 2 hours session duration
  }
}));


//routes
app.get('/', (req, res) => {
    res.render('login');
  });

// Login form page
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', verifyPassword, (req, res)=>{
  //reaching here user is verified
  res.json({ success: true, redirectUrl: '/search-client' });
})

app.get('/search-client', isAuthenticated, (req, res)=>{
  res.render('search-client');
});

app.get('/create-program', isAuthenticated, (req, res)=>{
  res.render('create-program');
});


app.get('/register-client', isAuthenticated, (req, res)=>{
  res.render('register-client');
});

app.get('/enroll-client', isAuthenticated, (req, res)=>{
  res.render('enroll-client');
});

//app listen
const port= process.env.PORT;
app.listen(port, ()=> console.log(`The app is listening on port ${port}`));