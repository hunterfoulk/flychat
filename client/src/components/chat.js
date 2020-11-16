import React, { useState, useContext, useEffect, useRef } from 'react'
import { FiSend } from 'react-icons/fi';
import { IoMdPerson } from 'react-icons/io';
import "./chat.scss"
import { UserContext } from "../contexts/userContext"
import { VideoContext } from '../contexts/videoContext';
import { set } from 'local-storage';
import RoomMessages from "./roomMessages"
import PrivateMessages from "./privateMessage"


export default function Chat({ socket }) {
    const [message, setMessage] = useState("");
    const [privateMessage, setPrivateMessage] = useState("");
    const [openList, setOpenList] = useState(false)
    const [messages, setMessages] = useState([])
    var moment = require("moment");
    const messagesRef = useRef()
    const [typers, setTypers] = useState([])
    const { dispatch: userDispatch, userData } = useContext(UserContext);
    const [windows, setNewWindow] = useState([])
    const [tabs, setTabs] = useState([])
    const [tab, setTab] = useState("ROOM")

    useEffect(() => {

        socket.on("newMessageCreated", (payload) => {
            console.log("user", payload.User)
            setMessages(msgs => [...msgs, payload])
            messagesRef.current.scrollIntoView();
        })

        socket.on("send tabs", ({ tabs, tab }) => {
            console.log("payload", tabs)
            setTabs(tabs)
            if (tab === "ROOM") return
            setTab(tab)

        })

        socket.on("notTyping", (username) => {
            setTypers((typers) => typers.filter((typer) => typer !== username));
        });

    }, [])


    console.log("USERS TABS", tabs)
    socket.on("typing", (username) => {
        console.log("user", username)
        setTypers((typers) =>
            !typers.includes(username) ? [...typers, username] : typers
        );


    })

    const newMessage = (e) => {
        e.preventDefault()
        if (tab === "ROOM") {
            socket.emit("createMessage", message)
            setMessage("")
        } else {

            console.log("THIS IS THE TAB", tab)
            socket.emit("newTabMessage", { tab, message })
            setMessage("")
        }

    }

    const handleTyping = (e) => {
        setMessage(e.target.value)
        if (!e.target.value) {
            socket.emit("notTyping", {
                username: userData.username,
            });
        } else if (e.target.value && tab === "ROOM") {
            console.log("else fired typing")
            socket.emit("typing", {
                username: userData.username,
            });

        }
    }


    const handlePrivateMessageTab = (user) => {
        console.log("pm window user", user)
        if (user.username === userData.username) {
            return
        } else {
            socket.emit("createNewTab", user)

        }

    }

    // const sendPrivateMessage = (e) => {
    //     e.preventDefault()
    //     console.log("PM FIRED")
    //     let userId = tab.userId

    //     socket.emit("createPrivateMessage", { userId, message })

    //     setPrivateMessage("")
    // }

    console.log("NEW WINDOW", windows)

    const tabStyles = {
        fontWeight: "500",
        backgroundColor: "white",
        boxShadow: "2px 0px 17px -4px rgba(0, 0, 0, 0.6)",
        borderRight: "1px solid #18182486",
        borderLeft: "1px solid #18182486",
        borderTop: "1px solid #18182486",
        borderTopLeftRadius: "3px",
        borderTopRightRadius: "3px",
    }

    console.log("tab", tab)
    console.log(privateMessage)
    return (
        <div className="chat">
            <div className="tabs">
                <div className="general-tab" onClick={() => setTab("ROOM")} style={tab === "ROOM" ? tabStyles : {
                    backgroundColor: "#f3f3f3", border: "none", borderTopLeftRadius: "3px",
                    borderTopRightRadius: "3px",
                }}>
                    <span>Room</span>
                </div>
                <div className="private-tabs">
                    {tabs.map((tabs, i) => (
                        <div className="private-tab" onClick={() => setTab(tabs)} style={tabs.tabId === tab.tabId ? tabStyles : {
                            backgroundColor: "#f3f3f3", border: "none", borderTopLeftRadius: "3px",
                            borderTopRightRadius: "3px",
                        }}>
                            <span>{tabs.foreignSocket.username}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="message-container">
                <div className="messages-holder" style={openList ? { width: "85%" } : { width: "100%" }} >

                    {tab === "ROOM" && <RoomMessages messages={messages} messagesRef={messagesRef} />}
                    {tab !== "ROOM" && <PrivateMessages tab={tab} socket={socket} />}

                    {typers.length > 0 && <>  {typers.map((typer, index) => (
                        <>
                            {typer}{" "}
                            {typers.length > 1 && index !== typers.length - 1 && " and "}
                        </>
                    ))}
                        <>{typers.length === 1 ? " is typing..." : "are typing..."}</>
                    </>}

                </div>


                {openList && <div className="users-list">
                    <div className="users-list-header">
                        <span>{userData.userList.length} Active Users </span>
                    </div>
                    {userData.userList.map((user, i) => (
                        <>
                            <div className="user" onClick={() => handlePrivateMessageTab(user)}>
                                <span>{user.username}</span>
                            </div>

                        </>
                    ))}
                </div>}
            </div>
            <div className="users-icon-container">
                <IoMdPerson className="users-icon" onClick={() => setOpenList(!openList)} />
            </div>
            <div className="input-holder">

                <form onSubmit={(e) => newMessage(e)}>
                    <input type="text" value={message} onChange={handleTyping} />
                    <button onClick={(e) => newMessage(e)}><FiSend /></button>

                </form>

            </div>

        </div >
    )
}
