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


mongoose.connection.once('open',() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () => {
    console.log("Listening on port 3000");
  });
});