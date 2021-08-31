import React from 'react';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import {Container} from 'semantic-ui-react';

import MainHub from "./pages/MainHub/MainHub";
import CreateVault from "./pages/CreateVault/CreateVault";
import VaultOptOut from "./pages/VaultOptOut/VaultOptOut";
import YourSeedPhrase from "./pages/YourSeedPhrase/YourSeedPhrase";

/**
 * Main App Entrypoint
 */
function App() {

    return (

        <Router>

            <Container fluid>

                <Switch>

                    <Route exact path="/" component={MainHub}/>

                    <Route exact path="/createVault" component={CreateVault}/>

                    <Route exact path="/vaultOptOut" component={VaultOptOut}/>

                    <Route exact path="/yourSeedPhrase" component={YourSeedPhrase}/>

                </Switch>


            </Container>

        </Router>

    );
}

export default App;
