import React from 'react'
import "./footer.scss"
import { FaGlobe } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';


export default function Footer() {
    return (
        <div className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="footer-left-content">
                        <h1>FlyChat</h1>
                        <span>A Youtube Watch Party Chat Room For Friends</span>
                    </div>
                </div>
                <div className="footer-right">
                    <div className="footer-right-content">
                        <h1>Contact</h1>
                        <div className="links-container">
                            <a><FaGlobe style={{ position: "relative", top: "3px" }} /> www.hunterfoulk.com</a>
                            <a><FaGithub style={{ position: "relative", top: "3px" }} /> Github.com/hunterfoulk</a>

                        </div>
                    </div>
                </div>

            </div>
            <div className="footer-bottom">
                <span className="footer-title">FlyChat</span>
                <span>© 2020 Hunter Foulk | All rights reserved.</span>
            </div>
        </div>
    )
}
