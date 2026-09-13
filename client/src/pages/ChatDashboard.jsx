import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import { useConversations } from '../hooks/useApi';
import { conversationAPI } from '../services/api';
import Toast from '../components/Toast';

const ChatDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const { conversations, loading: convLoading, refetch: fetchConversations, addConversation } = useConversations();
  const [selectedUser, setSelectedUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setSidebarOpen(true);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner large" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app">
      <Navbar />
      <div className="app-container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <UserList
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            conversations={conversations}
          />
        </aside>
        
        {window.innerWidth < 768 && !sidebarOpen && !selectedUser && (
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <main className={`main-chat ${selectedUser ? 'active-chat' : ''}`}>
          <ChatWindow
            selectedUser={selectedUser}
            conversations={conversations}
            onBack={handleBackToUsers}
            onConversationCreated={addConversation}
          />
        </main>
      </div>

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default ChatDashboard;