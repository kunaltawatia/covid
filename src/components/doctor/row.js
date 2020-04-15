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
        onClick={() => {
          handleReveal();
        }}>
        <td style={{ fontWeight: 600 }}>{patient.name}</td>
        <td>
          <a href={`tel:${patient.telephone}`} className="link" target="_noblank">
          {patient.telephone}
          </a>
        </td>
        <td style={{ color: '#B5B5B5' }}>
            {patient.age}
        </td>
        <td style={{ color: '#B5B5B5' }}>
          {patient.gender}
        </td>
        <td style={{ color: '#B5B5B5' }}>
          {patient.type}
        </td>
      </tr>

      <tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      
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
