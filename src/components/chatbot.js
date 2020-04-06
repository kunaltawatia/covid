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
        loadingChat: true,
        questionsLoaded: false,
        suspect: false,
        chatStarted: false,
        doctor: null,
        incomingTyping: false,
        patientId: null,
        hospitals: [],
        hospitalSelected: '',
        hospital: ''
    };

    socket = null

    componentDidMount() {
        axios.get(ENDPOINT + '/api/questions')
            .then(response => {
                const { questions, incomingChats, hospitals, chat, hospital, patientId } = response.data;
                if (chat && chat.length) {
                    this.setState({
                        previousChat: chat,
                        hospital,
                        patientId
                    });
                }
                if (questions)
                    this.setState({
                        questions,
                        hospitals,
                        questionsLoaded: true,
                        chat: incomingChats.concat([
                            {
                                statement: questions[0].statement,
                                type: 'incoming'
                            }
                        ]),
                        loading: false,
                        loadingChat: false
                    });
            })
            .catch((error) => {
                this.setState({ loadingChat: false });
                console.log(error);
            });
        /*  In case we need constant viewport height
        
                let viewheight = $(window).height();
                let viewwidth = $(window).width();
                let viewport = document.querySelector("meta[name=viewport]");
                viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
        */

    }

    startChat = () => {
        const { optionSelected, hospitals } = this.state;
        this.setState({ chatStarted: true, hospital: hospitals[optionSelected].hospital });
    }

    startPreviousChat = () => {
        const { previousChat } = this.state;
        this.setState({ chat: previousChat, previousChat: null, chatStarted: true, loading: true }, this.scrollDown);
        this.connect();
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
        const { textAnswered } = this.state;

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
        const { textAnswered } = this.state;

        this.setState({
            [id]: value
        });

        if ((value.length === 0) ^ (textAnswered.length === 0)) {
            this.socket.emit('typingChange', value.length > 0);
        }
    }

    connect = () => {
        const { patientId, hospital } = this.state;

        this.socket = client(ENDPOINT, {
            path: '/app_chat',
            query: {
                patientId,
                hospital,
                type: 'patient'
            }
        });

        this.socket.on('doctorAlloted', (doctor) => {
            this.setState({
                loading: false,
                doctor
            });
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
        const { chat, answers, questions, hospital } = this.state;

        axios.post(ENDPOINT + '/api/assessment', {
            answers,
            latitude,
            longitude,
            hospital,
            chat
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
                if (answers['18'] === '0')
                    this.connect();
                else
                    this.enterMessageIntoChat('कृपया अपनी सेहत का ख़याल रखें।', 'incoming');
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
        const { chatStarted, optionSelected, hospitals, loadingChat, previousChat } = this.state;

        if (loadingChat)
            return (
                < div className="Chat fadeInUp" >
                    <div class="lds-dual-ring"></div>
                </div >
            );
        if (previousChat)
            return (
                <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                    <p className="incoming-message">क्या आप पिछले परामर्श को जारी रखना चाहते हैं</p>
                    <div className="answer-box button-row">
                        <button
                            onClick={this.startPreviousChat}
                            className="fadeInUp"
                            style={{ animationDelay: `1s` }}
                        >
                            हाँ
                    </button>
                        <button
                            onClick={() => { this.setState({ previousChat: null, hospital: '', patientId: null }) }}
                            className="fadeInUp"
                            style={{ animationDelay: `1.1s` }}
                        >
                            नहीं
                    </button>
                    </div>
                </div >
            )
        if (!chatStarted)
            return (
                <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                    <p className="incoming-message">अस्पताल चुनकर चेकअप शुरू करे</p>
                    <div className="answer-box select-row fadeInUp" style={{ animationDelay: '1s' }}>
                        <select id="optionSelected" value={optionSelected} onChange={this.handleChange}>
                            {
                                hospitals.map(({ value, hospital }) => {
                                    return (
                                        <option value={value}>
                                            {hospital}
                                        </option>
                                    )
                                })
                            }
                        </select>
                        <button onClick={this.startChat} className="send">
                            <Icon.Send />
                        </button>
                    </div>
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