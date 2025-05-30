import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentPath, setCurrentPath] = useState('');

  // Control de visibilidad durante la carga y actualización de la ruta
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Actualizar la ruta actual
    setCurrentPath(window.location.pathname);

    // Escuchar cambios en la ruta
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
      setIsVisible(false);
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('astro:page-load', handleRouteChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('astro:page-load', handleRouteChange);
    };
  }, []);

  // Determinar el z-index basado en la ruta
  const getZIndex = () => {
    if (currentPath === '/tienda' || currentPath === '/blog') {
      return 'z-[60]'; // Por encima de los botones flotantes
    }
    return 'z-50'; // Valor por defecto
  };

  // Determinar la posición del botón
  const getButtonPosition = () => {
    if (currentPath === '/tienda' || currentPath === '/blog') {
      return 'bottom-24'; // Por encima de los botones flotantes
    }
    return 'bottom-6'; // Posición por defecto
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Botón flotante del asistente */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${getButtonPosition()} right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${getZIndex()}`}
      >
        <FaRobot className="w-6 h-6" />
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-[calc(100%-3rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col ${getZIndex()}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaRobot className="w-6 h-6 text-white" />
              <h3 className="text-white font-semibold">Asistente Virtual</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-3">
                  <FaSpinner className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant;