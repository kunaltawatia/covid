import React from "react";
import * as Icon from "react-feather";
import $ from "jquery";
import _ from "lodash";

import Progress from "react-progressbar";

import axios from "axios";
import { ENDPOINT } from "../../config";

import PeerConnection from "../webrtc/PeerConnection";
import CallWindow from "../webrtc/CallWindow";
import CallModal from "../webrtc/CallModal";

const client = require("socket.io-client");

export default class Chat extends React.Component {
  state = {
    loading: true,
    chatStarted: false,
    user: null,
    incomingTyping: false,
    chat: [],
    textAnswered: "",
    actionsReveal: false,
    doctors: [],
    doctorSelected: "",

    callWindow: "",
    callModal: "",
    localSrc: null,
    peerSrc: null,
  };

  socket = null;
  pc = {};

  componentDidMount() {
    axios
      .get(ENDPOINT + "/api/doctor-list")
      .then((response) => {
        const { doctors } = response.data;
        if (doctors) {
          this.setState({ doctors });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentWillReceiveProps(props) {
    const { patient } = props;
    if (this.state.patient !== patient && this.socket) {
      this.socket.emit("changePatient", patient);
    }
  }

  sendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const { textAnswered } = this.state;
    if (textAnswered.length) {
      this.setState({ textAnswered: "" });
      this.socket.emit("message", textAnswered);
      this.enterMessageIntoChat(textAnswered, "outgoing");
    }
  };

  enterMessageIntoChat = (statement, type) => {
    const { chat } = this.state;
    this.setState(
      {
        chat: chat.concat([{ statement, type }]),
      },
      this.scrollDown
    );
  };

  scrollDown = () => {
    $("#chat-box").animate({ scrollTop: $("#chat-box")[0].scrollHeight }, 800);
  };

  connect = () => {
    const { username, hospital } = this.props;

    this.socket = client("http://localhost:3000", {
      path: "/app_chat",
      transports: ["websocket"],
      query: {
        type: "doctor",
        username,
        hospital,
      },
    });

    this.socket.on("userAlloted", (user) => {
      this.setState({
        loading: false,
        user,
      });
    });

    this.socket.on("chatsFromUser", (data) => {
      let { chat } = JSON.parse(data);
      if (chat)
        this.setState(
          {
            chat: chat.map(({ statement, type }) => {
              return {
                statement,
                type: type === "incoming" ? "outgoing" : "incoming",
              };
            }),
          },
          this.scrollDown
        );
    });

    this.socket.on("userDisconnected", () => {
      this.endCall(false);
      this.setState({
        loading: true,
        user: null,
        chat: [
          {
            statement: "हम आपके परामर्श के लिए रोगियों को खोज रहे हैं",
            type: "incoming",
          },
        ],
      });
    });

    this.socket.on("onlineUsers", (onlineUsers) => {
      this.setState({ onlineUsers });
    });

    this.socket.on("message", (text) => {
      this.setState({ incomingTyping: false });
      this.enterMessageIntoChat(text, "incoming");
    });

    this.socket.on("typingChange", (state) => {
      this.setState({ incomingTyping: state });
      this.scrollDown();
    });

    this.socket.on("inactivity", () => {
      this.socket.disconnect();
      this.endCall(false);
      this.setState({ user: false, loading: true });
    });

    this.socket.on("request", () => {
      this.setState({ callModal: "active" });
      this.scrollDown();
    });

    this.socket.on("call", (data) => {
      if (data.sdp) {
        this.pc.setRemoteDescription(data.sdp);
        if (data.sdp.type === "offer") this.pc.createAnswer();
      } else this.pc.addIceCandidate(data.candidate);
    });

    this.socket.on("end", this.endCall.bind(this, false));
  };

  startCall = (isCaller, config) => {
    this.config = config;
    this.pc = new PeerConnection(this.socket)
      .on("localStream", (src) => {
        const newState = { callWindow: "active", localSrc: src };
        if (!isCaller) newState.callModal = "";
        this.setState(newState);
      })
      .on("peerStream", (src) => this.setState({ peerSrc: src }))
      .start(isCaller, config);
  };

  rejectCall = () => {
    const { callFrom } = this.state;
    this.socket.emit("end", { to: callFrom });
    this.setState({ callModal: "" });
  };

  endCall = (isStarter) => {
    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }
    this.pc = {};
    this.config = null;
    this.setState(
      {
        callWindow: "",
        callModal: "",
        localSrc: null,
        peerSrc: null,
      },
      this.scrollDown
    );
  };

  disconnectUser = () => {
    this.socket.emit("disconnectUser");
  };

  referUser = () => {
    const { doctorSelected } = this.state;
    this.socket.emit("referUser", doctorSelected);
  };

  componentWillUnmount() {
    if (this.socket) this.socket.disconnect();
  }

  handleMessageChange = (event) => {
    const { id, value } = event.target;
    const { textAnswered, user } = this.state;

    this.setState({
      [id]: value,
    });

    if (user) {
      if ((value.length === 0) ^ (textAnswered.length === 0)) {
        this.socket.emit("typingChange", value.length > 0);
      }
    }
  };

  handleChange = (event) => {
    const { id, value } = event.target;

    this.setState({
      [id]: value,
    });
  };

  imageUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !this.socket) return;
    this.setState({ uploadingImage: 0.01 });

    const formData = new FormData();
    formData.append("image", file);

    axios
      .post("/api/image", formData, {
        onUploadProgress: (progressEvent) => {
          this.setState({
            uploadingImage: progressEvent.loaded / progressEvent.total,
          });
        },
      })
      .then((response) => {
        const { image } = response.data;
        if (this.socket) {
          this.enterMessageIntoChat("chat-img-" + image.filename, "outgoing");
          this.socket.emit("message", "chat-img-" + image.filename);
        }
        this.setState({ uploadingImage: 0, ...(image ? { image } : {}) });
      })
      .catch((err) => {
        this.setState({ uploadingImage: 0 });
      });
  };

