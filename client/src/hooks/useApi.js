import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, conversationAPI, messageAPI } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};

export const useSearchUsers = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await userAPI.searchUsers(query.trim());
      setResults(response.data);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
};

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await conversationAPI.getConversations();
      setConversations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const addConversation = useCallback((conversation) => {
    setConversations(prev => {
      const exists = prev.find(c => c._id === conversation._id);
      if (exists) return prev;
      return [conversation, ...prev];
    });
  }, []);

  const updateConversation = useCallback((conversationId, updates) => {
    setConversations(prev => prev.map(c =>
      c._id === conversationId ? { ...c, ...updates } : c
    ));
  }, []);

  const removeConversation = useCallback((conversationId) => {
    setConversations(prev => prev.filter(c => c._id !== conversationId));
  }, []);

  return { conversations, loading, error, refetch: fetchConversations, addConversation, updateConversation, removeConversation };
};

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await messageAPI.getMessages(conversationId, pageNum);
      if (append) {
        setMessages(prev => [...response.data.messages, ...prev]);
      } else {
        setMessages(response.data.messages);
      }
      setHasMore(pageNum < response.data.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(1, false);
    }
  }, [conversationId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMessages(page + 1, true);
    }
  }, [loading, hasMore, page, fetchMessages]);

  const addMessage = useCallback((message) => {
    setMessages(prev => {
      const exists = prev.find(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => prev.map(m =>
      m._id === messageId ? { ...m, ...updates } : m
    ));
  }, []);

  const markAsRead = useCallback(async (messageId) => {
    try {
      await messageAPI.markAsRead(messageId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  return { messages, loading, error, hasMore, loadMore, fetchMessages, addMessage, updateMessage, markAsRead };
};