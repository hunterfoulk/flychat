import React, { useEffect, useState, createRef, useContext, useRef, useCallback } from 'react'
import "./room.scss"
import { useLocation, useRouteMatch } from "react-router-dom";
import YouTube from 'react-youtube';
import { UserContext } from "../contexts/userContext"
import { VideoContext } from '../contexts/videoContext';
import { createConnection, bindSocketEvents } from '../utils/socket';
import Swal from 'sweetalert2'
import Chat from "./chat"
import Peer from "simple-peer";
import styled from "styled-components";
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";





export default function Room() {
    const location = useLocation();
    const match = useRouteMatch();
    const player = createRef()
    const [isHost, setIsHost] = useState(true)
    const [displayUserPrompt, setDisplayUserPrompt] = useState(false)
    const { dispatch: userDispatch, userData } = useContext(UserContext);
    const { dispatch: videoDispatch } = useContext(UserContext);
    const [peers, setPeers] = useState([]);
    const userVideo = useRef()
    const socketRef = useRef();
    const peersRef = useRef([]);
    const peersCallback = useState([]);
    var moment = require("moment");
    const [loading, setLoading] = useState(true)
    const videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
    };


    const options = {
        width: '100%',
        height: '520px',
    };


    useEffect(() => {
        const roomID = match.params.roomID;
        const videoId = location.state && location.state.videoId
        let username = location.state && location.state.hostName
        init(roomID, videoId, username)
        setTimeout(() => {
            setLoading(false)
        }, 300);

        return () => {
            socketRef.current.disconnect()
        }
    }, []);

    console.log("loading", loading)

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
                userDispatch({ type: 'UPDATE_USERNAME', username: username });


                socketRef.current.emit("join room", { roomID, username, videoId });
            }
        } else {
            socketRef.current.emit("join room", { roomID, username, videoId });
            userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: videoId });
            userDispatch({ type: 'UPDATE_USERNAME', username: username });
            console.log("ELSE FIRED")

        }

        socketRef.current.on('newMessage', (data) => {

            console.log("DATA FOR SWITCH", data)


            switch (data.type) {
                case 'userJoined':
                    console.log(data.payload.username + " has joined ")
                    // userJoinedMessage(data.payload.username, "has joined!")
                    toast.dark(`${data.payload.username} has joined the room!`, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    break;

                case 'changeVideo':
                    console.log("FIRED for video")
                    userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: data.payload.videoId });
                    break;

                case 'userMessage':
                    console.log("FIREDDDDD message", data.payload.message)
                    console.log("FIREDDDDD message", data.payload.User.username)
                    let time = moment().format("LT");


                    userDispatch({ type: 'UPDATE_MESSAGES', username: data.payload.User.username, message: data.payload.message, time: time });
                    break;

                case 'all users':
                    console.log("FIREDDDDD")

                    userDispatch({ type: 'UPDATE_USER_LIST', data });
                    break;
                default:
                    break;
            }
        });


        socketRef.current.on("all users", users => {
            console.log("all users")
            userDispatch({ type: 'UPDATE_USER_LIST', userList: users });

        })

        socketRef.current.on("updateUserList", users => {
            console.log("update fired", users)
            userDispatch({ type: 'UPDATE_USER_LIST', userList: users });

        });

    }

    // const userJoinedMessage = (username, message, time) => {
    //     userDispatch({
    //         type: 'UPDATE_MESSAGES',
    //         data: {
    //             username,
    //             message,
    //             time

    //         },
    //     });

    // }


    return (
        <div className="room-main">

            <div className="room-content-container">
                <div className="youtube-container">
                    <YouTube
                        videoId={userData.videoId}
                        opts={options}
                        ref={player}
                    />
                </div >
                {loading ? <span>loading...</span> : <Chat socket={socketRef.current} />}

            </div>



            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    )
}