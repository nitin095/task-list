'use strict';

// dependencies
const nodemailer = require('nodemailer');

// defining transport object
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'meetpad.email@gmail.com',
        pass: 'meetpadpassword'
    }
});

let sendWelcomeMail = (userDetails) => {

    let mailOptions = {
        from: 'meetpad.email@gmail.com',
        to: userDetails.email,
        subject: `${userDetails.firstName}, welcome to your new Meet Pad Account`,
        html: `<div style="background:whitesmoke;margin:50px;padding:15px;text-align:center"><h1>Hi ${userDetails.firstName}</h1><p>Your account has been created.
        Please login to view your meetings.</p>
        <p><a href="http://ec2-13-233-119-109.ap-south-1.compute.amazonaws.com"><button style="background:none;padding:5px 10px">LOGIN</button></a></p>
        <p><h4>Here’s what we have on file for you:</h4>
        Name: ${userDetails.firstName} ${userDetails.lastName}<br>Email: ${userDetails.email}<br>Phone: +${userDetails.countryCode} ${userDetails.mobileNumber}</p>
        <p>Yours sincerely<br>Meet Pad</p>
        </div>`
    };

    // sending mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent to: %s', mailOptions.to);
    });

}// end sendWelcomeMail function

let sendNotification = (meetingDetails, email) => {

    let mailOptions = {
        from: 'meetpad.email@gmail.com',
        to: email,
        subject: `Notification: ${meetingDetails.title} @ ${meetingDetails.time.start}`,
        html: `<div style="border:2px solid lightgrey;padding:15px"><h2>${meetingDetails.title}</h2>
        <table>
        <tr><td style="color:grey">When</td><td>${meetingDetails.time.start}</td></tr>
        <tr><td style="color:grey">Where</td><td>${meetingDetails.location}</td></tr>
        <tr><td style="color:grey">Notes</td><td>${meetingDetails.notes}</td></tr>
        </table>
        <p><button style="background:lightgrey;padding:5px 10px;border:none;border-radius:3px"><a href="http://ec2-13-233-119-109.ap-south-1.compute.amazonaws.com">More details</a></button></p>
        <hr><h5>Sent by Meet Pad</h5>
        </div>`
    };

    // sending mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent to: %s', mailOptions.to);
    });

} // end sendNotification function

let sendNewMeetingMail = (meetingDetails, email) => {

    let mailOptions = {
        from: 'meetpad.email@gmail.com',
        to: email,
        subject: `New Meeting: ${meetingDetails.title} @ ${meetingDetails.time.start}`,
        html: `Hi! You have a invitation for a new meeting.<br>
        <div style="border:2px solid lightgrey;padding:15px"><h2>${meetingDetails.title}</h2>
        <table>
        <tr><td style="color:grey">When</td><td>${meetingDetails.time.start}</td></tr>
        <tr><td style="color:grey">Where</td><td>${meetingDetails.location}</td></tr>
        <tr><td style="color:grey">Notes</td><td>${meetingDetails.notes}</td></tr>
        </table>
        <p><button style="background:lightgrey;padding:5px 10px;border:none;border-radius:3px"><a href="http://ec2-13-233-119-109.ap-south-1.compute.amazonaws.com">More details</a></button></p>
        <hr><h5>Sent by Meet Pad</h5>
        </div>`
    };

    // sending mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent to: %s', mailOptions.to);
    });

}// end sendNewMeetingMail

let sendMeetingUpdateMail = (meetingDetails, email) => {

    let mailOptions = {
        from: 'meetpad.email@gmail.com',
        to: email,
        subject: `Meeting Updated: ${meetingDetails.title} @ ${meetingDetails.time.start}`,
        html: `Hi! This meeting has been updated by the cretor. Find updated details below.<br>
        <div style="border:2px solid lightgrey;padding:15px"><h2>${meetingDetails.title}</h2>
        <table>
        <tr><td style="color:grey">When</td><td>${meetingDetails.time.start}</td></tr>
        <tr><td style="color:grey">Where</td><td>${meetingDetails.location}</td></tr>
        <tr><td style="color:grey">Notes</td><td>${meetingDetails.notes}</td></tr>
        </table>
        <p><button style="background:lightgrey;padding:5px 10px;border:none;border-radius:3px"><a href="http://ec2-13-233-119-109.ap-south-1.compute.amazonaws.com">More details</a></button></p>
        <hr><h5>Sent by Meet Pad</h5>
        </div>`
    };

    // sending mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent to: %s', mailOptions.to);
    });

}// end sendNewMeetingMail


let sendMeetingCancelledMail = (meetingDetails, email) => {

    let mailOptions = {
        from: 'meetpad.email@gmail.com',
        to: email,
        subject: `Meeting Cancelled: ${meetingDetails.title} @ ${meetingDetails.time.start}`,
        html: `Hi! A meeting has been cancelled by admin. Find details below.<br>
        <div style="border:2px solid lightgrey;padding:15px"><h2>${meetingDetails.title}</h2>
        <table>
        <tr><td style="color:grey">When</td><td>${meetingDetails.time.start}</td></tr>
        <tr><td style="color:grey">Where</td><td>${meetingDetails.location}</td></tr>
        <tr><td style="color:grey">Notes</td><td>${meetingDetails.notes}</td></tr>
        </table>
        <p><button style="background:lightgrey;padding:5px 10px;border:none;border-radius:3px"><a href="http://ec2-13-233-119-109.ap-south-1.compute.amazonaws.com">More details</a></button></p>
        <hr><h5>Sent by Meet Pad</h5>
        </div>`
    };

    // sending mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent to: %s', mailOptions.to);
    });

}// end sendNewMeetingMail


let sendForgotPasswordEmail = (email, token, userType) => {

    let mailOptions = {
        from: 'meetpad.email@gmail.com',
        to: email,
        subject: `Reset your password`,
        html: ` <h3>Hi!</h3>
        <p>You requested for a password reset, kindly use this <a href="http://ec2-13-233-119-109.ap-south-1.compute.amazonaws.com?token=${token}?userType=${userType}">link</a> to reset your password</p>
        <p>This link is valid for 30 minutes.</p>
        <br>
        <p>Cheers!<br>Meet Pad</p>`
    };

    // sending mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent to: %s', mailOptions.to);
    });

}// end sendForgotPasswordEmail


module.exports = {
    sendWelcomeMail: sendWelcomeMail,
    sendNotification: sendNotification,
    sendNewMeetingMail: sendNewMeetingMail,
    sendMeetingUpdateMail: sendMeetingUpdateMail,
    sendMeetingCancelledMail: sendMeetingCancelledMail,
    sendForgotPasswordEmail: sendForgotPasswordEmail
}


