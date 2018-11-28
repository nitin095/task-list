// dependencies.
const bcrypt = require('bcrypt')
const cryptoRandomString = require('crypto-random-string');
// custom libraries 
let logger = require('../libs/loggerLib')

const saltRounds = 10

let hashpassword = (myPlaintextPassword) => {
  let salt = bcrypt.genSaltSync(saltRounds)
  let hash = bcrypt.hashSync(myPlaintextPassword, salt)
  return hash
}


let comparePassword = (oldPassword, hashpassword, cb) => {
  bcrypt.compare(oldPassword, hashpassword, (err, res) => {
    if (err) {
      logger.error(err.message, 'Comparison Error', 5)
      cb(err, null)
    } else {
      cb(null, res)
    }
  })
}


let comparePasswordSync = (myPlaintextPassword, hash) => {
  return bcrypt.compareSync(myPlaintextPassword, hash)
}


let generatePasswordResetToken = () => {
  return cryptoRandomString(50);
}


module.exports = {
  hashpassword: hashpassword,
  comparePassword: comparePassword,
  comparePasswordSync: comparePasswordSync,
  generatePasswordResetToken: generatePasswordResetToken
}
