const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.0 || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (Aap ise MongoDB ya JSON file se replace kar sakte hain)
let botsDatabase = []; 
let activeBotInstances = {};

// Bot Token verify karke run karne ka function
function startBotInstance(botData) {
    try {
        if (activeBotInstances[botData.botToken]) return; // Agar pehle se chal raha hai

        const bot = new TelegramBot(botData.botToken, { polling: true });
        
        bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            
            if (text === '/start') {
                bot.sendMessage(chatId, `Hello! 👋 Your bot is successfully running on our custom platform.`);
            } else {
                bot.sendMessage(chatId, `Echo: ${text}`);
            }
        });

        activeBotInstances[botData.botToken] = bot;
        console.log(`Bot started successfully for User ID: ${botData.userId}`);
    } catch (error) {
        console.error(`Failed to start bot (${botData.botToken}):`, error.message);
    }
}

// API: Create / Register Bot
app.post('/api/create-bot', async (req, res) => {
    const { userId, botName, botToken } = req.body;

    if (!userId || !botName || !botToken) {
        return res.status(400).json({ success: false, message: 'All fields are required!' });
    }

    // Check if token already exists
    const exists = botsDatabase.find(b => b.botToken === botToken);
    if (exists) {
        return res.status(400).json({ success: false, message: 'This bot token is already registered!' });
    }

    const newBot = { userId, botName, botToken, createdAt: new Date() };
    botsDatabase.push(newBot);

    // Start the bot on Telegram
    startBotInstance(newBot);

    res.json({ success: true, message: 'Bot created and started successfully!' });
});

// API: Get User's Bots using 20-digit Unique ID
app.get('/api/my-bots/:userId', (req, res) => {
    const { userId } = req.params;
    const userBots = botsDatabase.filter(b => b.userId === userId);
    res.json({ success: true, bots: userBots });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
