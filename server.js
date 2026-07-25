const express = require('express');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'tokens.json');

// Helper functions for data management
function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Active jobs ko track karne ke liye Map (token -> interval ID)
const activeJobs = new Map();

// --- API ROUTES ---

// Endpoint format: /api/get/:token/:status
// Example: https://haseeb-io-bot.vercel.app/api/get/YOUR_BOT_TOKEN/true
app.get('/api/get/:token/:status', (req, res) => {
    const { token, status } = req.params;
    const isEnable = status.toLowerCase() === 'true';

    let botsData = loadData();
    let botRecord = botsData.find(b => b.token === token);

    if (!botRecord) {
        botRecord = { token, active: false };
        botsData.push(botRecord);
    }

    botRecord.active = isEnable;
    saveData(botsData);

    if (isEnable) {
        startBotAutomation(token);
        return res.json({ 
            success: true, 
            message: `Bot successfully installed & activated. Running every 10 minutes.`,
            url: `https://haseeb-io-bot.vercel.app/api/get/${token}/true`
        });
    } else {
        stopBotAutomation(token);
        return res.json({ 
            success: true, 
            message: `Bot successfully uninstalled & deactivated.`,
            url: `https://haseeb-io-bot.vercel.app/api/get/${token}/false`
        });
    }
});

// Root route check
app.get('/', (req, res) => {
    res.json({ status: "Telegram Bot Automation API is running smoothly." });
});

// --- AUTOMATION BACKGROUND ENGINE ---

function startBotAutomation(token) {
    if (activeJobs.has(token)) return;

    console.log(`[STARTED] Automation started for token: ${token.substring(0, 8)}...`);

    // Telegram Bot Instance (Polling off kyunki yeh background background task/scheduler hai)
    const bot = new TelegramBot(token, { polling: false });

    // 10 minutes interval (10 * 60 * 1000 ms)
    const INTERVAL_TIME = 10 * 60 * 1000; 

    const intervalId = setInterval(async () => {
        try {
            console.log(`[RUNNING] Executing task for bot: ${token.substring(0, 8)}...`);
            
            // Yahan aap apni custom bot logic likh sakte hain 
            // (Jaise channel stats check karna ya messages process karna)
            
        } catch (error) {
            console.error(`[ERROR] Bot execution error:`, error.message);
        }
    }, INTERVAL_TIME);

    activeJobs.set(token, intervalId);
}

function stopBotAutomation(token) {
    if (activeJobs.has(token)) {
        clearInterval(activeJobs.get(token));
        activeJobs.delete(token);
        console.log(`[STOPPED] Automation stopped for token: ${token.substring(0, 8)}...`);
    }
}

// Server restart hone par active bots ko dobara resume karna
function restoreActiveBots() {
    const botsData = loadData();
    botsData.forEach(b => {
        if (b.active) {
            startBotAutomation(b.token);
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    restoreActiveBots();
});
