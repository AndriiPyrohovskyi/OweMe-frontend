import apiClient from '../client';

export interface WalletBalance {
  balance: string;
  status: 'active' | 'suspended' | 'frozen';
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'transfer' | 'payment' | 'refund' | 'debt_return_hold' | 'debt_return_release' | 'debt_return_transfer';
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  description?: string;
  createdAt: string;
  relatedOweReturnId?: number;
  relatedUser?: {
    id: number;
    username: string;
  };
}

export interface DepositRequest {
  amount: number;
  paymentMethodId: string;
}

export interface TransferRequest {
  toUserId: number;
  amount: number;
  description?: string;
}

export interface PayDebtRequest {
  debtId: number;
  amount: number;
}

export const walletApi = {
  // Отримати баланс
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get<WalletBalance>('/wallet/balance');
    return response;
  },

  // Отримати гаманець (повна інфа)
  getWallet: async () => {
    const response = await apiClient.get('/wallet');
    return response;
  },

  // Отримати історію транзакцій
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>('/wallet/transactions');
    return response;
  },

  // Поповнити баланс
  deposit: async (data: DepositRequest) => {
    const response = await apiClient.post('/wallet/deposit', data);
    return response;
  },

  // Перевести кошти користувачу
  transfer: async (data: TransferRequest) => {
    const response = await apiClient.post('/wallet/transfer', data);
    return response;
  },

  // Оплатити борг
  payDebt: async (data: PayDebtRequest) => {
    const response = await apiClient.post('/wallet/pay-debt', data);
    return response;
  },
};
