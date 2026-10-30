require('dotenv').config();
require('./config/langfuse');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const testRoutes = require('./routes/testRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/+$/, ''));

// Connect Database
connectDB();

// Health check endpoint for Render/monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/+$/, '');
        if (
            allowedOrigins.includes(normalized) ||
            (process.env.NODE_ENV !== 'production' && normalized.includes('localhost')) ||
            (process.env.FRONTEND_URL && normalized === process.env.FRONTEND_URL.replace(/\/+$/, '')) ||
            normalized.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/test', testRoutes);
app.use('/api', authRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
