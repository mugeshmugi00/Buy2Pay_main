const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:4200',
  'https://buy2-pay-main.vercel.app', 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
let isMongoDBConnected = false;

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb+srv://mugi84219:mugesh2002@cluster0.3dld5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { 
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Increase socket timeout
    connectTimeoutMS: 30000 // Increase connection timeout
  }
).then(() => {
  isMongoDBConnected = true;
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.log('Server will continue running with limited functionality');
});

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  isMongoDBConnected = false;
});
db.once('open', () => {
  isMongoDBConnected = true;
  console.log('Connected to MongoDB');
});

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['requester', 'approver', 'finance', 'admin'], required: true },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Requisition Schema
const RequisitionSchema = new mongoose.Schema({
  requisitionNumber: { type: String, required: true, unique: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  department: { type: String, required: true },
  items: [{
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    specifications: { type: String },
    deliveryDate: { type: Date, required: true }
  }],
  totalAmount: { type: Number, required: true },
  justification: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'modified'], default: 'submitted' },
  approvalHistory: [{
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approverName: { type: String },
    action: { type: String, enum: ['approved', 'rejected', 'modified'] },
    comments: { type: String },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Requisition = mongoose.model('Requisition', RequisitionSchema);

// Purchase Order Schema
const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  requisitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requisition', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  items: [{
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    deliveryDate: { type: Date, required: true }
  }],
  totalAmount: { type: Number, required: true },
  terms: { type: String },
  deliveryAddress: { type: String, required: true },
  status: { type: String, enum: ['sent', 'confirmed', 'partially_delivered', 'partially_received', 'received', 'completed', 'cancelled'], default: 'sent' },
  supplierConfirmation: {
    confirmed: { type: Boolean, default: false },
    confirmedDate: { type: Date },
    supplierComments: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);

// Supplier Schema
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  gst: { type: String, required: true },
  pan: { type: String, required: true },
  supplierCode: { type: String, required: true, unique: true },
  categories: [{ type: String }],
  rating: { type: Number, min: 1, max: 5, default: 3 },
  onTimeDeliveryRate: { type: Number, default: 0 },
  qualityRating: { type: Number, min: 1, max: 5, default: 3 },
  totalOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Supplier = mongoose.model('Supplier', SupplierSchema);

// Goods Receipt Schema
const GoodsReceiptSchema = new mongoose.Schema({
  grnNumber: { type: String, required: true, unique: true },
  poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  poNumber: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  receivedBy: { type: String, required: true },
  receivedDate: { type: Date, required: true },
  items: [{
    itemName: { type: String, required: true },
    orderedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    condition: { type: String, enum: ['good', 'damaged', 'defective'], default: 'good' },
    remarks: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  inspectionReport: { type: String },
  status: { type: String, enum: ['received', 'inspected', 'accepted', 'rejected'], default: 'received' },
  createdAt: { type: Date, default: Date.now }
});

const GoodsReceipt = mongoose.model('GoodsReceipt', GoodsReceiptSchema);

// Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  poNumber: { type: String, required: true },
  grnId: { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceipt' },
  grnNumber: { type: String },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  items: [{
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  totalTax: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  threeWayMatching: {
    poMatch: { type: Boolean, default: false },
    grnMatch: { type: Boolean, default: false },
    priceMatch: { type: Boolean, default: false },
    quantityMatch: { type: Boolean, default: false },
    isMatched: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['submitted', 'validated', 'approved', 'rejected', 'paid'], default: 'submitted' },
  paymentTerms: { type: String },
  discrepancies: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  invoiceNumber: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['bank_transfer', 'cheque', 'upi'], required: true },
  paymentDate: { type: Date, required: true },
  transactionReference: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processed', 'completed', 'failed'], default: 'pending' },
  processedBy: { type: String, required: true },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      department
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Requisition Routes
app.post('/api/requisitions', authenticateToken, checkRole(['requester', 'admin']), async (req, res) => {
  try {
    const requisitionNumber = 'REQ-' + Date.now();
    // When creating a requisition
    const requisition = new Requisition({
      ...req.body,
      totalAmount: Number(req.body.totalAmount), // force to number
      requisitionNumber,
      requesterId: req.user.userId,
      requesterName: req.user.name
    });

    await requisition.save();
    res.status(201).json(requisition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/requisitions', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'requester') {
      query.requesterId = req.user.userId;
    }

    const requisitions = await Requisition.find(query)
      .populate('requesterId', 'name email')
      .sort({ totalAmount: -1 });
    res.json(requisitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/requisitions/:id/approve', authenticateToken, checkRole(['approver', 'admin']), async (req, res) => {
  try {
    const { action, comments } = req.body;
    const requisition = await Requisition.findById(req.params.id);
    
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }

    requisition.status = action;
    requisition.approvalHistory.push({
      approverId: req.user.userId,
      approverName: req.user.name,
      action,
      comments
    });
    requisition.updatedAt = new Date();

    await requisition.save();
    res.json(requisition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase Order Routes
app.post('/api/purchase-orders', authenticateToken, checkRole(['approver', 'admin']), async (req, res) => {
  try {
    const poNumber = 'PO-' + Date.now();
    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      poNumber
    });

    await purchaseOrder.save();
    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate('requisitionId')
      .populate('supplierId')
      .sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

// Get purchase order by ID
app.get('/api/purchase-orders/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('requisitionId')
      .populate('supplierId');
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update purchase order status
app.patch('/api/purchase-orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    purchaseOrder.status = status;
    purchaseOrder.updatedAt = new Date();
    
    // When marking a PO as delivered
    purchaseOrder.deliveryStatus = 'on_time'; // or 'late'
    await purchaseOrder.save();
    
    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available purchase orders for goods receipt
app.get('/api/purchase-orders/available-for-receipt', authenticateToken, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({
      status: { $in: ['sent', 'confirmed', 'partially_received'] }
    })
      .populate('supplierId')
      .sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supplier Routes
app.post('/api/suppliers', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/suppliers/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/suppliers/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock data for when MongoDB is not connected
const mockSuppliers = [
  {
    _id: 'supplier1',
    name: 'ABC Suppliers',
    email: 'abc@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    gst: 'GST123456',
    pan: 'PAN123456',
    supplierCode: 'SUP001'
  },
  {
    _id: 'supplier2',
    name: 'XYZ Corporation',
    email: 'xyz@example.com',
    phone: '987-654-3210',
    address: '456 Oak Ave',
    gst: 'GST654321',
    pan: 'PAN654321',
    supplierCode: 'SUP002'
  }
];

const mockGoodsReceipts = [
  {
    _id: 'grn1',
    grnNumber: 'GRN-1755507915217',
    poId: 'po1',
    poNumber: 'PO-1755507915217',
    supplierId: 'supplier1',
    supplier: mockSuppliers[0],
    receivedBy: 'Anita Singh',
    receivedDate: new Date('2025-08-18'),
    items: [
      {
        itemName: 'Laptop',
        orderedQuantity: 10,
        receivedQuantity: 10,
        unitPrice: 1000,
        totalAmount: 10000,
        condition: 'good',
        remarks: ''
      }
    ],
    totalAmount: 10000,
    status: 'received',
    createdAt: new Date('2025-08-18')
  }
];

// Goods Receipt Routes
app.post('/api/goods-receipts', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    if (!isMongoDBConnected) {
      const grnNumber = 'GRN-' + Date.now();
      const mockGoodsReceipt = {
        _id: 'grn' + Date.now(),
        ...req.body,
        grnNumber,
        createdAt: new Date()
      };
      mockGoodsReceipts.push(mockGoodsReceipt);
      return res.status(201).json(mockGoodsReceipt);
    }
    
    const grnNumber = 'GRN-' + Date.now();
    const goodsReceipt = new GoodsReceipt({
      ...req.body,
      grnNumber
    });

    await goodsReceipt.save();
    res.status(201).json(goodsReceipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/goods-receipts', authenticateToken, async (req, res) => {
  try {
    if (!isMongoDBConnected) {
      return res.json(mockGoodsReceipts);
    }
    
    const goodsReceipts = await GoodsReceipt.find()
      .populate('poId')
      .populate('supplierId')
      .sort({ createdAt: -1 });
      
    // Ensure supplier information is properly included
    const enrichedReceipts = await Promise.all(goodsReceipts.map(async (receipt) => {
      const receiptObj = receipt.toObject();
      
      // If supplierId exists but wasn't populated properly
      if (receiptObj.supplierId && typeof receiptObj.supplierId === 'string') {
        try {
          const supplier = await Supplier.findById(receiptObj.supplierId);
          if (supplier) {
            receiptObj.supplier = supplier.toObject();
          }
        } catch (err) {
          console.error('Error fetching supplier:', err);
        }
      }
      
      return receiptObj;
    }));
    
    res.json(enrichedReceipts);
  } catch (error) {
    console.error('Error fetching goods receipts:', error);
    res.json(mockGoodsReceipts); // Fallback to mock data on error
  }
});

// Get a single goods receipt by ID
app.get('/api/goods-receipts/:id', authenticateToken, async (req, res) => {
  try {
    if (!isMongoDBConnected) {
      const mockReceipt = mockGoodsReceipts.find(receipt => receipt._id === req.params.id);
      if (mockReceipt) {
        return res.json(mockReceipt);
      } else {
        return res.status(404).json({ error: 'Goods receipt not found' });
      }
    }
    
    const goodsReceipt = await GoodsReceipt.findById(req.params.id)
      .populate('poId')
      .populate('supplierId');
      
    if (!goodsReceipt) {
      return res.status(404).json({ error: 'Goods receipt not found' });
    }
    
    const receiptObj = goodsReceipt.toObject();
    
    // If supplierId exists but wasn't populated properly
    if (receiptObj.supplierId && typeof receiptObj.supplierId === 'string') {
      try {
        const supplier = await Supplier.findById(receiptObj.supplierId);
        if (supplier) {
          receiptObj.supplier = supplier.toObject();
        }
      } catch (err) {
        console.error('Error fetching supplier:', err);
      }
    }
    
    res.json(receiptObj);
  } catch (error) {
    console.error('Error fetching goods receipt:', error);
    // Try to find a mock receipt as fallback
    const mockReceipt = mockGoodsReceipts.find(receipt => receipt._id === req.params.id);
    if (mockReceipt) {
      return res.json(mockReceipt);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Invoice Routes
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    
    // Perform three-way matching
    const po = await PurchaseOrder.findById(invoice.poId);
    const grn = await GoodsReceipt.findById(invoice.grnId);
    
    if (po && grn) {
      invoice.threeWayMatching.poMatch = true;
      invoice.threeWayMatching.grnMatch = true;
      invoice.threeWayMatching.priceMatch = Math.abs(po.totalAmount - invoice.totalAmount) < 100;
      invoice.threeWayMatching.quantityMatch = true; // Simplified logic
      invoice.threeWayMatching.isMatched = 
        invoice.threeWayMatching.poMatch && 
        invoice.threeWayMatching.grnMatch && 
        invoice.threeWayMatching.priceMatch && 
        invoice.threeWayMatching.quantityMatch;
    }

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('supplierId')
      .populate('poId')
      .populate('grnId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('supplierId')
      .populate('poId')
      .populate('grnId');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id/validate', authenticateToken, checkRole(['finance', 'admin']), async (req, res) => {
  try {
    const { status, comments } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedAt: new Date(),
        $push: { discrepancies: comments }
      },
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Routes
app.post('/api/payments', authenticateToken, checkRole(['finance', 'admin']), async (req, res) => {
  try {
    const paymentNumber = 'PAY-' + Date.now();
    const payment = new Payment({
      ...req.body,
      paymentNumber,
      processedBy: req.user.name
    });

    await payment.save();
    
    // Update invoice status
    await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'paid' });
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('invoiceId')
      .populate('supplierId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Routes
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalRequisitions = await Requisition.countDocuments();
    const approvedRequisitions = await Requisition.countDocuments({ status: 'approved' });
    const totalPOs = await PurchaseOrder.countDocuments();
    const totalSuppliers = await Supplier.countDocuments({ isActive: true });
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    
    const totalSpend = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const supplierPerformance = await Supplier.aggregate([
      {
        $lookup: {
          from: 'purchaseorders',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpend: { $sum: '$orders.totalAmount' },
          onTimeDeliveryRate: {
            $cond: [
              { $gt: [{ $size: '$orders' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$orders',
                            as: 'order',
                            cond: { $eq: ['$$order.deliveryStatus', 'on_time'] }
                          }
                        }
                      },
                      { $size: '$orders' }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          },
          qualityRating: { $avg: '$orders.qualityRating' }
        }
      },
      {
        $project: {
          name: 1,
          totalOrders: 1,
          totalSpend: 1,
          onTimeDeliveryRate: 1,
          qualityRating: 1
        }
      }
    ]);

    const monthlySpend = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      summary: {
        totalRequisitions,
        approvedRequisitions,
        totalPOs,
        totalSuppliers,
        totalInvoices,
        paidInvoices,
        totalSpend: totalSpend[0]?.total || 0,
        approvalRate: totalRequisitions > 0 ? (approvedRequisitions / totalRequisitions * 100).toFixed(1) : 0,
        paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices * 100).toFixed(1) : 0
      },
      supplierPerformance,
      monthlySpend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/supplier-performance', authenticateToken, async (req, res) => {
  try {
    const supplierStats = await Supplier.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'purchaseorders',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'payments'
        }
      },
      {
        $project: {
          name: 1,
          rating: 1,
          onTimeDeliveryRate: 1,
          qualityRating: 1,
          totalOrders: { $size: '$orders' },
          totalSpend: { $sum: '$payments.amount' },
          avgOrderValue: {
            $cond: {
              if: { $eq: [{ $size: '$orders' }, 0] },
              then: 0,
              else: { $divide: [{ $sum: '$payments.amount' }, { $size: '$orders' }] }
            }
          }
        }
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 20 }
    ]);

    res.json(supplierStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;