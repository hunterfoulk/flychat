import React, { useRef } from 'react'

export default function RoomMessages({ messages, messagesRef }) {
    var moment = require("moment");

    let time = moment().format("LT");
    return (

        <>
            {messages.map((message) => (
                <>
                    <div className="message">
                        <div className="name-holder">
                            <span className="username">{message.User.username}</span>
                            <span className="time">{time}</span>
                        </div>
                        <div className="message-text">
                            <span>{message.message}</span>
                        </div>



                    </div>

                </>
            ))}
            <div ref={messagesRef} />
        </>
    )
}
