import React from 'react'
import "./navbar.scss"
import { FiSend } from 'react-icons/fi';
import { Link, useHistory } from "react-router-dom";



export default function Navbar() {
    const history = useHistory()

    return (
        <div className="navbar">
            <span className="nav-logo"><FiSend /></span>
            <span onClick={() => history.push("/")}>FlyChat</span>
        </div>
    )
}
