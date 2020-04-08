import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';

function Row(props) {
  const [doctor, setDoctor] = useState(props.doctor);
  const [username, setUsername] = useState(props.doctor.username);
  const [password, setPassword] = useState(props.doctor.password);
  const [hospital, setHospital] = useState(props.doctor.hospital);
  const [name,setName] = useState(props.doctor.name);
  const [email,setEmail] = useState(props.doctor.email);
  const [telephone,setTelephone] = useState(props.doctor.telephone);
  const [post,setPost] = useState(props.doctor.post);
  const [department,setDepartment] = useState(props.doctor.department);
  const [reveal, setReveal] = useState(false);
  const [editing, setEditing] = useState(props.doctor._id ? false : true);

  useEffect(() => {
    setDoctor(props.doctor);
    setUsername(props.doctor.username);
    setHospital(props.doctor.hospital);
    setPassword(props.doctor.password);
    setName(props.doctor.name);
    setEmail(props.doctor.email);
    setTelephone(props.doctor.telephone);
    setPost(props.doctor.post);
    setDepartment(props.doctor.department);
    setEditing(props.doctor._id ? false : true);
  }, [props.doctor]);

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
      <tr className={props.total ? 'doctor is-total' : 'doctor'} className={props.total ? 'is-total' : ''}
        // onMouseEnter={() => props.onHighlightDoctor?.(doctor, props.index)}
        // touchstart={() => props.onHighlightDoctor?.(doctor, props.index)}
        onClick={editing ? null : handleReveal}>
        <td style={{ fontWeight: 600, textTransform: 'none' }}>
          {
            editing ?
              <input value={username} onChange={(e) => {
                setUsername(e.target.value);
              }}></input>
              :
              doctor.username
          }
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#007bff'}}>
            {!doctor.delta.active==0 && <Icon.ArrowUp/>}
            {doctor.delta.active>0 ? `${doctor.delta.active}` : ''}
          </span>*/}
          {
            editing ?
              <input value={password} onChange={(e) => {
                setPassword(e.target.value);
              }}></input>
              :
              doctor.password
          }
          {/* {parseInt(doctor.active)===0 ? '-' : doctor.active} */}
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!doctor.delta.recovered==0 && <Icon.ArrowUp/>}
            {doctor.delta.recovered > 0 ? `${doctor.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(doctor.recovered)===0 ? '-' : doctor.recovered} */}
          {
            editing ?
              <input value={hospital} onChange={(e) => {
                setHospital(e.target.value);
              }}></input>
              :
              doctor.hospital
          }
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!doctor.delta.recovered==0 && <Icon.ArrowUp/>}
            {doctor.delta.recovered > 0 ? `${doctor.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(doctor.recovered)===0 ? '-' : doctor.recovered} */}
          {
            editing ?
              <input value={telephone} onChange={(e) => {
                setTelephone(e.target.value);
              }}></input>
              :
              doctor.telephone
          }
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!doctor.delta.recovered==0 && <Icon.ArrowUp/>}
            {doctor.delta.recovered > 0 ? `${doctor.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(doctor.recovered)===0 ? '-' : doctor.recovered} */}
          {
            editing ?
              <input value={email} onChange={(e) => {
                setEmail(e.target.value);
              }}></input>
              :
              doctor.email
          }
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!doctor.delta.recovered==0 && <Icon.ArrowUp/>}
            {doctor.delta.recovered > 0 ? `${doctor.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(doctor.recovered)===0 ? '-' : doctor.recovered} */}
          {
            editing ?
              <input value={name} onChange={(e) => {
                setName(e.target.value);
              }}></input>
              :
              doctor.name
          }
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!doctor.delta.recovered==0 && <Icon.ArrowUp/>}
            {doctor.delta.recovered > 0 ? `${doctor.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(doctor.recovered)===0 ? '-' : doctor.recovered} */}
          {
            editing ?
              <input value={department} onChange={(e) => {
                setDepartment(e.target.value);
              }}></input>
              :
              doctor.department
          }
        </td>
        <td style={{ color: 'inherit', textTransform: 'none' }}>
          {/*<span className="deltas" style={{color: '#28a745'}}>
            {!doctor.delta.recovered==0 && <Icon.ArrowUp/>}
            {doctor.delta.recovered > 0 ? `${doctor.delta.recovered}` : ''}
          </span>*/}
          {/* {parseInt(doctor.recovered)===0 ? '-' : doctor.recovered} */}
          {
            editing ?
              <input value={post} onChange={(e) => {
                setPost(e.target.value);
              }}></input>
              :
              doctor.post
          }
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
        Object.keys(doctor).map((dataKey, index) => {
          return (
            <tr key={index} className={`district`} style={{ display: reveal && !props.total ? '' : 'none' }}>
              <td style={{ fontWeight: 600 }}>{dataKey}</td>
              <td>{doctor[dataKey] ? doctor[dataKey] === true ? 'Yes' : doctor[dataKey] : '-'}</td>
            </tr>
          );
        })
      }

      <tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      {editing ?
        <tr>
          <button onClick={() => {
            props.edit({
              ...doctor,
              username,
              password,
              hospital,
              telephone,
              email,
              name,
              department,
              post
            }); setEditing(false);
          }} style={{ background: 'none', padding: 0 }}>
            <Icon.Save size={16} />
          </button>
          <button onClick={() => { setEditing(props.doctor._id ? false : true); }} style={{ background: 'none', padding: 0 }}>
            <Icon.X size={16} />
          </button>
        </tr>
        :
        <tr>
          <button onClick={() => { setEditing(true) }} style={{ background: 'none', padding: 0 }}>
            <Icon.Settings size={16} />
          </button>
          <button onClick={() => { props.delete(doctor._id) }} style={{ background: 'none', padding: 0 }}>
            <Icon.Trash size={16} />
          </button>
        </tr>
      }
    </React.Fragment>
  );
}

export default Row;
