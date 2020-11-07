import React, { useState } from 'react'
import Callimg from "../images/newcall.svg"
import "./homepage.scss"
import { getVideoId } from "../utils/helper"
import { createConnection } from "../utils/socket"
import { Link, useHistory } from "react-router-dom";
import { MdPhotoCamera } from 'react-icons/md';
import { MdOndemandVideo } from 'react-icons/md';
import { MdChatBubbleOutline } from 'react-icons/md';
import { v1 as uuid } from "uuid";


export default function Homepage() {
    const [hostName, setHostName] = useState("")
    const [username, setUsername] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [_socket, setSocket] = useState(null)
    const history = useHistory()

    const createRoom = async (e) => {
        e.preventDefault()
        let username = hostName;
        const videoId = getVideoId(videoUrl)

        const roomID = uuid();
        history.push({
            pathname: `/room/${roomID}`,
            state: { hostName: username, videoId, roomID },


        });

        setVideoUrl("")
        setHostName("")
        console.log("VIDEO ID", videoId)
    }


    return (
        <div className="homepage-main">
            <div className="homepage-header">
                <div className="header-left">
                    <div className="left-content">
                        <h2 className="header-one">A <span className="second-h2">Youtube</span> Watch Party Chat Room For Friends</h2>
                        <p className="header-two">Host or join a chat room to watch videos and webcam with your friends.</p>
                    </div>
                    <div className="button-container">
                        <button>Get Started</button>
                    </div>
                </div>
                <div className="header-right">
                    <div className="image-container">
                        <img src={Callimg} />
                    </div>
                </div>
            </div>
            <div className="card-container">

                <div className="card">
                    <MdOndemandVideo className="icon" />
                    <span>Watch videos in sync together</span>
                </div>
                <div className="card">
                    <MdChatBubbleOutline className="icon" />
                    <span>Chat with friends</span>

                </div>

                <div className="card">
                    <MdPhotoCamera className="icon" />
                    <span>Video chat with others</span>
                </div>
            </div>

            <div className="forms-section">
                <div className="form-section-left">
                    <div className="form">
                        <h2>Create Room</h2>
                        <input placeholder="username" value={hostName} onChange={(e) => setHostName(e.target.value)} />
                        <input placeholder="https://www.youtube.com/watch?v=1bLTSokZHsU" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                        <button onClick={(e) => createRoom(e)}>Create</button>
                    </div>
                </div>
                <div className="form-section-right">
                    <div className="form">
                        <h2>Join Room</h2>
                        <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input placeholder="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                        <button type="submit">Join</button>
                    </div>
                </div>
            </div>

            {/* <form onSubmit={(e) => createRoom(e)}>
                <input placeholder="username" value={hostName} onChange={(e) => setHostName(e.target.value)} />
                <input placeholder="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <button type="submit">Create</button>
            </form> */}
        </div>
    )
}
