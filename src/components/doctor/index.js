import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import Chat from './doctors_chat';
import Table from './table';
// import $ from 'jquery';
import { ENDPOINT } from '../../config';

axios.defaults.withCredentials = true;

class Doctor extends React.Component {

    state = {
        loading: true,
        loggedin: false,
        username: '',
        password: ''
    }

    componentDidMount() {
        this.login();
    }

    logout = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        this.setState({ loading: true, error: '' });
        axios.get(ENDPOINT + '/api/logout')
            .then((response) => {
                const { loggedOut } = response.data;
                if (loggedOut) {
                    this.setState({
                        loggedin: false,
                        username: '',
                        hospital: '',
                        password: ''
                    });
                }
                else {
                    this.setState({ error: 'Error Occured!' });
                }
                this.setState({ loading: false });
            })
            .catch((err) => {
                this.setState({ loading: false, error: 'Internal Server Error!' });
                console.log(err);
            });
    }

    login = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const { loading, username, password } = this.state;

        this.setState({ loading: true, error: '' });
        axios.post(ENDPOINT + '/api/login', {
            username,
            password
        })
            .then((response) => {
                const { login, username, hospital } = response.data;
                if (login) {
                    this.setState({
                        loggedin: true,
                        username,
                        hospital
                    });
                }
                else {
                    if (username || password)
                        this.setState({ error: 'Invalid Credentials!' });
                }
                this.setState({ loading: false });
            })
            .catch((err) => {
                if (username || password)
                    this.setState({ loading: false, error: 'Internal Server Error!' });
                console.log(err);
            });
    };

    handleChange = (event) => {
        const { id, value } = event.target;
        this.setState({
            [id]: value
        });
    }

    render() {

        const { loggedin, username, password, error, loading, hospital } = this.state;

        if (!loggedin) {
            return (
                <div className="Home">
                    {loading ? <div class="lds-dual-ring"></div> :
                        <form onSubmit={this.login} className="login-form fadeInUp">
                            <p>{error}</p>
                            <h3>Username: </h3>
                            <input id='username' value={username} onChange={this.handleChange}
                                type="username"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                            />
                            <h3>Password: </h3>
                            <input id='password' value={password} onChange={this.handleChange}
                                type="password"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                            />
                            <button type="submit" className="send">
                                <Icon.Send />
                            </button>
                        </form>
                    }
                </div>
            )
        }

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

                    <Chat username={username} hospital={hospital} />
                </div>

                <div className="home-right">
                    <form onSubmit={this.logout} className="login-form fadeInUp">
                        <p>{error}</p>
                        <button onClick={this.logout} className="logout fadeInUp" style={{ animationDelay: '0.8s' }}>Logout</button>
                    </form>
                    <Table />
                </div>
            </div>
        );
    }
}

export default Doctor;
