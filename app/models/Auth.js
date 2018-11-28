// dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Auth = new Schema({
  userId: {
    type: String,
    required: true
  },
  authToken: {
    type: String,
    required: true
  },
  tokenSecret: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'tokenGenerationTime'
  }
})

module.exports = mongoose.model('Auth', Auth)
