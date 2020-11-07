
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Homepage from "./components/homepage"
import Room from "./components/room"


function Routes() {
    return (
        <Router>
            <div style={{ minHeight: '100%' }}>
                <Switch>
                    <Route path='/' component={Homepage} exact />
                    <Route path='/room/:roomID' component={Room} exact />
                </Switch>

            </div>

        </Router>
    );
}

export default Routes;