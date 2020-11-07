import React, { useContext, useRef, useState, useEffect } from 'react'
import "./members.scss"
import { UserContext } from "../contexts/userContext"
import Defaultpic from "../images/default.png"
import Peer from "simple-peer";


export default function Members({ socket }) {
    const { dispatch: userDispatch, userData } = useContext(UserContext);
    const [peers, setPeers] = useState([]);
    const userVideo = useRef()
    const peersRef = useRef([]);

    const videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            const peers = []
            userData.userList.forEach(user => {
                const peer = createPeer(user, socket.id, stream);
                peersRef.current.push({
                    peerID: user,
                    peer,
                })
                peers.push(peer);
            })
            setPeers(peers);
        })
        socket.on("")

    }, [])




    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socket.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socket.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }


    return (
        <div className="members-container">
            {userData.userList.map((user) => (
                <div className="user">
                    <span>{user.username}</span>
                    <img src={Defaultpic} />
                    <video ref={userVideo} />
                </div>
            ))}
        </div>
    )
}
