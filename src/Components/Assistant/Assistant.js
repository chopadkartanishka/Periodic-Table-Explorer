import React, { useState, useRef, useEffect } from 'react';
import { useElement } from '../../contexts/ElementContext';
import { MessageSquare, Send, X, Loader2, Sparkles } from 'lucide-react';
import './Assistant.css';

const SYSTEM_PROMPT = `You are a chemistry assistant specialized in the periodic table.

Your responsibilities:
1) Answer questions related only to chemical elements, their properties, and periodic trends.
2) Provide accurate, concise, and educational explanations.
3) Focus on topics such as atomic number, atomic mass, electron configuration, valency, electronegativity, atomic radius, ionization energy, and classification of elements.

Rules:
1) Do not answer questions outside chemistry or the periodic table.
2) If a question is unrelated, politely respond that you can only help with periodic table and chemistry-related queries.
3) Keep answers clear and to the point, avoiding unnecessary detail.
4) Do NOT use any Markdown formatting in your response. Output pure plain text only. Avoid using bold (**), italics (*), or standard markdown bullet points.

If element context is provided (e.g., user clicked an element), incorporate that into your response.`;

export default function Assistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your Chemistry Assistant. Ask me anything about the periodic table or chemical elements.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedElement } = useElement();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleAssistant = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // CRA inlines REACT_APP_* vars at build time; avoid process.env in the browser.
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.");
      }

      // We use standard fetch for browser usage to avoid node-specific dependencies with older SDks if any
      let promptText = `${SYSTEM_PROMPT}\n\n`;
      if (selectedElement) {
        promptText += `Context: The user currently has the element ${selectedElement.name} (Symbol: ${selectedElement.symbol}, Atomic Number: ${selectedElement.number}) selected.\n\n`;
      }
      
      // Constructing history
      const historyContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      promptText += `Chat History:\n${historyContext}\n\nUser: ${userMessage}\nAssistant:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }],
          generationConfig: {
            temperature: 0.2,
          }
        })
      });

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (!response.ok) {
        throw new Error("Failed to communicate with the API. Please try again.");
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/\*\*/g, '').replace(/^\s*\* /gm, '- ');
        setMessages(prev => [...prev, { role: 'model', text: rawText }]);
      } else {
        throw new Error("Received an unexpected response format from the API.");
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I ran into an issue processing that. Please try again or check the API key configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="assistant-fab" 
        onClick={toggleAssistant}
        aria-label="Toggle Chemistry Assistant"
      >
        <Sparkles size={24} />
      </button>

      {isOpen && (
        <div className="assistant-window">
          <div className="assistant-header">
            <div className="assistant-title">
              <MessageSquare size={18} />
              <span>Chemistry Assistant</span>
            </div>
            <button className="assistant-close" onClick={toggleAssistant}>
              <X size={18} />
            </button>
          </div>

          <div className="assistant-context">
            {selectedElement ? (
              <span className="context-badge active">
                Context: {selectedElement.name}
              </span>
            ) : (
              <span className="context-badge">
                No element selected
              </span>
            )}
          </div>

          <div className="assistant-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message model">
                <div className="message-content loading">
                  <Loader2 className="spinner" size={16} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="assistant-error">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="assistant-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about elements or chemistry..."
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
