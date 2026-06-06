/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  ratingsCount: number;
  coverUrl: string;
  fileSize: string; // e.g., "4.2 MB"
  pages: number;
  salesCount: number;
  viewsCount: number;
  inventoryCount: number; // For digital products, could be 'Unlimited' or a limited stock cap
  reviews: Review[];
  publishDate: string;
  downloadUrl?: string; // Secure download path
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  bookIds: string[];
  books: {
    id: string;
    title: string;
    price: number;
  }[];
  totalPrice: number;
  paymentMethod: 'Stripe' | 'Razorpay' | 'PayPal' | 'UPI' | 'Card' | 'NetBanking';
  paymentStatus: 'Paid' | 'Processing' | 'Failed';
  transactionId: string;
  receiptNumber: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  purchasedBookIds: string[];
  totalSpent: number;
  joinDate: string;
}

export interface BankDetails {
  bankName: string;
  holderName: string;
  accountNumber: string;
  routingNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface PaymentGateways {
  stripeEnabled: boolean;
  stripeKey: string;
  razorpayEnabled: boolean;
  razorpayKey: string;
  paypalEnabled: boolean;
  paypalEmail: string;
  upiEnabled: boolean;
  upiId: string;
  netBankingEnabled: boolean;
}

export interface AnalyticsSummary {
  totalSalesCount: number;
  totalRevenue: number;
  totalViews: number;
  conversionRate: number; // percentage
  totalCustomers: number;
  monthlySales: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { category: string; count: number }[];
  downloadStats: { bookTitle: string; count: number }[];
  dailyViews: { date: string; views: number }[];
}
