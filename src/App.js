import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
// import * as Icon from 'react-feather';
// import $ from 'jquery';

import './App.scss';
import Home from './components/home';
import Navbar from './components/navbar';
import Acknowledgement from './components/acknowledgement';
// import Summary from './components/summary';
// import Cluster from './components/cluster';
import FAQ from './components/faq';
import Doctor from './components/doctor';
import Admin from './components/admin';
// import Banner from './components/banner';
import axios from 'axios';
import { ENDPOINT } from './config';


const history = require('history').createBrowserHistory;

function App() {
  const [hits, setHits] = useState(0);

  const normalise = (hits) => {
    if (!hits) return hits;
    const digits = Math.floor(Math.log10(hits)) + 1;
    return [...Array(Math.max(0, 5 - digits)).keys()].map(() => '0').join('') + hits;
  }

  useEffect(() => {
    axios.get(ENDPOINT + '/api/hits')
      .then((response) => {
        const { hits } = response.data;
        if (hits)
          setHits(hits);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // useEffect(() => {
  //   $(window).on("load", function () {
  //     $(window).scroll(function () {
  //       var windowBottom = $(this).scrollTop() + $(this).innerHeight();
  //       $(".animate").each(function () {
  //         /* Check the location of each desired element */
  //         var objectBottom = $(this).offset().top;

  //         /* If the element is completely within bounds of the window, fade it in */
  //         if (objectBottom < windowBottom) { //object comes into view (scrolling down)
  //           $(this).removeClass('animate').addClass('fadeInUp')
  //         } else { //object goes out of view (scrolling up)
  //           // if ($(this).css("opacity")==1) {$(this).fadeTo(500,0);}
  //         }
  //       });
  //     }).scroll(); //invoke scroll-handler on page-load
  //   });
  // }, []);

  return (
    <div className="App">

      <Router history={history}>
        <Route render={({ location }) => (
          <div className="Almighty-Router">
            <Navbar />
            {/* <Banner /> */}
            <Route exact path="/" render={() => <Redirect to="/" />} />
            <Switch location={location}>
              <Route exact path="/" render={(props) => <Home {...props} />} />
              <Route exact path="/doctor" render={(props) => <Doctor {...props} />} />
              <Route exact path="/admin_dashboard" render={(props) => <Admin {...props} />} />
              {/* <Route exact path="/links" render={(props) => <Links {...props} />} /> */}
              <Route exact path="/faq" render={(props) => <FAQ {...props} />} />
              <Route exact path="/acknowledgement" render={(props) => <Acknowledgement {...props} />} />
            </Switch>
          </div>
        )}
        />
      </Router>
      <footer className="fadeInUp" style={{ animationDelay: '0s' }}>
        <h6>हम आपके साथ है।</h6>
        <div className="logo-display">
          <a href="https://www.aiimsjodhpur.edu.in" target='_noblank'>
            <img src="/images/aiims-logo.png" alt="logo" />
          </a>
          <a href="http://iitj.ac.in" target='_noblank'>
            <img src="/images/iitj-logo.png" alt="logo" />
          </a>
        </div>
        <br />
        <div className="footer-sources">
          <h6 className="sources">सूचना के स्रोत: </h6>
          <div id='footerButtons'>
            <a href="https://who.int" target="_noblank">
              <img src="/images/who-logo.svg" className="who-logo" />
            </a>
            <a href="https://www.mohfw.gov.in/" target="_noblank">
              <img src="/images/mohfw-logo.jpg" className="mohfw-logo" />
            </a>
          </div>
        </div>
        <div class="hits">
          <a href="" target="_noblank" className="link">
            <h6 className="sources">
              कुल वेब हिट: {normalise(hits)}
            </h6>
          </a>
        </div>
        <div class="profile">
          <a href="http://home.iitj.ac.in/~tawatia.1" target="_noblank" className="link">
            <h6 className="sources">
              असेंबल्ड बाय: कुनाल तेवत्तिआ
          </h6>
          </a>
        </div>
      </footer>

    </div>
  );
}

export default App;
