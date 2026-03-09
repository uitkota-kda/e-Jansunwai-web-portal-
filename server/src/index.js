require('dotenv').config();
const app = require('./app');
const http = require('http');
const https = require('https');
const fs = require('fs');

const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 3443; // Default HTTPS port if not specified

// Check if SSL certificates are provided
if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    try {
        const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
        const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
        const credentials = { key: privateKey, cert: certificate };

        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(httpsPort, () => {
            console.log(`HTTPS Server running securely on port ${httpsPort}`);
        });

        // Optional: Also run HTTP server to redirect to HTTPS, or just run both for local dev
        const httpServer = http.createServer(app);
        httpServer.listen(port, () => {
            console.log(`HTTP Server running on port ${port} (Consider redirecting to HTTPS in production)`);
        });

    } catch (error) {
        console.error("Failed to start HTTPS server. Check your certificate paths.", error);
        // Fallback to HTTP if certificates fail to load
        app.listen(port, () => {
            console.log(`Fallback HTTP Server running on port ${port}`);
        });
    }
} else {
    // Run normal HTTP server if no certificates provided
    app.listen(port, () => {
        console.log(`HTTP Server running on port ${port}`);
        console.log("Tip: Provide SSL_KEY_PATH and SSL_CERT_PATH in .env to enable HTTPS.");
    });
}

// Trigger nodemon restart
