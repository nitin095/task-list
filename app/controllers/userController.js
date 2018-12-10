// modules dependencies.
const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const AuthModel = mongoose.model('Auth');
const mailer = require('../libs/mailer');
const socketLib = require('./../libs/socketLib');

// Models 
const UserModel = mongoose.model('User')


// Get multiple user Details 
let getUsers = (req, res) => {

    UserModel.find({ userId: req.params.users.split(',') })
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getUsers')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}// end get all users


// Get single user details 
let getSingleUser = (req, res) => {

    UserModel.findOne({ 'userId': req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller:getSingleUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}// end get single user


// Delete user
let deleteUser = (req, res) => {

    UserModel.findOneAndRemove({ 'userId': req.params.userId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: deleteUser', 10)
            let apiResponse = response.generate(true, 'Failed To delete user', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: deleteUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the user successfully', 200, result)
            res.send(apiResponse)
        }
    });

}// end delete user


// Edit user
let editUser = (req, res) => {

    let options = req.body;
    UserModel.update({ 'userId': req.params.userId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller:editUser', 10)
            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details edited', 200, result)
            res.send(apiResponse)
        }
    });

}// end edit user


// Password recovery function
let forgotPassword = (req, res) => {

    let randomToken = passwordLib.generatePasswordResetToken();

    UserModel.update({ 'email': req.body.email }, { 'resetPasswordToken': randomToken, 'resetPasswordExpires': time.getTimeAfter(30) }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'User Controller:forgotPassword', 10)
            let apiResponse = response.generate(true, 'Failed To find user email', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('Email not Found', 'User Controller: forgotPassword')
            let apiResponse = response.generate(true, 'No Email Found', 404, null)
            res.send(apiResponse)
        } else {
            mailer.sendForgotPasswordEmail(req.body.email, randomToken, 'user')
            let apiResponse = response.generate(false, 'Password change requested', 200, result)
            res.send(apiResponse)
        }
    })

}//end forgot password


// Reset password function
let resetPassword = (req, res) => {

    let newPassword = passwordLib.hashpassword(req.body.password)
    let now = Date.now()

    UserModel.update({
        'resetPasswordToken': req.body.token,
        'resetPasswordExpires': {
            $gt: now
        }
    }, {
            'password': newPassword,
            'resetPasswordToken': undefined,
            'resetPasswordExpires': undefined
        }).exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: resetPasssword', 10)
                let apiResponse = response.generate(true, 'Failed To reset password', 500, null)
                res.send(apiResponse)
            } else if (result.nModified == 0) {
                logger.info('Token is expired', 'User Controller: resetPasssword')
                let apiResponse = response.generate(true, 'Token is expired', 404, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate(false, 'User password changed', 200, result)
                res.send(apiResponse)
            }
        })

}// end reset password


// Signup function 
let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            countryCode: req.body.countryCode,
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        console.log(newUser)
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function

    // Promise call
    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password;
            let apiResponse = response.generate(false, 'User created', 200, resolve);
            res.send(apiResponse);
            mailer.sendWelcomeMail(resolve);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end signup function 


// Login function 
let loginFunction = (req, res) => {

    let findUser = () => {
        return new Promise((resolve, reject) => {

            if (req.body.email) {
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })// end Promise
    }// end find user

    let validatePassword = (retrievedUserDetails) => {
        console.log("validating Password");
        return new Promise((resolve, reject) => {

            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })//end PasswordLic comaprePassword

        })// end Promise
    }// end validate password

    let generateToken = (userDetails) => {
        console.log("generating token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
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
        console.log("saving token");
        return new Promise((resolve, reject) => {

            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
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
    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}// end login function


// Logout function
let logout = (req, res) => {

    AuthModel.findOneAndRemove({ authToken: req.body.authToken }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })

} // end logout function.


let addFriend = (req, res) => {

    let saveRequest = () => {
        return new Promise((resolve, reject) => {
            if (req.body.friendId) {
                UserModel.findOneAndUpdate({ userId: req.params.userId },
                    { $push: { 'friendRequestsSent': req.body.friendId } }, (err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'User Controller: addFriend', 10)
                            let apiResponse = response.generate(true, 'Failed To save friend request', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No User Found', 'User Controller: addFriend')
                            let apiResponse = response.generate(true, 'No User Found', 404, null)
                            reject(apiResponse)
                        } else {
                            logger.info('Friend request saved', 'userController: addFriend()', 10)
                            resolve()
                        }
                    })
            } else {
                let apiResponse = response.generate(true, '"friendId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })// end Promise
    }// end saveRequest

    let sendFriendRequest = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOneAndUpdate({ userId: req.body.friendId },
                { $push: { 'friendRequests': req.params.userId } }, (err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller: addFriend', 10)
                        let apiResponse = response.generate(true, 'Failed To send friend request', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: addFriend')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('Friend request sent', 'userController: addFriend()', 10)
                        resolve()
                    }
                })
        })// end Promise
    }// end sendFriendRequest

    let getUpdatedUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller: addFriend', 10)
                    let apiResponse = response.generate(true, 'Failed To get user details', 500, null)
                    reject(apiResponse)
                } else {
                    resolve(userDetails)
                }
            })
        })// end Promise
    }// end getUpdatedUserDetails

    saveRequest()
        .then(sendFriendRequest)
        .then(getUpdatedUserDetails)
        .then((userDetails) => {
            let apiResponse = response.generate(false, 'Friend request sent', 200, userDetails)
            res.status(200)
            res.send(apiResponse)

            //sending notification to friend request receiver
            let notification = {
                type: 'request',
                event: 'Friend request received',
                friendId: req.params.userId,
                receiverId: [req.body.friendId],
                friendName: `${userDetails.firstName} ${userDetails.lastName}`,
                time: Date.now()
            }
            socketLib.sendNotification(notification)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}// end addFriend


let acceptFriendRequest = (req, res) => {

    let updateFriendList = () => {
        return new Promise((resolve, reject) => {
            if (req.body.friendId) {
                UserModel.findOneAndUpdate({ userId: req.params.userId },
                    {
                        $push: { 'friends': req.body.friendId },
                        $pull: { 'friendRequests': req.body.friendId }
                    }, (err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'User Controller: acceptFriendRequest', 10)
                            let apiResponse = response.generate(true, 'Failed add to friend list', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No User Found', 'User Controller: acceptFriendRequest')
                            let apiResponse = response.generate(true, 'No User Found', 404, null)
                            reject(apiResponse)
                        } else {
                            logger.info('Friend request saved', 'userController: acceptFriendRequest()', 10)
                            resolve()
                        }
                    })
            } else {
                let apiResponse = response.generate(true, '"friendId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })// end Promise
    }// end updateFriendList

    let updateSenderFriendList = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOneAndUpdate({ userId: req.body.friendId },
                {
                    $push: { 'friends': req.params.userId },
                    $pull: { 'friendRequestsSent': req.params.userId }
                }, (err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller: acceptFriendRequest', 10)
                        let apiResponse = response.generate(true, 'Failed to update senders friends list', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: acceptFriendRequest')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('Sender friends list updated', 'userController: acceptFriendRequest()', 10)
                        resolve()
                    }
                })
        })// end Promise
    }// end updateSenderFriendList

    let getUpdatedUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller: addFriend', 10)
                    let apiResponse = response.generate(true, 'Failed To get user details', 500, null)
                    reject(apiResponse)
                } else {
                    resolve(userDetails)
                }
            })
        })// end Promise
    }// end getUpdatedUserDetails

    updateFriendList()
        .then(updateSenderFriendList)
        .then(getUpdatedUserDetails)
        .then((userDetails) => {
            let apiResponse = response.generate(false, 'Friend request accepted', 200, userDetails)
            res.status(200)
            res.send(apiResponse)

            //sending notification to friend request sender
            let notification = {
                type: 'request',
                event: 'Friend request accepted',
                receiverId: [req.body.friendId],
                friendId: req.params.userId,
                friendName: `${userDetails.firstName} ${userDetails.lastName}`,
                time: Date.now()
            }
            socketLib.sendNotification(notification)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}// end acceptFriendRequest


let cancelSentRequest = (req, res) => {

    let removeSentRequest = () => {
        return new Promise((resolve, reject) => {
            if (req.body.friendId) {
                UserModel.findOneAndUpdate({ userId: req.params.userId },
                    { $pull: { 'friendRequestsSent': req.body.friendId } }, (err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'User Controller: cancelSentRequest', 10)
                            let apiResponse = response.generate(true, 'Failed to cancel sent friend request', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No friend reqest Found', 'User Controller: cancelSentRequest')
                            let apiResponse = response.generate(true, 'No friend request Found', 404, null)
                            reject(apiResponse)
                        } else {
                            logger.info('Sent friend request removed', 'userController: cancelSentRequest()', 10)
                            resolve()
                        }
                    })
            } else {
                let apiResponse = response.generate(true, '"friendId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })// end Promise
    }// end removeSentRequest


    let removeReceivedRequest = () => {

        return new Promise((resolve, reject) => {
            UserModel.findOneAndUpdate({ userId: req.body.friendId },
                { $pull: { 'friendRequests': req.params.userId } }, (err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller: cancelSentRequest', 10)
                        let apiResponse = response.generate(true, 'Failed to remove request', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: cancelSentRequest')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('receiver received request removed', 'userController: cancelSentRequest()', 10)
                        resolve()
                    }
                })
        })// end Promise
    }// end removeReceivedRequest

    let getUpdatedUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller: addFriend', 10)
                    let apiResponse = response.generate(true, 'Failed To get user details', 500, null)
                    reject(apiResponse)
                } else {
                    resolve(userDetails)
                }
            })
        })// end Promise
    }// end getUpdatedUserDetails

    removeSentRequest()
        .then(removeReceivedRequest)
        .then(getUpdatedUserDetails)
        .then((userDetails) => {
            let apiResponse = response.generate(false, 'Friend request cancelled', 200, userDetails)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("error handler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}


let ignoreReceivedRequest = (req, res) => {

    let removeRequestFromReceiverSide = () => {
        return new Promise((resolve, reject) => {
            if (req.body.friendId) {
                UserModel.findOneAndUpdate({ userId: req.params.userId },
                    { $pull: { 'friendRequests': req.body.friendId } }, (err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'User Controller: ignoreReceivedRequest', 10)
                            let apiResponse = response.generate(true, 'Failed to remove received request', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No friend reqest Found', 'User Controller: ignoreReceivedRequest')
                            let apiResponse = response.generate(true, 'No friend request Found', 404, null)
                            reject(apiResponse)
                        } else {
                            logger.info('Received friend request removed', 'userController: ignoreReceivedRequest()', 10)
                            resolve()
                        }
                    })
            } else {
                let apiResponse = response.generate(true, '"friendId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })// end Promise
    }// end removeSentRequest


    let removeRequestFromSenderSide = () => {

        return new Promise((resolve, reject) => {
            UserModel.findOneAndUpdate({ userId: req.body.friendId },
                { $pull: { 'friendRequestsSent': req.params.userId } }, (err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller: ignoreReceivedRequest', 10)
                        let apiResponse = response.generate(true, 'Failed to remove request', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: ignoreReceivedRequest')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('sender sent request removed', 'userController: ignoreReceivedRequest()', 10)
                        resolve()
                    }
                })
        })// end Promise
    }// end removeReceivedRequest

    let getUpdatedUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller: addFriend', 10)
                    let apiResponse = response.generate(true, 'Failed To get user details', 500, null)
                    reject(apiResponse)
                } else {
                    resolve(userDetails)
                }
            })
        })// end Promise
    }// end getUpdatedUserDetails

    removeRequestFromReceiverSide()
        .then(removeRequestFromSenderSide)
        .then(getUpdatedUserDetails)
        .then((userDetails) => {
            let apiResponse = response.generate(false, 'Friend request ignored', 200, userDetails)
            res.status(200)
            res.send(apiResponse)

            //sending notification to friend request sender
            let notification = {
                type: 'request',
                event: 'Friend request declined',
                receiverId: [req.body.friendId],
                friendId: req.params.userId,
                friendName: `${userDetails.firstName} ${userDetails.lastName}`,
                time: Date.now()
            }
            socketLib.sendNotification(notification)
        })
        .catch((err) => {
            console.log("error handler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}


let removeFriend = (req, res) => {

    let removeFromUserSide = () => {
        return new Promise((resolve, reject) => {
            if (req.body.friendId) {
                UserModel.findOneAndUpdate({ userId: req.params.userId },
                    { $pull: { 'friends': req.body.friendId } }, (err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'User Controller: removeFriend', 10)
                            let apiResponse = response.generate(true, 'Faile to remove friend', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(result)) {
                            logger.info('No User Found', 'User Controller: removeFriend')
                            let apiResponse = response.generate(true, 'No User Found', 404, null)
                            reject(apiResponse)
                        } else {
                            logger.info('Friend removed', 'userController: removeFriend()', 10)
                            resolve()
                        }
                    })
            } else {
                let apiResponse = response.generate(true, '"friendId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })// end Promise
    }// end removeFromUserSide

    let removeFromFriendSide = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOneAndUpdate({ userId: req.body.friendId },
                { $pull: { 'friends': req.params.userId } }, (err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller: removeFriend', 10)
                        let apiResponse = response.generate(true, 'Failed to update senders friends list', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: removeFriend')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info("User removed from friend's list", 'userController: removeFriend()', 10)
                        resolve()
                    }
                })
        })// end Promise
    }// end removeFromFriendSide

    let getUpdatedUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller: addFriend', 10)
                    let apiResponse = response.generate(true, 'Failed To get user details', 500, null)
                    reject(apiResponse)
                } else {
                    resolve(userDetails)
                }
            })
        })// end Promise
    }// end getUpdatedUserDetails

    removeFromUserSide()
        .then(removeFromFriendSide)
        .then(getUpdatedUserDetails)
        .then((userDetails) => {
            let apiResponse = response.generate(false, 'Friend removed', 200, userDetails)
            res.status(200)
            res.send(apiResponse)
            //sending notification to removed friend
            let notification = {
                type: 'request',
                event: 'Friend removed',
                receiverId: [req.body.friendId],
                friendId: req.params.userId,
                friendName: `${userDetails.firstName} ${userDetails.lastName}`,
                time: Date.now()
            }
            socketLib.sendNotification(notification)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}// end removeFriend


let searchFriends = (req, res) => {
    let search = req.query.search;
    let keywords = search.split(" ");
    let strings = keywords.map(x => {
        if (!isNaN(x)) return ""
        else return new RegExp(x, 'i')
    })
    let numbers = keywords.map(x => {
        if (!isNaN(x)) return x
        else return null
    })
    console.log(keywords)

    UserModel.find({
        $or: [
            { firstName: { $in: strings } },
            { lastName: { $in: strings } },
            { email: { $in: strings } },
            { mobileNumber: { $in: numbers } }
        ]
    })
        .select(' -__v -_id -password -createdOn -lastModified')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: searchFriends', 10)
                let apiResponse = response.generate(true, 'Failed To search friends', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No user Found', 'User Controller: searchFriends')
                let apiResponse = response.generate(true, 'No results', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'users found', 200, result)
                res.send(apiResponse)
            }
        })
}// end searchFriends


// getAllAuths function
let getAllAuths = (req, res) => {

    AuthModel.find().exec((err, result) => {

        let apiResponse = response.generate(false, 'Auths found', 200, result)
        res.send(apiResponse)

    })

} // end getAllAuths function.

module.exports = {

    signUpFunction: signUpFunction,
    getUsers: getUsers,
    editUser: editUser,
    deleteUser: deleteUser,
    getSingleUser: getSingleUser,
    loginFunction: loginFunction,
    logout: logout,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    addFriend: addFriend,
    removeFriend: removeFriend,
    acceptFriendRequest: acceptFriendRequest,
    cancelSentRequest: cancelSentRequest,
    ignoreReceivedRequest: ignoreReceivedRequest,
    searchFriends: searchFriends,
    getAllAuths: getAllAuths

}// end exports