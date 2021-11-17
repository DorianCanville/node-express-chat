const mongoose = require('mongoose');

const userShema = mongoose.Schema({
  uuid: { type:String, required:true},
  login: { type: String, required: true },
  mdp: { type: String, required: true }
});

module.exports = mongoose.model('user', userShema);