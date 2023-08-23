var express = require("express");
var cookieParser= require("cookie-parser");
var logger= require("morgan");
var rt = require("file-stream-rotator")
cors=require("cors")
const mongoose = require('mongoose');
let writer = rt.getStream({filename:"test.log", frequency:"daily", verbose: true});
//session,passport modules.
const session=require("express-session");
var passport= require("passport");
var localStrategy= require("passport-local").Strategy;
var atlasSession=require("connect-mongodb-session")(session);
const bcrypt = require('bcryptjs')
//const env=require('dotenv');
//env.config();
require ('custom-env').env(true)
var dbConnect = require("./dbConnect");
//


var app = express();

mongoose.connect(process.env.MONGOATLASURI).then((res)=>
{
console.log("atlas connected")
})

logger.token('type', 'Method :method URL :url  STATUS :status RST :response-time ms USER AGENT :user-agent' )  ;
const corsOptions = {
    //To allow requests from client
    origin:'*',
    credentials: true,
    exposedHeaders: ["set-cookie"],
  };
  
 
  
  app.use( cors(corsOptions));             
app.use(logger('type', { stream: writer }))
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
//

const sessionStore=new atlasSession(
    {
        uri:process.env.MONGOATLASURI,
        databaseName:process.env.MONGODB,
        collection:process.env.MONGOCOLLECTION

    }

    

)
app.use(
    session(
        {
            name: "SESS_NAME",
            secret:process.env.SECRET,
            resave:false,
            saveUninitialized:false,
            store:sessionStore,
            cookie: {
              
//secure:false,// process.env.NODE_ENV === "production",
                maxAge: 1000,
                httpOnly: false,
              },
        }
        
    )
)


//Set up passport

app.use(passport.initialize());
app.use(passport.session());


passport.use(
    'local', new localStrategy({
        usernameField:'username',
        passwordField:'userpassword',
        passReqToCallback:true
    },async(req,username,userpassword,done)=>{
        if(!username||!userpassword)
           return done(null,false,'message','All fields are required')
        
           var data= await dbConnect
        .from(process.env.SUPABASEUSERSTABLE)
        .select('*')
        .eq('username', username)
        //.eq('userpassword', userpassword)
        .then((d)=>{
          
            return d;
        })
        .catch((e)=>console.error(e));

        if(!data.data[0])
            return done(null, false, 'message','User does not exist.');

        const ismatch= await bcrypt.compare(userpassword,data.data[0].userpassword)
        if(!ismatch)
            return done(null,false,'message','wrong password');

        return done(null,data.data[0]);

         
    }
));

passport.serializeUser((user,done)=>{
    done(null,user.id)
    console.log("serialized user called");
})

passport.deserializeUser((id,done)=>{
    dbConnect.from(process.env.SUPABASEUSERSTABLE).select('*').eq('id',id)
    .then((d)=>{
        done(null,d.data[0])
    }).catch(e=>console.error(e))

    console.log("deserialized user called");
})


var isAuth=require('./utility/isauthenticated')

app.post('/register',async(req,res,next)=>{

    console.log(process.env.MONGODB)
    console.log(process.env.SUPABASEUSERSTABLE)

    const{username,userpassword}= req.body;
    console.log(req.body)

    const hashpwd= await bcrypt.hash(userpassword,12);
    dbConnect
.from(process.env.SUPABASEUSERSTABLE)
.insert({
    username:username,
    userpassword:hashpwd
  }).then(  ()=>{
    
    res.status(201)
    res.send("Registration successfull"

)}
)
  .catch(e=>res.send("failed registration")
  );
}
);


app.get('/loginerror',(req,res,next)=>{
    res.send('login error');
  })

  app.get('/',(req,res,next)=>{
    res.send("index")
  })

 

  app.get('/profile',isAuth,(req,res,send)=>{

    res.append('Content-Type', 'application/javascript; charset=UTF-8');
    res.json(req.user)

    
  })


  
app.post('/login',passport.authenticate(
    'local',{
        successRedirect:'/profile',
        failureRedirect:'/loginerror'
    }
),(req,res,next)=>{
    res.send("success")
});

module.exports=app;