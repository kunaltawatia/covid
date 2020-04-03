import React from 'react';
import * as Icon from 'react-feather';
import $ from 'jquery';

// import axios from 'axios';
import { ENDPOINT } from '../config';

const client = require('socket.io-client');


export default class Chat extends React.Component {
    state = {
        loading: true,
        chatStarted: false,
        user: null,
        incomingTyping: false,
        chat: [],
        textAnswered: ''
    };

    socket = null

    sendMessage = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const { user, textAnswered } = this.state;
        if (textAnswered.length) {
            this.setState({ textAnswered: '' });
            this.socket.emit('message', textAnswered);
            this.enterMessageIntoChat(textAnswered, 'outgoing');
        }
    }

    enterMessageIntoChat = (statement, type) => {
        const { chat } = this.state;
        this.setState({
            chat: chat.concat([{ statement, type }])
        }, this.scrollDown)
    }

    scrollDown = () => {
        $("#chat-box").animate({ scrollTop: $("#chat-box")[0].scrollHeight }, 800);
    }

    connect = () => {
        const { username } = this.props;

        this.socket = client(ENDPOINT, { path: '/app_chat', query: { type: 'doctor', username } });

        this.socket.on('userAlloted', (user) => {
            console.log(user);
            this.setState({
                loading: false,
                user
            });
        });

        this.socket.on('chatsFromUser', data => {
            let { chat } = JSON.parse(data);
            if (chat)
                this.setState({
                    chat: chat.slice(0, chat.length - 1).map(({ statement, type }) => {
                        return {
                            statement,
                            type: type === 'incoming' ? 'outgoing' : 'incoming'
                        }
                    })
                }, this.scrollDown);
        });

        this.socket.on('userDisconnected', () => {
            this.setState({
                loading: true,
                user: null,
                chat: [
                    {
                        statement: 'हम आपके परामर्श के लिए रोगियों को खोज रहे हैं',
                        type: 'incoming'
                    }
                ]
            })
        })

        this.socket.on('onlineUsers', (onlineUsers) => {
            this.setState({ onlineUsers });
        });

        this.socket.on('message', (text) => {
            this.setState({ incomingTyping: false });
            this.enterMessageIntoChat(text, 'incoming');
        });

        this.socket.on('typingChange', state => {
            this.setState({ incomingTyping: state })
            this.scrollDown();
        });

        this.socket.on('inactivity', () => {
            this.socket.disconnect();
            this.setState({ user: false, loading: true });
        });
    }

    disconnectUser = () => {
        this.socket.emit('disconnectUser');
    }

    componentWillUnmount() {
        if (this.socket)
            this.socket.disconnect();
    }

    handleMessageChange = (event) => {

        const { id, value } = event.target;
        const { textAnswered, user } = this.state;

        this.setState({
            [id]: value
        });

        if (user) {
            if ((value.length === 0) ^ (textAnswered.length === 0)) {
                this.socket.emit('typingChange', value.length > 0);
            }
        }

    }

    renderChat = () => {
        const { chat, loading, incomingTyping } = this.state;

        return (
            <div id="chat-box" className="chat-box" style={loading ? { marginBottom: 0 } : {}}>
                {
                    chat.map(({ statement, type }) => {
                        return (
                            <p
                                className={`${type}-message ${type === 'outgoing' ? 'fadeInUp' : 'fadeInRight'}`}
                                style={{ animationDelay: type === 'incoming' ? '0.6s' : '0.2s' }}
                            >
                                {statement}
                            </p>
                        );
                    })
                }

                {incomingTyping &&
                    <p className="incoming-message" >
                        <div class="dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </p>}
            </div>
        )

    }

    renderAnswers = () => {
        const { textAnswered, loading, user } = this.state;

        if (loading) return null;

        if (user) return (
            <div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
                <form onSubmit={this.sendMessage} className="message-form">
                    <input id='textAnswered' value={textAnswered} onChange={this.handleMessageChange}
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        onFocus={this.scrollDown}
                    />
                    <button type="submit" className="send">
                        <Icon.Send />
                    </button>
                </form>
            </div>
        )
    }

    render() {
        const { user, chatStarted } = this.state;

        if (!chatStarted)
            return (
                <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                    <button className="start is-green" onClick={() => {
                        this.setState({
                            chatStarted: true,
                            chat: [
                                {
                                    statement: 'हम आपके परामर्श के लिए रोगियों को खोज रहे हैं',
                                    type: 'incoming'
                                }
                            ]
                        });
                        this.connect();
                    }}>चेकअप शुरू करें</button>
                </div>
            );

        return (
            <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                {user ?
                    <button className="close-icon" onClick={this.disconnectUser}><Icon.XCircle /></button>
                    : null}
                {this.renderChat()}
                {this.renderAnswers()}
            </div>
        )
    }

}