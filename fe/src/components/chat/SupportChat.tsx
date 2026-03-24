import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { io, Socket } from 'socket.io-client';
import { useGetChatHistoryQuery, ChatMessage } from '@/services/chatApi';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Socket URL usually backend base
const SOCKET_URL = 'http://localhost:8888';

import { v4 as uuidv4 } from 'uuid';

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  // Initialize session ID
  const [sessionId] = useState(() => {
    let saved = localStorage.getItem('support_chat_session_id');
    if (!saved) {
      saved = uuidv4();
      localStorage.setItem('support_chat_session_id', saved);
    }
    return saved;
  });

  const currentIdentifier = userId || sessionId;

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Load history
  const { data: historyData, isLoading } = useGetChatHistoryQuery(currentIdentifier, {
    skip: !isOpen || !currentIdentifier,
  });

  useEffect(() => {
    if (historyData?.data) {
      setMessages(historyData.data);
    }
  }, [historyData]);

  // Connect Socket ONCE on mount
  useEffect(() => {
    if (!currentIdentifier) return;

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit('join', { userId, sessionId });

      socketRef.current.on('messageRecieved', (newMessage: ChatMessage) => {
        // Only accept messages for this session or user
        if (newMessage.sessionId === sessionId || (userId && newMessage.userId === userId)) {
          setMessages((prev) => [...prev, newMessage]);
        }

        // If message is from Admin and box is closed, increment unread
        if (newMessage.isFromAdmin && !isOpenRef.current) {
          setUnreadCount((prev) => prev + 1);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, sessionId, currentIdentifier]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || !currentIdentifier) return;

    const messageData = {
      userId,
      sessionId,
      senderId: userId || `guest_${sessionId.substring(0, 8)}`,
      content: message.trim(),
      isFromAdmin: false,
    };

    socketRef.current.emit('sendMessage', messageData);
    setMessage('');
  };
    

  return (
    <div className="fixed bottom-6 right-24 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce relative"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col border border-neutral-200 dark:border-neutral-800 animate-slideIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">Hỗ trợ trực tuyến</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-neutral-200">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-[300px] flex flex-col gap-3">
            {isLoading ? (
              <p className="text-center text-neutral-400 text-sm">Đang tải...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-neutral-400 text-sm mt-4">Chào bạn, chúng tôi có thể giúp gì?</p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = !msg.isFromAdmin;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-bl-none'
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
              disabled={!message.trim()}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
