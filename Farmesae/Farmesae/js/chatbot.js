// Chatbot Configuration
const chatbotConfig = {
    name: "Farmease Assistant",
    welcomeMessage: "Hello! I'm your Farmease shopping assistant. How can I help you today?",
    maxHistory: 50,
    typingSpeed: 1000,
    responseDelay: 500,
    features: {
        voiceMessages: true,
        fileSharing: true,
        videoCalls: true,
        reactions: true,
        search: true
    }
};

// Chatbot State
const chatbotState = {
    isOpen: false,
    isMinimized: false,
    isTyping: false,
    lastOrder: null,
    unreadMessages: 0,
    context: {},
    user: {
        name: "User",
        preferences: {
            theme: "light",
            notifications: true
        }
    },
    session: {
        cart: [],
        recentSearches: [],
        conversationHistory: []
    }
};

// DOM Elements
const chatbotContainer = document.createElement('div');
chatbotContainer.className = 'chatbot-container';
chatbotContainer.innerHTML = `
    <div class="chatbot-header">
        <div class="chatbot-title">
            <i class="fas fa-robot"></i>
            <h3>${chatbotConfig.name}</h3>
        </div>
        <div class="chatbot-actions">
            <button class="minimize-btn"><i class="fas fa-minus"></i></button>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
    </div>
    <div class="chatbot-search">
        <input type="text" class="search-input" placeholder="Search messages...">
    </div>
    <div class="chatbot-messages"></div>
    <div class="chatbot-input-container">
        <div class="chatbot-input-wrapper">
            <button class="attachment-btn"><i class="fas fa-paperclip"></i></button>
            <input type="text" class="chatbot-input" placeholder="Type your message...">
            <button class="voice-btn"><i class="fas fa-microphone"></i></button>
            <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>
`;

const chatToggle = document.createElement('div');
chatToggle.className = 'chat-toggle';
chatToggle.innerHTML = '<i class="fas fa-comments"></i>';

document.body.appendChild(chatbotContainer);
document.body.appendChild(chatToggle);

// Core Functions
function toggleChat() {
    chatbotState.isOpen = !chatbotState.isOpen;
    chatbotContainer.classList.toggle('active');
    chatToggle.classList.toggle('active');
    
    if (chatbotState.isOpen) {
        chatbotState.unreadMessages = 0;
        updateUnreadIndicator();
    }
}

function minimizeChat() {
    chatbotState.isMinimized = !chatbotState.isMinimized;
    chatbotContainer.classList.toggle('minimized');
}

function closeChat() {
    chatbotState.isOpen = false;
    chatbotContainer.classList.remove('active');
    chatToggle.classList.remove('active');
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = content;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageStatus = document.createElement('div');
    messageStatus.className = 'message-status';
    if (isUser) {
        messageStatus.innerHTML = '<i class="fas fa-check-double"></i>';
    }
    
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    messageContent.appendChild(messageStatus);
    messageDiv.appendChild(messageContent);
    
    const messagesContainer = chatbotContainer.querySelector('.chatbot-messages');
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    if (!chatbotState.isOpen) {
        chatbotState.unreadMessages++;
        updateUnreadIndicator();
    }
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    
    const messagesContainer = chatbotContainer.querySelector('.chatbot-messages');
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return typingDiv;
}

function hideTypingIndicator(typingDiv) {
    typingDiv.remove();
}

function addReactions(messageDiv) {
    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'message-reactions';
    
    const reactions = ['👍', '❤️', '😊', '😮', '😢'];
    reactions.forEach(reaction => {
        const button = document.createElement('button');
        button.className = 'reaction-btn';
        button.textContent = reaction;
        button.onclick = () => toggleReaction(button, reaction);
        reactionsDiv.appendChild(button);
    });
    
    messageDiv.appendChild(reactionsDiv);
}

function toggleReaction(button, reaction) {
    button.classList.toggle('active');
    // Add reaction to message in conversation history
}

