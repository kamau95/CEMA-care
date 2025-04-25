import bcrypt from 'bcrypt';
import {pool} from '../db.js';

export const verifyPassword= async(req, res, next)=>{
    const{username, password}= req.body;
    if(!username || !password){
        return res.render('login', {err: 'missing email or password', FormData: req.body})
    }
    try{
        const[rows]= await pool.query('SELECT id, username, password FROM medics WHERE username=?', [username]);
        if(rows.length === 0){
            res.render('login', {err: 'invalid username or password', FormData: req.body})

        }

        const user= rows[0];
        const match= await bcrypt.compare(password, user.password);

        if(!match){
            res.render('login', {err: 'invalid password', FormData: req.body});
        }

        //credentials are now valid- let create a session
        req.session.userId= user.id;
        req.session.user= user.username;

        //call the next middleware
        next();
    }catch(error){
        return res.render('login', {err: 'interal server error', FormData: req.body});
    }
};

//check if medic is authenticated
export const authenticated= async(req, res, next)=>{
    if(req.session && req.session.userId){
        next()//continue to the next middleware
    }
    res.redirect('/login');
}