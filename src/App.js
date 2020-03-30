import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import * as Icon from 'react-feather';
import $ from 'jquery';

import './App.scss';
import Home from './components/home';
import Navbar from './components/navbar';
import Links from './components/links';
import Summary from './components/summary';
import Cluster from './components/cluster';
import FAQ from './components/faq';
import Doctor from './components/doctor';
import Banner from './components/banner';

const history = require('history').createBrowserHistory;

function App() {

  useEffect(() => {
    $(window).on("load", function () {
      $(window).scroll(function () {
        var windowBottom = $(this).scrollTop() + $(this).innerHeight();
        $(".animate").each(function () {
          /* Check the location of each desired element */
          var objectBottom = $(this).offset().top;

          /* If the element is completely within bounds of the window, fade it in */
          if (objectBottom < windowBottom) { //object comes into view (scrolling down)
            $(this).removeClass('animate').addClass('fadeInUp')
          } else { //object goes out of view (scrolling up)
            // if ($(this).css("opacity")==1) {$(this).fadeTo(500,0);}
          }
        });
      }).scroll(); //invoke scroll-handler on page-load
    });
  }, []);

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
              <Route exact path="/links" render={(props) => <Links {...props} />} />
              <Route exact path="/faq" render={(props) => <FAQ {...props} />} />
            </Switch>
          </div>
        )}
        />
      </Router>
      <footer className="fadeInUp" style={{ animationDelay: '2s' }}>
        <h6>हम आपके साथ है।</h6>
        <div className="logo-display">
          <a href="https://www.aiimsjodhpur.edu.in" target='_noblank'>
            <img src="/images/aiims-logo.png" alt="logo" />
          </a>
          <a href="http://iitj.ac.in" target='_noblank'>
            <img src="/images/iitj-logo.png" alt="logo" />
          </a>
        </div>
        {/* <div className="link">
          <a href="https://github.com/covid19india">covid19india</a>

        </div>
        <div id='footerButtons'>
          <a className="button" href="https://bit.ly/patientdb" target="_noblank">
            <Icon.Database /><span>Crowdsourced Patient Database&nbsp;</span>
          </a>
          <a href="https://bit.ly/covid19crowd" className="button telegram" target="_noblank">
            <Icon.MessageCircle />
            <span>Join Telegram to Collaborate!</span>
          </a>
        </div> */}
      </footer>

    </div>
  );
}

export default App;
