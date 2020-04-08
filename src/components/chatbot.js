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

        optionSelected: '0',
        textAnswered: '',

        chat: [],
        loadingChat: true,

        connectToDoctor: false,

        patientId: null,
        doctor: null,
        incomingTyping: false,

        answerBoxHidden: true,
        answerFormat: {},
        questionDetails: {}
    };

    socket = null;

    componentDidMount() {
        axios.get(ENDPOINT + '/api/questions')
            .then(response => {
                const { questions, incomingChats } = response.data;
                if (questions)
                    this.setState({
                        questions,
                        chat: incomingChats,
                        loadingChat: false
                    }, () => { this.setQuestion(questions[0]); });
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

    componentWillUnmount() {
        if (this.socket)
            this.socket.disconnect();
    }

    setQuestion = (question) => {
        const { statement, type, answers, pattern, id, nextQuestion } = question;

        this.enterMessageIntoChat(statement, 'incoming');
        this.setState({
            answerBoxHidden: false,
            textAnswered: '',
            optionSelected: '0',
            answerFormat: { type, answers, pattern },
            questionDetails: { statement, id, nextQuestion }
        });
    }

    enterMessageIntoChat = (statement, type) => {
        const { chat } = this.state;
        this.setState({
            chat: chat.concat([{ statement, type }])
        }, this.scrollDown);
    }

    getQuestionById = (id) => {
        const { questions } = this.state;
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].id === id)
                return questions[i];
        }
        return null;
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
                answerBoxHidden: false,
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
            this.setState({ doctor: false, answerBoxHidden: true });
        });

        this.socket.on('referUser', () => {
            this.setState({ doctor: false, answerBoxHidden: true });
        });
    }

    answer = (event) => {
        const { optionSelected, textAnswered, questionDetails, answerFormat } = this.state;
        const { answers, type } = answerFormat;
        const { id } = questionDetails;
        const textTypeAnswer = ["text", "tel"].includes(type);

        if (event && event.preventDefault)
            event.preventDefault();

        if (!textTypeAnswer || textAnswered) {
            this.enterMessageIntoChat(textTypeAnswer ? textAnswered : answers[optionSelected].statement, 'outgoing');
            this.setState({
                answers: {
                    ...this.state.answers,
                    [id]: textTypeAnswer ? textAnswered : optionSelected
                },
                answerBoxHidden: true
            }, this.answerEntered);
        }
    }

    /* this function is called when chatbot completes its loop and is passed in location */
    completedChatbot = (position) => {
        const { latitude, longitude } = (position && position.coords) || {};
        const { chat, answers } = this.state;

        axios.post(ENDPOINT + '/api/assessment', {
            answers,
            latitude,
            longitude,
            chat
        })
            .then(response => {
                const { incomingChats, connectToDoctor, patientId, question } = response.data;
                if (connectToDoctor) {
                    this.setState({
                        connectToDoctor,
                        patientId,
                        chat: chat.concat(incomingChats)
                    }, this.scrollDown);
                    this.setQuestion(question);
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
        const { connectToDoctor, optionSelected, answerFormat, questionDetails } = this.state;
        const { type, answers } = answerFormat;
        const textTypeAnswer = ["text", "tel"].includes(type);
        const { nextQuestion } = textTypeAnswer ? questionDetails : answers[optionSelected];

        /* question index is 0, implies that chatbot questioning loop has completed, and final function is called */
        if (nextQuestion === 0) {
            if (connectToDoctor) {
                if (optionSelected === '0')
                    this.connect();
                else
                    this.enterMessageIntoChat('कृपया अपनी सेहत का ख़याल रखें।', 'incoming');
            }
            else
                navigator.geolocation.getCurrentPosition(
                    this.completedChatbot.bind(this), this.completedChatbot.bind(this)
                );
        }
        else {
            const question = this.getQuestionById(nextQuestion);
            this.setQuestion(question);
        }
    }

    handleChange = (event) => {
        const { id, value } = event.target;

        this.setState({
            [id]: value
        }, () => {
            const { type } = this.state.answerFormat;
            if (type === 'button')
                this.answer();
        });
    }

    renderChat = () => {
        const { chat, answerBoxHidden, incomingTyping, loadingChat } = this.state;

        if (loadingChat)
            return null;

        return (
            <div id="chat-box" className="chat-box" style={answerBoxHidden ? { marginBottom: 0 } : {}}>
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
                {/* Searching For Doctor answerBoxHidden... */}
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
        const { optionSelected, textAnswered, answerBoxHidden, doctor, loadingChat } = this.state;
        const { answers, type, pattern } = this.state.answerFormat;

        /* no answers allowed */
        if (answerBoxHidden || loadingChat)
            return null;

        /* chatting with a doctor, so different set of functions */
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

        /* different types of answer*/
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
        const { loadingChat } = this.state;

        return (
            <div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
                {loadingChat && <div class="lds-dual-ring"></div>}
                {this.renderChat()}
                {this.renderAnswers()}
            </div>
        )
    }

}