/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Book, Order, Customer, BankDetails, PaymentGateways } from '../types.js';

// Path to our JSON database
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Interface for database structure
export interface DBStructure {
  books: Book[];
  orders: Order[];
  customers: Customer[];
  bankDetails: BankDetails;
  payments: PaymentGateways;
  viewsLog: { bookId: string; date: string }[];
  downloadLog: { bookId: string; date: string }[];
}

// Default Seed Data
const INITIAL_BOOKS: Book[] = [
  {
    id: "eb-1",
    title: "Mastering TypeScript & Clean Architecture",
    author: "Ayush",
    description: "Learn how to build scalable, type-safe, and highly maintainable modern web applications with advanced TypeScript design patterns, SOLID principles, and clean architectural paradigms. Packed with real-world project code, best practices, and enterprise-grade design techniques.",
    category: "Programming",
    price: 29.99,
    rating: 4.8,
    ratingsCount: 42,
    coverUrl: "", // We can use elegant styling on client or fallback covers
    fileSize: "8.4 MB",
    pages: 312,
    salesCount: 145,
    viewsCount: 1850,
    inventoryCount: 9999, // Unlimited virtual stock
    publishDate: "2025-10-15",
    reviews: [
      { id: "rev-1", reviewerName: "Siddharth", rating: 5, comment: "This is hands down the best TypeScript resource on the market. Extremely detailed!", date: "2026-05-12" },
      { id: "rev-2", reviewerName: "Ananya", rating: 4, comment: "Excellent flow. Helped me restructure my company's codebase with clean architecture.", date: "2026-05-20" },
      { id: "rev-3", reviewerName: "Rahul", rating: 5, comment: "Pure gold. The chapter on Monads and Type Guards alone is worth the price.", date: "2026-06-01" }
    ],
  },
  {
    id: "eb-2",
    title: "The Modern Developer's Guide to Web Security",
    author: "Ayush",
    description: "An essential, comprehensive manual on securing modern front-end and back-end architectures. Understand Cross-Site Scripting (XSS), CSRF, JWT compromises, secure cookies, SQL injections, and how to harden Node.js, Express, and React structures.",
    category: "Security",
    price: 24.99,
    rating: 4.9,
    ratingsCount: 36,
    coverUrl: "",
    fileSize: "6.2 MB",
    pages: 245,
    salesCount: 98,
    viewsCount: 1120,
    inventoryCount: 9999,
    publishDate: "2025-12-01",
    reviews: [
      { id: "rev-4", reviewerName: "Vikram", rating: 5, comment: "Engaging and incredibly practical. Highly recommend it to all fullstack engineers.", date: "2026-04-18" },
      { id: "rev-5", reviewerName: "Sarah M.", rating: 5, comment: "A lifesaver. Made security headers and CORS policies finally click for me.", date: "2026-05-02" }
    ]
  },
  {
    id: "eb-3",
    title: "Next.js 15 Deep Dive & Server Actions",
    author: "Ayush",
    description: "Demystifying production-grade development inside directory architectures. Dive deep into Server Components (RSC), Client Components, serverless APIs, optimal caching protocols, Server Actions, suspense hydration, and server-side authorization patterns.",
    category: "Frameworks",
    price: 34.99,
    rating: 4.7,
    ratingsCount: 29,
    coverUrl: "",
    fileSize: "11.1 MB",
    pages: 380,
    salesCount: 180,
    viewsCount: 2240,
    inventoryCount: 9999,
    publishDate: "2026-02-10",
    reviews: [
      { id: "rev-6", reviewerName: "Karthik", rating: 5, comment: "Ayush has a gift for breaking down complex topics. The Server Actions diagrams are amazing.", date: "2026-05-28" }
    ]
  },
  {
    id: "eb-4",
    title: "Ayush's Diary: Lessons in Code, Life & Creativity",
    author: "Ayush",
    description: "An inspiring compilation of personal reflections, critical lessons learned while scaling software, tips on managing creative burnout, and strategies for building a thriving career as a digital creator.",
    category: "Self-Improvement",
    price: 19.99,
    rating: 4.6,
    ratingsCount: 18,
    coverUrl: "",
    fileSize: "4.5 MB",
    pages: 190,
    salesCount: 54,
    viewsCount: 650,
    inventoryCount: 9999,
    publishDate: "2026-04-05",
    reviews: [
      { id: "rev-7", reviewerName: "Preeti", rating: 4, comment: "Very motivational. It's refreshing to read personal stories from a developer's perspective.", date: "2026-05-15" }
    ]
  },
  {
    id: "eb-5",
    title: "E-Commerce Secrets & Digital Product Sales",
    author: "Ayush",
    description: "Configure your systems properly for high-performing passive income streams. This digital playbook outlines conversions tactics, cart abandonment optimizations, pricing frameworks, and customer trust signals tailored for indie hackers.",
    category: "Business",
    price: 14.99,
    rating: 4.5,
    ratingsCount: 14,
    coverUrl: "",
    fileSize: "3.8 MB",
    pages: 154,
    salesCount: 40,
    viewsCount: 490,
    inventoryCount: 9999,
    publishDate: "2026-05-20",
    reviews: []
  }
];

