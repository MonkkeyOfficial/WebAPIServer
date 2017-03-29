import { Config } from './config'
Config.get.initialize();
import ReactDOM = require('react-dom')
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Navigation } from './controllers/Navigation'
import { Exercice, ExerciceRoute } from './controllers/Exercice'
import { Footer } from './controllers/Footer'

ReactDOM.render(
  <Navigation />
, document.getElementById('nav'));

ReactDOM.render(
  <Router>
    <Route path="/exo/:id" component={ExerciceRoute} />
  </Router>
, document.getElementById('content'));

ReactDOM.render(
  <Footer />
, document.getElementById('footer'));
