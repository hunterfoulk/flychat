import React, { useEffect, useState, createRef, useContext, useRef } from 'react'
import "./room.scss"
import { useLocation, useRouteMatch } from "react-router-dom";
import YouTube from 'react-youtube';
import { UserContext } from "../contexts/userContext"
import { VideoContext } from '../contexts/videoContext';
import { createConnection, bindSocketEvents } from '../utils/socket';
import Swal from 'sweetalert2'
import Chat from "./chat"
import Members from "./members"
import Peer from "simple-peer";
import styled from "styled-components";
import io from 'socket.io-client';


const StyledVideo = styled.video`
    height: 30%;
    width: 30%;
    margin:0px;
    background-color:green;
`;


const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        console.log("video fired")
        props.peer.on("stream", stream => {
            console.log("STREAMMM", stream)
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <>
            <div className="video-container">
                <video className="styled-video" ref={ref} autoPlay muted />
            </div>
            {/* <StyledVideo muted playsInline autoPlay ref={ref} /> */}
        </>
    );
}



export default function Room() {
    const location = useLocation();
    const match = useRouteMatch();
    const player = createRef()
    const [isHost, setIsHost] = useState(true)
    const [displayUserPrompt, setDisplayUserPrompt] = useState(false)
    const { dispatch: userDispatch, userData } = useContext(UserContext);
    const { dispatch: videoDispatch } = useContext(UserContext);
    const [camSocket, setCamSocket] = useState(null)
    const [peers, setPeers] = useState([]);
    const userVideo = useRef()
    const socketRef = useRef();
    const peersRef = useRef([]);


    const videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
    };


    const options = {
        width: '880px',
        height: '500px',
    };


    useEffect(() => {
        const roomID = match.params.roomID;
        const videoId = location.state && location.state.videoId
        let username = location.state && location.state.hostName
        userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: videoId });

        socketRef.current = io("http://localhost:8000", { path: '/socket' });
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", { roomID, username, videoId });
            socketRef.current.on("all users", users => {
                console.log("USERS", users)
                const peers = [];
                users.forEach(userID => {
                    console.log("USER ID", userID)
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                console.log("user joined fired")
                console.log("PAYLAOD FOR JOIN", payload)
                const peer = addPeer(payload.signal, payload.callerID, stream, payload.username);
                peersRef.current.push({
                    peerID: payload.callerID,
                    username: payload.callerUsername,
                    peer,
                })
                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                console.log("front-end recieving", payload.id)
                const item = peersRef.current.find(p => p.peerID.userId === payload.id);
                console.log("peer current", peersRef.current)
                console.log("item", item)
                item.peer.signal(payload.signal);
            });
        })

        socketRef.current.on('newMessage', (data) => {

            console.log("FIRED", data)

            switch (data.type) {
                case 'userJoin':
                    console.log(data.payload.username)
                    break;

                case 'changeVideo':
                    console.log("FIRED")
                    userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: data.payload.videoId });
                    break;

                case 'userMessage':
                    console.log("FIREDDDDD")

                    userDispatch({ type: 'UPDATE_MESSAGES', data });
                    break;

                default:
                    break;
            }
        });


    }, []);


    console.log("peers ref current", peersRef.current)
    console.log("THIS IS THE PEERS", peers)
    const createPeer = (userToSignal, callerID, stream) => {
        console.log("CREATE FIRED")
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            console.log("sending signal")
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    const addPeer = (incomingSignal, callerID, stream) => {
        console.log("ADD PEER FIRED")
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    console.log("PEERS", peers)


    return (
        <div className="room-main">
            <div className="room-left">
                <YouTube
                    videoId={userData.videoId}
                    opts={options}
                    ref={player}
                />

                <Chat socket={socketRef.current} />
            </div>
            <div className="room-right">

                {userData.username}
                {/* <StyledVideo muted ref={userVideo} autoPlay playsInline /> */}
                <div className="video-container">
                    <video className="styled-video" ref={userVideo} autoPlay muted />
                </div>

                {peers.map((peer, index) => {
                    return (
                        <>
                            <Video key={index} peer={peer} />
                        </>
                    );
                })}
            </div>
        </div>
    )
}
