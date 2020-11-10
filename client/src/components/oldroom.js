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
import io from 'socket.io-client';



const Video = ({ peer }) => {
    const ref = useRef();
    console.log("PEER IN VIDEO", peer)
    console.log("PEER IN VIDEO 123", peer.on)
    useEffect(() => {
        console.log("video fired")
        peer.on("stream", stream => {
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


                    const peer = createPeer(stream);
                    // socketRef.current.emit("join room", { roomID, username, videoId, peer });


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
                        console.log("PAYLOAD FOR JOIN", payload)
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
                        console.log("ITEM PEER", item.peer)
                    });
                })


            }
        } else {
            userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: videoId });
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(async stream => {
                userVideo.current.srcObject = stream;

                await createPeer(roomID, username, socketRef.current.id, stream, videoId);



                // socketRef.current.emit("join room", { roomID, username, videoId, stream });

                // socketRef.current.emit("join room", { roomID, username, videoId });

                socketRef.current.on("all users", users => {
                    console.log("USERS ELSE", users)

                    const peers = [];
                    users.forEach(user => {
                        console.log("users", user)

                        peersRef.current.push({
                            peerID: user.userId,
                            peer: user.peer,
                        })
                        peers.push(user.peer);
                        const item = peersRef.current.find(p => p.peerID === user.userId);
                        console.log("item", item)
                        // item.peer.signal(user.signal);
                        console.log("PEERS REF", peersRef.current)
                        setPeers(users => [...users, user.peer]);
                    })
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

                    userDispatch({ type: 'UPDATE_USER_LIST', userList: data.users });
                    break;

                default:
                    break;
            }
        });

    }


    console.log("peers ref current", peersRef.current)
    console.log("THIS IS THE PEERS", peers)

    //create peer
    const createPeer = (roomID, username, socketId, stream, videoId) => {
        console.log("CREATE FIRED", stream);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            console.log("sending signal", stream)
            socketRef.current.emit("join room", { roomID, username, socketId, signal, peer, videoId })

        })
        // console.log("PEER", peer)
        // return peer;
    }

    //add peer
    const addPeer = (incomingSignal, callerID, stream) => {
        console.log("incoming signal", incomingSignal)
        console.log("ADD PEER FIRED")
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID, stream })
        })

        peer.signal(incomingSignal);

        return peer;
    }




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
                    console.log("PEER IN MAP", peer)
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
