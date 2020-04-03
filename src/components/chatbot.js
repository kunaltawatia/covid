import React from 'react';
import * as Icon from 'react-feather';
import $ from 'jquery';

import axios from 'axios';
import { ENDPOINT } from '../config';

const client = require('socket.io-client');


export default class Chat extends React.Component {
    state = {
        questions: [],
        answers: {},
        questionIndex: 0,
        optionSelected: '0',
        textAnswered: '',
        chat: [],
        loading: true,
        questionsLoaded: false,
        suspect: false,
        chatStarted: false,
        doctor: null,
        incomingTyping: false,
        patientId: null,
        suspect: false
    };

    socket = null

    startChat = () => {
        this.setState({ loadingChat: true });
        axios.get(ENDPOINT + '/api/questions')
            .then(response => {
                const { questions, incomingChats } = response.data;
                if (questions)
                    this.setState({
                        questions,
                        questionsLoaded: true,
                        chat: incomingChats.concat([
                            {
                                statement: questions[0].statement,
                                type: 'incoming'
                            }
                        ]),
                        loading: false,
                        chatStarted: true,
                        loadingChat: false
                    });
            })
            .catch((error) => {
                this.setState({ loadingChat: false });
                alert
                    ('Error Occured!');
                console.log(error);
            });
        /*  In case we need constant viewport height
        
                let viewheight = $(window).height();
                let viewwidth = $(window).width();
                let viewport = document.querySelector("meta[name=viewport]");
                viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
        */
    }

    componentWillUnmount() {
        if (this.socket)
            this.socket.disconnect();
    }

    enterMessageIntoChat = (statement, type) => {
        const { chat } = this.state;
        this.setState({
            chat: chat.concat([{ statement, type }])
        }, this.scrollDown);
    }

    scrollDown = () => {
        $("#chat-box").animate({ scrollTop: $("#chat-box")[0].scrollHeight }, 800);
    }

    sendMessage = (e) => {
        const { doctor, textAnswered } = this.state;

        if (e && e.preventDefault)
            e.preventDefault();

        if (textAnswered.length) {
            this.setState({ textAnswered: '' });
            this.socket.emit('message', textAnswered);
            this.enterMessageIntoChat(textAnswered, 'outgoing');
        }
    }

    handleMessageChange = (event) => {
        const { id, value } = event.target;
        const { textAnswered, doctor } = this.state;

        this.setState({
            [id]: value
        });

        if ((value.length === 0) ^ (textAnswered.length === 0)) {
            this.socket.emit('typingChange', value.length > 0);
        }
    }

    connect = () => {
        const { patientId } = this.state;

        this.socket = client(ENDPOINT, {
            path: '/app_chat',
            query: {
                patientId,
                type: 'patient'
            }
        });

        this.socket.on('doctorAlloted', (doctor) => {
            this.setState({
                loading: false,
                doctor
            });
            this.socket.emit('sendChatsToDoctor', JSON.stringify({ chat: this.state.chat }));
        });

        this.socket.on('onlineUsers', (onlineUsers) => {
            this.setState({ onlineUsers });
        });

        this.socket.on('message', (text) => {
            this.setState({ incomingTyping: false })
            this.enterMessageIntoChat(text, 'incoming');
        });

        this.socket.on('typingChange', state => {
            this.setState({ incomingTyping: state })
            this.scrollDown();
        });

        this.socket.on('inactivity', () => {
            this.socket.disconnect();
            this.setState({ doctor: false, loading: true });
        });
    }

    answer = (e) => {
        const { questionIndex, questions, optionSelected, chat, textAnswered } = this.state;
        const { answers, type } = questions[questionIndex] || {};

        if (e && e.preventDefault)
            e.preventDefault();

        const { statement } = answers ? answers[optionSelected] : {};
        const nextQuestion = type.startsWith('te') ?
            questions[questionIndex].nextQuestion : (answers && answers[optionSelected] && answers[optionSelected].nextQuestion);

        if (!type.startsWith('te') || textAnswered)
            this.setState({
                answers: {
                    ...this.state.answers,
                    [questionIndex]: type.startsWith('te') ? textAnswered : optionSelected
                },

                chat: chat.concat([
                    {
                        statement: type.startsWith('te') ? textAnswered : statement,
                        type: 'outgoing'
                    }]),

                questionIndex: nextQuestion,
                optionSelected: '0',
                textAnswered: '',
                loading: true
            }, this.answerEntered);

    }

