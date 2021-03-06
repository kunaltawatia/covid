import React from 'react';
import * as Icon from 'react-feather';
import $ from 'jquery';
import _ from 'lodash';

import Progress from 'react-progressbar';

import axios from 'axios';
import { ENDPOINT } from '../config';

import PeerConnection from './webrtc/PeerConnection';
import CallWindow from './webrtc/CallWindow';
import CallModal from './webrtc/CallModal';

const client = require('socket.io-client');

export default class Chat extends React.Component {
	state = {
		questions: [],
		answers: {},

		optionSelected: '0',
		textAnswered: '',

		chat: [],
		loadingChat: true,
		requesting: false,

		connectToDoctor: false,

		patientId: null,
		doctor: null,
		incomingTyping: false,

		answerBoxHidden: true,
		answerFormat: {},
		questionDetails: {},

		callWindow: '',
		callModal: '',
		localSrc: null,
		peerSrc: null
	};

	socket = null;
	pc = {};

	componentDidMount() {
		axios
			.get(ENDPOINT + '/api/questions')
			.then((response) => {
				const { questions, incomingChats } = response.data;
				if (questions)
					this.setState(
						{
							questions,
							chat: incomingChats,
							loadingChat: false
						},
						() => {
							this.setQuestion(questions[0]);
						}
					);
			})
			.catch((error) => {
				// this.setState({ loadingChat: false });
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
		if (this.socket) this.socket.disconnect();
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
	};

	enterMessageIntoChat = (statement, type) => {
		const { chat } = this.state;
		this.setState(
			{
				chat: chat.concat([{ statement, type }])
			},
			this.scrollDown
		);
	};

	getQuestionById = (id) => {
		const { questions } = this.state;
		for (var i = 0; i < questions.length; i++) {
			if (questions[i].id === id) return questions[i];
		}
		return null;
	};

	scrollDown = () => {
		if ($('#chat-box').length)
			$('#chat-box').animate({ scrollTop: $('#chat-box')[0].scrollHeight }, 800);
	};

	sendMessage = (e) => {
		const { textAnswered, doctor } = this.state;

		if (e && e.preventDefault) e.preventDefault();

		if (textAnswered.length) {
			this.setState({ textAnswered: '' });
			this.socket.emit('message', { message: textAnswered, to: doctor });
			this.enterMessageIntoChat(textAnswered, 'outgoing');
		}
	};

	handleMessageChange = (event) => {
		const { id, value } = event.target;
		const { textAnswered, doctor } = this.state;

		this.setState({
			[id]: value
		});

		if ((value.length === 0) ^ (textAnswered.length === 0)) {
			this.socket.emit('typingChange', { state: value.length > 0, to: doctor });
		}
	};

	connect = () => {
		const { patientId } = this.state;

		this.setState({ requesting: true });

		this.socket = client(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/', {
			path: '/app_chat',
			transports: ['websocket'],
			query: {
				patientId,
				type: 'patient'
			}
		});

		this.socket.on('doctorAlloted', (doctor) => {
			this.setState({
				answerBoxHidden: false,
				requesting: false,
				doctor
			});
		});

		this.socket.on('onlineUsers', (onlineUsers) => {
			this.setState({ onlineUsers });
		});

		this.socket.on('message', ({ message, from }) => {
			if (from === this.state.doctor) {
				this.setState({ incomingTyping: false });
				this.enterMessageIntoChat(message, 'incoming');
			}
		});

		this.socket.on('typingChange', ({ state, from }) => {
			if (from === this.state.doctor) {
				this.setState({ incomingTyping: state });
				this.scrollDown();
			}
		});

		this.socket.on('referUser', (doctor) => {
			this.endCall(false);
			this.setState({ doctor, answerBoxHidden: true });
		});

		this.socket.on('request', (from) => {
			if (from === this.state.doctor) {
				this.setState({ callModal: 'active' });
				this.scrollDown();
			}
		});

		this.socket.on('call', ({ data, from }) => {
			if (from === this.state.doctor) {
				if (data.sdp) {
					this.pc.setRemoteDescription(data.sdp);
					if (data.sdp.type === 'offer') this.pc.createAnswer();
				} else this.pc.addIceCandidate(data.candidate);
			}
		});

		this.socket.on('end', (from) => {
			if (from === this.state.doctor) this.endCall(false);
		});
	};

	startCall = (isCaller, config) => {
		this.config = config;
		this.pc = new PeerConnection(this.socket, this.state.doctor)
			.on('localStream', (src) => {
				const newState = { callWindow: 'active', localSrc: src };
				if (!isCaller) newState.callModal = '';
				this.setState(newState);
			})
			.on('peerStream', (src) => this.setState({ peerSrc: src }))
			.start(isCaller, config);
	};

	rejectCall = () => {
		const { doctor } = this.state;
		this.socket.emit('end', doctor);
		this.setState({ callModal: '' });
	};

	endCall = (isStarter) => {
		if (_.isFunction(this.pc.stop)) {
			this.pc.stop(isStarter);
		}
		this.pc = {};
		this.config = null;
		this.setState(
			{
				callWindow: '',
				callModal: '',
				localSrc: null,
				peerSrc: null
			},
			this.scrollDown
		);
	};

	answer = (event) => {
		const { optionSelected, textAnswered, questionDetails, answerFormat } = this.state;
		const { answers, type } = answerFormat;
		const { id } = questionDetails;
		const textTypeAnswer = ['text', 'tel'].includes(type);

		if (event && event.preventDefault) event.preventDefault();

		if (!textTypeAnswer || textAnswered) {
			this.enterMessageIntoChat(
				textTypeAnswer ? textAnswered : answers[optionSelected].statement,
				'outgoing'
			);
			this.setState(
				{
					answers: {
						...this.state.answers,
						[id]: textTypeAnswer ? textAnswered : optionSelected
					},
					answerBoxHidden: true
				},
				this.answerEntered
			);
		}
	};

	/* this function is called when chatbot completes its loop and is passed in location */
	completedChatbot = (position) => {
		const { latitude, longitude } = (position && position.coords) || {};
		const { chat, answers } = this.state;

		this.setState({ requesting: true });

		axios
			.post(ENDPOINT + '/api/assessment', {
				answers,
				latitude,
				longitude,
				chat
			})
			.then((response) => {
				const { incomingChats, connectToDoctor, patientId, question } = response.data;
				if (connectToDoctor) {
					this.setState(
						{
							connectToDoctor,
							patientId,
							chat: chat.concat(incomingChats)
						},
						this.scrollDown
					);
					this.setQuestion(question);
				} else {
					if (incomingChats) {
						this.setState(
							{
								chat: chat.concat(incomingChats)
							},
							this.scrollDown
						);
					}
				}
				this.setState({ requesting: false });
			})
			.catch((error) => {
				this.setState({ requesting: false });
				console.log(error);
			});
	};

	answerEntered = () => {
		const { connectToDoctor, optionSelected, answerFormat, questionDetails } = this.state;
		const { type, answers } = answerFormat;
		const textTypeAnswer = ['text', 'tel'].includes(type);
		const { nextQuestion } = textTypeAnswer ? questionDetails : answers[optionSelected];

		/* question index is 0, implies that chatbot questioning loop has completed, and final function is called */
		if (nextQuestion === 0) {
			if (connectToDoctor) {
				if (optionSelected === '0') this.connect();
				else this.enterMessageIntoChat('कृपया अपनी सेहत का ख़याल रखें।', 'incoming');
			} else
				navigator.geolocation.getCurrentPosition(
					this.completedChatbot.bind(this),
					this.completedChatbot.bind(this)
				);
		} else {
			const question = this.getQuestionById(nextQuestion);
			this.setQuestion(question);
		}
	};

	handleChange = (event) => {
		const { id, value } = event.target;

		this.setState(
			{
				[id]: value
			},
			() => {
				const { type } = this.state.answerFormat;
				if (type === 'button') this.answer();
			}
		);
	};

	imageUpload = (event) => {
		const file = event.target.files[0];
		if (!file || !this.socket) return;
		this.setState({ uploadingImage: 0.01 });
		const { doctor } = this.state;

		const formData = new FormData();
		formData.append('image', file);

		axios
			.post('/api/image', formData, {
				onUploadProgress: (progressEvent) => {
					this.setState({
						uploadingImage: progressEvent.loaded / progressEvent.total
					});
				}
			})
			.then((response) => {
				const { image } = response.data;
				if (this.socket) {
					this.enterMessageIntoChat('chat-img-' + image.filename, 'outgoing');
					this.socket.emit('message', { message: 'chat-img-' + image.filename, to: doctor });
				}
				this.setState({ uploadingImage: 0, ...(image ? { image } : {}) });
			})
			.catch((err) => {
				this.setState({ uploadingImage: 0 });
			});
	};

	renderChat = () => {
		const {
			callModal,
			chat,
			answerBoxHidden,
			incomingTyping,
			loadingChat,
			requesting
		} = this.state;

		if (loadingChat) return null;

		return (
			<div id="chat-box" className="chat-box" style={answerBoxHidden ? { marginBottom: 0 } : {}}>
				{chat.map(({ statement, type }) => {
					return (
						<p
							className={`${type}-message ${type === 'outgoing' ? 'fadeInUp' : 'fadeInRight'}`}
							style={{ animationDelay: type === 'incoming' ? '0.6s' : '0.2s' }}
						>
							{statement.startsWith('chat-img') ? (
								<img src={'/api/images/' + statement.split('-')[2]} />
							) : (
								statement
							)}
						</p>
					);
				})}
				{incomingTyping || requesting ? (
					<p className="incoming-message">
						<div class="dots">
							<div class="dot"></div>
							<div class="dot"></div>
							<div class="dot"></div>
						</div>
					</p>
				) : null}
				<CallModal status={callModal} startCall={this.startCall} rejectCall={this.rejectCall} />
			</div>
		);
	};

	renderAnswers = () => {
		const {
			optionSelected,
			textAnswered,
			answerBoxHidden,
			doctor,
			loadingChat,
			uploadingImage
		} = this.state;
		const { answers, type, pattern } = this.state.answerFormat;

		const callWithVideo = (video) => {
			const config = { audio: true, video };
			return () => this.startCall(true, config);
		};
		/* no answers allowed */
		if (answerBoxHidden || loadingChat) return null;
		/* chatting with a doctor, so different set of functions
		 */ else if (uploadingImage) {
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<Progress completed={Math.floor(uploadingImage * 100)} />
				</div>
			);
		} else if (doctor) {
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<form onSubmit={this.sendMessage} className="message-form">
						<input
							id="textAnswered"
							value={textAnswered}
							onChange={this.handleMessageChange}
							type="text"
							autoComplete="off"
							autoCorrect="off"
							spellCheck="false"
							onFocus={this.scrollDown}
						/>
						{textAnswered ? (
							<button type="submit" className="send">
								<Icon.Send />
							</button>
						) : null}
						{!textAnswered ? (
							<button type="button" onClick={callWithVideo(true)} className="send">
								<Icon.Video />
							</button>
						) : null}
						{!textAnswered ? (
							<button type="button" onClick={callWithVideo(false)} className="send">
								<Icon.PhoneCall />
							</button>
						) : null}
						{!textAnswered ? (
							<button
								type="button"
								onClick={() => {
									$('#imageInput').click();
								}}
								className="send"
							>
								<Icon.Image />
							</button>
						) : null}
						<div style={{ width: 0, height: 0, overflow: 'hidden' }}>
							<input
								type="file"
								id="imageInput"
								name="imageInput"
								onChange={this.imageUpload}
								accept="image/*"
							/>
						</div>
					</form>
				</div>
			);
		} else if (type === 'button') {
			/* different types of answer*/
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
						);
					})}
				</div>
			);
		} else if (type === 'select') {
			return (
				<div className="answer-box select-row fadeInUp" style={{ animationDelay: '1s' }}>
					<select id="optionSelected" value={optionSelected} onChange={this.handleChange}>
						{answers.map(({ value, statement }) => {
							return <option value={value}>{statement}</option>;
						})}
					</select>
					<button onClick={this.answer} className="send">
						<Icon.Send />
					</button>
				</div>
			);
		} else {
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<form onSubmit={this.answer} className="message-form">
						<input
							id="textAnswered"
							value={textAnswered}
							onChange={this.handleChange}
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
	};

	render() {
		const { loadingChat } = this.state;
		const { callWindow, localSrc, peerSrc } = this.state;

		if (!_.isEmpty(this.config)) {
			return (
				<CallWindow
					status={callWindow}
					localSrc={localSrc}
					peerSrc={peerSrc}
					config={this.config}
					mediaDevice={this.pc.mediaDevice}
					endCall={this.endCall}
				/>
			);
		}

		return (
			<div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
				{loadingChat && <div class="lds-dual-ring"></div>}
				{this.renderChat()}
				{this.renderAnswers()}
			</div>
		);
	}
}
