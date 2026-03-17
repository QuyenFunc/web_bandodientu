import { api } from './api';

export interface ChatMessage {
  id: string;
  userId: string;
  senderId: string;
  content: string;
  isFromAdmin: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface AdminChatListResponse {
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<{ status: string; data: ChatMessage[] }, string>({
      query: (userId) => ({
        url: `/chat/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'Chat' as any, id: userId }],
    }),

    getAdminChatList: builder.query<{ status: string; data: AdminChatListResponse[] }, void>({
      query: () => ({
        url: '/chat/admin/list',
        method: 'GET',
      }),
      providesTags: ['Chat' as any],
    }),
  }),
});

export const { useGetChatHistoryQuery, useGetAdminChatListQuery } = chatApi;
