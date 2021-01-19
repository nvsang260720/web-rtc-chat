const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
const callVideo = document.getElementById('call-video')
// const selector 	= document.getElementById("fileSelector");


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io()


// Join chatroom
socket.emit('joinRoom', { username, room })


// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
});

// Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//receive photo
socket.on('receivePhoto', sendFile => {
    console.log(sendFile)
    addImage(sendFile)
});

// Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault()

    // Get message text
    var msg = e.target.elements.msg.value
    var selector = e.target.elements.imageSelector
    if (msg) {
        msg = msg.trim()
        // Emit message to server
        socket.emit('chatMessage', msg)
        // Clear input
        e.target.elements.msg.value = ''
        e.target.elements.msg.focus()
        // return true;
    }
    if (selector) {
        var reader = new FileReader()
        reader.onload = function(file) {
            socket.emit("sendPhoto", { base64: file.target.result })
        }
        reader.readAsDataURL(selector.files[0])
        e.target.elements.imageSelector.value = ''
    }
});
callVideo.addEventListener('click', e =>{
    socket.emit('callVideo', )
})
//------------------------------------------------------------------function----------------------------------------
//add image

function addImage(sendFile) {
    var url = sendFile.file.path
    var image = new Image(500, 500)
    image.src = url

    const div = document.createElement('div')
    div.classList.add('message')
    const p = document.createElement('p')
    p.classList.add('meta')
    if(sendFile.username == username){
        p.innerText = "me"
    }
    else{
        p.innerText = sendFile.username
    }
    p.innerHTML += `<span>${sendFile.time}</span>`
    div.appendChild(p)
    div.append(image)
    document.querySelector('.chat-messages').appendChild(div)
}

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    const p = document.createElement('p')
    p.classList.add('meta')
    if(message.username == username){
        p.innerText = "me"
    }
    else{
        p.innerText = message.username
    }
    p.innerHTML += `<span>${message.time}</span>`
    div.appendChild(p)
    const para = document.createElement('p')
    para.classList.add('text')
    para.innerText = message.text
    div.appendChild(para)
    document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = ''
    users.forEach(user => {
        const li = document.createElement('li')
        if(user.username == username){
            li.innerText = "me"
        }
        else{
            li.innerText = user.username
        }
        userList.appendChild(li)
    })
}
function randomString(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
 
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
 
    return text;
}