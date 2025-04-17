import React from "react"
import AgoraRTM from "agora-rtm-sdk"
import { useLocation } from "react-router"
import { useNavigate } from "react-router"
let first = true
const StreamHandler = () => {
    // const [streamerList, setStreamerList] = React.useState(['Abhijeet', 'Aayush', 'Ankit', 'Aarav', 'Aarvi']);
    const [showStreamerNames, setShowStreamerNames] = React.useState(true);
    const [isStreamer, setIsStreamer] = React.useState(false);
    const toggleStreamerNames = () => {
        setShowStreamerNames(prev => !prev);
    };

    const setStreamer = (value) => {
        setIsStreamer(value);
    };

    const navigate = useNavigate();
    const { state } = useLocation();
    const { RoomId, isStreamerset } = state;
    let broadcasters = new Map(); // uid → metadata



    const servers = {
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun.l.google.com:5349",
                    "stun:stun1.l.google.com:3478",
                    "stun:stun1.l.google.com:5349",
                ]
            }
        ]
    }
    // console.log('Room ID');
    console.log(RoomId);
    let APP_ID = "e996accb35234d22bf92922376441efb"
    let token = null

    let uid = String(Math.floor(Math.random() * 100000))
    console.log('User ID');
    console.log(uid);
    let client
    let channel
    let connection
    // const memIds = new Set([2,3,4,5,6,7])
    // const members = new Map([])
    // let memberNumber = 1
    const audioVal = true
    //room id either generated or passed from the previous page
    let roomID = RoomId

    let localStream
    let localVideoStream
    let remoteStream = new Map([])
    let peerConnection = new Map([])
    let selectedStreamer = null
    let init = async () => {
        window.addEventListener('beforeunload', leaveChannel)
        // Create a client instance 
        client = await AgoraRTM.createInstance(APP_ID)

        await client.login({ uid, token })

        channel = client.createChannel(roomID)
        await channel.join()

        //listening for new member joining
        channel.on('MemberJoined', handleUserJoined)
        //listening for message from peer
        client.on('MessageFromPeer', handleMessageFromPeer)
        //listening for member leaving
        channel.on('MemberLeft', handleUserLeft)
        if(isStreamerset === true){
            startStreaming(client);
        }
    }

    let leaveChannel = async () => {
        await channel.leaveChannel()
        await client.logout()
        navigate('/');
    }

    let initialize = () => {
        if (first === true) {
            first = false
            init()
        }
    }

    initialize()

    let handleMessageFromPeer = async (message, MemberId) => {

        message = JSON.parse(message.text)
        console.log('Handling some message from user')
        if (message.type === "JOIN" && message.role === "broadcaster") {
            
            broadcasters.set(message.uid, message);
            // updateBroadcasterUI(); // function to show available broadcasters
        } else if (message.type === "LEAVE" && message.role === "broadcaster") {
            broadcasters.delete(message.uid);
        } else if (message.type === "JOIN_STREAM" && message.role === "receiver") {
            //
            if (message.selectedStreamer === uid) {
                // Handle the receiver joining a stream
                console.log('Receiver joined stream:', message.receiverUid);
                // You can create an offer or handle the stream here
                createOffer(message.receiverUid);
            }
        } else if (message.type === 'offer') {
            if (MemberId !== uid) {
                console.log("Offer received");
                // for(let i=2;i<=maxUsers;i++){
                //     if(memIds.has(i) === true){
                //         memberNumber = i;
                //         memIds.delete(i);//delete this user
                //         break;
                //     }
                // }
                // members.set(MemberId,memberNumber)
                createAnswer(MemberId, message.offer);
            }

        }

        else if (message.type === 'answer') {
            if (peerConnection.get(MemberId)) {
                addAnswer(message.answer, MemberId);
                console.log("Answer received");
            }
        }

        else if (message.type === 'candidate') {
            console.log("Candidate  received");
            if (peerConnection.get(MemberId)) {
                peerConnection.get(MemberId).addIceCandidate(message.candidate)
            }
        }
        else if (message.type === 'Leaving') {
            console.log("Leaving was called");
            // for(let i = 2;i<=maxUsers;i++){
            //     if(members.get(MemberId) === i){
            //         document.getElementById(`user-${i}`).style.display = 'none'
            //         memIds.add(i)//when user leaves add this as a potential user
            //         members.delete(MemberId)
            //     }
            // }
        }

    }

    let handleUserJoined = async (MemberId) => {
        // if(isStreamer){
        //     // members.set(MemberId,memberNumber)
        //     console.log('A new user joined this channel: ',MemberId)
        //     createOffer(MemberId);
        // }
        console.log('A new user joined this channel: ', MemberId)
    }

    let handleUserLeft = async (MemberId) => {
        // for(let i = 2;i<=maxUsers;i++){
        //     if(members.get(MemberId) === i){
        //         document.getElementById(`user-${i}`).style.display = 'none'
        //         memIds.add(i)//when user leaves add this as a potential user
        //         members.delete(MemberId)
        //     }
        // }
    }

    let createPeerConnectoion = async (MemberId) => {
        connection = new RTCPeerConnection(servers)
        // await setTimeout(async()=>{
        peerConnection.set(MemberId, connection)

        //handle the remote stream for receivers of stream(downstream)
        if (isStreamer === false) {
            let stream = new MediaStream()
            remoteStream.set(MemberId, stream)
            document.getElementById(`user-1`).srcObject = stream
            document.getElementById(`user-1`).style.display = 'block'
            // console.log('I am adding remote stream');

            connection.ontrack = (event) => {
                event.streams[0].getTracks().forEach(async track => {
                    await stream.addTrack(track)
                })
            }
        }

        //if a streamer then it will set the upstream
        if (isStreamer === true) {
            if (!localStream) {
                localVideoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioVal })
                document.getElementById('user-1').srcObject = localVideoStream
            }

            //Adds all the tracks to peerConnection
            localStream.getTracks().forEach(async track => {
                await connection.addTrack(track, localStream)
            })
            console.log("Tracks added to localstream");

        }
        // if(isStreamer === false){
        //here connection ontrack was present
        // }

        //send ice candidates
        connection.onicecandidate = async (event) => {
            if (event.candidate) {
                await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)
            }
        }
        // },500); 
    }

    let createOffer = async (MemberId) => {
        await createPeerConnectoion(MemberId);

        console.log('connection established successfully')

        let offer = await peerConnection.get(MemberId).createOffer()
        await peerConnection.get(MemberId).setLocalDescription(offer)
        console.log('Offer created')

        client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, MemberId)
        console.log('Offer sent')
    }


    let createAnswer = async (MemberId, offer) => {
        await createPeerConnectoion(MemberId)

        await peerConnection.get(MemberId).setRemoteDescription(offer)

        let answer = await peerConnection.get(MemberId).createAnswer()
        await peerConnection.get(MemberId).setLocalDescription(answer)

        client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId)
    }

    let addAnswer = async (answer, MemberId) => {
        if (!peerConnection.get(MemberId).currentRemoteDescription) {
            peerConnection.get(MemberId).setRemoteDescription(answer)
        }
    }
    // let videoON = true;

    let toggleCamera = async () => {
        //get the videotrack from stream
        let videoTrack = localStream.getTracks().find(track => track.kind === 'video')

        if (videoTrack.enabled) {
            videoTrack.enabled = false
            document.getElementById('user-1').srcObject = null
            document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80)'
        } else {
            videoTrack.enabled = true
            document.getElementById('user-1').srcObject = localVideoStream
            document.getElementById('camera-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
        }
    }

    let toggleMic = async () => {
        //get the audiotrack from stream
        let audioTrack = localStream.getTracks().find(track => track.kind === 'audio')

        if (audioTrack.enabled) {
            audioTrack.enabled = false
            document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80)'
        } else {
            audioTrack.enabled = true
            document.getElementById('mic-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
        }
    }

    let startStreaming = async () => {
        console.log('Starting streaming');
        setStreamer(true);
        localVideoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioVal })
        document.getElementById('user-1').srcObject = localVideoStream;
        // Send your role to others
        client.sendMessageToPeer({ text: JSON.stringify({ type: "JOIN", role: "broadcaster" }) ,uid});
    }

    let stopStreaming = async () => {
        setStreamer(false);
        localStream.getTracks().forEach(track => track.stop());
        document.getElementById('user-1').srcObject = null;
        // Send your role to others
        await client.sendMessageToPeer({ text: JSON.stringify({ type: "LEAVE",  role: "broadcaster" }) }, uid);
        // Close the peer connection and clear the map
        for (let [memberId, connection] of peerConnection.entries()) {
            connection.close();
            peerConnection.delete(memberId);
        }

    }

    const handleSelectBroadcaster = async (event) => {
        selectedStreamer = event.target.value;
        const receiverUid = uid;
        // currentTargetUid = selectedUid;
        await channel.sendMessage({ text: JSON.stringify({ type: "JOIN_STREAM", selectedStreamer, receiverUid, role: "receiver" }) });
    }

    if (isStreamer === true) {
        return (
            <>
                <div id="roomid"><h3>Room ID : {roomID}</h3></div>
                <div id="streamer">Streaming</div>
                <div id="controls">

                    <div class="control-container" id="camera-btn">
                        <img src={require('./icons/camera.png')} alt='camera button' onClick={toggleCamera} />
                    </div>

                    <div class="control-container" id="mic-btn">
                        <img src={require('./icons/mic.png')} alt='mic button' onClick={toggleMic} />
                    </div>

                    <a href="/videostreamingapp/">
                        <div class="control-container" id="leave-btn">
                            <img src={require('./icons/phone.png')} alt='phone button' onClick={leaveChannel} />
                        </div>
                    </a>
                    <button onClick={stopStreaming} style={{ marginTop: '10px' }}>
                        Stop Streaming
                    </button>
                    <button className="streamer-toggle-btn" onClick={toggleStreamerNames} style={{ marginTop: '10px' }}>
                        {showStreamerNames ? 'Hide Streamers' : 'Show Streamers'}
                    </button>
                    
                </div>


                {showStreamerNames && (
                    <div className="streamer-list">
                        <h3>Streamers</h3>

                        <select onChange={handleSelectBroadcaster}>
                            {Array.from(broadcasters.entries()).map(([uid, data]) => (
                                <option value={uid}>{data.streamTitle || uid}</option>
                            ))}
                        </select>

                    </div>
                )}


            </>
        )
    } else {
        return (
            <>
                <div id="roomid"><h3>Room ID : {roomID}</h3></div>

                <div id="receiver"> Live </div>
                <div id="controls">

                    <a href="/videostreamingapp/">
                        <div className="control-container" id="leave-btn">
                            <img src={require('./icons/phone.png')} alt='phone button' onClick={leaveChannel} />

                        </div>
                    </a>
                    <button onClick={startStreaming} style={{ marginTop: '10px' }}>
                        Start Streaming
                    </button>
                    <button className="streamer-toggle-btn" onClick={toggleStreamerNames} style={{ marginTop: '10px' }}>
                        {showStreamerNames ? 'Hide Streamers' : 'Show Streamers'}
                    </button>
                </div>
                {showStreamerNames && (
                    <div className="streamer-list">
                        <h3>Streamers</h3>

                        <select onChange={handleSelectBroadcaster}>
                            {Array.from(broadcasters.entries()).map(([uid, data]) => (
                                <option value={uid}>{data.streamTitle || uid}</option>
                            ))}
                        </select>

                    </div>
                )}
            </>
        )
    }
}

export default StreamHandler
