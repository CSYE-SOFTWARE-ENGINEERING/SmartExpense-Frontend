import React from 'react';
import './ChatbotButton.css';

const ChatbotButton = ({ chatbotLink }) => {
  return (
    <a 
      href={chatbotLink} 
      className="chatbot-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="chatbot-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14v2h2V6h-2zm0 4v8h2v-8h-2z"/>
        </svg>
      </div>
      <span className="chatbot-text">Chat with us</span>
    </a>
  );
};

export default ChatbotButton;