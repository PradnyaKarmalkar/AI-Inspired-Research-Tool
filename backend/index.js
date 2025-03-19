const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Multer setup for PDF uploads
const upload = multer({ dest: "uploads/" });

app.post("/api/questions/ask", upload.single("pdf"), (req, res) => {
    const question = req.body.question;
    const pdfPath = req.file ? req.file.path : null;

    if (!question || !pdfPath) {
        return res.status(400).json({ error: "Both question and PDF are required" });
    }

    // Call the Python script
    exec(`python qa_model.py "${question}" "${pdfPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).json({ error: "Error processing question" });
        }

        const answer = stdout.trim();
        res.json({ answer });

        // Delete the uploaded PDF after processing
        fs.unlink(pdfPath, (err) => {
            if (err) console.error("Error deleting PDF:", err);
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
