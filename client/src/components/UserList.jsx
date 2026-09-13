import { useState } from 'react';
import SearchBar from './SearchBar';
import UserListItem from './UserListItem';
import LoadingSpinner from './LoadingSpinner';
import { useUsers, useSearchUsers } from '../hooks/useApi';

const UserList = ({ selectedUser, onSelectUser, conversations }) => {
  const { users, loading, error, refetch } = useUsers();
  const { results: searchResults, loading: searchLoading, search } = useSearchUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const displayUsers = searchQuery ? searchResults : users;
  const isSearching = searchQuery.trim().length > 0;

  const handleSearch = (query) => {
    setSearchQuery(query);
    search(query);
  };

  const getLastMessagePreview = (userId) => {
    const conversation = conversations.find(c => c.participant?._id === userId);
    if (!conversation?.lastMessage) return null;
    return conversation.lastMessage;
  };

  if (loading) {
    return (
      <div className="user-list-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-error">
        <p>{error}</p>
        <button className="btn btn-primary btn-sm" onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Messages</h2>
      </div>
      <SearchBar onSearch={handleSearch} placeholder="Search users..." />
      <div className="user-list-content">
        {displayUsers.length === 0 ? (
          <div className="empty-state">
            {isSearching ? 'No users found' : 'No users yet'}
          </div>
        ) : (
          displayUsers.map(user => {
            const lastMessage = getLastMessagePreview(user._id);
            return (
              <UserListItem
                key={user._id}
                user={user}
                lastMessage={lastMessage}
                isSelected={selectedUser?._id === user._id}
                onClick={onSelectUser}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;