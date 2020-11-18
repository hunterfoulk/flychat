
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Homepage from "./components/homepage"
import Room from "./components/room"
import Navbar from "./common/navbar"
import Footer from "./common/footer"


function Routes() {
    return (
        <Router>
            <div style={{ minHeight: '100%' }}>
                <Navbar />
                <Switch>
                    <Route path='/' component={Homepage} exact />
                    <Route path='/room/:roomID' component={Room} exact />
                </Switch>
                <Footer />
            </div>

        </Router>
    );
}

export default Routes;