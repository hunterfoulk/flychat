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




const Video = (props) => {
    const ref = useRef();
    console.log("PROPS PEER FOR VIEEO", props.peer)
    useEffect(() => {
        console.log("video fired")
        console.log("props.peer", props.peer)
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
        init(roomID, videoId, username)

        return () => {
            socketRef.current.disconnect()
        }
    }, []);


    const init = async (roomID, videoId, username) => {


        socketRef.current = io("http://localhost:8000", { path: '/socket' });

        if (!videoId) {

            if (!username) {

                const usernamePrompt = await Swal.fire({
                    title: 'Enter your display name',
                    input: 'text',
                    allowOutsideClick: false,
                });
                username = usernamePrompt.value;


                navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                    userVideo.current.srcObject = stream;
                    console.log("THIS IS THE STREAM", stream)
                    socketRef.current.emit("join room", { roomID, username, videoId, stream });
                    socketRef.current.on("all users", users => {
                        console.log("USERS", users)
                        const peers = [];
                        users.forEach(user => {
                            console.log("USER ID", user)
                            const peer = createPeer(user, socketRef.current.id, stream, username);
                            peersRef.current.push({
                                peerID: user.userId,
                                peer,
                            })
                            peers.push(peer);
                        })
                        setPeers(peers);
                    })

                    socketRef.current.on("user joined", payload => {
                        console.log("user joined fired")
                        console.log("PAYLAOD FOR JOIN", payload)
                        const peer = addPeer(payload.signal, payload.callerID, stream);
                        peersRef.current.push({
                            peerID: payload.callerID,
                            peer,
                        })
                        setPeers(users => [...users, peer]);
                    });

                    socketRef.current.on("receiving returned signal", payload => {
                        console.log("front-end recieving", payload.id)
                        const item = peersRef.current.find(p => p.peerID === payload.id);
                        console.log("peer current", peersRef.current)
                        console.log("item", item)
                        item.peer.signal(payload.signal);
                    });
                })




            }
        } else {
            userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: videoId });
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                userVideo.current.srcObject = stream;

                console.log("THIS IS THE STREAM", stream)

                socketRef.current.emit("join room", { roomID, username, videoId, stream: stream });
                socketRef.current.on("all users", users => {
                    const peers = [];
                    users.forEach(user => {
                        const peer = createPeer(user, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: user.userId,
                            peer,
                        })
                        peers.push(peer);
                    })
                    setPeers(peers);
                })

                socketRef.current.on("user joined", payload => {
                    console.log("user joined fired")
                    console.log("PAYLAOD FOR JOIN", payload)
                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    peersRef.current.push({
                        peerID: payload.callerID,
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
        }
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

                case 'all users':
                    console.log("FIREDDDDD")

                    userDispatch({ type: 'UPDATE_USER_LIST', data });
                    break;
                default:
                    break;
            }
        });

        socketRef.current.on("removeUser", userToRemove => {
            console.log("disconnect list fired", userToRemove)
            // userDispatch({ type: 'UPDATE_USER_LIST', userList: newUsers });
            let user = peersRef.current.find(peer => peer.peerID === userToRemove.userId)
            let removePeer = user.peer
            // console.log("USER PEER", removePeer)
            console.log("FIRST PEERSE", peersRef.current)
            let newPeers = peersRef.current.filter(user => user.peer._id !== removePeer._id)

            console.log("newPeers", newPeers)
            console.log("newPeers with peer", newPeers.peer)
            peersRef.current = newPeers
            setPeers(newPeers)
        });

    }



    console.log("current socket", socketRef.current)
    console.log("peers ref current", peersRef.current)
    console.log("THIS IS THE PEERS", peers)

    const createPeer = (usersToSignal, callerID, stream) => {
        console.log("CREATE FIRED")
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            console.log("sending signal")
            socketRef.current.emit("sending signal", { usersToSignal, callerID, signal })
        })
        // console.log("NEW PEER SIGNAL", signal)
        console.log("NEW PEER LOG", peer)
        return peer;
    }

    const addPeer = (incomingSignal, callerID, stream) => {
        console.log("ADD PEER FIRED", incomingSignal)
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