function addFileAttachment(file) {
    const attachmentDiv = document.createElement('div');
    attachmentDiv.className = 'file-attachment';
    
    attachmentDiv.innerHTML = `
        <i class="fas fa-file"></i>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
    `;
    
    return attachmentDiv;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function startVoiceRecording() {
    // Implement voice recording functionality
    console.log('Voice recording started');
}

function stopVoiceRecording() {
    // Implement voice recording stop functionality
    console.log('Voice recording stopped');
}

function startVideoCall() {
    // Implement video call functionality
    console.log('Video call started');
}

function searchMessages(query) {
    const messages = chatbotContainer.querySelectorAll('.message');
    messages.forEach(message => {
        const text = message.textContent.toLowerCase();
        message.style.display = text.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

function updateUnreadIndicator() {
    const indicator = chatToggle.querySelector('.new-message-indicator') || document.createElement('div');
    indicator.className = 'new-message-indicator';
    
    if (chatbotState.unreadMessages > 0) {
        if (!chatToggle.contains(indicator)) {
            chatToggle.appendChild(indicator);
        }
    } else {
        indicator.remove();
    }
}

// Event Listeners
chatToggle.addEventListener('click', toggleChat);

chatbotContainer.querySelector('.minimize-btn').addEventListener('click', minimizeChat);
chatbotContainer.querySelector('.close-btn').addEventListener('click', closeChat);

const sendButton = chatbotContainer.querySelector('.send-btn');
const inputField = chatbotContainer.querySelector('.chatbot-input');

sendButton.addEventListener('click', () => {
    const message = inputField.value.trim();
    if (message) {
        addMessage(message, true);
        inputField.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const typingIndicator = showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator(typingIndicator);
                addMessage("I'm processing your request...");
            }, chatbotConfig.typingSpeed);
        }, chatbotConfig.responseDelay);
    }
});

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

const searchInput = chatbotContainer.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    searchMessages(e.target.value);
});

const voiceButton = chatbotContainer.querySelector('.voice-btn');
voiceButton.addEventListener('mousedown', startVoiceRecording);
voiceButton.addEventListener('mouseup', stopVoiceRecording);
voiceButton.addEventListener('mouseleave', stopVoiceRecording);

const attachmentButton = chatbotContainer.querySelector('.attachment-btn');
attachmentButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const attachment = addFileAttachment(file);
            addMessage(attachment.outerHTML, true);
        }
    };
    input.click();
});

// Initialize Chatbot
function initChatbot() {
    addMessage(chatbotConfig.welcomeMessage);
    
    // Add quick replies
    const quickReplies = [
        "Browse Products",
        "Track Order",
        "View Cart",
        "Get Support"
    ];
    
    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.className = 'chatbot-quick-replies';
    
    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply';
        button.textContent = reply;
        button.onclick = () => {
            addMessage(reply, true);
            // Handle quick reply
        };
        quickRepliesDiv.appendChild(button);
    });
    
    chatbotContainer.querySelector('.chatbot-messages').appendChild(quickRepliesDiv);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initChatbot);

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const chatToggle = document.getElementById('chatToggle');
    const chatbot = document.getElementById('chatbot');
    const minimizeBtn = document.getElementById('minimizeChatbot');
    const closeBtn = document.getElementById('closeChatbot');
    const sendBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatbotInput');
    const chatDisplay = document.getElementById('chatDisplay');

    // Toggle chatbot visibility
    chatToggle.addEventListener('click', function() {
        chatbot.classList.toggle('hidden');
        if (!chatbot.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    // Minimize chatbot
    minimizeBtn.addEventListener('click', function() {
        chatbot.classList.add('minimized');
    });

    // Close chatbot
    closeBtn.addEventListener('click', function() {
        chatbot.classList.add('hidden');
    });

    // Send message on button click
    sendBtn.addEventListener('click', function() {
        sendChatMessage();
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Function to send chat message
    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, 'user');
            chatInput.value = '';

            // Simulate bot response after a delay
            setTimeout(() => {
                const botResponse = "Thank you for your message. Our team will get back to you soon.";
                addMessage(botResponse, 'bot');
            }, 1000);
        }
    }

    // Function to add message to chat display
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="timestamp">${timestamp}</span>
            </div>
        `;
        
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
}); 