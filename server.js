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
  count:Number,
  log: []
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
  let dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  let user;
  try {
    user = await usersModel.findById(req.params._id);
  } catch (error) {
    res.send({Error:"Invalid user"});
    return
  }
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  if(!(date.match(dateRegex)) && date !==""){
    res.send({Error:"You entered unvalid date"})
    return;
  }
  if(date === ""){
    date = new Date();
  }
  else{
    date = new Date(date);
  }
  let exerciesArray=await exerciesModel.findOne({user:user});
  if(exerciesArray === null){
    console.log("Creating new Item in the exerciesModel");
    newExercies = await exerciesModel.create({
      user:user,
      count:1,
      log:[{
        description:description,
        duration:duration,
        date:date.toDateString()
      }]
    });
    console.log("Newly created Exercise")
    console.log(newExercies);
  }
  else{
    let log=exerciesArray.log;
    let count=exerciesArray.count;
    log.push({description:description,
              duration:duration,
              date:date.toDateString()
            });       
    exerciesArray.log = log;
    exerciesArray.count = count + 1;
    await exerciesArray.save();
    console.log("With old exercises");
    console.log(exerciesArray); 
  }
  res.send({
    user: user.username,
    description: description,
    duration: duration,
    date: date.toDateString()
  });
});

app.get('/api/users/:_id/logs',urlencodedParser,async function(req,res){
  let user = await usersModel.findById((req.params._id));
  if(user === null){
    res.send({Error:"There is no such user"});
    return
  }
  else{
    let exerciesArray=await exerciesModel.findOne({user:user});
    res.send(exerciesArray);
  } 
})

mongoose.connection.once('open',() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () => {
    console.log("Listening on port 3000");
  });
});