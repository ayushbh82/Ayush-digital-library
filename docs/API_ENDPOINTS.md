/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Add the following API endpoints to server.ts for quick ebook management
 */

// Add these imports at the top of server.ts
import multer from 'multer';
import { adminManager } from './src/server/adminManager.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Quick Add Ebook Endpoint (Admin only)
app.post('/api/admin/ebooks/quick-add', upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'coverFile', maxCount: 1 }
]), (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const { title, author, description, category, price, pages, fileSize } = req.body;
  const files = req.files as { [key: string]: Express.Multer.File[] };

  // Validate required fields
  if (!title || !description || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Convert cover image to base64 if provided
    let coverUrl = "";
    if (files.coverFile && files.coverFile[0]) {
      const coverData = files.coverFile[0].buffer.toString('base64');
      const mimeType = files.coverFile[0].mimetype;
      coverUrl = `data:${mimeType};base64,${coverData}`;
    }

    // Create the ebook
    const newBook: Book = {
      id: `eb-${Date.now()}`,
      title,
      author: author || "Ayush",
      description: description || "No summary provided.",
      category: category || "General",
      price: Number(price),
      rating: 5.0,
      ratingsCount: 0,
      coverUrl: coverUrl || "", // Base64 cover image
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
      message: "🎉 New eBook Added",
      subtext: `"${newBook.title}" by ${newBook.author} has been successfully published!`,
      date: new Date().toISOString()
    });

    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error creating ebook:', error);
    res.status(500).json({ error: "Failed to create ebook" });
  }
});

// Get All Admin Ebooks (Admin only)
app.get('/api/admin/ebooks', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }

  const books = db.getBooks();
  res.json(books);
});

// Bulk Upload Ebooks (Admin only)
app.post('/api/admin/ebooks/bulk-upload', upload.single('csvFile'), (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No CSV file provided" });
  }

  try {
    const csvContent = req.file.buffer.toString('utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const uploadedBooks: Book[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const bookData: { [key: string]: string } = {};

      headers.forEach((header, index) => {
        bookData[header] = values[index] || '';
      });

      if (!bookData['title'] || !bookData['price']) continue;

      const newBook: Book = {
        id: `eb-${Date.now()}-${i}`,
        title: bookData['title'],
        author: bookData['author'] || "Ayush",
        description: bookData['description'] || "",
        category: bookData['category'] || "General",
        price: Number(bookData['price']) || 0,
        rating: 5.0,
        ratingsCount: 0,
        coverUrl: "",
        fileSize: bookData['filesize'] || "5.0 MB",
        pages: Number(bookData['pages']) || 120,
        salesCount: 0,
        viewsCount: 0,
        inventoryCount: 9999,
        reviews: [],
        publishDate: new Date().toISOString().split('T')[0]
      };

      db.saveBook(newBook);
      uploadedBooks.push(newBook);
    }

    res.json({
      message: `Successfully uploaded ${uploadedBooks.length} ebooks`,
      ebooks: uploadedBooks
    });
  } catch (error) {
    console.error('Error bulk uploading ebooks:', error);
    res.status(500).json({ error: "Failed to bulk upload ebooks" });
  }
});

// Quick Edit Ebook (Admin only)
app.put('/api/admin/ebooks/:id/quick-edit', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifyTokenAndGetUser(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }

  const bookId = req.params.id;
  const existingBook = db.getBookById(bookId);
  if (!existingBook) {
    return res.status(404).json({ error: "eBook not found" });
  }

  const { title, price, description, category } = req.body;

  const updatedBook: Book = {
    ...existingBook,
    title: title !== undefined ? title : existingBook.title,
    price: price !== undefined ? Number(price) : existingBook.price,
    description: description !== undefined ? description : existingBook.description,
    category: category !== undefined ? category : existingBook.category
  };

  db.saveBook(updatedBook);
  res.json(updatedBook);
});
