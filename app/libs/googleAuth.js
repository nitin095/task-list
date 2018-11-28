// modules dependencies.
const mongoose = require('mongoose');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const time = require('./../libs/timeLib');
const logger = require('./../libs/loggerLib');
const response = require('./../libs/responseLib');

// Models 
const UserModel = mongoose.model('User');
const AuthModel = mongoose.model('Auth');


const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '1064919328221-7ce00cmar1o5e0bcqccq9seeftl11bma.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);


// auth function
let auth = (req, res) => {

    const idToken = req.body.idToken
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userEmail = payload['email'];

        UserModel.findOne({ email: userEmail }, (err, userDetails) => {
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
            } else if (check.isEmpty(userDetails)) {
                signup(payload, (userDetails) => {
                    login(userDetails, (response) => {
                        res.send(response)
                    })
                    // mailer.sendWelcomeMail(newUserObj);
                });
            } else {
                login(userDetails, (response) => {
                    res.send(response)
                })
            }//end login
        });
    }
    verify().catch(console.error);

} // end auth function.


let signup = (userDetails, loginAfterSignup) => {

    let newUser = new UserModel({
        userId: userDetails.sub,
        firstName: userDetails.name.split(' ')[0],
        lastName: userDetails.name.split(' ')[1],
        email: userDetails.email,
        countryCode: userDetails.countryCode || 0,
        mobileNumber: userDetails.mobileNumber || 0,
        createdOn: time.now()
    })
    newUser.save((err, newUser) => {
        if (err) {
            logger.error(err.message, 'userController: createUser', 10)
        } else {
            let newUserObj = newUser.toObject();
            loginAfterSignup(newUserObj)
        }
    })

}//end signup


let login = (userDetails, res) => {

    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }// end generate token


    let saveToken = (tokenDetails) => {

        return new Promise((resolve, reject) => {

            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    logger.error(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }// end else
            })// end AuthModel

        })// end Promisw
    }// end save token

    // Promise call
    generateToken(userDetails)
        .then(saveToken)
        .then((result) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, result)
            res(apiResponse)
        })
        .catch((err) => {
            res(err)
        })

}// end login


module.exports = {
    auth: auth
}