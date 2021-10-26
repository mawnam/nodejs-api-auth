require('dotenv').config();
require('./config/database').connect();

const express = require('express');
const User = require('./model/user');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

app.use(express.json());


app.post('/register', async (req, res) => {
try{
    const { first_name, last_name, email, password } = req.body;
    
    //validate 
    if(!(first_name && last_name && email && password)){
       return res.status(400).send("All input is Required!!")
    }

    //check
    const oldUser = await User.findOne({ email });
    if(oldUser){

        return res.status(409).send("User already exist!")
    }

    encryptedPassword = await bcrypt.hash(password,10);
    
    //create user
    const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(),
        password:encryptedPassword
    })

    //create token
    const token =jwt.sign(

        {user_id:User._id, email },
        process.env.TOKEN_KEY,{
            expiresIn:"12h"
        }
    )
    //save token
    user.token = token;

    //return new user
    res.status(200).json(user);


} catch(err){
    console.log(err);
}


})

app.post("/login", async (req, res) => {

    try{

    const { email, password } = req.body;

    //validate user input
    if(!(email && password)){
        return res.status(400).send("All input is Required!!")
    }

    const user = await User.findOne({ email });

    if(user && (await bcrypt.compare(password, user.password))){

        //create token
        const token =jwt.sign(

            {user_id:User._id, email },
            process.env.TOKEN_KEY,{
                expiresIn:"12h"
            }
        )
        //save token
        user.token = token;

        //return new user
        res.status(200).json(user);

    }else{
        return res.status(400).send("wrong user or password");
    }


    } catch(err){
        console.log(err);
    }

    
})

app.post("/welcome", auth, (req, res) => {

    res.status(200).send("welcome ٩(◕‿◕｡)۶");

})

module.exports = app;