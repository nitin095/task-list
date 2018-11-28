'use strict'
// Dependencies
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const root = 'https://s3.amazonaws.com/mybucket';

// Schema Declaration
let userSchema = new Schema({
  userId: {
    type: String,
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  countryCode: {
    type: Number,
    required: true
  },
  mobileNumber: {
    type: Number,
    required: true
  },
  picture: {
    type: String,
    get: v => `${root}${v}`
  },
  friends: [],
  resetPasswordToken: {
    type: String,
    default: null,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
    select: false
  }

}, {
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'lastModified'
    }
  })
// end userSchema


mongoose.model('User', userSchema);