// Vercel Serverless Function for Telegram Bot Management

export default async function handler(req, res) {
    // CORS headers agar zaroorat ho
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // URL se token aur status nikalna (Query params ya path se)
    // Example format: /api/get?token=YOUR_TOKEN&status=true
    const { token, status } = req.query;

    if (!token || !status) {
        return res.status(400).json({
            success: false,
            message: "Missing parameters! Use format: /api/get?token=YOUR_TOKEN&status=true"
        });
    }

    const isEnable = status.toLowerCase() === 'true';

    try {
        if (isEnable) {
            // Yahan bot install / activate hone ki logic aayegi
            // Note: Vercel par setInterval kaam nahi karega, isliye yahan aap database (jaise MongoDB ya Vercel KV) mein token save kar sakte hain.
            
            return res.status(200).json({
                success: true,
                token: token,
                status: "installed",
                message: `Bot successfully installed & activated for token: ${token.substring(0, 8)}...`,
                target_url: `https://haseeb-io-bot.vercel.app/api/get?token=${token}&status=true`
            });
        } else {
            // Yahan bot uninstall / deactivate hone ki logic aayegi
            
            return res.status(200).json({
                success: true,
                token: token,
                status: "uninstalled",
                message: `Bot successfully uninstalled & deactivated.`,
                target_url: `https://haseeb-io-bot.vercel.app/api/get?token=${token}&status=false`
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
