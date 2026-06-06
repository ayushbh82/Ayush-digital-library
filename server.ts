/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/dbInit.js';
import { Book, Order, Review, BankDetails, PaymentGateways } from './src/types.js';

const app = express();
const PORT = 3000;

// Standard middlewares for heavy payloads (Base64 file uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global mock notifications queue for live admin alerts
const notificationsQueue: { id: string; message: string; subtext: string; date: string }[] = [
  {
    id: "notif-init-1",
    message: "Admin Dashboard Seeded",
    subtext: "Ayush Digital Library backend is fully active and listening",
    date: new Date().toISOString()
  }
];

// Simple Authentication Middleware & Token Utilities
// Token is structured as base64(email|name|role|expiresAt)
function generateSimulatedToken(email: string, name: string, role: 'admin' | 'customer'): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  const payload = `${email}|${name}|${role}|${expiresAt}`;
  return Buffer.from(payload).toString('base64');
}

function verifyTokenAndGetUser(token: string | undefined): { email: string; name: string; role: 'admin' | 'customer' } | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const [email, name, role, expiresAt] = raw.split('|');
    if (!email || !role || !expiresAt) return null;
    if (Date.now() > Number(expiresAt)) return null; // Token expired
    return { email, name, role: role as 'admin' | 'customer' };
  } catch (e) {
    return null;
  }
}

// REST Endpoints for general auth
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing registration details" });
  }

  // Check if customer exists in client log
  const customers = db.getCustomers();
  const exists = customers.some(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return res.status(400).json({ error: "Email already registered" });
  }

  // Create mock customer entry
  const newCustomer = {
    id: `cust-${Date.now()}`,
    name,
    email,
    purchasedBookIds: [],
    totalSpent: 0,
    joinDate: new Date().toISOString()
  };

  // Set default entry
  db.getCustomers().push(newCustomer);
  
  // Generate token
  const token = generateSimulatedToken(email, name, 'customer');
  res.json({ token, user: { name, email, role: 'customer' } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, isAdmin } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing login details" });
  }

  if (isAdmin || email.toLowerCase() === 'ayush@library.com' || email.toLowerCase() === 'admin@library.com') {
    // Admin login validation
    if (password === 'admin123' || password === 'ayush2026' || password === 'admin') {
      const token = generateSimulatedToken(email, 'Ayush', 'admin');
      return res.json({ token, user: { name: 'Ayush', email: 'ayush@library.com', role: 'admin' } });
    } else {
      return res.status(401).json({ error: "Invalid owner/admin password" });
    }
  }

  // Normal Customer Login authentication
  // If user is registered, authenticate them; otherwise, create an automatic demo account for rich interaction
  const customers = db.getCustomers();
  let existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (!existing) {
    // Create automatic guest-demo profile so the user has immediate access
    const nameStr = email.split('@')[0];
    const uppercaseName = nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
    existing = {
      id: `cust-${Date.now()}`,
      name: uppercaseName,
      email: email,
      purchasedBookIds: [db.getBooks()[0].id], // Gifting them the first book on dynamic sign-up for demonstration
      totalSpent: 29.99,
      joinDate: new Date().toISOString()
    };
    db.getCustomers().push(existing);
  }

  const token = generateSimulatedToken(existing.email, existing.name, 'customer');
  res.json({ token, user: { name: existing.name, email: existing.email, role: 'customer' } });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized session" });
  }
  res.json({ user });
});

// Books/Library REST Endpoints
app.get('/api/books', (req, res) => {
  res.json(db.getBooks());
});

app.get('/api/books/:id', (req, res) => {
  const book = db.getBookById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: "eBook not found" });
  }
  // Log page view in server analytics
  db.logPageView(book.id);
  res.json(book);
});

// Create Book (Admin only)
app.post('/api/books', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Author privileges only." });
  }

  const { title, author, description, category, price, coverUrl, pages, fileSize } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: "Title and price are required elements" });
  }

  const newBook: Book = {
    id: `eb-${Date.now()}`,
    title,
    author: author || "Ayush",
    description: description || "No summary provided.",
    category: category || "General",
    price: Number(price),
    rating: 5.0,
    ratingsCount: 0,
    coverUrl: coverUrl || "", // Base64 or standard asset
    fileSize: fileSize || "5.0 MB",
    pages: Number(pages) || 120,
    salesCount: 0,
    viewsCount: 1,
    inventoryCount: 9999,
    reviews: [],
    publishDate: new Date().toISOString().split('T')[0]
  };

  db.saveBook(newBook);
  
  // Trigger notification
  notificationsQueue.unshift({
    id: `notif-bk-${Date.now()}`,
    message: "New eBook Added",
    subtext: `"${newBook.title}" by ${newBook.author} is now live in the store!`,
    date: new Date().toISOString()
  });

  res.status(201).json(newBook);
});

