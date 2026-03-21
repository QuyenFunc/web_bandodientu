import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { Rnd } from 'react-rnd';

// Components
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';
import ChatProductList from './ChatProductList';
import ChatToggleButton from './ChatToggleButton';
import ChatHeaderContent from './ChatHeaderContent';
import ChatQuickActions from './ChatQuickActions';
import ChatEmptyState from './ChatEmptyState';
import ChatResizeIndicator from './ChatResizeIndicator';

// Icons
import { VerifiedIcon, TrashIcon, HelpIcon } from './icons';

// Services & API
import {
  useSendChatbotMessageMutation,
  useTrackChatbotAnalyticsMutation,
  ChatbotResponse,
  ProductRecommendation,
} from '../services/chatbotApi';

// Hooks & Constants
import { useChatWidget } from '../hooks/useChatWidget';
import {
  CHAT_WIDGET_CONFIG,
  RESIZE_HANDLE_STYLES,
  RESIZE_HANDLE_CLASSES,
} from '../constants/chatWidget';

// Styles
import './ChatWidget.css';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
  suggestions?: string[];
  products?: ProductRecommendation[];
  actions?: Array<{
    type: string;
    label: string;
    url?: string;
    data?: Record<string, any>;
  }>;
}

const ChatWidget: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  // Custom hook for chat widget state management
  const {
    isOpen,
    position,
    size,
    messages,
    messagesEndRef,
    chatWidgetRef,
    toggleChat,
    closeChat,
    addMessage,
    removeMessage,
    applyChanges,
    setSize,
    setMessages,
  } = useChatWidget();

  // API hooks
  const [sendMessage, { isLoading }] = useSendChatbotMessageMutation();
  const [trackAnalytics] = useTrackChatbotAnalyticsMutation();

  // Session ID
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
    };

    addMessage(userMessage);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    addMessage({
      id: loadingId,
      text: '',
      sender: 'ai',
      isLoading: true,
    });

    try {
      // Track analytics
      await trackAnalytics({
        event: 'message_sent',
        userId: user?.id,
        sessionId,
        metadata: { message: text },
      });

      // Get current page context for better responses
      const context = {
        currentUrl: window.location.href,
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Call enhanced chatbot API
      const apiResponse = await sendMessage({
        message: text,
        userId: user?.id,
        sessionId,
        context,
      }).unwrap();

      // Handle different response structures
      let response: ChatbotResponse;
      if (
        (apiResponse as any).status === 'success' &&
        (apiResponse as any).data
      ) {
        const newApiResponse = apiResponse as any;
        response = {
          response: newApiResponse.data.response,
          suggestions: newApiResponse.data.suggestions,
          products: newApiResponse.data.products,
          actions: newApiResponse.data.actions,
          sessionId: newApiResponse.data.sessionId,
        };
      } else {
        response = apiResponse as any as ChatbotResponse;
      }

      // Remove loading message and add AI response
      removeMessage(loadingId);
      addMessage({
        id: (Date.now() + 2).toString(),
        text: response.response,
        sender: 'ai',
        suggestions: response.suggestions,
        products: response.products,
        actions: response.actions,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);

      let errorMessage = t('chat.errors.general');

      if (error.message === 'Request timeout' || error.code === 'ECONNABORTED') {
        errorMessage = 'Hệ thống đang bận xử lý, bạn vui lòng chờ trong giây lát hoặc thử lại nhé! 🙏';
      } else if (error.status === 404) {
        errorMessage = t('chat.errors.notFound');
      } else if (error.status === 429) {
        errorMessage = t('chat.errors.tooManyRequests');
      } else if (error.status >= 500) {
        errorMessage = t('chat.errors.serverError');
      }

      // Remove loading message and add error message
      removeMessage(loadingId);
      addMessage({
        id: (Date.now() + 2).toString(),
        text: errorMessage,
        sender: 'ai' as const,
        suggestions: [
          t('chat.suggestions.tryAgain'),
          t('chat.suggestions.findProducts'),
          t('chat.suggestions.contactSupport'),
        ],
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Handle resize with react-rnd
  const handleResize = (
    e: MouseEvent | TouchEvent,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: any
  ) => {
    ref.classList.add('resize-feedback');
    setTimeout(() => {
      ref.classList.remove('resize-feedback');
    }, CHAT_WIDGET_CONFIG.ANIMATION_DURATION.RESIZE);
  };

  // Handle resize stop to save final dimensions
  const handleResizeStop = (
    e: MouseEvent | TouchEvent,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: any
  ) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Chat toggle button */}
      <ChatToggleButton isOpen={isOpen} onClick={toggleChat} />

      {/* Overlay to prevent clicks outside from closing the chat */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      )}

      {/* Chat widget with react-rnd - drag disabled, only resize enabled */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-24 z-50 w-[384px] h-[600px]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Rnd
            ref={chatWidgetRef as any}
            size={{ width: size.width, height: size.height }}
            position={position}
            minWidth={CHAT_WIDGET_CONFIG.MIN_SIZE.width}
            minHeight={CHAT_WIDGET_CONFIG.MIN_SIZE.height}
            maxWidth={CHAT_WIDGET_CONFIG.MAX_SIZE.width}
            maxHeight={CHAT_WIDGET_CONFIG.MAX_SIZE.height}
            disableDragging={true}
            enableUserSelectHack={false}
            bounds="window"
            onResize={handleResize}
            onResizeStop={handleResizeStop}
            className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-neutral-200/50 dark:border-neutral-700/50 transform animate-in slide-in-from-bottom-4 duration-500 transition-all chat-widget-resize-transition chat-widget-active"
            resizeHandleStyles={RESIZE_HANDLE_STYLES as any}
            resizeHandleClasses={RESIZE_HANDLE_CLASSES as any}
          >
            {/* Chat header */}
            <ChatHeaderContent
              onApplyChanges={applyChanges}
              onClose={closeChat}
            />

            {/* Chat messages */}
            <div className="chat-messages flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-neutral-50/80 via-white/50 to-neutral-50/80 dark:from-neutral-800/80 dark:via-neutral-900/50 dark:to-neutral-800/80 min-h-[200px]">
              {messages.length === 0 && <ChatEmptyState onSuggestionClick={handleSendMessage} />}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className="animate-in slide-in-from-bottom-2 duration-500"
                >
                  <ChatMessage message={message} />
                  {message.sender === 'ai' && (
                    <>
                      {/* Show products if available */}
                      {message.products && message.products.length > 0 && (
                        <div className="ml-12 mt-4 mb-2">
                          <ChatProductList
                            products={message.products}
                            sessionId={sessionId}
                            title="🛍️ Sản phẩm gợi ý cho bạn"
                          />
                        </div>
                      )}

                      {/* Show suggestions if available */}
                      {message.suggestions &&
                        message.suggestions.length > 0 && (
                          <div className="ml-12 mt-4 mb-2">
                            <ChatSuggestions
                              suggestions={message.suggestions}
                              onSuggestionClick={handleSuggestionClick}
                            />
                          </div>
                        )}
                    </>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat bottom area: Quick Actions + Input + Branding */}
            <div className="border-t border-neutral-200/60 dark:border-neutral-700/60 bg-gradient-to-b from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 backdrop-blur-md">
              {/* 1. Quick actions above input */}
              <div className="px-4 pt-3">
                <ChatQuickActions onSendMessage={handleSendMessage} />
              </div>

              {/* 2. Chat input component */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />

              {/* 3. Global Branding & Meta Actions Footer */}
              <div className="px-5 pb-4 flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 font-bold border-t border-neutral-100/50 dark:border-neutral-800/50 pt-2.5 mt-1">
                <div className="flex items-center group transition-colors hover:text-primary-500">
                  <VerifiedIcon className="mr-1.5 text-primary-500/70 group-hover:text-primary-500 transition-colors" size={12} />
                  <span className="uppercase tracking-widest">
                    {t('chat.poweredBy') || 'Powered by'}{' '}
                    <span className="text-primary-600 dark:text-primary-400">
                      Shopmini AI
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="flex items-center space-x-1 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Xóa cuộc trò chuyện"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?')) {
                        setMessages([]);
                      }
                    }}
                  >
                    <TrashIcon size={12} />
                    <span className="hidden sm:inline">Làm mới</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center space-x-1 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Trợ giúp"
                    onClick={() => handleSendMessage('Tôi cần trợ giúp về cách sử dụng chatbot')}
                  >
                    <HelpIcon size={12} />
                    <span className="hidden sm:inline">Trợ giúp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resize indicator */}
            <ChatResizeIndicator />
          </Rnd>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
