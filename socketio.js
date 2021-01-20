const io = require('socket.io')()
const botName = 'ChatCord Bot'
var fs = require("fs")
const { formatMessage, formatFile } = require('./utils/messages')
const { randomString, getBase64Image } = require('./utils/setFile')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

let peer = {}
    // Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        console.log(user.username + " Đã kết nối tới serve!")
            // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
    socket.on('callVideo', roomID => {
        console.log(roomID)
    })

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
            // console.log(file);

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // send photo
    socket.on("sendPhoto", baseImg => {
        const user = getCurrentUser(socket.id)
        var guess = baseImg.base64.match(/^data:image\/(png|jpeg);base64,/)[1]
        var ext = ""
        switch (guess) {
            case "png":
                ext = ".png"
                break
            case "jpeg":
                ext = ".jpg"
                break
            default:
                ext = ".bin"
                break

        }
        var savedFilename = "/uploads/" + randomString(10) + ext
        fs.writeFile(__dirname + '/public' + savedFilename, getBase64Image(baseImg.base64), 'base64', function(err) {
            if (err !== null) {
                console.log(err)
                console.log("not send photo")
            } else {
                io.to(user.room).emit("receivePhoto", formatFile(user.username, { path: savedFilename }))
                console.log("Send photo success!")
            }
        })
    })
    socket.on('NewUser', idroomcall => {
        peer[socket.id] = socket
        console.log("đã kết nối peer: " + socket.id)
        console.log("đã kết nối peer: " + idroomcall)
        socket.emit('getsocketid', socket.id)
        socket.broadcast.emit('initReceive', socket.id)
        io.emit('numberUser', Object.keys(peer).length)
    })
    socket.on('join-room', (roomID) => {
        socket.join(roomID)
        socket.to(roomID).emit('user-name', socket.id);
        Object.keys(io.sockets.adapter.rooms[roomID].sockets).forEach(element => {
            if (element != socket.id)
                socket.emit('user-name-for-me', element);
        });
    })

    socket.on('signal', data => {
        console.log('sending signal from ' + socket.id + ' to ' + data)
        if (!peer[data.socket_id]) return
        peer[data.socket_id].emit('signal', {
            socket_id: socket.id,
            signal: data.signal
        })
    })

    socket.on('initSend', init_socket_id => {
        console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
            // gửi socket.id cho các client khác
        peer[init_socket_id].emit('initSend', socket.id)
    })

    socket.on('disconnect', () => {
        console.log('đã ngắt kết nối peer');
        delete peer[socket.id]
    })

    socket.on('turn off mic', (id) => {
        console.log("asdklsaj " + id);
        socket.broadcast.emit('turn off mic', id)
    })


    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat`)
            )

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

module.exports = io