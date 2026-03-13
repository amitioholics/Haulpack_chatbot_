const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    // Format links and bold text
    let formattedText = text.replace(/(www\.[\w\-.]+)/g, '<a href="https://$1" target="_blank">$1</a>');
    formattedText = formattedText.replace(/\n/g, '<br>');

    // Handle markdown-style bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    msgDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add to local history for context
    chatHistory.push({ text: text, sender: sender });
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'bot');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-indicator-container">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

async function getBotResponse(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory.slice(-6) // Send last 6 messages for context
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error communicating with backend:", error);
        return "I'm having trouble connecting to my server right now. Please try again later or contact cs@haulpack.com.";
    }
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';
    userInput.focus();

    showTypingIndicator();

    const response = await getBotResponse(text);

    removeTypingIndicator();
    addMessage(response, 'bot');
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Auto-focus input on load
window.onload = () => {
    userInput.focus();
};
