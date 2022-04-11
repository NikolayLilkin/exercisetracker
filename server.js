require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()
const app = express();
var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false })
mongoose.connect(process.env.DATABASE,{
  useUnifiedTopology: true,
  useNewUrlParser: true
});
var Users = new mongoose.Schema({user:String});
var usersModel = mongoose.model("Users", Users);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get('/hello', (req,res) => {
  res.json({message:"Hello my name is"});
})

app.post('/api/users',urlencodedParser,async function(req,res){
  let dbUser = await usersModel.findOne({user:req.body.username});
  if(dbUser === null){
    let newCreatedUser= await usersModel.create({
      user:req.body.username
    });
    console.log("Created new user " + req.body.username);
    res.json({user:req.body.username,_id:newCreatedUser._id});
  }
  else{
    res.json({user:dbUser.user,_id:dbUser._id});
  }
});

app.get('/api/users',async function (req, res){
  let users = await usersModel.find();
  res.send(users);
});

mongoose.connection.once('open',() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () => {
    console.log("Listening on port 3000");
  });
});