import express from 'express';
import dotenv from 'dotenv'

// Load env variables first
dotenv.config();

//create express app
const app = express();

//enables parse data from forms and json requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//register a view
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static files from the 'public' directory
app.use(express.static('public'));


//routes
app.get('/', (req, res) => {
    res.render('login');
  });

app.get('/search-client', (req, res)=>{
  res.render('search-client');
});

app.get('/create-program', (req, res)=>{
  res.render('create-program');
});
//app listen
const port= process.env.PORT;
app.listen(port, ()=> console.log(`The app is listening on port ${port}`));