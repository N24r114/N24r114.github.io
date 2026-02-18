document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('target-ip');
    const saveIpBtn = document.getElementById('save-ip');
    const statusMsg = document.getElementById('status-msg');
    const txtInput = document.getElementById('txt');
    const sendTextBtn = document.getElementById('send-text-btn');

    // Load saved IP
    let targetIp = localStorage.getItem('remote_target_ip') || '';
    if (targetIp) {
        ipInput.value = targetIp;
        statusMsg.textContent = `Conectado a: ${targetIp}`;
    }

    // Save IP
    saveIpBtn.addEventListener('click', () => {
        targetIp = ipInput.value.trim();
        if (targetIp) {
            localStorage.setItem('remote_target_ip', targetIp);
            statusMsg.textContent = `Conectado a: ${targetIp}`;
        }
    });

    // Helper to send command
    async function sendCommand(cmd) {
        if (!targetIp) {
            statusMsg.textContent = '❌ Error: Ingresa la IP arriba';
            return;
        }

        const url = `http://${targetIp}:5000/api/command`;
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(40);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: cmd }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('Server error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // Helper to send text
    async function sendText() {
        const text = txtInput.value.trim();
        if (!text) return;

        if (!targetIp) {
            statusMsg.textContent = '❌ Error: Ingresa la IP arriba';
            return;
        }

        if (navigator.vibrate) navigator.vibrate(80);

        try {
            await fetch(`http://${targetIp}:5000/api/type`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            txtInput.value = ''; // Clear input
        } catch (error) {
            console.error('Fetch error:', error);
            statusMsg.textContent = '❌ Error de conexión';
        }
    }

    // Event Listeners for Buttons
    // We use pointerdown for faster reaction than click
    document.querySelectorAll('button[data-cmd]').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault(); // Prevent double firing
            const cmd = btn.getAttribute('data-cmd');
            sendCommand(cmd);
        });
    });

    // Send Text Button
    sendTextBtn.addEventListener('click', sendText);

    // Enter key in textarea to send
    txtInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendText();
        }
    });
});
