document.addEventListener('DOMContentLoaded', () => {
    // 1. Generate or Retrieve 20-digit Unique ID
    function getOrCreateUniqueId() {
        let userId = localStorage.getItem('user_unique_id');
        if (!userId) {
            userId = '';
            for (let i = 0; i < 20; i++) {
                userId += Math.floor(Math.random() * 10);
            }
            localStorage.setItem('user_unique_id', userId);
        }
        return userId;
    }

    const currentUserId = getOrCreateUniqueId();
    document.getElementById('uniqueIdDisplay').textContent = currentUserId;

    // Load user's bots on startup
    loadUserBots(currentUserId);

    // 2. Handle Bot Creation Form Submit
    const botForm = document.getElementById('botForm');
    botForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const botName = document.getElementById('botName').value;
        const botToken = document.getElementById('botToken').value;
        const responseMsg = document.getElementById('responseMsg');

        responseMsg.textContent = 'Deploying bot...';
        responseMsg.style.color = '#3498db';

        try {
            const response = await fetch('/api/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, botName, botToken })
            });

            const result = await response.json();

            if (result.success) {
                responseMsg.textContent = result.message;
                responseMsg.style.color = '#2ecc71';
                botForm.reset();
                loadUserBots(currentUserId); // Refresh list
            } else {
                responseMsg.textContent = result.message;
                responseMsg.style.color = '#e74c3c';
            }
        } catch (error) {
            responseMsg.textContent = 'Server error occurred!';
            responseMsg.style.color = '#e74c3c';
        }
    });

    // 3. Fetch and Display User's Bots
    async function loadUserBots(userId) {
        const container = document.getElementById('botsContainer');
        try {
            const res = await fetch(`/api/my-bots/${userId}`);
            const data = await res.json();

            if (data.success && data.bots.length > 0) {
                container.innerHTML = '';
                data.bots.forEach(bot => {
                    container.innerHTML += `
                        <div class="bot-item">
                            <h4>🤖 ${bot.botName}</h4>
                            <p>Token: ${bot.botToken.substring(0, 10)}...</p>
                        </div>
                    `;
                });
            } else {
                container.innerHTML = '<p>No bots created yet. Create your first bot above!</p>';
            }
        } catch (error) {
            container.innerHTML = '<p>Failed to load your bots.</p>';
        }
    }
});
