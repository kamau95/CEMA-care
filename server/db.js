import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

//load environment variables
dotenv.config();


//database connection
export const pool= mysql.createPool({
    connectionLimit: 10,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

//test if connection is successful
pool.getConnection()
.then( conn=>{
    console.log('database connected successfully');
    conn.release()
})
.catch( err=>{
    console.error('error connecting:', err);
})

//function to add client in the db
export async function addClient(name, age, gender, contact) {
    try{
        const[existing]= await pool.query('SELECT * FROM clients WHERE contact=?', [contact]);
        if(existing.length > 0){
            return {success: false, message: 'client exists'}
        }
        // Insert new user into the database
        const[result]= await pool.query(
            'INSERT INTO clients(name, age, gender, contact) VALUES(?, ?, ?, ?)',
            [name, age, gender, contact]
        );
        return {success: true, id: result.insertId}
    }catch(error){
        console.error('Error adding user:', error);
        throw error;
    }
}

//function to add medics in the database
export async function addMedic(username, password){
    try{
        const[existing]= await pool.query('SELECT * FROM medics WHERE username=?', [username]);
        if(existing.length > 0){
            return {success: false, message: 'medic already exists'}
        }
        //hash the password
        const hashedPassword= await bcrypt.hash(password, 10);
        const[result]= await pool.query('INSERT INTO medics(username, password) VALUES(?, ?)',
            [username, hashedPassword]
        );
        console.log('medic added successfully')
        return {success: true, id: result.insertId};
    } catch(error){
        console.error('Error adding medic:', error);
        throw error;
    }
}

//func add programs in db
export async function addProgram(name, treatments = '', follow_up_notes = '') {
    try {
      // Check for an existing program with the same name
      const [existing] = await pool.query(
        'SELECT * FROM programs WHERE name = ?',
        [name]
      );
  
      if (existing.length > 0) {
        console.log('Program with this name exists');
        return null;
      }
  
      // Insert the new program
      const [result] = await pool.query(
        'INSERT INTO programs (name, treatments, follow_up_notes) VALUES (?, ?, ?)',
        [name, treatments, follow_up_notes]
      );
      console.log('program added successfully');
      return {
        success: true,
        id: result.insertId,
      };
    } catch (error) {
      console.error('Error adding program:', error);
      throw error;
    }
  }

//function to enroll client inside a program
/*export async function enrollClient(name, gender, age, contact, programName, treatments = '', follow_up_notes = '') {
    try {
      let client_id, program_id;
  
      // Check for existing client using unique contact
      const [clientRows] = await pool.query(
        'SELECT id FROM clients WHERE contact = ?',
        [contact]
      );
  
      if (clientRows.length > 0) {
        client_id = clientRows[0].id;
      } else {
        const newClient = await addClient(name, gender, age, contact);
        if (!newClient?.id) throw new Error('Failed to add client');
        client_id = newClient.id;
      }
  
      // Check for existing program using unique name
      const [programRows] = await pool.query(
        'SELECT id FROM programs WHERE name = ?',
        [programName]
      );
  
      if (programRows.length > 0) {
        program_id = programRows[0].id;
      } else {
        const newProgram = await addProgram(programName, treatments, follow_up_notes);
        if (!newProgram?.id) throw new Error('Failed to add client');
        program_id = newProgram.id;
      }
  
      // Enroll client into program
      const enrollment_date = new Date();
      const [enrollmentResult] = await pool.query(
        'INSERT INTO enrollment (client_id, program_id, enrollment_date) VALUES (?, ?, ?)',
        [client_id, program_id, enrollment_date]
      );
  
      console.log('Client enrolled successfully!');
      return {
        enrollment_id: enrollmentResult.insertId,
        client_id,
        program_id,
        enrollment_date
      };
  
    } catch (err) {
      console.error('Error enrolling client:', err);
      throw err;
    }
  }*/
export async function enrollClient(contact, programName, treatments = '', follow_up_notes= '') {
  try {
    let client_id, program_id;
  
    // Check for existing client using unique contact
    const [clientRows] = await pool.query(
      'SELECT id FROM clients WHERE contact = ?',
      [contact]
    );
    if (clientRows.length === 0) {
      console.log('Client not found:', contact);
      return { success: false, message: 'Client not found. Please add client before enrolling.' };
    }
    client_id = clientRows[0].id;
  
    // Check for existing program using unique name
    const [programRows] = await pool.query(
      'SELECT id FROM programs WHERE name = ?',
      [programName]
    );
    if (programRows.length > 0) {
    program_id = programRows[0].id;
    } else {
      const newProgram = await addProgram(programName, treatments, follow_up_notes);
      if (!newProgram?.id) throw new Error('Failed to add program');
        program_id = newProgram.id;
      }
  
      // Check for existing enrollment to prevent duplicates
      const [enrollmentRows] = await pool.query(
        'SELECT * FROM enrollment WHERE client_id = ? AND program_id = ?',
        [client_id, program_id]
      );
      if (enrollmentRows.length > 0) {
        console.log('Client already enrolled:', contact, programName);
        return { success: false, message: 'Client already enrolled in this program' };
      }
  
      // Enroll client into program
      const [enrollmentResult] = await pool.query(
        'INSERT INTO enrollment (client_id, program_id) VALUES (?, ?)',
        [client_id, program_id]
      );
  
      console.log('Client enrolled successfully!');
      return {
        success: true,
        enrollment_id: enrollmentResult.insertId,
        client_id,
        program_id,
      };
      } catch (err) {
        console.error('Error enrolling client:', err);
        throw err;
      }
}