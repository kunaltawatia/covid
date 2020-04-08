import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';

function Row(props) {
  const [patient, setPatient] = useState(props.patient);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setPatient(props.patient);
  }, [props.patient]);

  const handleReveal = () => {
    setReveal(!reveal);
  };

  return (
    <React.Fragment>
      <span className={`dropdown ${reveal ? 'rotateRightDown' : 'rotateDownRight'}`} onClick={() => {
        handleReveal();
      }}>
        <Icon.ChevronDown />
      </span>
      <tr className={props.total ? 'patient is-total' : 'patient'} className={props.total ? 'is-total' : ''}
        // onMouseEnter={() => props.onHighlightPatient?.(patient, props.index)}
        // touchstart={() => props.onHighlightPatient?.(patient, props.index)}
        onClick={() => {
          handleReveal();
        }}>
        <td style={{ fontWeight: 600 }}>{patient.name}</td>
        <td>
          {/* <span className="deltas" style={{color: '#ff073a'}}>
            {!patient.delta.confirmed==0 && <Icon.ArrowUp/>}
            {patient.delta.confirmed > 0 ? `${patient.delta.confirmed}` : ''}
          </span> */}
          <a href={`tel:${patient.telephone}`} className="link" target="_noblank">
          {patient.telephone}
          </a>
        </td>
        <td style={{ color: '#B5B5B5' }}>
          {/*<span className="deltas" style={{color: '#007bff'}}>
            {!patient.delta.active==0 && <Icon.ArrowUp/>}
            {patient.delta.active>0 ? `${patient.delta.active}` : ''}
          </span>*/}
            {patient.age}
          {/* {parseInt(patient.active)===0 ? '-' : patient.active} */}
        </td>
        <td style={{ color: '#B5B5B5' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!patient.delta.recovered==0 && <Icon.ArrowUp/>}
            {patient.delta.recovered > 0 ? `${patient.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(patient.recovered)===0 ? '-' : patient.recovered} */}
          {patient.gender}
        </td>
        <td style={{ color: '#B5B5B5' }}>
          {/*<span className="deltas" style={{color: '#6c757d'}}>
            {!patient.delta.deaths==0 && <Icon.ArrowUp/>}
            {patient.delta.deaths>0 ? `${patient.delta.deaths}` : ''}
          </span>*/}
          {/* {parseInt(patient.deaths)===0 ? '-' : patient.deaths} */}
          {patient.type}
        </td>
      </tr>

      <tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
        <td></td>
        <td></td>
        <td></td>
      </tr>

      {/* <tr className={`district-heading`} style={{display: reveal && !props.total ? '' : 'none'}}>
        <td>District</td>
        <td><abbr className={`${window.innerWidth <=769 ? 'is-cherry' : ''}`} title="Confirmed">{window.innerWidth <=769 ? window.innerWidth <=375 ? 'Confirmed' : 'Confirmed' : 'Confirmed'}</abbr></td>
         <td><abbr className={`${window.innerWidth <=769 ? 'is-blue' : ''}`} title="Active">{window.innerWidth <=769 ? window.innerWidth <=375 ? 'A' : 'Actv' : 'Active'}</abbr></td>
        <td><abbr className={`${window.innerWidth <=769 ? 'is-green' : ''}`} title="Recovered">{window.innerWidth <=769 ? window.innerWidth <=375 ? 'R' : 'Rcvrd' : 'Recovered'}</abbr></td>
        <td><abbr className={`${window.innerWidth <=769 ? 'is-gray' : ''}`} title="Deaths">{window.innerWidth <=769 ? window.innerWidth <=375 ? 'D' : 'Dcsd' : 'Deceased'}</abbr></td>
      </tr>

      {districts?.Unknown &&
      <tr className={`district`} style={{display: reveal && !props.total ? '' : 'none'}}>
        <td style={{fontWeight: 600}}>Unknown</td>
        <td>{districts['Unknown'].confirmed}</td>
         <td>{districts['Unknown'].active}</td>
        <td>{districts['Unknown'].recovered}</td>
        <td>{districts['Unknown'].deaths}</td>
      </tr>
      }*/}

      {
        Object.keys(patient).map((dataKey, index) => {
          return (
            <tr key={index} className={`district`} style={{ display: reveal && !props.total ? '' : 'none' }}>
              <td style={{ fontWeight: 600 }}>{dataKey}</td>
              <td>{patient[dataKey] ? patient[dataKey] === true ? 'Yes' : patient[dataKey] : '-'}</td>
            </tr>
          );
        })
      }

      <tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </React.Fragment>
  );
}

export default Row;