  renderChat = () => {
    const { callModal, chat, loading, incomingTyping } = this.state;

    return (
      <div
        id="chat-box"
        className="chat-box"
        style={loading ? { marginBottom: 0 } : {}}
      >
        {chat.map(({ statement, type }) => {
          return (
            <p
              className={`${type}-message ${
                type === "outgoing" ? "fadeInUp" : "fadeInRight"
              }`}
              style={{ animationDelay: type === "incoming" ? "0.6s" : "0.2s" }}
            >
              {statement.startsWith("chat-img") ? (
                <img src={"/api/images/" + statement.split("-")[2]} />
              ) : (
                statement
              )}
            </p>
          );
        })}

        {incomingTyping && (
          <p className="incoming-message">
            <div class="dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </p>
        )}
        <CallModal
          status={callModal}
          startCall={this.startCall}
          rejectCall={this.rejectCall}
        />
      </div>
    );
  };

  renderAnswers = () => {
    const { textAnswered, loading, user, uploadingImage } = this.state;

    const callWithVideo = (video) => {
      const config = { audio: true, video };
      return () => this.startCall(true, config);
    };

    if (loading) return null;

    if (uploadingImage) {
      return (
        <div
          className="answer-box text-row fadeInUp"
          style={{ animationDelay: "1s" }}
        >
          <Progress completed={Math.floor(uploadingImage * 100)} />
        </div>
      );
    }

    if (user)
      return (
        <div
          className="answer-box text-row fadeInUp"
          style={{ animationDelay: "1s" }}
        >
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
              <button
                type="button"
                onClick={callWithVideo(true)}
                className="send"
              >
                <Icon.Video />
              </button>
            ) : null}
            {!textAnswered ? (
              <button
                type="button"
                onClick={callWithVideo(false)}
                className="send"
              >
                <Icon.PhoneCall />
              </button>
            ) : null}
            {!textAnswered ? (
              <button
                type="button"
                onClick={() => {
                  $("#imageInput").click();
                }}
                className="send"
              >
                <Icon.Image />
              </button>
            ) : null}
            <div style={{ width: 0, height: 0, overflow: "hidden" }}>
              <input
                type="file"
                id="imageInput"
                name="imageInput"
                onChange={this.imageUpload}
              />
            </div>
          </form>
        </div>
      );
  };

  renderActions = () => {
    const { actionsReveal, doctors, doctorSelected } = this.state;

    if (!actionsReveal)
      return (
        <div className="chat-actions">
          <button
            onClick={() => {
              this.setState({
                actionsReveal: true,
                doctorSelected: doctors.length ? doctors[0].username : "",
              });
            }}
          >
            <Icon.ArrowRight />
          </button>
        </div>
      );

    return (
      <div className="chat-actions expand">
        <button
          onClick={() => {
            this.setState({ actionsReveal: false });
          }}
        >
          <Icon.ArrowDown />
        </button>
        {doctors.length ? (
          <div
            className="select-row fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            <label>Refer to:</label>
            <select
              id="doctorSelected"
              value={doctorSelected}
              onChange={this.handleChange}
            >
              {doctors.map(({ username, name, post }) => {
                return (
                  <option value={username}>
                    {name}, {post}
                  </option>
                );
              })}
            </select>
            <button className="send" onClick={this.referUser}>
              <Icon.Send />
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  render() {
    const { user, chatStarted } = this.state;
    const { callWindow, localSrc, peerSrc } = this.state;

    if (!chatStarted)
      return (
        <div className="Chat fadeInUp" style={{ animationDelay: "0.7s" }}>
          <button
            className="start is-green"
            onClick={() => {
              this.setState({
                chatStarted: true,
                chat: [
                  {
                    statement: "हम आपके परामर्श के लिए रोगियों को खोज रहे हैं",
                    type: "incoming",
                  },
                ],
              });
              this.connect();
            }}
          >
            चेकअप शुरू करें
          </button>
        </div>
      );

    if (!_.isEmpty(this.config)) {
      return (
        <CallWindow
          status={callWindow}
          localSrc={localSrc}
          peerSrc={peerSrc}
          config={this.config}
          mediaDevice={this.pc.mediaDevice}
          endCall={this.endCall}
          socket={this.socket}
        />
      );
    }
    return (
      <div
        className="Chat fadeInUp"
        style={{ animationDelay: "0.7s", marginBottom: "8rem" }}
      >
        {user ? (
          <button className="close-icon" onClick={this.disconnectUser}>
            <Icon.XCircle />
          </button>
        ) : null}
        {this.renderChat()}
        {this.renderAnswers()}
        {user && this.renderActions()}
      </div>
    );
  }
}
