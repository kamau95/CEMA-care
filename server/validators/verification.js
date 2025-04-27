import bcrypt from 'bcrypt';
import {pool} from '../db.js';

export const verifyPassword= async(req, res, next)=>{
    const{username, password}= req.body;
    console.log('Verifying login for:', { username });

    if(!username || !password){
        console.log('Missing credentials');
        return res.status(400).json({ success: false, message: 'Missing username or password' });
    }
    try{
        const[rows]= await pool.query('SELECT id, username, password FROM medics WHERE username=?', [username]);
        console.log('Database query result:', rows);

        if(rows.length === 0){
            console.log('No user found for username:', username);
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user= rows[0];
        //const match= await bcrypt.compare(password, user.password);
        const match = password === user.password;
        console.log('Password match:', match);

        if(!match){
            console.log('Invalid password for username:', username);
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        //credentials are now valid- let create a session
        req.session.userId= user.id;
        req.session.user= user.username;

        //call the next middleware
        next();
    }catch(error){
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//check if medic is authenticated
export const isAuthenticated= async(req, res, next)=>{
    if(req.session && req.session.userId){
        console.log('User is authenticated:', req.session.userId);
        return next()//continue to the next middleware
    }
    console.log('User not authenticated');
    return res.status(401).json({ success: false, message: 'Unauthorized, please log in' });
}