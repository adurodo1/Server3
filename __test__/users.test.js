const request=require("supertest");
var db= require("../dbConnect")
var app= require("../app");
let session = null;



 

describe('Our server', function() {
    // Called once before any of the tests in this block begin.

     
    
    
    test('Testing Routes',()=>{
        request(app).get('/loginerror').expect(200).end(function(err, res) {
            if (err) throw err;
            
      });

      

    })
    
    
    test('Sign up user',async()=>{
       
       var result= await request.agent(app).post('/register')
        .send({
    
            "username":"ggggggggggggggggkk",
            "userpassword":"dfgdfgfdgfdgdf"
        }).expect(201);

        /*
        .end((err, res) => {  
            if (err) {
               done(err);
            }
            console.log(res.header['set-cookie']);
            session = res.header['set-cookie'];  
            done();  
        })
        */

        
        
    });
    
    test('login',async()=>{
       
         await request(app).post('/login')
        .send({
    
            "username":"dfgdfgfdg",
            "userpassword":"dfgdfgfdgfdgdf"
        }).expect(302)
        /*
        .end((err, res) => {  
            if (err) {
               done(err);
            }
            console.log(res.header['set-cookie']);
            session = res.header['set-cookie'];  
            done();  
        })
        */
    })
    
    
    
    test('profile',async()=>{
    
   
       
        await request(app).get('/profile')
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        
     
    
    
    })



})