    /* this function is called when chatbot completes its loop and is passed in location */
    final = (position) => {
        const { latitude, longitude } = (position && position.coords) || {};
        const { chat, answers, questions } = this.state;

        axios.post(ENDPOINT + '/api/assessment', {
            answers,
            latitude,
            longitude
        })
            .then(response => {
                const { incomingChats, suspect, patientId, questionIndex } = response.data;
                if (suspect) {
                    this.setState({
                        suspect: true,
                        patientId,
                        questionIndex,
                        chat: chat.concat(incomingChats).concat([
                            {
                                statement: questions[questionIndex].statement,
                                type: 'incoming'
                            }
                        ]),
                        loading: false
                    }, this.scrollDown);
                }
                else {
                    if (incomingChats) {
                        this.setState({
                            chat: chat.concat(incomingChats),
                        }, this.scrollDown);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    answerEntered = () => {
        const { questionIndex, questions, chat, answers, suspect } = this.state;

        /* scroll because a message was just entered into chat */
        this.scrollDown();

        /* question index is 0, implies that chatbot questioning loop has completed, and final function is called */
        if (questionIndex === 0) {
            if (suspect) {
                if (answers['17'] === '0')
                    this.setState({
                        chat: chat.concat([
                            {
                                statement: 'हम आपके परामर्श के लिए डॉक्टरों की खोज कर रहे हैं',
                                type: 'incoming'
                            }
                        ])
                    }, this.connect);
                else {
                    this.setState({
                        chat: chat.concat([
                            {
                                statement: 'कृपया अपनी सेहत का ख़याल रखें।',
                                type: 'incoming'
                            }
                        ])
                    });
                }
                this.scrollDown();
            }
            else
                navigator.geolocation.getCurrentPosition(
                    this.final.bind(this), this.final.bind(this)
                );
        }
        else {
            this.enterMessageIntoChat(questions[questionIndex].statement, 'incoming');
            this.setState({ loading: false });
        }
    }

    handleChange = (event) => {
        const { id, value } = event.target;

        this.setState({
            [id]: value
        }, () => {
            const { questions, questionIndex } = this.state;
            const { type } = questions[questionIndex];

            if (type === 'button') this.answer();
        });
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
                {/* Searching For Doctor loading... */}
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
        const { questions, questionIndex, optionSelected, textAnswered, loading, doctor } = this.state;
        const { answers, type, pattern } = questions[questionIndex];

        if (loading)
            return null;

        else if (doctor) {
            return (
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
            );
        }

        else if (type === 'button') {
            return (
                <div className="answer-box button-row">
                    {answers.map(({ value, statement }, index) => {
                        return (
                            <button
                                value={value}
                                id="optionSelected"
                                onClick={this.handleChange}
                                className="fadeInUp"
                                style={{ animationDelay: `1.${index}s` }}
                            >
                                {statement}
                            </button>
                        )
                    })}
                </div>
            );
        }

        else if (type === 'select') {
            return (
                <div className="answer-box select-row fadeInUp" style={{ animationDelay: '1s' }}>
                    <select id="optionSelected" value={optionSelected} onChange={this.handleChange}>
                        {
                            answers.map(({ value, statement }) => {
                                return (
                                    <option value={value}>
                                        {statement}
                                    </option>
                                )
                            })
                        }
                    </select>
                    <button onClick={this.answer} className="send">
                        <Icon.Send />
                    </button>
                </div>
            );
        }

        else {
            return (
                <div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
                    <form onSubmit={this.answer} className="message-form">
                        <input id='textAnswered' value={textAnswered} onChange={this.handleChange}
                            type={type}
                            pattern={pattern}
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
            );
        }
    }

    render() {
        const { questionsLoaded, chatStarted } = this.state;

        if (!questionsLoaded || !chatStarted)
            return (
                <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                    <button className="start is-green" onClick={this.startChat}>डॉक्टरों द्वारा चेकउप शुरू करे</button>
                </div>
            );

        return (
            <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                {this.renderChat()}
                {this.renderAnswers()}
            </div>
        )
    }

}