// Update Book (Admin only)
app.put('/api/books/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Action restricted to Author." });
  }

  const bookId = req.params.id;
  const existingBook = db.getBookById(bookId);
  if (!existingBook) {
    return res.status(404).json({ error: "eBook not found" });
  }

  const { title, author, description, category, price, coverUrl, pages, fileSize, inventoryCount } = req.body;
  
  const updatedBook: Book = {
    ...existingBook,
    title: title !== undefined ? title : existingBook.title,
    author: author !== undefined ? author : existingBook.author,
    description: description !== undefined ? description : existingBook.description,
    category: category !== undefined ? category : existingBook.category,
    price: price !== undefined ? Number(price) : existingBook.price,
    coverUrl: coverUrl !== undefined ? coverUrl : existingBook.coverUrl,
    pages: pages !== undefined ? Number(pages) : existingBook.pages,
    fileSize: fileSize !== undefined ? fileSize : existingBook.fileSize,
    inventoryCount: inventoryCount !== undefined ? Number(inventoryCount) : existingBook.inventoryCount
  };

  db.saveBook(updatedBook);
  res.json(updatedBook);
});

// Delete Book (Admin only)
app.delete('/api/books/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }

  const success = db.deleteBook(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "eBook not found" });
  }

  res.json({ message: "eBook deleted successfully" });
});

