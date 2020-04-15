import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINT } from '../config';
import LazyLoad from 'react-lazy-load';

import Level from './level';
import Chat from './chatbot';

function Home() {
  const [nationalStats, setNationalStats] = useState({});
  const [rajasthanStats, setRajasthanStats] = useState({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched === false) {
      getStates();
    }
  }, [fetched]);

  const getStates = () => {
    axios.get(ENDPOINT + '/api/cases')
      .then((response) => {
        setFetched(true);
        setNationalStats(response.data.national_stats);
        setRajasthanStats(response.data.rajasthan_stats);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="Home">
      <div className="home-left">

        <div className="header fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="header-mid">
            <div className="titles">
              <h1>CoViDoc टेली-कंसल्टेंसी पोर्टल</h1>
              <h2>आईआईटी जोधपुर की पहल</h2>
            </div>
          </div>
        </div>

        <Chat />
      </div>

      <div className="home-right">
        {
          navigator.userAgent.toLowerCase().match(/android.*applewebkit(?=.*version)/) ?
            null
            :
            <div className="app-link fadeInUp" style={{animationDelay: '1s'}}>
              <a href="#">
                <h3>Download CoViDoc App</h3>
              </a>
            </div>
        }

        <div className="header fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="header-right">
            <div className="titles">
              <h2>राष्ट्रीय आँकड़े</h2>
              <h4>भारत में COVID-19 का संक्रमण</h4>
            </div>
          </div>
        </div>

        <Level data={nationalStats} />

        <div className="header fadeInUp" style={{ animationDelay: '0.5s', paddingTop: 0 }}>
          <div className="header-right">
            <div className="titles">
              <h2>स्थानीय आँकड़े</h2>
              <h4>राजस्थान में COVID-19 का संक्रमण</h4>
            </div>
          </div>
        </div>

        <Level data={rajasthanStats} />
        <video src='/videos/who.mp4' controls={true} className="who-video fadeInUp" style={{ animationDelay: '0.5s' }}></video>

      </div>
      <LazyLoad offsetVertical={300}>
        <img src="/images/prevention.jpg" className="prevention-image fadeInUp" style={{ animationDelay: '0.5s' }}></img>
      </LazyLoad>
      <div className="helpline fadeInUp" style={{ animationDelay: '0.5s' }}>
        <LazyLoad offsetVertical={300}>
          <img src="/images/myths.jpg" className="myth-image"></img>
        </LazyLoad>
        <div className="row">
          <div className="col">
            <h2>हेल्पलाइन नंबर: </h2>
            <a href="tel:1075" >
              1075
            </a>
            <a href="tel:+91-11-23978046" >
              +91-11-23978046
            </a>
          </div>
          <div className="col">
            <h2>हेल्पलाइन ईमेल आई.डी.</h2>
            <a href="mail:ncov2019@gov.in">
              ncov2019@gov.in
            </a>
            <a href="mail:ncov2019@gmail.com">
              ncov2019@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
