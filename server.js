const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

// Set storage engine for multer to save images locally
const storage = multer.diskStorage({
    destination: './uploads/', // Folder where images will be saved
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname)); // Save with timestamp to avoid conflicts
    },
});

// Initialize multer
const upload = multer({ storage: storage });

// API endpoint to upload image
app.post('/upload', upload.single('img'), (req, res) => {
    // Access the uploaded file info via req.file
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    // Return the file URL for later use
    const imageUrl = `${process.env.BASE_URL}uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

app.post('/uploadMulti', upload.fields([
    { name: "imgCover", maxCounts: 1 },
    { name: "images", maxCounts: 10 },
]), (req, res) => {
    // Access the uploaded file info via req.file
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    // Prepare URLs for uploaded files
    const imgCoverUrl = req.files['imgCover'] ? `${process.env.BASE_URL}uploads/${req.files['imgCover'][0].filename}` : null;
    const imagesUrls = req.files['images'] ? req.files['images'].map(file => `${process.env.BASE_URL}uploads/${file.filename}`) : [];

    res.json({ imgCoverUrl, imagesUrls });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

app.listen(3002, () => console.log('Image upload service running on port 3002'));
