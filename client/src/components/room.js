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
import { AiOutlineLoading3Quarters } from 'react-icons/ai';







export default function Room() {
    const location = useLocation();
    const match = useRouteMatch();
    const player = createRef()
    const { dispatch: userDispatch, userData } = useContext(UserContext);
    const { dispatch: videoDispatch, videoData } = useContext(VideoContext);
    const socketRef = useRef();
    var moment = require("moment");
    const [loading, setLoading] = useState(true)


    const options = {
        width: '100%',
        height: '520px',
    };


    const getCurrentPlayer = () => {
        if (player.current) return player.current.getInternalPlayer();
        else return null;

    };

    const emitVideoState = (type, payload, delayTime = 0) => {
        console.log("emit fired", type)
        setTimeout(() => {
            if (!videoData.transition) {
                socketRef.current.emit('videoStateChange', { type, payload, username: userData.username });
            }
        }, 500 + delayTime);
    }

    const onVideoPlay = () => {
        const player = getCurrentPlayer();

        console.log("on video player", player)
        player.seekTo(videoData.playVideo || 0);
        player.playVideo();
    }

    const onPauseVideo = () => {
        const player = getCurrentPlayer();
        videoDispatch({ type: 'UPDATE_TRANSITION', transition: false });
        player.pauseVideo()
    }

    useEffect(() => {
        onVideoPlay()
    }, [videoData.playVideo])

    useEffect(() => {
        onPauseVideo()
    }, [videoData.pauseVideo])




    const onStateChange = (e) => {
        const { data } = e;

        let player = getCurrentPlayer()
        console.log("player data", e)
        switch (data) {
            case -1:
                console.log('Case -1 Video unstarted');
                break;

            case 0:
                console.log('Case 0 Video Ended');
                break;

            case 1:
                // PLAY
                console.log('Case 1 Video Play', e.target.getCurrentTime());
                player.playVideo();

                emitVideoState(
                    'PLAY', { currentTime: e.target.getCurrentTime() }, 150

                );
                videoDispatch({ type: 'UPDATE_TRANSITION', transition: false });

                break;

            case 2:
                // PAUSE
                console.log('Case 2 Video paused');
                emitVideoState('PAUSE');
                videoDispatch({ type: 'UPDATE_TRANSITION', transition: false });

                break;

            case 3:
                console.log('Case 3 Bufferring');
                break;

            case 5:
                console.log('Case 5 Video qued');

                break;

            default:
                break;
        }
    }

    console.log("current player", player.current)



    useEffect(() => {
        const roomID = match.params.roomID;
        const videoId = location.state && location.state.videoId
        let username = location.state && location.state.hostName
        init(roomID, videoId, username)
        setTimeout(() => {
            setLoading(false)
        }, 300);


        socketRef.current.on('sendPauseEvent', (data) => {
            console.log(data)


            toast.warn(`${data.user} paused the video.`, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        })


        return () => {
            socketRef.current.disconnect()
        }
    }, []);

    console.log("loading", loading)




    const init = async (roomID, videoId, username) => {
        // https://flychatserver.herokuapp.com/
        socketRef.current = io("http://localhost:8000", { path: '/socket' });

        if (!videoId) {
            console.log("no video ID")


            if (!username) {

                const usernamePrompt = await Swal.fire({
                    title: 'Enter your display name',
                    input: 'text',
                    allowOutsideClick: false,
                });
                username = usernamePrompt.value;
                userDispatch({ type: 'UPDATE_USERNAME', username: username });


            }
            socketRef.current.emit("join room", { roomID, username, videoId });
        } else {
            socketRef.current.emit("join room", { roomID, username, videoId });
            userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: videoId });
            userDispatch({ type: 'UPDATE_USERNAME', username: username });
            console.log("ELSE FIRED")

        }

        socketRef.current.on('newMessage', (data) => {

            console.log("DATA FOR SWITCH", data.payload)


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

                case "updateVideoState":
                    console.log("video state change fired", data)
                    videoDispatch({
                        type: "UPDATE_TRANSITION",
                        transition: true
                    })

                    switch (data.payload.type) {
                        case "PLAY":
                            console.log("PLAY FIREDDDD", data.payload)
                            console.log("PLAY FIREDDDD 123", data.payload.currentTime)
                            videoDispatch({
                                type: 'PLAY_VIDEO',
                                currentTime: data.payload.currentTime
                            });

                            break;

                        case "PAUSE":
                            videoDispatch({
                                type: "PAUSE_VIDEO",
                                timestamp: Date.now()
                            })


                            break;
                    }
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


    return (
        <div className="room-main">

            <div className="room-content-container">
                <div className="youtube-container">
                    <YouTube
                        videoId={userData.videoId}
                        opts={options}
                        ref={player}
                        onStateChange={onStateChange}
                    />
                </div >
                {loading ? <AiOutlineLoading3Quarters /> : <Chat socket={socketRef.current} />}

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