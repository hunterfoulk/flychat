import React, { useState, useContext, useEffect } from 'react'
import { FiSend } from 'react-icons/fi';
import "./chat.scss"
import { UserContext } from "../contexts/userContext"
import { VideoContext } from '../contexts/videoContext';

export default function Chat({ socket }) {
    const [message, setMessage] = useState("");
    const { dispatch: userDispatch, userData } = useContext(UserContext);
    useEffect(() => {
        console.log(socket)

    }, [])
    const newMessage = (e) => {
        e.preventDefault()
        socket.emit("createMessage", message)
        setMessage("")
    }

    return (
        <div className="chat">
            <div className="message-container">
                {userData.messages.map((message) => (
                    <span>{message.message}</span>
                ))}
            </div>
            <div className="input-holder">
                <form onSubmit={(e) => newMessage(e)}>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button onClick={(e) => newMessage(e)}><FiSend /></button>
                </form>

            </div>

        </div>
    )
}
