import React from 'react';
import * as Icon from 'react-feather';
import $ from 'jquery';

import axios from 'axios';
import { ENDPOINT } from '../config';


export default class Chat extends React.Component {
    state = {
        questions: [],
        answers: {},
        questionIndex: 0,
        optionSelected: 0,
        textAnswered: '',
        chat: [],
        loading: true,
        questionsLoaded: false,
        suspect: false,
        chatStarted: false
    };

    componentDidMount() {

        // location
        axios.get(ENDPOINT + '/questions.json')
            .then(response => {
                const { questions } = response.data;
                if (questions)
                    this.setState({
                        questions,
                        questionsLoaded: true,
                        chat: [
                            {
                                statement: questions[0].statement,
                                type: 'incoming'
                            }
                        ],
                        loading: false
                    });
            })
            .catch((error) => {
                console.log(error);
            });
        /*  In case we need constant viewport height
        
                let viewheight = $(window).height();
                let viewwidth = $(window).width();
                let viewport = document.querySelector("meta[name=viewport]");
                viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
        */
    }

    answer = (e) => {

        if (e && e.preventDefault) e.preventDefault();

        const { questionIndex, questions, optionSelected, chat, textAnswered } = this.state;
        const { answers, type } = questions[questionIndex];
        const nextQuestion = type.startsWith('te') ? questions[questionIndex].nextQuestion : answers && answers[optionSelected] && answers[optionSelected].nextQuestion;
        const { statement } = answers ? answers[optionSelected] : {};

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
                optionSelected: 0,
                textAnswered: '',
                loading: true
            }, this.answerEntered);

    }

    final = (position) => {
        var latitude = position.coords?.latitude;
        var longitude = position.coords?.longitude;

        const { chat, answers } = this.state;
        axios.post(ENDPOINT + '/api/post-suspection', {
            answers,
            latitude,
            longitude
        })
            .then(response => {
                const { incomingChats } = response.data;
                if (incomingChats) {
                    this.setState({
                        chat: chat.concat(incomingChats)
                    }, this.scrollDown)
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    answerEntered = () => {
        this.scrollDown();
        const { questionIndex, questions, chat, answers, suspect } = this.state;

        if (questionIndex === 0) {

            if (suspect) {
                navigator.geolocation.getCurrentPosition(this.final.bind(this), this.final.bind(this));
            }
            else
                axios.post(ENDPOINT + '/api/pre-assessment', {
                    answers
                })
                    .then(response => {
                        const { suspect, incomingChats, questionIndex } = response.data;
                        if (suspect) {
                            this.setState({
                                suspect,
                                chat: chat.concat(incomingChats).concat([
                                    {
                                        statement: questions[questionIndex].statement,
                                        type: 'incoming'
                                    }
                                ]),
                                loading: false,
                                questionIndex
                            }, this.scrollDown)
                        }
                        else if (incomingChats) {
                            this.setState({
                                chat: chat.concat(incomingChats)
                            }, this.scrollDown)
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
        }
        else {
            this.setState({
                chat: chat.concat([
                    {
                        statement: questions[questionIndex].statement,
                        type: 'incoming'
                    }
                ]),
                loading: false
            }, this.scrollDown)
        }
    }

    scrollDown = () => {
        $("#chat-box").animate({ scrollTop: $("#chat-box")[0].scrollHeight }, 800);
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
        const { chat, loading } = this.state;

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
            </div>
        )

    }

    renderAnswers = () => {
        const { questions, questionIndex, optionSelected, textAnswered, loading } = this.state;
        const { answers, type, pattern } = questions[questionIndex];

        if (loading) return null;

        if (type === 'button')
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

        else if (type === 'select')
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

        else
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

    render() {
        const { questionsLoaded, chatStarted } = this.state;

        if (!questionsLoaded || !chatStarted)
            return (
                <div className="Chat animate" style={{ animationDelay: '0.7s' }}>
                    <button className="start is-green" onClick={() => {
                        this.setState({ chatStarted: true })
                    }}>चेकअप शुरू करें</button>
                </div>
            );

        return (
            <div className="Chat animate" style={{ animationDelay: '0.7s' }}>
                {this.renderChat()}
                {this.renderAnswers()}
            </div>
        )
    }

}