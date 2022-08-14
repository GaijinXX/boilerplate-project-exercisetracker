const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose");
require('dotenv').config()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect('mongodb+srv://gaijin:killer01@cluster0.kfo2p.mongodb.net/tracker?retryWrites=true&w=majority');

let ExerciseSchema = new mongoose.Schema({
  description: {required: true, type: String},
  duration: {required: true, type: Number},
  date: { type : Date, default: Date.now }
});

let UserSchema = new mongoose.Schema({
  username: {required: true, type: String},
  exercises: [ExerciseSchema]
});

const User = mongoose.model('User', UserSchema);
const Exercise = mongoose.model('Exercise', ExerciseSchema);

app.post('/api/users', (req, res) => {
  let user = new User({username: req.body.username});
  res.json({_id: user._id, username: user.username});
  user.save();
});

app.get('/api/users', (req, res) => {
  User.find({}, (err, docs) => {
    res.json(docs.map(el => ({ _id: el._id, username: el.username })));
  });
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  let descr = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date ? req.body.date : Date.now();
  let user = await User.findById(req.params._id);
  let exercise = await new Exercise({description: descr, duration: duration, date: date});
  user.exercises.push(exercise);
  console.log(user);
  user.save();
  res.json({ _id: user._id, username: user.username, description: exercise.description, duration: exercise.duration, date: exercise.date })
});

app.get('/api/users/:_id/logs', async (req, res) => {
  let user = await User.findById(req.params._id);
  console.log(await Exercise.find({}));
  //let from = new Date(el.date);
  let fort = 0;
  user.exercises = req.query.from ? user.exercises.filter(el => (new Date(el.date)).getTime() > (new Date(req.query.from)).getTime()) : user.exercises;
  user.exercises = req.query.from ? user.exercises.filter(el => (new Date(el.date)).getTime() < (new Date(req.query.to)).getTime()) : user.exercises;

  res.json({username: user.username, count: user.exercises.length, _id: user._id, log: user.exercises.slice(0, req.query.limit)});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})