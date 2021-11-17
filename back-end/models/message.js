const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
  uuid: { type:String, required: true},
  UserName: { type: String, required: true },
  message: { type: String, required: true },
  date: {type: Date, require: false, default: Date.now()},
  numero: {type: Number, required: false }, // numero du chat
});

module.exports = mongoose.model('message', MessageSchema);