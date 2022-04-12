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
  let user = await usersModel.findById(req.params._id);
  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = req.body.date?new Date(req.body.date).toDateString() : new Date().toDateString();
  let exerciesArray=await exerciesModel.findOne({user:user});
  if(exerciesArray === null){
    console.log("Creating new Item in the exerciesModel");
    newExercies = await exerciesModel.create({
      user:user,
      count:1,
      log:[{
        description:description,
        duration:duration,
        date:date
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
              date:date
            });       
    exerciesArray.log = log;
    exerciesArray.count = count + 1;
    await exerciesArray.save();
    console.log("With old exercises");
    console.log(exerciesArray); 
  }
  res.send({
    _id:user._id,
    username:user.username,
    date: date,
    duration: duration,
    description: description
  });
});

app.get('/api/users/:_id/logs',urlencodedParser,async function(req,res){
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  let user = await usersModel.findById(req.params._id);
  let exerciesArray=await   exerciesModel.findOne({user:user});
  let log = exerciesArray.log;
  if (from){
    const fromDate = new Date(from)
    log = log.filter(exe => new Date(exe.date)>= fromDate)
  }
  if (to){
    const toDate = new Date(to)
    log = log.filter(exe => new Date(exe.date)<= toDate)
  }
  if(limit){
    log = log.slice(0,limit)
  }
  res.send({
        _id:user._id,
        username: user.username,
        count: exerciesArray.count,
        log: log
      });
  });

mongoose.connection.once('open',() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () => {
    console.log("Listening on port 3000");
  });
});