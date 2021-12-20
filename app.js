const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('./models/User')
const { json } = require('body-parser')
const passport = require('passport');
const session = require('express-session');




const app = express()
require('./config/passport')(passport);


app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );



const db = mongoose.connect("mongodb://localhost:27017/NodeAssessment")
.then(()=>console.log("MongoDB Connected...."))
.catch(err => console.log(err))

app.use(express.json())  
app.use(express.urlencoded({extended:false}))  //
app.set('view engine','ejs') // view engine ejs

let user = {
    id:"kdkdavnkjavnankvcknaan",
    email:"biswajit1@gmail.com",
    password:"fnqoevneonvoe"
}

const JWT_SECRET = 'some super secret...'


app.get('/',(req,res,next) => {
    //res.send('hello world')
    res.render('register')
})

app.post('/',(req,res,next)=>{   
    console.log(req.body)
    //res.send(req.body)
    const { fname,lname,dob,email,password } = req.body;
    User.findOne({email: email})
        .then(user => {
            if(user){
                // User exists
                //res.send('User already register')
                res.render('register',{
                    fname,
                    lname,
                    dob,
                    email,
                    password
                })
            }else{
                const newUser = new User({
                    fname,lname,dob,email,password 
                })
                newUser.save()
                res.send(`You are now registered Mr ${email}`)

            }
        })
        


})

// login

app.get('/login',(req,res,next) => {
    //res.send('hello world')
    res.render('login')
})

app.post('/login',(req,res,next)=>{   //when form is submitted
    console.log(req.body.password)
    User.findOne({email:req.body.email}).then(usr=>{
        console.log(usr.password)
        if(usr.password !== req.body.password){
            
            res.send('invalid credentials')
        }
        res.send(`Logged in ${usr.email}`)
    }).catch(res.send('invalid '))
        
    
})

// app.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//       successRedirect: '/login',
//       failureRedirect: '/login',
//       resave: false
//       //failureFlash: true
//     })(req, res, next);
//   });

//routes
app.get('/forgot-password',(req,res,next)=>{
    res.render('forgot-password');
})




app.post('/forgot-password',(req,res,next)=>{   //when form is submitted
    const {email} = req.body;
    console.log(req.body.email)
    if(!User.findOne({email:req.body.email})){
        console.log('user exists')
        res.send('user not registered')
         return;
    }
    User.findOne({email:req.body.email}).then(usr=>{
        console.log(usr)
        user.password = usr.password
        user.id = usr.id
        const secret = JWT_SECRET + usr.password  // current password
    const payload={
        email:usr.email,
        id:usr.id
    }
    const token = jwt.sign(payload,secret,{expiresIn:'15m'})
    const link = `http://localhost:3000/reset-password/${usr.id}/${token}`
    console.log(link)
    res.send('password reset link has been sent to your email...')

    })

   

})

app.get('/reset-password/:id/:token',(req,res,next)=>{
    const {id,token} = req.params;
    // res.send(req.params)
    console.log(res)
    console.log(req)

   
    const secret = JWT_SECRET + user.password
    try{
        const payload = jwt.verify(token,secret)
        res.render('reset-password',{email:user.email})
    }catch(error){
        console.log(error.message)
        res.send(error.message)
    }
})
app.post('/reset-password/:id/:token',(req,res,next)=>{
    const {id,token} = req.params;
    //res.send(user)
    const {password,password2} = req.body
    if(password !== password2) res.send('password dont match')

    if(id !== user.id){
        res.send('invalid id')
        return;

    }

    const secret = JWT_SECRET + user.password
    try{
        const payload = jwt.verify(token,secret)
        user.password = password

        let myquery = {id:id}
        let newvalues = {$set:{password:password}}
        User.updateOne(myquery, newvalues, function(err, res){
            console.log('done')
        })

         res.send(user)
        // console.log(user)
    }
    catch(error){
        console.log(error.message)
        res.send(error.message)
    }
})


app.listen(3000,()=>console.log('server on at 3000'))