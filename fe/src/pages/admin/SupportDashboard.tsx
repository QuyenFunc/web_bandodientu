import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { io, Socket } from 'socket.io-client';
import { useGetAdminChatListQuery, ChatMessage, AdminChatListResponse } from '@/services/chatApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PaperAirplaneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api'; // Trả fetcher cho REST methods nếu cần
import { useDispatch } from 'react-redux';

// Socket URL
const SOCKET_URL = 'http://localhost:8888';

const SupportDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<AdminChatListResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatList, setChatList] = useState<AdminChatListResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch admin list
  const { data: listData, isLoading: isListLoading, refetch: refetchList } = useGetAdminChatListQuery();

  useEffect(() => {
    if (listData?.data) {
      setChatList(listData.data);
    }
  }, [listData]);

  // Fetch active user messages
  // Có thể dùng lazy queries nếu có, hoặc gọi manual API mỗi khi click user
  const fetchMessages = async (uid: string) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/chat/${uid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(r => r.json());
      if (res.status === 'success') {
        setMessages(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const selectedUserRef = useRef<AdminChatListResponse | null>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Connect socket ONCE on mount
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('adminJoin');

    socketRef.current.on('messageRecieved', (msg: ChatMessage) => {
      // Use ref to check selectedUser without being stale
      if (selectedUserRef.current && msg.userId === selectedUserRef.current.userId) {
        setMessages((prev) => [...prev, msg]);
      }
      refetchList(); // Refresh list structure timestamp
    });

    socketRef.current.on('newChatAlert', () => {
      refetchList(); // trigger list to reload state
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [refetchList]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socketRef.current) return;

    const messageData = {
      userId: selectedUser.userId,
      senderId: user?.id,
      content: newMessage.trim(),
      isFromAdmin: true,
    };

    socketRef.current.emit('sendMessage', messageData);
    setNewMessage('');
  };

  if (isListLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5 text-primary-500" />
            Hỗ trợ khách hàng
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatList.length === 0 ? (
            <p className="p-4 text-center text-neutral-400 text-sm">Chưa có người nhắn tin</p>
          ) : (
            chatList.map((item) => (
              <button
                key={item.userId}
                onClick={() => setSelectedUser(item)}
                className={`w-full p-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                  selectedUser?.userId === item.userId ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-neutral-200 dark:bg-neutral-700 h-10 w-10 rounded-full flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300">
                    {item.user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm">
                      {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Anonymous'}
                    </p>
                    <p className="text-xs text-neutral-500 truncate max-w-[150px]">{item.lastMessage}</p>
                  </div>
                </div>
                {item.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Box area */}
      <div className="w-2/3 flex flex-col bg-neutral-50 dark:bg-zinc-900/20">
        {selectedUser ? (
          <>
            {/* Upper Info */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-3">
              <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 h-10 w-10 rounded-full flex items-center justify-center font-bold">
                {selectedUser.user?.firstName?.[0] || 'U'}
              </div>
              <div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {selectedUser.user ? `${selectedUser.user.firstName} ${selectedUser.user.lastName}` : 'Anonymous'}
                </p>
                <p className="text-xs text-neutral-400">{selectedUser.user?.email}</p>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const isMe = msg.isFromAdmin;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-bl-none shadow-sm border border-neutral-100 dark:border-neutral-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.currentTarget.value)}
                placeholder="Nhập câu trả lời..."
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl disabled:opacity-50 transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <EnvelopeIcon className="h-16 w-16 mb-2 opacity-30" />
            <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
