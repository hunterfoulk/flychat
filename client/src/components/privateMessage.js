import React, { useState } from 'react'

export default function PrivateMessage({ tab, socket }) {
    var moment = require("moment");
    let time = moment().format("LT");






    return (
        <>

            {tab.messages.map((message) => (
                <>
                    <div className="message">
                        <div className="name-holder">
                            <span className="username">{message.user.username}</span>
                            <span className="time">{time}</span>
                        </div>
                        <div className="message-text">
                            <span>{message.message}</span>
                        </div>

                        {/* <div ref={messagesRef} /> */}

                    </div>

                </>
            ))}

        </>
    )
}
