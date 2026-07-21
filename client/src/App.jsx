import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiBar from './components/KpiBar';
import Chat from './components/Chat';
import InputBox from './components/InputBox';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isKpiLoading, setIsKpiLoading] = useState(false);
  const [kpiSummary, setKpiSummary] = useState(null);
  const [showKpi, setShowKpi] = useState(true);

  // Dark mode state initialized from localStorage or default true (dark mode)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('skylark_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  // Sync dark class on document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('skylark_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('skylark_theme', 'light');
    }
  }, [darkMode]);

  const fetchKpiSummary = async () => {
    setIsKpiLoading(true);
    try {
      const res = await fetch('/api/summary');
      const data = await res.json();
      if (data.success && data.summary) {
        setKpiSummary(data.summary);
      }
    } catch (err) {
      console.log('KPI summary fetch fallback:', err.message);
    } finally {
      setIsKpiLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiSummary();
  }, []);

  const handleSendMessage = async (userText) => {
    if (!userText || !userText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { sender: 'user', text: userText, timestamp: timeStr };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          sender: 'bot',
          text: data.answer,
          sources: data.sources,
          metrics: data.metrics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (data.metrics) {
          setKpiSummary((prev) => ({
            ...prev,
            pipeline: data.metrics.pipeline || prev?.pipeline,
            revenue: data.metrics.revenue || prev?.revenue,
            risks: data.metrics.risks || prev?.risks,
          }));
        }
      } else {
        throw new Error(data.error || 'Failed to fetch response');
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      const errorMessage = {
        sender: 'bot',
        text: `**Error:** ${err.message || 'Unable to process query.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleRetryLast = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        handleSendMessage(messages[i].text);
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 transition-colors">
      {/* Header */}
      <Header
        onClearChat={handleClearChat}
        showKpi={showKpi}
        onToggleKpi={() => setShowKpi((prev) => !prev)}
        onRefreshKpi={fetchKpiSummary}
        isKpiLoading={isKpiLoading}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Interactive KPI Bar */}
      {showKpi && (
        <KpiBar
          kpiSummary={kpiSummary}
          onMetricClick={(query) => handleSendMessage(query)}
        />
      )}

      {/* Main Chat Display */}
      <Chat
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onRetryLast={handleRetryLast}
      />

      {/* Input Box */}
      <InputBox onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;
