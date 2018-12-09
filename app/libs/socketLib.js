// modules dependencies.
const socketio = require('socket.io');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const tokenLib = require("./tokenLib.js");


let setServer = (server) => {

    let onlineUsers = []
    let io = socketio.listen(server);
    let myIo = io.of('/')

    myIo.on('connection', (socket) => {

        socket.emit("verifyUser", "");

        socket.on('set-user', (authToken) => {
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else {
                    console.log("user verified");
                    let currentUser = user.data;
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log(`${fullName} is online`);
                    // let userObj = { userId: currentUser.userId, fullName: fullName }
                    if (!onlineUsers.includes(currentUser.userId)) {
                        onlineUsers.push(currentUser.userId)
                        console.log(onlineUsers)
                        socket.room = 'meetPad'
                        socket.join(socket.room)
                        socket.to(socket.room).broadcast.emit('onlineUserList', onlineUsers);
                    }
                }
            })
        }) // end of listening set-user event


        socket.on('disconnect', () => {
            console.log("user is disconnected");
            console.log(socket.userId);
            var removeIndex = onlineUsers.indexOf(socket.userId);
            onlineUsers.splice(removeIndex, 1)
            console.log(onlineUsers)
            socket.to(socket.room).broadcast.emit('onlineUserList', onlineUsers);
            socket.leave(socket.room)
        }) // end socket on disconnect


        eventEmitter.on('notification', (data) => {
            console.log('emitting notification')
            for (let id of data.receiverId) {
                socket.emit(id, data);
            }
        })//end eventEmitter on alert

        eventEmitter.on('message', (data) => {
            socket.emit(message.receiverId, data)
        })

    });//end myTo

}//end setServer

// function to emit notification
let sendNotification = (notification) => {
    eventEmitter.emit('notification', notification)
}

// function to send message to another user
let sendMessage = (message) => {
    eventEmitter.email('message',message)
}

module.exports = {
    setServer: setServer,
    sendNotification: sendNotification,
    sendMessage: sendMessage
}
