require('dotenv').config();
require('./config/redis');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const app = express();

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 20, // Max 20 wrong attempts per IP address
    message: {
        status: 429,
        error: "Too many login attempts from this IP address. Please try again after 15 minutes."
    },
    standardHeaders: true, 
    legacyHeaders: false,  
});

// ========== CORS CONFIGURATION ==========
const allowedOrigins = [
    'https://educare-point-cyber-cafe.vercel.app',
    'https://educarepointcybercafe.pages.dev',
    //  'https://educarepoint.in', 
    'http://localhost:3000',
    'http://localhost:5173',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ========== BODY PARSERS ==========
app.use(express.json());

// ========== SESSION (required for passport) ==========
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// ========== PASSPORT ==========
app.use(passport.initialize());
app.use(passport.session());
require('./passport')(passport);

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected - EducarePoint'))
    .catch(err => {
        console.error('❌ MongoDB Error:', err);
        process.exit(1);
    });

// ========== ROUTES ==========
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/download', require('./routes/download')); // ✅ PDF download proxy
app.use('/api/auth/login', adminLimiter);
app.use('/api/auth', require('./routes/auth').router);

// ========== TEST ROUTES ==========
app.get('/', (req, res) => {
    res.json({
        message: 'Educare Point API Running',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Educare Point Backend',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// ========== ERROR HANDLING ==========
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});