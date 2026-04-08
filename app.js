const appData = {
    currentView: 'inbox',
    views: {
        'inbox': { title: 'Omni Inbox' },
        'live-chat': { title: 'Live Agent Active' },
        'social': { title: 'Social Streams Aggregated' },
        'voice': { title: 'Voice Transcripts & Analysis' }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Initial Render
    renderView('inbox');

    // Setup Sidebar Nav Links
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            
            const viewId = target.getAttribute('data-view');
            renderView(viewId);
        });
    });
});

function renderView(viewId) {
    appData.currentView = viewId;
    
    // Update Title
    const titleObj = document.getElementById('current-view-title');
    titleObj.textContent = appData.views[viewId].title;

    // Inject Template
    const container = document.getElementById('view-container');
    const template = document.getElementById(`tmpl-${viewId}`);
    
    if (template) {
        container.innerHTML = '';
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
        
        // Setup specialized handlers per view
        if(viewId === 'live-chat') {
            setupLiveChat();
        } else if (viewId === 'inbox') {
            populateInboxEvents();
        }
    }
}

// Global Escalation Logic (Requested in Prompt)
window.handleEscalate = function(user, priority, reason) {
    const escalationJSON = {
        escalation: true,
        priority: priority,
        reason: reason,
        summary: `Escalation requested during live support.`,
        customer_sentiment: "Frustrated",
        recommended_department: "Tier 2 Live Support"
    };
    
    console.log("ESCALATION PAYLOAD GENERATED:", escalationJSON);
    alert(`Escalating to human agent!\nPayload Generated in console:\n\n${JSON.stringify(escalationJSON, null, 2)}`);
    
    // Replace chat history to show escalation status
    const history = document.getElementById('chat-history');
    if(history) {
        history.innerHTML += `<div class="msg ai-msg opacity-fade" style="background: rgba(255, 51, 102, 0.2); border: 1px solid #ff3366; color: #ff3366;">Escalation payload triggered. Transferring to human agent...</div>`;
        history.scrollTop = history.scrollHeight;
    }
}

function setupLiveChat() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChat();
            }
        });
    }
}

window.sendChat = function() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    const history = document.getElementById('chat-history');
    const typing = document.querySelector('.typing-indicator');
    
    // 1. Add User Msg
    const userDiv = document.createElement('div');
    userDiv.className = 'msg user-msg opacity-fade';
    userDiv.textContent = msg;
    
    // remove typing if exists to put msg before it
    if(typing) typing.style.display = 'none';
    history.appendChild(userDiv);
    
    input.value = '';
    history.scrollTop = history.scrollHeight;
    
    // 2. Show Typing Indicator
    if(typing) {
        typing.style.display = 'block';
        history.appendChild(typing); // move to bottom
    } else {
        const t = document.createElement('div');
        t.className = 'typing-indicator';
        t.textContent = 'AI is processing intent...';
        t.style.display = 'block';
        history.appendChild(t);
    }
    history.scrollTop = history.scrollHeight;

    // 3. Simulate AI Response
    setTimeout(() => {
        if(document.querySelector('.typing-indicator')) {
             document.querySelector('.typing-indicator').style.display = 'none';
        }
        
        const aiDiv = document.createElement('div');
        aiDiv.className = 'msg ai-msg opacity-fade';
        aiDiv.textContent = generateAIResponse(msg);
        history.appendChild(aiDiv);
        history.scrollTop = history.scrollHeight;
    }, 1200);
}

function generateAIResponse(input) {
    const normalized = input.toLowerCase();
    
    if (normalized.includes('where is') || normalized.includes('order')) {
        return "I can see your order #8921 is currently in transit. It should arrive by tomorrow evening. I apologize for any confusion regarding tracking.";
    } 
    if (normalized.includes('angry') || normalized.includes('frustrat') || normalized.includes('hate')) {
        return "I completely understand your frustration and apologize for the inconvenience this has caused. Let me correct this immediately or escalate your ticket.";
    }
    
    return "Thank you for that context. Based on your profile history, I've updated your preferences. Is there anything else I can help you resolve today?";
}

function populateInboxEvents() {
    const feed = document.getElementById('global-feed');
    if(!feed) return;
    
    const events = [
        { type: 'Alert', text: 'Social Media sentiment spike detected on Twitter.', time: 'Just now' },
        { type: 'Update', text: 'Voice transcript analyzed. Refund processed for Mark S.', time: '3 mins ago' },
        { type: 'Message', text: 'Live chat transferred from Bot to Human (Tier 2).', time: '12 mins ago' },
        { type: 'System', text: 'Knowledge base updated with latest FAQ policies.', time: '1 hour ago' }
    ];
    
    events.forEach(ev => {
        const div = document.createElement('div');
        div.style.padding = '15px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        
        div.innerHTML = `
            <div>
                <strong style="color: var(--primary-cyan)">${ev.type}</strong>
                <p style="margin-top: 5px; font-size: 14px; color: var(--text-muted)">${ev.text}</p>
            </div>
            <span style="font-size: 12px; color: var(--text-muted)">${ev.time}</span>
        `;
        feed.appendChild(div);
    });
}
