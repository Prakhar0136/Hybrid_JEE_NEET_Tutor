require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const testRoutes = require('./routes/testRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes

app.use('/api/auth', authRoutes); // Includes signup, login
app.use('/api/chat', chatRoutes);
app.use('/api/test', testRoutes);
app.use('/api', authRoutes);      // To support /api/users/me
app.use('/api/ai', require('./routes/aiRoutes'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