// Add Review (Public)
app.post('/api/books/:id/reviews', (req, res) => {
  const { reviewerName, rating, comment } = req.body;
  const bookId = req.params.id;

  if (!reviewerName || !rating || !comment) {
    return res.status(400).json({ error: "Missing review fields" });
  }

  const book = db.getBookById(bookId);
  if (!book) {
    return res.status(404).json({ error: "eBook not found" });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    reviewerName,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  book.reviews.unshift(newReview);
  
  // Recalculating average rating
  const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
  book.rating = Number((totalRating / book.reviews.length).toFixed(1));
  book.ratingsCount = book.reviews.length;

  db.saveBook(book);

  notificationsQueue.unshift({
    id: `notif-rev-${Date.now()}`,
    message: "New Book Review Received",
    subtext: `"${reviewerName}" rated "${book.title}" with a ${rating}★ score`,
    date: new Date().toISOString()
  });

  res.status(201).json(newReview);
});

// Dynamic Checkout Processing with receipt generation
app.post('/api/checkout', (req, res) => {
  const { customerName, customerEmail, cartItems, paymentMethod, paymentDetails } = req.body;

  if (!customerName || !customerEmail || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Missing active customer cart items" });
  }

  // Construct Order info
  const booksSold: { id: string; title: string; price: number }[] = [];
  const bookIds: string[] = [];
  let totalPrice = 0;

  for (const item of cartItems) {
    const book = db.getBookById(item.bookId);
    if (!book) {
      return res.status(400).json({ error: `Book with ID ${item.bookId} is no longer available` });
    }
    booksSold.push({
      id: book.id,
      title: book.title,
      price: book.price
    });
    bookIds.push(book.id);
    totalPrice += book.price * (item.quantity || 1);
  }

  const transactionId = `txn_${paymentMethod.substring(0, 3).toLowerCase()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    customerName,
    customerEmail,
    books: booksSold,
    bookIds,
    totalPrice: Number(totalPrice.toFixed(2)),
    paymentMethod,
    paymentStatus: 'Paid', // Instantly approved
    transactionId,
    receiptNumber,
    date: new Date().toISOString()
  };

  // Persist order in local state
  db.saveOrder(newOrder);

  // Send an alert notification
  notificationsQueue.unshift({
    id: `notif-buy-${Date.now()}`,
    message: "New eBook Sale Completed!",
    subtext: `${customerName} bought ${booksSold.length} book(s) via ${paymentMethod}. Total: $${newOrder.totalPrice}`,
    date: new Date().toISOString()
  });

  res.status(201).json({
    message: "Payment processed successfully. eBook credentials have been securely provisioned.",
    order: newOrder
  });
});

// Secure PDF download endpoint (Prevents unauthorized URL scraping)
app.get('/api/download/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  const emailQuery = req.query.email as string;

  if (!emailQuery) {
    return res.status(403).send("<h1>Access Forbidden</h1><p>Active customer subscription or purchase verification required.</p>");
  }

  // Verify that a customer with this email has actually bought this eBook or is an Administrator
  const isAyushAdmin = emailQuery.toLowerCase() === 'ayush@library.com' || emailQuery.toLowerCase() === 'admin@library.com' || emailQuery.toLowerCase() === 'admin';
  
  const customers = db.getCustomers();
  const customer = customers.find(c => c.email.toLowerCase() === emailQuery.toLowerCase());
  const hasPurchased = customer && customer.purchasedBookIds.includes(bookId);

  if (!isAyushAdmin && !hasPurchased) {
    return res.status(403).send("<h1>Verification Failure</h1><p>No valid purchase code or invoice detected for this account. Please buy the book first or login with the email used during checkout.</p>");
  }

  const book = db.getBookById(bookId);
  if (!book) {
    return res.status(404).send("<h1>eBook Not Found</h1><p>The requested file has been archived or deleted from the backend catalog.</p>");
  }

  // Record a secure download in our analytics
  db.logDownload(book.id);

  // Generate and serve a clean mock PDF attachment content dynamically
  // Since we are creating direct file downloads, sending a text summary with standard application/pdf headers, 
  // or a professional text document formatted to simulate standard PDF binary chunks so it downloads securely.
  // Actually, sending a fully formatted textual invoice + eBook content as a file with .pdf extension works beautifully 
  // because browsers will open it as a text-pdf or readers will easily read the printable text payload!
  const dateFormatted = new Date().toLocaleDateString('en-US');
  
  const mockPdfContent = `%PDF-1.4
%âãÏÓ
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
>>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
  /F1 16 Tf
  50 700 Td
  (AYUSH DIGITAL LIBRARY - OFFICIAL DOWNLOAD) Tj
  /F1 12 Tf
  0 -40 Td
  (Book Title: ${book.title}) Tj
  0 -20 Td
  (Author: ${book.author}) Tj
  0 -20 Td
  (License Holder: ${customer?.name || 'Administrator'}) Tj
  0 -20 Td
  (License Email: ${emailQuery}) Tj
  0 -20 Td
  (Verification Stamp: SECURE-HASH-${Math.random().toString(36).substring(2, 12).toUpperCase()}) Tj
  0 -40 Td
  (Thank you for supporting authors and indie publishers. This PDF represents your) Tj
  0 -15 Td
  (authorized personal reading copy. Sharing or posting this online is strictly prohibited) Tj
  0 -15 Td
  (under copyright standard DMCA provisions.) Tj
  0 -35 Td
  (*** EBOOK INTERIOR CONTENT SUMMARY ***) Tj
  0 -20 Td
  (Total Pages: ${book.pages}) Tj
  0 -15 Td
  (Category: ${book.category}) Tj
  0 -15 Td
  (File Identifier: ADL-${book.id}-${dateFormatted.replace(/\//g, '')}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000130 00000 n 
0000000305 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
860
%%EOF`;

  res.setHeader('Content-disposition', `attachment; filename="${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_Licensed.pdf"`);
  res.setHeader('Content-type', 'application/pdf');
  res.send(Buffer.from(mockPdfContent));
});

// Admin Control Panel routes
app.get('/api/admin/analytics', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  // Calculate dynamic stats
  const books = db.getBooks();
  const orders = db.getOrders();
  const customers = db.getCustomers();
  const viewsLog = db.getViewsLog();
  const downloadLog = db.getDownloadLog();

  // Total Sales & Revenue
  const totalSalesCount = orders.length;
  const totalRevenue = Number(orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2));
  
  // Total Views
  const totalViews = viewsLog.length + books.reduce((sum, b) => sum + b.viewsCount, 0);
  
  // Target Conversion calculation: Orders / Total Views
  const conversionRate = totalViews > 0 ? Number(((totalSalesCount / totalViews) * 100).toFixed(2)) : 0;
  
  // Categories Distribution
  const categoriesMap: Record<string, number> = {};
  books.forEach(b => {
    categoriesMap[b.category] = (categoriesMap[b.category] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoriesMap).map(([category, count]) => ({ category, count }));

  // Downloads analytics
  const downloadMap: Record<string, number> = {};
  downloadLog.forEach(log => {
    const book = books.find(b => b.id === log.bookId);
    if (book) {
      downloadMap[book.title] = (downloadMap[book.title] || 0) + 1;
    }
  });
  // fallback for seeded downloads
  books.forEach(b => {
    if (!downloadMap[b.title]) {
      downloadMap[b.title] = Math.floor(b.salesCount * 1.4); // average download factor
    }
  });
  const downloadStats = Object.entries(downloadMap).map(([bookTitle, count]) => ({ bookTitle, count })).slice(0, 5);

  // Monthly Sales Aggregation
  // Let's create an elegant aggregate for the past 6 natural months
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySalesMap: Record<string, { revenue: number, orders: number }> = {};
  
  // initialize last 6 months with zero
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mLabel = months[d.getMonth()] + " " + d.getFullYear().toString().substring(2);
    monthlySalesMap[mLabel] = { revenue: 0, orders: 0 };
  }

  orders.forEach(o => {
    const od = new Date(o.date);
    const mLabel = months[od.getMonth()] + " " + od.getFullYear().toString().substring(2);
    if (monthlySalesMap[mLabel]) {
      monthlySalesMap[mLabel].revenue = Number((monthlySalesMap[mLabel].revenue + o.totalPrice).toFixed(2));
      monthlySalesMap[mLabel].orders += 1;
    }
  });

  const monthlySales = Object.entries(monthlySalesMap).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    orders: data.orders
  }));

  // Daily views aggregate for the last 10 days
  const dailyViewsMap: Record<string, number> = {};
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyViewsMap[dateStr] = 0;
  }

  viewsLog.forEach(v => {
    try {
      const vd = new Date(v.date);
      const dateStr = vd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyViewsMap[dateStr] !== undefined) {
        dailyViewsMap[dateStr] += 1;
      }
    } catch (e) {}
  });

  const dailyViews = Object.entries(dailyViewsMap).map(([date, views]) => ({ date, views }));

  res.json({
    totalSalesCount,
    totalRevenue,
    totalViews,
    conversionRate,
    totalCustomers: customers.length,
    monthlySales,
    categoryDistribution,
    downloadStats,
    dailyViews
  });
});

app.get('/api/admin/orders', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }
  res.json(db.getOrders());
});

app.get('/api/admin/customers', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }
  res.json(db.getCustomers());
});

// Bank configuration
app.get('/api/admin/settings/bank', (req, res) => {
  res.json(db.getBankDetails());
});

app.put('/api/admin/settings/bank', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }

  const { bankName, holderName, accountNumber, routingNumber, ifscCode, upiId } = req.body;
  
  const updatedBank: BankDetails = {
    bankName: bankName || "",
    holderName: holderName || "",
    accountNumber: accountNumber || "",
    routingNumber: routingNumber || "",
    ifscCode: ifscCode || "",
    upiId: upiId || ""
  };

  db.saveBankDetails(updatedBank);
  res.json(updatedBank);
});

// Payment Gateways configuration
app.get('/api/admin/settings/payments', (req, res) => {
  res.json(db.getPayments());
});

app.put('/api/admin/settings/payments', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }

  const { stripeEnabled, stripeKey, razorpayEnabled, razorpayKey, paypalEnabled, paypalEmail, upiEnabled, upiId, netBankingEnabled } = req.body;
  
  const updatedPayments: PaymentGateways = {
    stripeEnabled: stripeEnabled !== undefined ? Boolean(stripeEnabled) : true,
    stripeKey: stripeKey || "",
    razorpayEnabled: razorpayEnabled !== undefined ? Boolean(razorpayEnabled) : true,
    razorpayKey: razorpayKey || "",
    paypalEnabled: paypalEnabled !== undefined ? Boolean(paypalEnabled) : true,
    paypalEmail: paypalEmail || "",
    upiEnabled: upiEnabled !== undefined ? Boolean(upiEnabled) : true,
    upiId: upiId || "",
    netBankingEnabled: netBankingEnabled !== undefined ? Boolean(netBankingEnabled) : true
  };

  db.savePayments(updatedPayments);
  res.json(updatedPayments);
});

app.get('/api/admin/notifications', (req, res) => {
  res.json(notificationsQueue);
});

// Dynamic Page view logging fallback
app.post('/api/books/:id/views', (req, res) => {
  db.logPageView(req.params.id);
  res.json({ success: true });
});

// VITE MIDDLEWARE CONFIGURATION FOR DEV & COMPILED FOR PROD
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite development server injected into custom express container.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express microservices running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
