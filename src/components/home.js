import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINT } from '../config';

import $ from 'jquery';

import { format, zonedTimeToUtc } from 'date-fns-tz';
import { formatDistance, compareAsc } from 'date-fns';

import Table from './table';
import Level from './level';
import ChoroplethMap from './choropleth';
import TimeSeries from './timeseries';
import Minigraph from './minigraph';
import Banner from './banner';
import Chat from './chatbot';

function Home(props) {
  const [states, setStates] = useState([]);
  const [nationalStats, setNationalStats] = useState({});
  const [rajasthanStats, setRajasthanStats] = useState({});
  const [fetched, setFetched] = useState(false);
  const [graphOption, setGraphOption] = useState(1);
  const [lastUpdated, setLastUpdated] = useState('');
  const [timeseries, setTimeseries] = useState([]);
  const [deltas, setDeltas] = useState([]);
  const [timeseriesMode, setTimeseriesMode] = useState(true);
  const [stateHighlighted, setStateHighlighted] = useState(undefined);

  useEffect(() => {
    if (fetched === false) {
      getStates();
    }
  }, [fetched]);

  const getStates = () => {
    axios.get(ENDPOINT + '/cases.json')
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

        <div className="header animate" style={{ animationDelay: '0.5s' }}>
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

        <div className="header animate" style={{ animationDelay: '0.5s' }}>
          <div className="header-right">
            <div className="titles">
              <h2>राष्ट्रीय आँकड़े</h2>
              <h4>भारत में COVID-19 का संक्रमण</h4>
            </div>
          </div>
        </div>

        <Level data={nationalStats} deltas={deltas} />
        <Minigraph timeseries={timeseries} animate={true} />

        <div className="header animate" style={{ animationDelay: '0.5s', paddingTop: 0 }}>
          <div className="header-right">
            <div className="titles">
              <h2>स्थानीय आँकड़े</h2>
              <h4>राजस्थान में COVID-19 का संक्रमण</h4>
            </div>
          </div>
        </div>

        <Level data={rajasthanStats} />
        <Minigraph timeseries={timeseries} animate={true} />

        {/* <Table states={states} summary={false} onHighlightState={onHighlightState} /> */}

        <video src='/videos/who.mp4' controls={true} className="who-video animate" style={{ animationDelay: '0.5s' }}></video>

        {/* <ChoroplethMap states={states} stateHighlighted={stateHighlighted} />

        <div className="timeseries-header animate" style={{animationDelay: '1.5s'}}>
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

      <img src="/images/prevention.jpg" className="prevention-image animate" style={{ animationDelay: '0.5s' }}></img>
      <img src="/images/myths.jpg" className="myth-image animate" style={{ animationDelay: '0.5s' }}></img>

    </div>
  );
}

export default Home;
