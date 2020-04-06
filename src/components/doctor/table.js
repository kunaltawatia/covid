import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';

import Row from './row';

function Table(props) {
    const [patients, setPatients] = useState([]);
    const [page, setPage] = useState(1);
    //   const [districts, setDistricts] = useState({});
    //   const [count, setCount] = useState(0);
    //   const [sortData, setSortData] = useState({
    //     sortColumn: 'confirmed',
    //     isAscending: false,
    //   });

    //   useEffect(()=>{
    //     if (props.summary===true) {
    //       setStates(props.states.slice(0, 9));
    //     } else {
    //       setStates(props.states);
    //     }
    //   }, [props.states]);

    //   useEffect(()=>{
    //     if (states.length>0) {
    //       let length = 0;
    //       props.states.map((state, i) => {
    //         if (i!==0 && state.confirmed>0) length+=1;
    //         if (i===props.states.length-1) setCount(length);
    //       });
    //     }
    //   }, [states.length]);

    useEffect(() => {
        getPatients();
    }, [1]);
    useEffect(() => {
        getPatients();
    }, [page]);
    /* add renew button */

    const getPatients = () => {

        axios.get(ENDPOINT + '/api/patient-list?page=' + page)
            .then((response) => {
                setPatients(response.data.patients);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    // make a axios call every 1min
    // setInterval(getPatients, 60 * 1000);

    //   const doSort = (e, props) => {
    //     const totalRow = states.splice(0, 1);
    //     {/* console.log(totalRow);*/}
    //     states.sort((StateData1, StateData2) => {
    //       const sortColumn = sortData.sortColumn;
    //       let value1 = StateData1[sortColumn];
    //       let value2 = StateData2[sortColumn];

    //       if (sortColumn != 'state') {
    //         value1 = parseInt(StateData1[sortColumn]);
    //         value2 = parseInt(StateData2[sortColumn]);
    //       }

    //       if (sortData.isAscending) {
    //         return value1 > value2 ? 1 : (value1 == value2) && StateData1['state'] > StateData2['state'] ? 1 : -1;
    //       } else {
    //         return value1 < value2 ? 1 : (value1 == value2) && StateData1['state'] > StateData2['state'] ? 1 : -1;
    //       }
    //     });
    //     {/* console.log(states);*/}
    //     states.unshift(totalRow[0]);
    //   };

    const handleSort = (e, props) => {
        // const currentsortColumn = e.currentTarget.querySelector('abbr').getAttribute('title').toLowerCase();
        // setSortData({
        //   sortColumn: currentsortColumn,
        //   isAscending: sortData.sortColumn == currentsortColumn? !sortData.isAscending : sortData.sortColumn === 'state',
        // });
    };

    //   doSort();

    return (
        <table className="table fadeInUp" style={{ animationDelay: '1s' }}>
            <h5 className="affected-count">
                <button onClick={getPatients} class="refresh">
                    <Icon.RefreshCw size={10} />
                </button>
                Patients
            </h5>
            <thead>
                <tr>
                    <th className="state-heading" onClick={(e) => handleSort(e, props)} >
                        <div className='heading-content'>
                            <abbr title="Name">
                                Name
                            </abbr>
                        </div>
                    </th>
                    <th onClick={(e) => handleSort(e, props)}>
                        <div className='heading-content'>
                            <abbr className={`${window.innerWidth <= 769 ? 'is-cherry' : ''}`} title="Suspected">{window.innerWidth <= 769 ? window.innerWidth <= 375 ? 'S' : 'Suspect' : 'Suspected'}</abbr>
                        </div>
                    </th>
                    <th onClick={(e) => handleSort(e, props)}>
                        <div className='heading-content'>
                            <abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Fever">{window.innerWidth <= 769 ? window.innerWidth <= 375 ? 'F' : 'Fev' : 'Fever'}</abbr>
                        </div>
                    </th>
                    <th onClick={(e) => handleSort(e, props)}>
                        <div className='heading-content'>
                            <abbr className={`${window.innerWidth <= 769 ? 'is-green' : ''}`} title="Cough">{window.innerWidth <= 769 ? window.innerWidth <= 375 ? 'C' : 'Cgh' : 'Cough'}</abbr>
                        </div>
                    </th>
                    <th onClick={(e) => handleSort(e, props)}>
                        <div className='heading-content'>
                            <abbr className={`${window.innerWidth <= 769 ? 'is-gray' : ''}`} title="SoB">{window.innerWidth <= 769 ? window.innerWidth <= 375 ? 'SoB' : 'SoB' : 'Short Breath'}</abbr>
                        </div>
                    </th>
                </tr>
            </thead>

            {
                patients.map((patient, index) => {
                    return (
                        <tbody>
                            <Row key={index} patient={patient} />
                        </tbody>
                    );
                })
            }
            <div className="pagination">
                <button onClick={() => setPage(Math.max(1, page - 1))} className="arrow">
                    <Icon.ArrowLeft size={16} />
                </button>
                <button onClick={() => setPage(patients.length ? page + 1 : page)} className="arrow">
                    <Icon.ArrowRight size={16} />
                </button>
            </div>
        </table>
    );
}

export default Table;
