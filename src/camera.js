let Peer = require('simple-peer')
const socket = io()
const videoGrid = document.getElementById('video-grid')
let peers = {}
let localStream = null
let numberUserConnection = 0
let socketidUser = ''

var qs = require('qs');

const {idroomcall} = qs.parse(location.search, {
    ignoreQueryPrefix: true
});
console.log("id" +idroomcall)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
    getHours()
    localStream = stream;
    getStream(localStream, 1)

    socket.emit('join-room',idroomcall)
    socket.emit('NewUser', idroomcall)
    socket.on('getsocketid', (id) => {
        socketidUser = id
        peers[id] = new Peer({ initiator: true, trickle: false, stream: localStream})
        console.log("id peer ", peers[id]);
    })
    //
    socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
        addPeer(socket_id, false)

        socket.emit('initSend', socket_id)
    })
    
    socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true)
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
    })

    socket.on('numberUser', (number) => numberUserConnection = number)

    socket.on('turn off mic', id => {
        // const elementVideo = document.querySelector('#'+id+' .video')
        // elementVideo.muted = true;
    })
})
.catch(err => console.log(err))

function addPeer(socket_id, am_initiator){
    peers[socket_id] = new Peer({ initiator: am_initiator, trickle: false, stream: localStream})

    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
        })
    })

    peers[socket_id].on('stream', stream => {
        getStream(stream, socket_id)
        
    })

    peers[socket_id].on('connect', () => {
        document.getElementById('number-user').innerHTML = numberUserConnection

    })

    peers[socket_id].on('track', (track, stream) => {
        // if(track.length > 0 && stream != null){
            // track[0].enabled = !track[0].enabled
            console.log("cái lozz", track);
        // }
    })

    peers[socket_id].on('error', (err) => {
        console.log("",err);
    })
}

function getStream(stream, socket_id){
    const mdiv = document.createElement('div')
    const myVideo = document.createElement('video')
    // button in video
    const button1 = document.createElement('div')
    const button2 = document.createElement('div')
    button1.classList.add('button-video')
    button1.classList.add('button-pins')
    button1.setAttribute('id', 'button-pins'+socket_id)
    button2.classList.add('button-video')
    button2.classList.add('button-showlayout')
    button2.setAttribute('id', 'button-showlayout'+socket_id)
    // set event click
    button1.onclick = function() {myOnClickVideo(socket_id, "button1")}
    button2.onclick = function() {myOnClickVideo(socket_id, "button2")}
    //
    mdiv.setAttribute('id', socket_id)
    mdiv.classList.add('box')
    if(socket_id === 1) myVideo.muted = "muted"
    myVideo.classList.add('video')
    myVideo.srcObject = stream
    myVideo.onloadeddata = () => {
        myVideo.play()
    }
    
    mdiv.append(myVideo)
    mdiv.append(button1)
    mdiv.append(button2)
    videoGrid.append(mdiv)
    // myVideo.addEventListener('mouseover', mouseHoverVideo(socket_id))
    // myVideo.addEventListener('mouseout', mouseHoverOutVideo(socket_id))
    changeCss(numberUserConnection)

}

// change css
function changeCss(number){
    console.log(number);
    // const elementVideo = document.getElementsByTagName('video')
    // const css = document.getElementsByClassName('video')
    const classBox = document.getElementsByClassName('box')
    for (let index = 0; index < number; index++) {
        if(number >= 5) {
            classBox[index].style.flex = '1 0 31%'
        }
    }
}
function myOnClickVideo(id, type){
    alert(id +" "+ type);
}
function mouseHoverVideo(id){
    const button1 = document.getElementById('button-pins1')
    button1.style.height = '500px'
}
function mouseHoverOutVideo(id){
    alert(id );
}
function getHours(){
    const divTime = document.getElementById('time-now')
    const d = new Date()
    const h = d.getHours()
    const m = d.getMinutes()
    const time = h + ' : ' + m
    divTime.innerHTML  += time
    console.log(time)
}

window.onpenFramesChat = (id) => {
    alert(id)
    document.getElementById("frame-users-chat").style.width = "300px"
    document.getElementById('div-bottom').style.width = "78%"
    document.getElementById("container").style.marginRight = "300px"
    document.getElementById('menu-top-right').style.height = "0"
}
window.closeFrameUsersChat = () => {
    document.getElementById("frame-users-chat").style.width = "0"
    document.getElementById('div-bottom').style.width = "100%"
    document.getElementById("container").style.marginRight = "0"
    document.getElementById('menu-top-right').style.height = "48px"
}


// event mic video
const button_mic= document.getElementById('button-mic')
const button_call= document.getElementById('button-call')
const button_videocam= document.getElementById('button-videocam')

button_mic.addEventListener('click', onClickMic)
button_call.addEventListener('click', onClickCall)
button_videocam.addEventListener('click', onClickVideoCam)

function onClickMic(){
    const icon_mic = document.getElementById('icon-mic')
    turnOffMic()
    if(icon_mic.name === 'mic-outline'){
        icon_mic.name = 'mic-off-outline'
        button_mic.style.background = 'red'
        button_mic.style.color = 'white'
        button_mic.style.borderColor = 'white'
        
    }
    else {
        icon_mic.name = 'mic-outline'  
        button_mic.style.background = 'white'
        button_mic.style.color = 'black'
        button_mic.style.borderColor = 'darkgray'
    }
}
function onClickCall(){
    
}
function onClickVideoCam(){
    const icon_videocam = document.getElementById('icon-videocam')
    turnOffVideo()
    if(icon_videocam.name === 'videocam-outline'){
        icon_videocam.name = 'videocam-off-outline'
        button_videocam.style.background = 'red'
        button_videocam.style.color = 'white'
        button_videocam.style.borderColor = 'white'
    }
    else {
        icon_videocam.name = 'videocam-outline'  
        button_videocam.style.background = 'white'
        button_videocam.style.color = 'black'
        button_videocam.style.borderColor = 'darkgray'
    }
    
}

function turnOffMic(){
    
    const track = localStream.getAudioTracks()[0]
    track.enabled = !track.enabled;
    socket.emit('turn off mic', socketidUser)
}
function turnOffVideo(){
    
    const track = localStream.getVideoTracks()[0]
    track.enabled = !track.enabled;
}
// event mic video

const input_chat = document.getElementById('editTex-chat')
document.querySelectorAll(".tabEmotionPanel span").forEach(el=>{
    el.onclick = ()=>{
        let emoji = el.innerHTML.trim()
        let mess = input_chat.value
        input_chat.value = mess + emoji
        //editTex-chat get value ra rồi nối vào. oki :v
    }
})


