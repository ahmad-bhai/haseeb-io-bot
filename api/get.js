import TelegramBot from 'node-telegram-bot-api';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // URL se parameters nikalna: /api/get?token=YOUR_TOKEN&status=true&chat=@channel
    const { token, status, chat } = req.query;

    if (!token || !status) {
        return res.status(400).json({
            success: false,
            message: "Missing parameters! Use format: /api/get?token=YOUR_TOKEN&status=true&chat=@channel"
        });
    }

    const isEnable = status.toLowerCase() === 'true';
    const targetChat = chat || '@your_channel_username';

    try {
        if (isEnable) {
            // Telegram Bot instance create karna
            const bot = new TelegramBot(token, { polling: false });

            // Yahan aap bot ki koi bhi Telegram API request run kar sakte hain
            // Misal ke taur par, channel ki info check karna ya members count lena:
            const chatInfo = await bot.getChat(targetChat);

            return res.status(200).json({
                success: true,
                status: "installed",
                channel: chatInfo.title || targetChat,
                message: `Bot successfully activated! Target channel: ${targetChat}`,
                note: "Vercel par 10-minute automated loop ke liye is URL ko kisi external Cron service se bar bar hit karwana hoga."
            });

        } else {
            return res.status(200).json({
                success: true,
                status: "uninstalled",
                message: `Bot successfully deactivated for token: ${token.substring(0, 8)}...`
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            hint: "Make sure the bot token is correct and the bot is an admin in the target channel/group."
        });
    }
}
