// src/api/payos.api.ts
import api from "../lib/axios";

export type CreatePaymentBody = {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

// Tạo payment (cần Authorization)
export async function payosCreatePayment(body: CreatePaymentBody) {
  // axios `api` sẽ tự gắn Authorization nhờ interceptor
  const { data } = await api.post("/payos/create-payment", body);
  return data as { checkoutUrl: string } & Record<string, any>;
}

// Lấy status (cần Authorization & kiểm tra quyền sở hữu)
export async function payosGetStatus(orderCode: number) {
  const { data } = await api.get(`/payos/status/${orderCode}`);
  return data;
}
