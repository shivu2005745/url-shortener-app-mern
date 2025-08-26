// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

const app = express();

// -Middleware ---
app.use(express.json());
app.use(cors());

// --- Database Connection ---
const mongoURI = 'mongodb+srv://2k23cs2313061:nI2g23kwG7nsfmME@cluster0.geqeoet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully.');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// --- URL Schema and Model --
const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Url = mongoose.model('Url', urlSchema);

// --- API Endpoints -
app.post('/api/shorten', async (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl || !longUrl.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL provided.' });
    }

    try {
        let existingUrl = await Url.findOne({ originalUrl: longUrl });

        if (existingUrl) {
            return res.json({ shortUrl: existingUrl.shortUrl });
        }

        const shortUrl = shortid.generate();
        const newUrl = new Url({
            originalUrl: longUrl,
            shortUrl: shortUrl
        });

        await newUrl.save();

        res.status(201).json({ shortUrl: newUrl.shortUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const urlDoc = await Url.findOne({ shortUrl: shortUrl });

        if (urlDoc) {
            return res.redirect(urlDoc.originalUrl);
        } else {
            return res.status(404).json({ error: 'URL not found.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --Server Startup 
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
