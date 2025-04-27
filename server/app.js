import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { pool } from "./db.js";

// Initialize MySQL session store
const MySQLStore = MySQLStoreFactory(session);

// Load env variables first
dotenv.config();

//create express app
const app = express();
app.set('trust proxy', 1); // Trust Render's proxy for HTTPS

//function to manipulate database
import { addClient, addMedic, addProgram, enrollClient } from "./db.js";

//deal with input validation
import { verifyPassword, isAuthenticated } from "./validators/verification.js";

//enables parse data from forms and json requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//register a view
app.set("view engine", "ejs");
app.set("views", "views");

// Serve static files from the 'public' directory
app.use(express.static("public"));

//api key middleware
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    console.log("API key validated successfully");
    next();
  } else {
    console.log("Invalid or missing API key:", apiKey);
    res.status(401).json({ success: false, message: "Invalid or missing API key" });
  }
};

//Session middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: new MySQLStore({}, pool),//use existing pool
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false, 
      maxAge: 1000 * 60 * 60 * 2, // 2 hours session duration
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'strict'
    },
  })
);

//routes
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/search-client", isAuthenticated, (req, res) => {
  res.render("search-client");
});

app.post("/search-client", isAuthenticated, async (req, res) => {
  const { clientContact } = req.body || {};

  if (!clientContact) {
    console.log("Missing clientContact:", req.body);
    return res.status(400).json({
      success: false,
      message: "Client contact is required",
    });
  }

  try {
    const [clients] = await pool.query(
      'SELECT id FROM clients WHERE contact = ?',
      [clientContact]
    );
    if (clients.length > 0) {
      console.log("Client found:", clients[0].id);
      return res.status(200).json({
        success: true,
        clientId: clients[0].id,
      });
    } else {
      console.log("No client found for contact:", clientContact);
      return res.status(404).json({
        success: false,
        message: "No such client found",
      });
    }
  } catch (error) {
    console.error("Error searching clients:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Client Profile Route
app.get("/client-profile/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch client details
    const [clients] = await pool.query(
      'SELECT id, name, age, gender, contact FROM clients WHERE id = ?',
      [id]
    );
    if (clients.length === 0) {
      console.log("Client not found for id:", id);
      return res.render("client-profile", { client: null, programs: [] });
    }

    // Fetch enrolled programs
    const [programs] = await pool.query(
      `SELECT p.name, e.enrollment_date
       FROM enrollment e
       JOIN programs p ON e.program_id = p.id
       WHERE e.client_id = ?`,
      [id]
    );

    console.log("Client profile:", { client: clients[0], programs });
    res.render("client-profile", {
      client: clients[0],
      programs,
    });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    res.status(500).render("client-profile", {
      client: null,
      programs: [],
      error: "Server error",
    });
  }
});

// Login form page
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", verifyPassword, (req, res) => {
  req.session.userId = req.body.username;
  req.session.save(err => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ success: false, message: 'Session error' });
    }
    res.json({ success: true, redirectUrl: "/search-client" });
  });
});


app.get("/create-program", isAuthenticated, (req, res) => {
  res.render("create-program");
});
app.post("/create-program", isAuthenticated, async (req, res) => {
  const { programName, treatment, followUps } = req.body;
  if (!programName) {
    return res.status(400).json({ success: false, message: "Program name is required" });
  }

  try {
    const result = await addProgram(programName, treatment, followUps);
    if (result && result.success) {
      console.log("Program created:", result.id);
      //remember to come here and review sth
      return res.status(201).json({success: true, message: "Program created successfully", id: result.id});
    } else {
      console.log('Duplicate program name:', programName);
      return res.status(400).json({success: false, message: "Program with this name already exists"});
    }
  } catch (error) {
    console.error("Error creating program:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/register-client", isAuthenticated, (req, res) => {
  res.render("register-client");
});
app.post("/register-client", isAuthenticated, async(req, res)=>{
  const { clientName, age, gender, contact } = req.body;

  if (!clientName || !age || !gender || !contact) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try{
    const result = await addClient(clientName, age, gender, contact);

    if(result && result.success){
      console.log('Client registered:', result.id);
      return res.status(201).json({ success: true, message: 'Client registered successfully'});
    } else{
      console.log('Duplicate client contact:', contact);
      return res.status(400).json({ success: false, message: 'Client with this contact already exists' });
    }
  } catch(error){
    console.error('Error registering client:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
})

app.get("/enroll-client", isAuthenticated, (req, res) => {
  res.render("enroll-client");
});

app.post("/enroll-client", isAuthenticated, async(req, res) => {
  const { clientContact, programName } = req.body;
  if (!clientContact || !programName) {
    return res.status(400).json({ success: false, message: 'Client contact and program name are required' });
  }

  try {
    const result = await enrollClient(clientContact, programName);
    if (result.success) {
        console.log('Client enrolled:', result.enrollment_id);
        return res.status(201).json({
            success: true,
            message: 'Client enrolled successfully',
            enrollment_id: result.enrollment_id
        });
    } else {
        console.log('Enrollment failed:', result.message);
        return res.status(400).json({
            success: false,
            message: result.message
        });
    }
} catch (error) {
    console.error('Error enrolling client:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
}
});

app.get('/programs', isAuthenticated, async (req, res) => {
  try {
      const [programs] = await pool.query('SELECT name FROM programs');
      res.json(programs);
  } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

// New API route with API key authentication
app.get("/api/client-profile/:id", verifyApiKey, async (req, res) => {
  const { id } = req.params;

  // Validate ID as a positive integer
  if (!/^\d+$/.test(id)) {
    console.log("Invalid client ID:", id);
    return res.status(400).json({
      success: false,
      message: "Invalid client ID",
    });
  }

  try {
    // Fetch client details
    const [clients] = await pool.query(
      'SELECT id, name, age, gender, contact FROM clients WHERE id = ?',
      [id]
    );
    if (clients.length === 0) {
      console.log("Client not found for id:", id);
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Fetch enrolled programs
    const [programs] = await pool.query(
      `SELECT p.name, e.enrollment_date
       FROM enrollment e
       JOIN programs p ON e.program_id = p.id
       WHERE e.client_id = ?`,
      [id]
    );

    console.log("Client profile fetched for API:", { client: clients[0], programs });
    return res.status(200).json({
      success: true,
      client: clients[0],
      programs,
    });
  } catch (error) {
    console.error("Error fetching client profile for API:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

//app listen
const port = process.env.PORT;
app.listen(port, () => console.log(`The app is listening on port ${port}`));
