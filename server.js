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
var Users = new mongoose.Schema({username:String});
var usersModel = mongoose.model("Users", Users);
var Exercises = new mongoose.Schema({
  user:Users,
  description: String,
  duration: Number,
  date: Date
});
var exerciesModel = mongoose.model("Exercises",Exercises);
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get('/hello', (req,res) => {
  res.json({message:"Hello my name is"});
})

app.post('/api/users',urlencodedParser,async function(req,res){
  let dbUser = await usersModel.findOne({username:req.body.username});
  if(dbUser === null){
    let newCreatedUser= await usersModel.create({
      username:req.body.username
    });
    console.log("Created new user " + req.body.username);
    res.send({username:req.body.username,_id:newCreatedUser._id});
  }
  else{
    res.send({username:dbUser.username,_id:dbUser._id});
  }
});

app.get('/api/users',async function (req, res){
  let users = await usersModel.find();
  res.send(users);
});

app.post('/api/users/:_id/exercises',urlencodedParser,async function (req,res){
  let regEx = /^\d{4}-\d{2}-\d{2}$/;
  let user = await usersModel.findById(req.params._id);
  console.log(user);
  if(user === null){
    res.send({Error:"No such id"});
  }
  else{
    console.log("The date is " + req.body.date);
    if(req.body.date === ""){
      let newExercise = await exerciesModel({
      user: user,
      description: req.body.description,
      duration: req.body.duration,
      date: new Date()
    });
    console.log(newExercise);
    res.send({username: newExercise.user.username,
             description: newExercise.description,
             duration: newExercise.duration,
             date: newExercise.date.toDateString() 
             });
    }
    else if(req.body.date.match(regEx)){
      let newExercise = await exerciesModel({
      user: user,
      description: req.body.description,
      duration: req.body.duration,
      date: new Date()
    });
    console.log(newExercise);
    res.send({username: newExercise.user.username,
             description: newExercise.description,
             duration: newExercise.duration,
             date: newExercise.date.toDateString() 
             });
    }
    else{
      res.send({Error:"Invalid Date"});
    }
    
  }
  
  //console.log(user.username);
  //res.send(user);
});


mongoose.connection.once('open',() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () => {
    console.log("Listening on port 3000");
  });
});