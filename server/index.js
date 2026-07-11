require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ========== CORS CONFIGURATION ==========
const allowedOrigins = [
    'https://educare-point-cyber-cafe.vercel.app',
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
app.use('/api/auth', require('./routes/auth').router);   // ← NEW

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
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

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