import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

//load environment variables
dotenv.config();


//database connection
export const pool= mysql.createPool({
    connectionLimit: 10,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_password,
    ssl: {
        rejectUnauthorized: false
    }
}).promise()

//test if connection is successful
pool.getConnection()
.then( conn=>{
    console.log('database connected successfully');
    conn.release()
})
.catch( err=>{
    console.error('error connecting:', err);
})

export async function addClient(name, age, gender, contact) {
    try{
        const[existing_user]= await pool.query('SELECT * FROM clients WHERE contact=?', [contact]);
        if(existing_user.length )
    }

}