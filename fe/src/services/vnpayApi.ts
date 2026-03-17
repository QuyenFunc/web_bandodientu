import { api } from './api';

export interface CreateVnpayUrlRequest {
  amount: number;
  orderId: string;
  bankCode?: string;
}

export interface CreateVnpayUrlResponse {
  status: string;
  data: {
    paymentUrl: string;
  };
}

export const vnpayApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createVnpayUrl: builder.mutation<CreateVnpayUrlResponse, CreateVnpayUrlRequest>({
      query: (data) => ({
        url: '/payment/vnpay/create-url',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useCreateVnpayUrlMutation } = vnpayApi;
