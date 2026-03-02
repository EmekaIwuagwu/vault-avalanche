export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const backendUrl = process.env.PUBLIC_BACKEND_URL;
        const frontendUrl = process.env.PUBLIC_FRONTEND_URL;

        if (backendUrl || frontendUrl) {
            console.log('[Keep-Alive] Starting frontend monitoring loop...');

            // Ping every 13 minutes (Render's limit is 15 mins)
            setInterval(async () => {
                try {
                    if (backendUrl) {
                        console.log(`[Keep-Alive] Frontend pinging backend: ${backendUrl}`);
                        await fetch(`${backendUrl}/health`).catch(() => { });
                    }
                    if (frontendUrl) {
                        console.log(`[Keep-Alive] Frontend pinging itself: ${frontendUrl}`);
                        await fetch(`${frontendUrl}/api/health`).catch(() => { });
                    }
                } catch (err) {
                    console.error('[Keep-Alive] Error during ping:', err);
                }
            }, 13 * 60 * 1000);
        } else {
            console.log('[Keep-Alive] No URLs provided in env (PUBLIC_BACKEND_URL/PUBLIC_FRONTEND_URL), skipping monitoring.');
        }
    }
}
