import React from 'react'
import "./navbar.scss"
import { FiSend } from 'react-icons/fi';


export default function Navbar() {
    return (
        <div className="navbar">
            <span className="nav-logo"><FiSend /></span>
            <span>FlyChat</span>
        </div>
    )
}
