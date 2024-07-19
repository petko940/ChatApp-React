import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {});

function Chat() {
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('newMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        socket.on('chatHistory', (history) => {
            setMessages(history);
        });

        return () => {
            socket.off('newMessage');
            socket.off('chatHistory');
        };
    }, []);

    const handleJoinChat = () => {
        if (username.trim() !== '') {
            socket.connect();
            socket.emit('joinChat', username);
            setIsConnected(true);
        } else {
            alert('Please enter a username');
        }
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (currentMessage.trim() !== '') {
            socket.emit('sendMessage', currentMessage);
            setCurrentMessage('');
        }
    };

    const handleLeaveChat = () => {
        socket.disconnect();
        setIsConnected(false);
        setUsername('');
    };

    return (
        <>
            {/* {username} */}
            <div className="chat-app">
                {!isConnected ? (
                    <div>
                        <h2>Join Chat</h2>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <button onClick={handleJoinChat}>Join</button>
                    </div>
                ) : (
                    <div>
                        <h2>Chat</h2>
                        <ul className="message-list">
                            {messages.map((message, index) => (
                                <li key={index}>
                                    <span className="username">{message.username}:</span> {message.message}
                                    <span className="timestamp">{message.timestamp}</span>
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                placeholder="Type your message..."
                            />
                            <button type="submit">Send</button>
                        </form>
                        <button type="button" onClick={handleLeaveChat}>Leave</button>
                    </div>
                )}
            </div>


        </>
    );
}

export default Chat;
