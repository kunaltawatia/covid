import React, {useState, useEffect} from 'react';

function Level(props) {
  const [data, setData] = useState(props.data);
  const [confirmed, setConfirmed] = useState(0);
  const [active, setActive] = useState(0);
  const [recoveries, setRecoveries] = useState(0);
  const [deaths, setDeaths] = useState(0);

  useEffect(()=>{
    setData(props.data);
    // parseData();
    console.log(props.data);
  },[props.data]);
  useEffect(()=>{
    setData(props.data);
    // parseData();
  });
  const parseData = () => {
    let confirmed = 0;
    let active = 0;
    let recoveries = 0;
    let deaths = 0;
    data.map((state, index) => {
      if (index !== 0) {
        confirmed += parseInt(state.confirmed);
        active += parseInt(state.active);
        recoveries += parseInt(state.recovered);
        deaths += parseInt(state.deaths);
      }
    });
    setConfirmed(confirmed);
    setActive(active);
    setRecoveries(recoveries);
    setDeaths(deaths);
  };

  return (
    <div className="Level animate" style={{animationDelay: '0.8s'}}>

      <div className="level-item is-cherry">
        <h2>पुष्टीकृत</h2>
        <h4>[{data.delta ? data.delta.confirmed>=0 ? '+'+data.delta.confirmed : '+0' : ''}]</h4>
        <h1>{data.confirmed} </h1>
      </div>

      <div className="level-item is-blue">
        <h2 className="heading">संक्रमित</h2>
        <h4>&nbsp;</h4>
        {/* <h4>[{props.deltas ? props.deltas.confirmeddelta-(props.deltas.recovereddelta+props.deltas.deceaseddelta) >=0 ? '+'+(props.deltas.confirmeddelta-(props.deltas.recovereddelta+props.deltas.deceaseddelta)).toString() : '+0' : ''}]</h4>*/}
        <h1 className="title has-text-info">{data.active}</h1>
      </div>

      <div className="level-item is-green">
        <h2 className="heading">उपचारित</h2>
        <h4>[{data.delta ? data.delta.recovered>=0 ? '+'+data.delta.recovered : '+0' : ''}]</h4>
        <h1 className="title has-text-success">{data.recoveries} </h1>
      </div>

      <div className="level-item is-gray">
        <h2 className="heading">मृतक</h2>
        <h4>[{data.delta ? data.delta.deceased>=0 ? '+'+data.delta.deceased : '+0' : ''}]</h4>
        <h1 className="title has-text-grey">{data.deaths}</h1>
      </div>

    </div>
  );
}

export default Level;
