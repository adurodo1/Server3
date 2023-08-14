const app = require("./app")

app.listen('3000',()=>{
    console.log(process.env.NODE_ENV);
    console.log(process.env.MONGODB)
})














