import "./App.css";
import "./normal.css";
import userAvatar from "./square.png";
import therabotAvatar from "./thera-bot-avatar.png";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Speech from "speak-tts";
import React from "react";

import { useState, useEffect } from "react";

function App() {
  // State adding for input and chat log
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      user: "THERA-BOT",
      message:
        "Hey, I am THERA-BOT, an AI based Mental Health Assistant,\nHow can I help you today?",
    },
    {
      user: "me",
      message: "I am feeling low today",
    },
  ]);

  // Check if speech recognition is supported
  const isSpeechRecognitionSupported =
    SpeechRecognition.browserSupportsSpeechRecognition();

  const { transcript, resetTranscript } = useSpeechRecognition();
  const speech = new Speech();

  // Clearing Chats
  const clearChats = () => {
    setChatLog([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submit");
    if (input) {
      sendMessage(input);
      // setInput("");
    }
    let chatLogNew = [...chatLog, { user: "me", message: `${input}` }];
    await setInput("");
    setChatLog(chatLogNew);

    // Fetch response to the api combining the chat log array of messages and sending it as a message to localhost:3000 as a post
    const messages = chatLogNew.map((message) => message.message).join("\n");
    const response = await fetch("http://localhost:3001/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messages,
      }),
    });

    const data = await response.json();
    setChatLog([
      ...chatLogNew,
      {
        user: "THERA-BOT",
        message: `${data.message}`,
      },
    ]);
    console.log(data.message);
  };

  const sendMessage = (message) => {
    const newMessage = {
      user: "User",
      message: message,
    };
    setChatLog((prevChatLog) => [...prevChatLog, newMessage]);
  };

  const handleSpeechToText = () => {
    if (isSpeechRecognitionSupported) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      console.log("Speech recognition is not supported in this browser.");
    }
  };

  const handleTextToSpeech = (text) => {
    speech
      .speak({
        text: text,
      })
      .then(() => {
        console.log("Text-to-speech success");
      })
      .catch((error) => {
        console.error("Error during text-to-speech:", error);
      });
  };

  React.useEffect(() => {
    speech.init().then((data) => {
      console.log("Speech initialization successful", data);
    });
  }, []);

  React.useEffect(() => {
    if (transcript) {
      setInput(transcript);
      resetTranscript();
    }
  }, [transcript]);

  const handleIncomingMessage = (message) => {
    const newMessage = {
      user: "THERA-BOT",
      message: message,
    };
    setChatLog((prevChatLog) => [...prevChatLog, newMessage]);
    handleTextToSpeech(message);
  };

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="side-menu-button" onClick={clearChats}>
          {/* <span>+</span> */}
          New Chat
        </div>
      </aside>
      <section className="chatbox">
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {/* {handleIncomingMessage(chatLog.map((message) => message))} */}
        </div>

        <div className="chat-input-holder">
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              className="mic-button"
              onClick={handleSpeechToText}
            >
              🎤
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input-textarea"
              placeholder="Type your message..."
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;

const ChatMessage = ({ message }) => {
  const isOutgoingMessage = message.user === "THERA-BOT";

  // const speech = new Speech();

  // const handleTextToSpeech = (text) => {
  //   speech
  //     .speak({
  //       text: text,
  //     })
  //     .then(() => {
  //       console.log("Text-to-speech success");
  //     })
  //     .catch((error) => {
  //       console.error("Error during text-to-speech:", error);
  //     });
  // };

  // const handleIncomingMessage = (message) => {
  //   const newMessage = {
  //     user: "THERA-BOT",
  //     message: message,
  //   };
  //   setChatLog((prevChatLog) => [...prevChatLog, newMessage]);
  //   handleTextToSpeech(message);
  // };

  return (
    <div
      className={`chat-message ${isOutgoingMessage ? "outgoing" : "incoming"}`}
    >
      <div className="avatar">
        {isOutgoingMessage ? (
          <img src={therabotAvatar} />
        ) : (
          <img src={userAvatar} />
        )}
      </div>
      <div className={`message ${isOutgoingMessage ? "outgoing" : "incoming"}`}>
        {message.message}
      </div>
      {/* {handleIncomingMessage(message.message)} */}
    </div>
  );
};
