import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINT } from '../config';
import LazyLoad from 'react-lazy-load';

// import FAQ from './faq';

// import $ from 'jquery';

// import { format, zonedTimeToUtc } from 'date-fns-tz';
// import { formatDistance, compareAsc } from 'date-fns';

// import Table from './table';
import Level from './level';
// import ChoroplethMap from './choropleth';
// import TimeSeries from './timeseries';
import Minigraph from './minigraph';
// import Banner from './banner';
import Chat from './chatbot';

function Home(props) {
  const [nationalStats, setNationalStats] = useState({});
  const [rajasthanStats, setRajasthanStats] = useState({});
  const [fetched, setFetched] = useState(false);
  const [graphOption, setGraphOption] = useState(1);
  const [lastUpdated, setLastUpdated] = useState('');
  const [timeseries, setTimeseries] = useState([]);
  const [deltas, setDeltas] = useState([]);
  const [timeseriesMode, setTimeseriesMode] = useState(true);
  const [stateHighlighted, setStateHighlighted] = useState(undefined);
  const [faqVisible, setFAQ] = useState(false);

  useEffect(() => {
    if (fetched === false) {
      getStates();
    }
  }, [fetched]);

  const getStates = () => {
    axios.get(ENDPOINT + '/api/cases')
      .then((response) => {
        // setStates(response.data.statewise);
        setTimeseries(response.data.cases_time_series);
        // setLastUpdated(formatDate(response.data.statewise[0].lastupdatedtime));
        // setDeltas(response.data.key_values[0]);
        setFetched(true);
        setNationalStats(response.data.national_stats);
        setRajasthanStats(response.data.rajasthan_stats);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const formatDate = (unformattedDate) => {
    const day = unformattedDate.slice(0, 2);
    const month = unformattedDate.slice(3, 5);
    const year = unformattedDate.slice(6, 10);
    const time = unformattedDate.slice(11);
    console.log(`${month} ${day} ${year} ${time}`);
    return `${year}-${month}-${day}T${time}`;
  };

  const onHighlightState = (state, index) => {
    if (!state && !index) setStateHighlighted(null);
    else setStateHighlighted({ state, index });
  };

  return (
    <div className="Home">
      <div className="home-left">

        <div className="header fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="header-mid">
            <div className="titles">
              <h1>COVID-19 सहायता पोर्टल</h1>
              <h2>एम्स जोधपुर - आईआईटी जोधपुर की संयुक्त पहल</h2>
            </div>
          </div>
        </div>

        <Chat />
      </div>

      <div className="home-right">

        <div className="header fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="header-right">
            <div className="titles">
              <h2>राष्ट्रीय आँकड़े</h2>
              <h4>भारत में COVID-19 का संक्रमण</h4>
            </div>
          </div>
        </div>

        <Level data={nationalStats} deltas={deltas} />
        <Minigraph timeseries={timeseries} animate={true} />

        <div className="header fadeInUp" style={{ animationDelay: '0.5s', paddingTop: 0 }}>
          <div className="header-right">
            <div className="titles">
              <h2>स्थानीय आँकड़े</h2>
              <h4>राजस्थान में COVID-19 का संक्रमण</h4>
            </div>
          </div>
        </div>

        <Level data={rajasthanStats} />
        {/* <Minigraph timeseries={timeseries} animate={true} /> */}

        {/* <Table states={states} summary={false} onHighlightState={onHighlightState} /> */}

        <video src='/videos/who.mp4' controls={true} className="who-video fadeInUp" style={{ animationDelay: '0.5s' }}></video>

        {/* <ChoroplethMap states={states} stateHighlighted={stateHighlighted} />

        <div className="timeseries-header fadeInUp" style={{animationDelay: '1.5s'}}>
          <h1>Spread Trends</h1>
          <div className="tabs">
            <div className={`tab ${graphOption===1 ? 'focused' : ''}`} onClick={()=>{
              setGraphOption(1);
            }}>
              <h4>Cumulative</h4>
            </div>
            <div className={`tab ${graphOption===2 ? 'focused' : ''}`} onClick={()=>{
              setGraphOption(2);
            }}>
              <h4>Daily</h4>
            </div>
          </div>

          <div className="timeseries-mode">
            <label htmlFor="timeseries-mode">Scale Uniformly</label>
            <input type="checkbox" checked={timeseriesMode} onChange={(event)=>{
              setTimeseriesMode(!timeseriesMode);
            }}/>
          </div>

        </div>

        <TimeSeries timeseries={timeseries} type={graphOption} mode={timeseriesMode}/> */}

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
