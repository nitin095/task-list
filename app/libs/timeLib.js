// dependencies
const moment = require('moment')
const momenttz = require('moment-timezone')
const timeZone = 'Asia/Calcutta'

let now = () => {
  return moment.utc().format()
}

let getLocalTime = () => {
  return moment().tz(timeZone).format()
}

let convertToLocalTime = (time) => {
  return momenttz.tz(time, timeZone).format('LLLL')
}

let getTimeAfter = (minutes) => {
  return moment().add(minutes, 'm').toDate();
}

let getTimeBefore = (date, minutes) => {
  return moment(date).subtract(minutes, 'm').toDate();
}

module.exports = {
  now: now,
  getLocalTime: getLocalTime,
  convertToLocalTime: convertToLocalTime,
  getTimeAfter: getTimeAfter,
  getTimeBefore: getTimeBefore
}