const INITIAL_BANK_DETAILS: BankDetails = {
  bankName: "State Bank of India",
  holderName: "Ayush",
  accountNumber: "39209489211",
  routingNumber: "SBIN0003049", // Using IFSC for Indian routing, standard representational format
  ifscCode: "SBIN0003049",
  upiId: "ayush@sbi"
};

const INITIAL_PAYMENTS: PaymentGateways = {
  stripeEnabled: true,
  stripeKey: "pk_test_ayush_digital_library_51N",
  razorpayEnabled: true,
  razorpayKey: "rzp_test_ayush_digital_library_912",
  paypalEnabled: true,
  paypalEmail: "ayush.payments@example.com",
  upiEnabled: true,
  upiId: "ayush@upi",
  netBankingEnabled: true
};

// Generate some initial transactions to populate the graphs
const generateInitialOrders = (): Order[] => {
  const orders: Order[] = [];
  const names = ["Aarav", "Priya", "Amit", "Kiran", "Rohit", "Sneha", "Tanvi", "Dev", "Meera", "Vikram"];
  const emails = ["aarav@gmail.com", "priya@yahoo.com", "amit@hotmail.com", "kiran@gmail.com", "rohit@outlook.com", "sneha@gmail.com", "tanvi@gmail.com", "dev@gmail.com", "meera@gmail.com", "vikram@gmail.com"];
  const methods: Order['paymentMethod'][] = ['Stripe', 'Razorpay', 'PayPal', 'UPI', 'Card', 'NetBanking'];
  
  // Set dates over the last few months to simulate historical data
  const baseDate = new Date();
  
  // Generate ~40 historical orders
  for (let i = 1; i <= 45; i++) {
    const orderDate = new Date();
    orderDate.setDate(baseDate.getDate() - (45 - i) * 2.5); // spread out over last 110 days
    
    // Choose books randomly
    const bookIndex1 = (i % INITIAL_BOOKS.length);
    const bookIndex2 = ((i + 2) % INITIAL_BOOKS.length);
    
    const b1 = INITIAL_BOOKS[bookIndex1];
    const b2 = i % 3 === 0 ? INITIAL_BOOKS[bookIndex2] : null;
    
    const items = [b1];
    if (b2) items.push(b2);
    
    const booksList = items.map(b => ({ id: b.id, title: b.title, price: b.price }));
    const total = booksList.reduce((sum, b) => sum + b.price, 0);
    
    const custIndex = i % names.length;
    
    orders.push({
      id: `ord-${1000 + i}`,
      customerName: names[custIndex],
      customerEmail: emails[custIndex],
      bookIds: items.map(b => b.id),
      books: booksList,
      totalPrice: Number(total.toFixed(2)),
      paymentMethod: methods[i % methods.length],
      paymentStatus: 'Paid',
      transactionId: `txn_sim_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      receiptNumber: `REC-${orderDate.getFullYear()}-${10000 + i}`,
      date: orderDate.toISOString()
    });
  }
  
  return orders;
};

const generateInitialCustomers = (orders: Order[]): Customer[] => {
  const customersMap = new Map<string, Customer>();
  
  orders.forEach((o, index) => {
    const email = o.customerEmail;
    if (customersMap.has(email)) {
      const existing = customersMap.get(email)!;
      existing.purchasedBookIds = Array.from(new Set([...existing.purchasedBookIds, ...o.bookIds]));
      existing.totalSpent = Number((existing.totalSpent + o.totalPrice).toFixed(2));
    } else {
      customersMap.set(email, {
        id: `cust-${100 + index}`,
        name: o.customerName,
        email: email,
        purchasedBookIds: [...o.bookIds],
        totalSpent: o.totalPrice,
        joinDate: new Date(new Date(o.date).getTime() - 1000 * 60 * 60 * 24 * 5).toISOString() // Joined 5 days before first purchase
      });
    }
  });

  return Array.from(customersMap.values());
};

const generateViewsAndDownloads = (books: Book[], orders: Order[]) => {
  const viewsLog: { bookId: string; date: string }[] = [];
  const downloadLog: { bookId: string; date: string }[] = [];
  
  // Seed some historic clicks and downloads
  const baseDate = new Date();
  
  books.forEach(b => {
    // Generate some views for each book distributed over historical days
    for (let day = 0; day < 30; day++) {
      const logDate = new Date();
      logDate.setDate(baseDate.getDate() - day);
      
      const dayViews = Math.floor(Math.random() * 20) + (b.id === 'eb-1' || b.id === 'eb-3' ? 15 : 2);
      for (let v = 0; v < dayViews; v++) {
        viewsLog.push({
          bookId: b.id,
          date: logDate.toISOString().split('T')[0] // local ISO date string
        });
      }
    }
  });

  // Generate some downloads for sold books
  orders.forEach(ord => {
    ord.bookIds.forEach(bid => {
      // Create 1-2 downloads for each book in each order
      const downloadsCount = Math.floor(Math.random() * 2) + 1;
      const orderDate = new Date(ord.date);
      for (let d = 0; d < downloadsCount; d++) {
        const downloadDate = new Date(orderDate.getTime() + (d * 12 * 60 * 60 * 1000));
        downloadLog.push({
          bookId: bid,
          date: downloadDate.toISOString()
        });
      }
    });
  });

  return { viewsLog, downloadLog };
};

// Main Database Manager class
export class JSONDatabase {
  private data: DBStructure;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DBStructure {
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      // Read or seed
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
      } else {
        const initialOrders = generateInitialOrders();
        const initialCustomers = generateInitialCustomers(initialOrders);
        const { viewsLog, downloadLog } = generateViewsAndDownloads(INITIAL_BOOKS, initialOrders);
        
        const defaultDB: DBStructure = {
          books: INITIAL_BOOKS,
          orders: initialOrders,
          customers: initialCustomers,
          bankDetails: INITIAL_BANK_DETAILS,
          payments: INITIAL_PAYMENTS,
          viewsLog,
          downloadLog
        };

        this.saveData(defaultDB);
        return defaultDB;
      }
    } catch (e) {
      console.error("Error loading mock JSON Database. Defaulting to empty-safe values.", e);
      return {
        books: INITIAL_BOOKS,
        orders: [],
        customers: [],
        bankDetails: INITIAL_BANK_DETAILS,
        payments: INITIAL_PAYMENTS,
        viewsLog: [],
        downloadLog: []
      };
    }
  }

  private saveData(dataToSave: DBStructure) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (error) {
      console.error("Error writing JSON DB to file system", error);
    }
  }

  // Database CRUD actions
  public getBooks(): Book[] {
    return this.data.books;
  }

  public getBookById(id: string): Book | undefined {
    return this.data.books.find(b => b.id === id);
  }

  public saveBook(book: Book): void {
    const idx = this.data.books.findIndex(b => b.id === book.id);
    if (idx >= 0) {
      this.data.books[idx] = book;
    } else {
      this.data.books.push(book);
    }
    this.saveData(this.data);
  }

  public deleteBook(id: string): boolean {
    const oldLength = this.data.books.length;
    this.data.books = this.data.books.filter(b => b.id !== id);
    const outcome = this.data.books.length < oldLength;
    if (outcome) {
      this.saveData(this.data);
    }
    return outcome;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public saveOrder(order: Order): void {
    this.data.orders.unshift(order); // Store newer orders first
    
    // Add to Customers or increment customer stats
    const email = order.customerEmail;
    const existingCustIdx = this.data.customers.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (existingCustIdx >= 0) {
      const cust = this.data.customers[existingCustIdx];
      cust.purchasedBookIds = Array.from(new Set([...cust.purchasedBookIds, ...order.bookIds]));
      cust.totalSpent = Number((cust.totalSpent + order.totalPrice).toFixed(2));
      this.data.customers[existingCustIdx] = cust;
    } else {
      this.data.customers.push({
        id: `cust-${Date.now()}`,
        name: order.customerName,
        email: order.customerEmail,
        purchasedBookIds: [...order.bookIds],
        totalSpent: order.totalPrice,
        joinDate: new Date().toISOString()
      });
    }

    // Update book sales counts as well
    order.bookIds.forEach(bid => {
      const bIdx = this.data.books.findIndex(b => b.id === bid);
      if (bIdx >= 0) {
        this.data.books[bIdx].salesCount += 1;
      }
    });

    this.saveData(this.data);
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getBankDetails(): BankDetails {
    return this.data.bankDetails;
  }

  public saveBankDetails(details: BankDetails): void {
    this.data.bankDetails = details;
    this.saveData(this.data);
  }

  public getPayments(): PaymentGateways {
    return this.data.payments;
  }

  public savePayments(pay: PaymentGateways): void {
    this.data.payments = pay;
    this.saveData(this.data);
  }

  public logPageView(bookId: string): void {
    // Record page view log
    this.data.viewsLog.push({
      bookId,
      date: new Date().toISOString().split('T')[0]
    });
    // Increment book visual counter as well
    const idx = this.data.books.findIndex(b => b.id === bookId);
    if (idx >= 0) {
      this.data.books[idx].viewsCount += 1;
    }
    this.saveData(this.data);
  }

  public logDownload(bookId: string): void {
    this.data.downloadLog.push({
      bookId,
      date: new Date().toISOString()
    });
    this.saveData(this.data);
  }

  public getViewsLog() {
    return this.data.viewsLog;
  }

  public getDownloadLog() {
    return this.data.downloadLog;
  }
}

// Single instance of local state
export const db = new JSONDatabase();
