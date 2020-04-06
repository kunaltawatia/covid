import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';

import Row from './row';

function Table(props) {
    const [doctors, setDoctors] = useState([]);
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

    // useEffect(() => {
    //     getDoctors();
    // }, [1]);
    useEffect(() => {
        getDoctors();
    }, [page]);
    /* add renew button */

    const getDoctors = () => {

        axios.get(ENDPOINT + '/admin/doctor-list?page=' + page)
            .then((response) => {
                const { doctors } = response.data;
                console.log(doctors);
                if (doctors)
                    setDoctors(doctors);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteDoctor = (id) => {
        axios.delete(ENDPOINT + '/admin/doctor/' + id)
            .then((response) => {
                getDoctors();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const edit = ({ _id, ...rest }) => {
        if (_id)
            axios.post(ENDPOINT + '/admin/doctor/' + _id, rest)
                .then((response) => {
                    getDoctors();
                })
                .catch((err) => {
                    console.log(err);
                });
        else
            axios.put(ENDPOINT + '/admin/doctor', rest)
                .then((response) => {
                    getDoctors();
                })
                .catch((err) => {
                    console.log(err);
                });
    }

    // make a axios call every 1min
    // setInterval(getDoctors, 60 * 1000);

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
                <button onClick={getDoctors} class="refresh">
                    <Icon.RefreshCw size={10} />
                </button>
                Doctors
            </h5>
            <thead>
                <tr>
                    <th className="state-heading" onClick={(e) => handleSort(e, props)} >
                        <div className='heading-content'>
                            <abbr title="Name">
                                Username
                            </abbr>
                        </div>
                    </th>
                    <th onClick={(e) => handleSort(e, props)}>
                        <div className='heading-content'>
                            <abbr className={`${window.innerWidth <= 769 ? 'is-cherry' : ''}`} title="Password">{window.innerWidth <= 769 ? window.innerWidth <= 375 ? 'P' : 'PWD' : 'Password'}</abbr>
                        </div>
                    </th>
                    <th onClick={(e) => handleSort(e, props)}>
                        <div className='heading-content'>
                            <abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Hospital">{window.innerWidth <= 769 ? window.innerWidth <= 375 ? 'H' : 'HOS' : 'Hospital'}</abbr>
                        </div>
                    </th>
                </tr>
            </thead>

            {
                doctors.map((doctor, index) => {
                    return (
                        <tbody>
                            <Row key={index} doctor={doctor} delete={deleteDoctor} edit={edit} />
                        </tbody>
                    );
                })
            }
            <div className="pagination">
                <button onClick={() => setPage(Math.max(1, page - 1))} className="arrow">
                    <Icon.ArrowLeft size={16} />
                </button>
                <button onClick={() => {
                    setDoctors([{
                        username: '',
                        password: '',
                        hospital: '',
                        _id: false
                    }].concat(doctors))
                }} className="arrow">
                    <Icon.Plus size={16} />
                </button>
                <button onClick={() => setPage(doctors.length ? page + 1 : page)} className="arrow">
                    <Icon.ArrowRight size={16} />
                </button>
            </div>
        </table>
    );
}

export default Table;
