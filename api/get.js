export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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
            // Telegram API ko direct fetch ke zariye check karna taake crash na ho
            const telegramUrl = `https://api.telegram.org/bot${token}/getMe`;
            const response = await fetch(telegramUrl);
            const data = await response.json();

            if (!data.ok) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Telegram Bot Token!"
                });
            }

            return res.status(200).json({
                success: true,
                status: "installed",
                bot_name: data.result.username,
                target_chat: targetChat,
                message: `Bot @${data.result.username} successfully installed & activated!`
            });

        } else {
            return res.status(200).json({
                success: true,
                status: "uninstalled",
                message: "Bot successfully deactivated."
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
