// src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { chatbotAPI } from "../api";
import { FaRobot, FaPaperPlane, FaTimes, FaComments, FaThumbsUp, FaThumbsDown, FaRegCommentDots } from "react-icons/fa";

function ChatBot() {
  const { user } = React.useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Bonjour 👋 Je suis **StageFlow AI, votre assistant intelligent pour les stages !\n\nJe peux vous aider à :\n• 🔍 Trouver des offres de stage\n• 📝 Postuler en quelques clics\n• 📊 Suivre vos candidatures\n• 💡 Obtenir des conseils CV\n\nComment puis-je vous aider aujourd'hui ?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: new Date()
    },
  ]);
  
  const messagesEndRef = useRef(null);
  const chatbotBodyRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const sendMessage = async (customText = null) => {
    const textToSend = customText || input.trim();
    if (!textToSend) return;

    const now = new Date();
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: now
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const recentHistory = messages.slice(-5).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));
      
      const data = await chatbotAPI.send(textToSend, recentHistory, user);
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error("Erreur:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "🤖 Service momentanément indisponible. Veuillez réessayer dans quelques instants.\n\n📧 Contact: support@stageflow.com",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    { icon: "🔍", text: "Trouver un stage" },
    { icon: "💻", text: "Stages informatique" },
    { icon: "📝", text: "Comment postuler ?" },
    { icon: "📊", text: "Mes candidatures" },
    { icon: "❓", text: "Aide" }
  ];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Grouper les messages par heure (optionnel)
  const getTimeSeparator = (currentTime, prevTime) => {
    if (!prevTime) return true;
    const diff = Math.abs(currentTime - prevTime);
    return diff > 30 * 60 * 1000; // 30 minutes
  };

  return (
    <>
      {/* Bouton toggle */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
        {!isOpen && messages.length > 1 && (
          <span className="chatbot-toggle-badge">{messages.length - 1}</span>
        )}
      </button>

      {/* Fenêtre chat */}
      <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">
              <FaRobot />
              <span className="chatbot-avatar-online"></span>
            </div>
            <div className="chatbot-header-info">
              <h3>StageFlow AI</h3>
              <p>{user ? `👋 ${user.name || user.email?.split('@')[0]}` : "✨ En ligne"}</p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button className="chatbot-header-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body des messages */}
        <div className="chatbot-body" ref={chatbotBodyRef}>
          {messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showSeparator = getTimeSeparator(msg.timestamp, prevMsg?.timestamp);
            
            return (
              <React.Fragment key={msg.id}>
                {showSeparator && idx > 0 && (
                  <div className="chatbot-time-sep">
                    {msg.time}
                  </div>
                )}
                <div className={`chatbot-message ${msg.sender}`}>
                  {msg.sender === "bot" && (
                    <div className="chatbot-msg-avatar">
                      <FaRegCommentDots />
                    </div>
                  )}
                  <div className="chatbot-bubble">
                    <div className="chatbot-bubble-content">
                      <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                    </div>
                    <div className="chatbot-bubble-time">{msg.time}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="chatbot-typing">
              <div className="chatbot-msg-avatar">
                <FaRobot />
              </div>
              <div className="chatbot-typing-bubble">
                <div className="chatbot-typing-dot"></div>
                <div className="chatbot-typing-dot"></div>
                <div className="chatbot-typing-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        <div className="chatbot-quick-replies">
          {quickReplies.map((reply, i) => (
            <button 
              key={i} 
              className="chatbot-quick-reply" 
              onClick={() => sendMessage(reply.text)}
            >
              {reply.icon} {reply.text}
            </button>
          ))}
        </div>

        {/* Footer input */}
        <div className="chatbot-footer">
          <div className="chatbot-input-wrapper">
            <input
              type="text"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
          </div>
          <button 
            className="chatbot-send-btn" 
            onClick={() => sendMessage()} 
            disabled={isTyping || !input.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatBot;