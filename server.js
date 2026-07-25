const express = require('express');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const app = express();
app.use(express.json());

// Background jobs ya active sessions store karne ke liye
const activeTasks = new Map();

// --- API ENDPOINT ---
// URL: /api/get?token=YOUR_BOT_TOKEN&status=true&chat=@your_channel
app.get('/api/get', async (req, res) => {
    const { token, status, chat } = req.query;
    
    if (!token || !status) {
        return res.status(400).json({ success: false, message: "Token and status are required!" });
    }

    const isEnable = status.toLowerCase() === 'true';
    const targetChat = chat || '@your_channel_username';

    if (isEnable) {
        // Agar pehle se chal raha hai toh dobara start na ho
        if (activeTasks.has(token)) {
            return res.json({ success: true, message: "Bot is already running and adding members!" });
        }

        // Background Interval: Har 10 minutes (600,000 ms) baad task run hoga
        const intervalId = setInterval(async () => {
            try {
                console.log(`[RUNNING] Bot using token/session trying to process members for ${targetChat}...`);
                
                // Yahan members add karne ki API request ya logic aayegi
                // Note: Telegram par direct random members add karne ke liye Userbot (MTProto) 
                // ya phone sessions ki zaroorat hoti hai, standard Bot token se limits hoti hain.
                
            } catch (error) {
                console.error(`[ERROR] Member addition failed:`, error.message);
            }
        }, 10 * 60 * 1000); // 10 Minutes

        activeTasks.set(token, intervalId);

        return res.json({
            success: true,
            status: "activated",
            message: `System activated! Bot will attempt to process members every 10 minutes for ${targetChat}.`
        });

    } else {
        // Stop / Uninstall
        if (activeTasks.has(token)) {
            clearInterval(activeTasks.get(token));
            activeTasks.delete(token);
        }

        return res.json({
            success: true,
            status: "deactivated",
            message: "System successfully stopped and uninstalled."
        });
    }
});

app.get('/', (req, res) => {
    res.json({ message: "Telegram Member Automation Server is Live!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
