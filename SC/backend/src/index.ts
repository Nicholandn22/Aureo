import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory session key storage (for demo purposes)
// In production, use a database
const sessionKeys: Map<string, {
    sessionPrivateKey: string;
    sessionAddress: string;
    expiresAt: number;
}> = new Map();

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * Store session key from frontend
 */
app.post('/api/session-key', (req, res) => {
    try {
        const { smartAccountAddress, sessionPrivateKey, sessionAddress, expiresAt } = req.body;

        if (!smartAccountAddress || !sessionPrivateKey || !sessionAddress || !expiresAt) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Store session key
        sessionKeys.set(smartAccountAddress.toLowerCase(), {
            sessionPrivateKey,
            sessionAddress,
            expiresAt,
        });

        console.log(`✅ Session key stored for ${smartAccountAddress}`);
        console.log(`   Session Address: ${sessionAddress}`);
        console.log(`   Expires At: ${new Date(expiresAt * 1000).toISOString()}`);

        // Also write to .env file for persistence (optional)
        const envPath = path.join(__dirname, '..', '.env');
        const envKey = `SESSION_KEY_${smartAccountAddress.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
        const envValue = sessionPrivateKey;

        try {
            let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
            if (envContent.includes(envKey)) {
                // Update existing key
                const regex = new RegExp(`${envKey}=.*`, 'g');
                envContent = envContent.replace(regex, `${envKey}=${envValue}`);
            } else {
                // Add new key
                envContent += `\n${envKey}=${envValue}\n`;
            }
            fs.writeFileSync(envPath, envContent);
            console.log(`   💾 Persisted to .env file`);
        } catch (err) {
            console.warn('   ⚠️  Could not persist to .env file:', err);
        }

        res.json({ success: true, message: 'Session key stored successfully' });
    } catch (error) {
        console.error('Error storing session key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get session key for a smart account (for debugging)
 */
app.get('/api/session-key/:smartAccountAddress', (req, res) => {
    try {
        const { smartAccountAddress } = req.params;
        const sessionKey = sessionKeys.get(smartAccountAddress.toLowerCase());

        if (!sessionKey) {
            return res.status(404).json({ error: 'Session key not found' });
        }

        // Don't expose the private key in the response
        res.json({
            sessionAddress: sessionKey.sessionAddress,
            expiresAt: sessionKey.expiresAt,
            isExpired: Date.now() / 1000 > sessionKey.expiresAt,
        });
    } catch (error) {
        console.error('Error fetching session key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * List all stored session keys (for debugging)
 */
app.get('/api/session-keys', (req, res) => {
    try {
        const keys = Array.from(sessionKeys.entries()).map(([address, data]) => ({
            smartAccountAddress: address,
            sessionAddress: data.sessionAddress,
            expiresAt: data.expiresAt,
            isExpired: Date.now() / 1000 > data.expiresAt,
        }));

        res.json({ count: keys.length, keys });
    } catch (error) {
        console.error('Error listing session keys:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Aureo AI Agent Backend Server`);
    console.log(`📡 Listening on http://localhost:${PORT}`);
    console.log(`🌐 Network: Mantle Sepolia (Chain ID: ${process.env.CHAIN_ID})`);
    console.log(`\n✅ Ready to receive session keys from frontend\n`);
});

// Export for use in AI Agent
export { sessionKeys };
