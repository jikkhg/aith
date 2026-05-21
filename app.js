/* --------------------------------------------------
   AONGAI-NGAI AI PORTAL & LIQUID GLASS ENGINE
   -------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------
    // 1. CHAT PORTAL INTERFACE CONTROLLER
    // --------------------------------------------------
    initChatPortal();

    // --------------------------------------------------
    // 2. LIQUID GLASS ENGINE INITIALIZATION
    // --------------------------------------------------
    initLiquidGlassEngine();
});

/* --------------------------------------------------
   1. CHAT PORTAL INTERFACE & STORAGE LOGIC
   -------------------------------------------------- */
function initChatPortal() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const btnToggleSidebarDesktop = document.getElementById('btn-toggle-sidebar-desktop');
    const btnToggleSidebarMobile = document.getElementById('btn-toggle-sidebar-mobile');
    const navLinks = document.querySelectorAll('.nav-link');
    const portalSections = document.querySelectorAll('.portal-section');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const messagesList = document.getElementById('messages-list');
    const welcomeContainer = document.getElementById('welcome-container');
    const chatHistoryList = document.getElementById('chat-history-list');
    const btnNewChat = document.getElementById('btn-new-chat');
    const btnClearChat = document.getElementById('btn-clear-chat');
    const btnExportChat = document.getElementById('btn-export-chat');
    const typingIndicator = document.getElementById('typing-indicator');
    const chatViewport = document.getElementById('chat-viewport');
    
    // Settings Modal Elements
    const btnSettings = document.getElementById('btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnResetSettings = document.getElementById('btn-reset-settings');
    const btnTestConnection = document.getElementById('btn-test-connection');
    const testConnectionResult = document.getElementById('test-connection-result');
    
    const settingApiEndpoint = document.getElementById('setting-api-endpoint');
    const settingApiKey = document.getElementById('setting-api-key');
    const settingModel = document.getElementById('setting-model');
    const settingTemp = document.getElementById('setting-temperature');
    const valTemp = document.getElementById('val-temp');
    const settingMaxTokens = document.getElementById('setting-max-tokens');
    const settingSystemPrompt = document.getElementById('setting-system-prompt');
    const btnToggleApiKey = document.getElementById('btn-toggle-api-key');
    
    const activeChatTitle = document.getElementById('active-chat-title');
    const activeChatModel = document.getElementById('active-chat-model');
    const toastContainer = document.getElementById('toast-container');

    // Portal State
    let chats = JSON.parse(localStorage.getItem('thaillm_chats')) || [];
    let currentChatId = localStorage.getItem('thaillm_current_chat_id') || null;
    let settings = JSON.parse(localStorage.getItem('thaillm_settings')) || {
        endpoint: 'https://api.aongai-ai.com/v1/chat/completions',
        apiKey: '',
        model: 'aongai-ngai-ai-v1.0',
        temperature: 0.3,
        maxTokens: 2048,
        systemPrompt: 'คุณคือ เอาง่ายๆ AI ผู้ช่วยปัญญาประดิษฐ์แสนเป็นมิตรที่จะคอยตอบคำถามและช่วยอธิบายเรื่องยากๆ ให้เข้าใจง่ายที่สุด สุภาพ และมีประโยชน์'
    };

    // Initialize System Settings inputs
    function loadSettingsToInputs() {
        settingApiEndpoint.value = settings.endpoint;
        settingApiKey.value = settings.apiKey;
        settingModel.value = settings.model;
        settingTemp.value = settings.temperature;
        valTemp.textContent = settings.temperature;
        settingMaxTokens.value = settings.maxTokens;
        settingSystemPrompt.value = settings.systemPrompt;
        activeChatModel.textContent = settings.model;
    }
    loadSettingsToInputs();

    // 1.1 Sidebar toggles
    if (btnToggleSidebarDesktop) {
        btnToggleSidebarDesktop.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    if (btnToggleSidebarMobile) {
        btnToggleSidebarMobile.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    // Mobile show trigger using navbar portal brand trigger
    const portalBrand = document.querySelector('.portal-brand');
    if (portalBrand) {
        portalBrand.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('active');
            }
        });
    }

    // 1.2 Switch Navigation Tabs
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetTabId = link.getAttribute('data-tab');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            portalSections.forEach(sec => {
                if (sec.id === targetTabId) {
                    sec.classList.remove('hidden');
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                    sec.classList.add('hidden');
                }
            });

            // Auto close mobile sidebar on nav selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }

            showToast(`เปิดหน้า: ${link.textContent.trim()}`, 'info');
        });
    });

    // 1.3 Toast Notification helper
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-triangle-exclamation';
        
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        
        // Remove toast
        setTimeout(() => {
            toast.style.animation = 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 1.4 Setting API modal visibility
    btnSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });
    btnCloseSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Toggle API Key visibility
    btnToggleApiKey.addEventListener('click', () => {
        const type = settingApiKey.type === 'password' ? 'text' : 'password';
        settingApiKey.type = type;
        const icon = btnToggleApiKey.querySelector('i');
        icon.className = type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    });

    // Temp range updates value
    settingTemp.addEventListener('input', () => {
        valTemp.textContent = settingTemp.value;
    });

    // Save Settings
    btnSaveSettings.addEventListener('click', () => {
        settings.endpoint = settingApiEndpoint.value;
        settings.apiKey = settingApiKey.value;
        settings.model = settingModel.value;
        settings.temperature = parseFloat(settingTemp.value);
        settings.maxTokens = parseInt(settingMaxTokens.value) || 2048;
        settings.systemPrompt = settingSystemPrompt.value;
        
        localStorage.setItem('thaillm_settings', JSON.stringify(settings));
        activeChatModel.textContent = settings.model;
        settingsModal.classList.add('hidden');
        showToast('บันทึกการตั้งค่า API เรียบร้อยแล้ว', 'success');
    });

    // Reset settings
    btnResetSettings.addEventListener('click', () => {
        if (confirm('คุณต้องการรีเซ็ตค่ากลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
            localStorage.removeItem('thaillm_settings');
            settings = {
                endpoint: 'https://api.aongai-ai.com/v1/chat/completions',
                apiKey: '',
                model: 'aongai-ngai-ai-v1.0',
                temperature: 0.3,
                maxTokens: 2048,
                systemPrompt: 'คุณคือ เอาง่ายๆ AI ผู้ช่วยปัญญาประดิษฐ์แสนเป็นมิตรที่จะคอยตอบคำถามและช่วยอธิบายเรื่องยากๆ ให้เข้าใจง่ายที่สุด สุภาพ และมีประโยชน์'
            };
            loadSettingsToInputs();
            showToast('คืนค่าเริ่มต้นการตั้งค่าสำเร็จ', 'info');
        }
    });

    // Test API Connection
    btnTestConnection.addEventListener('click', async () => {
        testConnectionResult.textContent = 'กำลังทดสอบเชื่อมต่อ...';
        testConnectionResult.className = 'test-result processing';
        
        try {
            // Simulated connection check for safety
            await new Promise(r => setTimeout(r, 1200));
            testConnectionResult.textContent = 'เชื่อมต่อเสร็จสิ้น! API ปลายทางพร้อมใช้งาน (Simulated)';
            testConnectionResult.className = 'test-result success';
            showToast('เชื่อมต่อ API สำเร็จ', 'success');
        } catch (err) {
            testConnectionResult.textContent = 'ข้อผิดพลาด: ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
            testConnectionResult.className = 'test-result error';
            showToast('ไม่สามารถเชื่อมต่อ API ได้', 'error');
        }
    });

    // 1.5 CHAT WORKSPACE THREAD ENGINE
    function renderChatHistory() {
        chatHistoryList.innerHTML = '';
        if (chats.length === 0) {
            chatHistoryList.innerHTML = `<div class="empty-history" style="padding:10px; text-align:center; color:var(--text-muted); font-size:0.85rem;">ไม่มีประวัติการสนทนา</div>`;
            return;
        }

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            chatItem.setAttribute('data-id', chat.id);
            
            chatItem.innerHTML = `
                <div class="chat-item-main">
                    <i class="fa-regular fa-comment"></i>
                    <div class="chat-item-title-wrapper">
                        <span class="chat-item-title">${chat.title}</span>
                    </div>
                </div>
                <div class="chat-item-actions">
                    <button class="btn-item-action delete-action" title="ลบห้องนี้">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Select chat
            chatItem.addEventListener('click', (e) => {
                if (e.target.closest('.delete-action')) return; // Avoid select when deleting
                selectChat(chat.id);
            });

            // Delete chat
            const btnDelete = chatItem.querySelector('.delete-action');
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });

            chatHistoryList.appendChild(chatItem);
        });
    }

    function createNewChat(initialTitle = 'ห้องสนทนาใหม่') {
        const id = 'chat_' + Date.now();
        const newChat = {
            id: id,
            title: initialTitle,
            messages: []
        };
        chats.unshift(newChat);
        localStorage.setItem('thaillm_chats', JSON.stringify(chats));
        selectChat(id);
        renderChatHistory();
        showToast('สร้างห้องสนทนาใหม่เรียบร้อย', 'success');
    }

    function selectChat(id) {
        currentChatId = id;
        localStorage.setItem('thaillm_current_chat_id', id);
        
        const chat = chats.find(c => c.id === id);
        if (chat) {
            activeChatTitle.textContent = chat.title;
            renderMessages(chat.messages);
            welcomeContainer.classList.add('hidden');
        } else {
            activeChatTitle.textContent = 'ห้องสนทนาใหม่';
            messagesList.innerHTML = '';
            welcomeContainer.classList.remove('hidden');
        }
        
        renderChatHistory();
    }

    function deleteChat(id) {
        if (confirm('คุณต้องการลบห้องสนทนานี้และข้อความทั้งหมดในห้องนี้ใช่หรือไม่?')) {
            chats = chats.filter(c => c.id !== id);
            localStorage.setItem('thaillm_chats', JSON.stringify(chats));
            
            if (currentChatId === id) {
                currentChatId = chats.length > 0 ? chats[0].id : null;
                if (currentChatId) {
                    localStorage.setItem('thaillm_current_chat_id', currentChatId);
                } else {
                    localStorage.removeItem('thaillm_current_chat_id');
                }
            }
            
            selectChat(currentChatId);
            renderChatHistory();
            showToast('ลบห้องสนทนาแล้ว', 'info');
        }
    }

    function renderMessages(messages) {
        messagesList.innerHTML = '';
        if (messages.length === 0) {
            welcomeContainer.classList.remove('hidden');
            return;
        }
        welcomeContainer.classList.add('hidden');

        messages.forEach(msg => {
            appendMessageToViewport(msg.role, msg.content);
        });
        
        scrollToBottom();
    }

    function appendMessageToViewport(role, content) {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${role === 'user' ? 'user-message' : 'ai-message'}`;
        
        const isUser = role === 'user';
        const avatarIcon = isUser ? 'fa-user' : 'fa-wind';
        const avatarClass = isUser ? 'user-avatar' : 'ai-avatar';
        
        // Helper to format mock bold and code blocks in UI
        let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
            
        // Handle multiline code blocks
        if (content.includes('```')) {
            const parts = content.split('```');
            for (let i = 1; i < parts.length; i += 2) {
                const codeLines = parts[i].trim().split('\n');
                const lang = codeLines[0].trim() || 'code';
                const actualCode = codeLines.slice(1).join('\n');
                
                const blockHtml = `
                    <pre>
                        <div class="code-header">
                            <span>${lang}</span>
                            <button class="btn-copy-code" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent); alert('คัดลอกโค้ดเรียบร้อย!');">
                                <i class="fa-regular fa-copy"></i> คัดลอกโค้ด
                            </button>
                        </div>
                        <code style="display:block; padding:12px; background:#04070d; overflow-x:auto; color:#a5f3fc; font-family:monospace; line-height:1.4;">${actualCode}</code>
                    </pre>
                `;
                parts[i] = blockHtml;
            }
            formattedContent = parts.map((p, idx) => idx % 2 === 0 ? p.replace(/\n/g, '<br>') : p).join('');
        } else {
            formattedContent = formattedContent.replace(/\n/g, '<br>');
        }

        wrapper.innerHTML = `
            <div class="avatar ${avatarClass}">
                <i class="fa-solid ${avatarIcon}"></i>
            </div>
            <div class="message-bubble">
                <p>${formattedContent}</p>
            </div>
        `;
        
        messagesList.appendChild(wrapper);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    // Send chat text action
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatInput.style.height = 'auto';
        btnSend.classList.add('disabled');
        btnSend.disabled = true;

        // Ensure active chat thread exists
        if (!currentChatId) {
            const shortTitle = text.length > 15 ? text.substring(0, 15) + '...' : text;
            createNewChat(shortTitle);
        }

        const chatIndex = chats.findIndex(c => c.id === currentChatId);
        if (chatIndex === -1) return;

        // 1. Add User Message
        chats[chatIndex].messages.push({ role: 'user', content: text });
        localStorage.setItem('thaillm_chats', JSON.stringify(chats));
        appendMessageToViewport('user', text);
        
        // Show Typing indicator
        typingIndicator.classList.remove('hidden');
        scrollToBottom();

        // 2. Generate simulated intelligent response based on prompt text
        await new Promise(r => setTimeout(r, 1500)); // typing lag
        
        let reply = '';
        const lowercaseText = text.toLowerCase();
        
        if (lowercaseText.includes('สวัสดี') || lowercaseText.includes('hello') || lowercaseText.includes('hi')) {
            reply = 'สวัสดีครับ! ผมคือ เอาง่ายๆ AI v1.0 ยินดีต้อนรับครับ วันนี้มีเรื่องยากๆ อะไรที่ผมสามารถช่วยย่อยและอธิบายให้คุณเข้าใจได้ง่ายๆ บ้างครับ?';
        } else if (lowercaseText.includes('โค้ด') || lowercaseText.includes('python') || lowercaseText.includes('javascript') || lowercaseText.includes('code')) {
            reply = 'แน่นอนครับ! นี่คือตัวอย่างการเขียนฟังก์ชันภาษา JavaScript สำหรับการตรวจสอบเบอร์โทรศัพท์มือถือในประเทศไทย:\n\n```javascript\nfunction validateThaiMobile(phone) {\n    // ตรวจสอบโครงสร้างเบอร์มือถือไทย 10 หลัก ขึ้นต้นด้วย 06, 08, หรือ 09\n    const thaiPhoneRegex = /^0[689]\\d{8}$/;\n    return thaiPhoneRegex.test(phone);\n}\n\n// ทดสอบเรียกใช้งาน\nconsole.log(validateThaiMobile("0812345678")); // true\nconsole.log(validateThaiMobile("1234567890")); // false\n```\n\nฟังก์ชันด้านบนใช้ `Regular Expression` ในการสแกนหาข้อความที่ตรงตามเงื่อนไข สามารถนำไปประยุกต์ใช้งานในระบบตรวจข้อมูลฟอร์มสมัครสมาชิกได้ทันทีครับ!';
        } else if (lowercaseText.includes('เที่ยว') || lowercaseText.includes('เชียงใหม่') || lowercaseText.includes('ทริป')) {
            reply = 'ยินดีเลยครับ! เชียงใหม่เป็นปลายทางที่สวยงามมาก นี่คือแผนท่องเที่ยวแนะนำ **3 วัน 2 คืน** สำหรับคุณและครอบครัวครับ:\n\n*   **วันที่ 1:** เดินทางถึงเชียงใหม่ - เที่ยววัดพระธาตุดอยสุเทพ - เช็คอินโรงแรมในคูเมือง - เดินประตูท่าแพในยามเย็น\n*   **วันที่ 2:** เดินทางขึ้นยอดดอยอินทนนท์ - สัมผัสอากาศหนาวและธรรมชาติที่กิ่วแม่ปาน - ชิมอาหารเหนือที่ตลาดนัดท้องถิ่น\n*   **วันที่ 3:** นั่งชิลคาเฟ่ย่านนิมมานเหมินทร์ - แวะซื้อของฝากจำพวกไส้อั่ว น้ำพริกหนุ่ม ที่ตลาดวโรรส - เดินทางกลับโดยสวัสดิภาพ\n\nหวังว่าแผนทริปนี้จะช่วยสร้างความคุ้มค่าและช่วงเวลาที่อบอุ่นให้กับครอบครัวของคุณนะครับ!';
        } else if (lowercaseText.includes('อวยพร') || lowercaseText.includes('วันเกิด')) {
            reply = 'คำกล่าวอวยพรวันเกิดผู้ใหญ่แบบเป็นทางการและดูสุภาพเรียบร้อย:\n\n"เนื่องในวาระโอกาสวันคล้ายวันเกิดของท่านในวันนี้ กระผม/ดิฉัน ขออาราธนาคุณพระศรีรัตนตรัยและสิ่งศักดิ์สิทธิ์ในสากลโลก ได้โปรดดลบันดาลประทานพรให้ท่านประสบแต่ความสุข ความเจริญ มีสุขภาพพลานามัยที่สมบูรณ์แข็งแรง ปราศจากโรคภัยไข้เจ็บ และมีความสุขความอบอุ่นร่วมกับครอบครัวในทุกๆ วันตลอดไปเทอญด้วยความเคารพอย่างสูงครับ/ค่ะ"';
        } else {
            reply = `ขอบคุณสำหรับคำถามประเด็น: "${text}" ครับ โมเดล เอาง่ายๆ AI ได้รับการออกแบบเชิงลึกในการสนทนาภาษาไทยเพื่อให้เข้าใจง่ายและย่อยง่ายที่สุด คุณสามารถขอคำอธิบายเพิ่มเติมหรือตัวอย่างอื่นๆ ได้ทันทีเลยนะครับ!`;
        }

        // Hide Typing
        typingIndicator.classList.add('hidden');

        // 3. Add AI Message
        chats[chatIndex].messages.push({ role: 'assistant', content: reply });
        localStorage.setItem('thaillm_chats', JSON.stringify(chats));
        appendMessageToViewport('assistant', reply);
        
        btnSend.classList.remove('disabled');
        btnSend.disabled = false;
    }

    // Listen chat input keys
    chatInput.addEventListener('input', () => {
        // Auto resize height
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        
        if (chatInput.value.trim()) {
            btnSend.classList.remove('disabled');
            btnSend.disabled = false;
        } else {
            btnSend.classList.add('disabled');
            btnSend.disabled = true;
        }
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    btnSend.addEventListener('click', sendMessage);

    // New Chat Action Button
    btnNewChat.addEventListener('click', () => {
        createNewChat();
    });

    // Clear active chat viewport
    btnClearChat.addEventListener('click', () => {
        if (currentChatId) {
            if (confirm('คุณต้องการลบข้อความทั้งหมดในห้องสนทนานี้ใช่หรือไม่?')) {
                const idx = chats.findIndex(c => c.id === currentChatId);
                if (idx !== -1) {
                    chats[idx].messages = [];
                    localStorage.setItem('thaillm_chats', JSON.stringify(chats));
                    renderMessages([]);
                    showToast('ล้างข้อความเรียบร้อยแล้ว', 'info');
                }
            }
        }
    });

    // Export Chat to Markdown file
    btnExportChat.addEventListener('click', () => {
        if (!currentChatId) {
            showToast('ไม่มีห้องสนทนาที่จะส่งออก', 'error');
            return;
        }
        const chat = chats.find(c => c.id === currentChatId);
        if (!chat || chat.messages.length === 0) {
            showToast('ห้องสนทนานี้ว่างเปล่า', 'error');
            return;
        }

        let markdown = `# Chat Export: ${chat.title}\n\n`;
        chat.messages.forEach(msg => {
            const roleName = msg.role === 'user' ? 'USER' : 'เอาง่ายๆ AI';
            markdown += `### **${roleName}**:\n${msg.content}\n\n---\n\n`;
        });

        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.title.replace(/\s+/g, '_')}_export.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('ส่งออกแชทในรูปแบบ Markdown สำเร็จ', 'success');
    });

    // Handle suggestion prompt card clicks
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            chatInput.value = prompt;
            chatInput.dispatchEvent(new Event('input'));
            chatInput.focus();
            showToast('โหลดข้อความลงในช่องแชทแล้ว', 'info');
        });
    });

    // Handle quick-try service button clicks in services tab
    const btnTryServices = document.querySelectorAll('.btn-try-service');
    btnTryServices.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            
            // Switch tab to home
            const homeLink = document.querySelector('[data-tab="tab-home"]');
            if (homeLink) homeLink.click();
            
            chatInput.value = prompt;
            chatInput.dispatchEvent(new Event('input'));
            chatInput.focus();
        });
    });

    // Initial render
    renderChatHistory();
    if (currentChatId) {
        selectChat(currentChatId);
    } else {
        welcomeContainer.classList.remove('hidden');
    }
}

// Global submit form for contact portal
window.handleContactSubmit = function() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    alert(`ขอบคุณครับ คุณ ${name}!\nข้อความของคุณ ("${message.substring(0, 30)}...") ได้รับการส่งต่อให้ทีมผู้พัฒนาเรียบร้อยแล้ว เราจะตอบกลับไปยังอีเมล ${email} โดยเร็วที่สุดครับ`);
    document.getElementById('contact-portal-form').reset();
};


/* --------------------------------------------------
   2. LIQUID GLASS VISUAL ENGINE
   -------------------------------------------------- */
class LiquidGlass {
    constructor(element, props = {}) {
        this.element = element;
        this.props = {
            displacementScale: 70,
            blurAmount: 0.0625,
            saturation: 140,
            aberrationIntensity: 2,
            elasticity: 0.15,
            cornerRadius: 18,
            padding: "24px",
            style: {},
            overLight: false,
            mode: "shader", // "standard" | "polar" | "prominent" | "shader"
            mouseContainer: null,
            ...props
        };

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, speedX: 0, speedY: 0 };
        this.size = { width: 0, height: 0, left: 0, top: 0 };
        this.canvas = null;
        this.gl = null;
        this.shaderProgram = null;
        this.bgTexture = null;
        this.animationFrameId = null;

        this.init();
    }

    init() {
        // Setup initial container styling
        this.element.style.position = 'relative';
        this.element.style.padding = this.props.padding;
        this.element.style.borderRadius = `${this.props.cornerRadius}px`;
        this.element.style.overflow = 'hidden';
        this.element.style.boxSizing = 'border-box';
        
        // Dynamic inline styles merges
        Object.assign(this.element.style, this.props.style);

        // Apply light background class if requested
        if (this.props.overLight) {
            this.element.classList.add('glass-over-light');
        } else {
            this.element.classList.remove('glass-over-light');
        }

        // Apply styles based on active mode
        this.updateMode();

        // Bind mouse movement tracking
        this.bindEvents();
    }

    updateMode() {
        this.cleanupWebGL();
        
        // Remove all previous mode classes
        this.element.classList.remove('mode-standard', 'mode-polar', 'mode-prominent', 'mode-shader');
        this.element.classList.add(`mode-${this.props.mode}`);

        if (this.props.mode === 'shader') {
            this.setupWebGL();
        } else if (this.props.mode === 'standard') {
            // Standard CSS/SVG blend mode
            this.element.style.backdropFilter = `blur(${this.props.blurAmount * 240}px) saturate(${this.props.saturation}%)`;
            this.element.style.webkitBackdropFilter = `blur(${this.props.blurAmount * 240}px) saturate(${this.props.saturation}%)`;
            this.element.style.filter = `url(#liquid-glass-refract-filter-${this.element.id || 'gen'})`;
        } else if (this.props.mode === 'polar') {
            // Lens magnification blend mode
            this.element.style.backdropFilter = `blur(${this.props.blurAmount * 120}px) saturate(${this.props.saturation}%)`;
            this.element.style.webkitBackdropFilter = `blur(${this.props.blurAmount * 120}px) saturate(${this.props.saturation}%)`;
            this.element.style.filter = `url(#liquid-glass-polar-filter-${this.element.id || 'gen'})`;
        } else if (this.props.mode === 'prominent') {
            // Ultra glossy frosted glass, with multiple border overlays
            this.element.style.backdropFilter = `blur(${this.props.blurAmount * 380}px) saturate(${this.props.saturation + 40}%)`;
            this.element.style.webkitBackdropFilter = `blur(${this.props.blurAmount * 380}px) saturate(${this.props.saturation + 40}%)`;
            this.element.style.filter = 'none';
        }
    }

    bindEvents() {
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onResize = this.onResize.bind(this);

        const trackTarget = this.props.mouseContainer ? this.props.mouseContainer : this.element;
        
        trackTarget.addEventListener('mousemove', this.onMouseMove);
        trackTarget.addEventListener('mouseleave', this.onMouseLeave);
        window.addEventListener('resize', this.onResize);
        
        this.updateSizes();

        // Run rendering cycle loop
        this.tick();
    }

    updateSizes() {
        const rect = this.element.getBoundingClientRect();
        this.size = {
            width: rect.width,
            height: rect.height,
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY
        };

        if (this.canvas) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            if (this.gl) {
                this.gl.viewport(0, 0, rect.width, rect.height);
            }
        }
    }

    onMouseMove(e) {
        const trackTarget = this.props.mouseContainer ? this.props.mouseContainer : this.element;
        const rect = trackTarget.getBoundingClientRect();
        
        // Calculate relative coordinates normalized inside the glass container
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;

        if (this.props.mouseContainer) {
            // If tracked relative to a large parent container, translate coordinates to the glass element itself
            const elementRect = this.element.getBoundingClientRect();
            this.mouse.targetX = e.clientX - elementRect.left;
            this.mouse.targetY = e.clientY - elementRect.top;
        } else {
            this.mouse.targetX = rawX;
            this.mouse.targetY = rawY;
        }
    }

    onMouseLeave() {
        // Soft snap back to center when mouse leaves
        this.mouse.targetX = this.size.width / 2;
        this.mouse.targetY = this.size.height / 2;
    }

    onResize() {
        this.updateSizes();
    }

    // 2.1 WebGL Shader implementation
    setupWebGL() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'liquid-glass-webgl-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        
        this.element.appendChild(this.canvas);
        this.updateSizes();

        this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: true });
        if (!this.gl) {
            console.warn("WebGL is not supported. Switched to polar backdrop-filter.");
            this.props.mode = 'polar';
            this.updateMode();
            return;
        }

        const vsSource = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            void main() {
                vTexCoord = aPosition * 0.5 + 0.5;
                vTexCoord.y = 1.0 - vTexCoord.y; // Correct texture coordinates vertical flip
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;
            varying vec2 vTexCoord;
            uniform vec2 uMousePos;
            uniform vec2 uResolution;
            uniform float uDisplacementScale;
            uniform float uBlurAmount;
            uniform float uSaturation;
            uniform float uAberration;
            uniform float uCornerRadius;
            uniform float uOverLight;
            uniform float uTime;

            // Rounded box distance function
            float sdRoundRect(vec2 p, vec2 b, float r) {
                vec2 d = abs(p) - b + vec2(r);
                return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
            }

            // Pseudo-random noise function for neon flow
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }

            // Generates a beautiful liquid fluid background pattern mapping
            vec3 getFluidBackground(vec2 uv, float time) {
                vec2 st = uv * 3.0;
                float n1 = noise(st + vec2(time * 0.1, time * 0.15));
                float n2 = noise(st - vec2(time * 0.08, -time * 0.12) + n1);
                
                // Neon Indigo, Cyan, Crimson Red colors
                vec3 col1 = vec3(0.02, 0.05, 0.15); // Dark deep blue
                vec3 col2 = vec3(0.02, 0.71, 0.83); // Neon Cyan
                vec3 col3 = vec3(0.65, 0.10, 0.19); // Apple Crimson
                vec3 col4 = vec3(0.23, 0.51, 0.96); // Neon Blue

                vec3 col = mix(col1, col2, n1);
                col = mix(col, col3, n2 * 0.6);
                col = mix(col, col4, length(uv - 0.5) * 0.5);

                return col;
            }

            void main() {
                // Resolution mapping
                vec2 uv = gl_FragCoord.xy / uResolution;
                
                // SDF Clipping border logic
                vec2 halfRes = uResolution * 0.5;
                vec2 p = gl_FragCoord.xy - halfRes;
                float d = sdRoundRect(p, halfRes, uCornerRadius);
                if (d > 2.0) {
                    discard;
                }

                // Refraction offset vector
                vec2 mouseUV = uMousePos / uResolution;
                vec2 toMouse = uv - mouseUV;
                float distToMouse = length(toMouse);
                
                // Displacement deformation based on proximity to interactive cursor
                vec2 refractOffset = vec2(0.0);
                if (distToMouse < 0.35) {
                    float force = (1.0 - distToMouse / 0.35);
                    force = pow(force, 2.5); // Rich elastic falloff curvature
                    refractOffset = normalize(toMouse) * force * (uDisplacementScale / 1200.0);
                }

                // Chromatic Aberration RGB channel extraction offsets
                vec2 uvR = uv + refractOffset * (1.0 + uAberration * 0.15);
                vec2 uvG = uv + refractOffset;
                vec2 uvB = uv + refractOffset * (1.0 - uAberration * 0.15);

                // Fetch dynamic fluid layers
                float r = getFluidBackground(uvR, uTime).r;
                float g = getFluidBackground(uvG, uTime).g;
                float b = getFluidBackground(uvB, uTime).b;
                vec3 color = vec3(r, g, b);

                // Frosty Blur overlay
                vec3 frostedOverlay = vec3(0.04, 0.08, 0.16);
                if (uOverLight > 0.5) {
                    frostedOverlay = vec3(0.95, 0.96, 0.98);
                }
                color = mix(color, frostedOverlay, uBlurAmount * 8.0);

                // Specular Glass Border Highlight
                float borderHighlight = smoothstep(1.5, -0.5, d);
                vec3 highlightColor = vec3(1.0) * borderHighlight * 0.22;
                if (uOverLight > 0.5) {
                    highlightColor = vec3(0.0) * borderHighlight * 0.12;
                }

                // Elastic dynamic mouse highlight glow reflecting from light source
                float specGlow = 0.0;
                if (distToMouse < 0.45) {
                    float specFalloff = 1.0 - (distToMouse / 0.45);
                    specFalloff = pow(specFalloff, 3.0);
                    specGlow = specFalloff * 0.28;
                }
                
                // Add overlays
                color += highlightColor + vec3(specGlow);

                // Desaturation / Saturation adjustment
                float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
                color = mix(vec3(luminance), color, uSaturation / 100.0);

                // Apple's dynamic translucent edge correction
                float alpha = 1.0;
                if (d > 0.0) {
                    alpha = 1.0 - smoothstep(0.0, 2.0, d);
                }

                gl_FragColor = vec4(color, alpha);
            }
        `;

        this.shaderProgram = this.createShaderProgram(vsSource, fsSource);
        if (!this.shaderProgram) return;

        // Populate geometry buffers
        const vertices = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ]);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'aPosition');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    createShaderProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return null;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader linking failed:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // 2.2 Dynamic Elastic Motion loop
    tick() {
        // spring damper system for "liquid" mouse tracking feel
        const spring = this.props.elasticity;
        const friction = 0.85;

        // elasticity math: target offset force
        const forceX = (this.mouse.targetX - this.mouse.x) * spring;
        const forceY = (this.mouse.targetY - this.mouse.y) * spring;

        this.mouse.speedX = (this.mouse.speedX + forceX) * friction;
        this.mouse.speedY = (this.mouse.speedY + forceY) * friction;

        this.mouse.x += this.mouse.speedX;
        this.mouse.y += this.mouse.speedY;

        // Keep bounds limits checked
        this.mouse.x = Math.max(0, Math.min(this.size.width, this.mouse.x));
        this.mouse.y = Math.max(0, Math.min(this.size.height, this.mouse.y));

        if (this.props.mode === 'shader' && this.gl && this.shaderProgram) {
            this.renderWebGL();
        } else if (this.props.mode === 'standard' || this.props.mode === 'polar') {
            this.updateSVGFilters();
        } else if (this.props.mode === 'prominent') {
            this.updateProminentTilt();
        }

        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    renderWebGL() {
        const gl = this.gl;
        const program = this.shaderProgram;

        gl.useProgram(program);

        // Upload properties uniforms
        gl.uniform2f(gl.getUniformLocation(program, 'uMousePos'), this.mouse.x, this.mouse.y);
        gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), this.size.width, this.size.height);
        gl.uniform1f(gl.getUniformLocation(program, 'uDisplacementScale'), this.props.displacementScale);
        gl.uniform1f(gl.getUniformLocation(program, 'uBlurAmount'), this.props.blurAmount);
        gl.uniform1f(gl.getUniformLocation(program, 'uSaturation'), this.props.saturation);
        gl.uniform1f(gl.getUniformLocation(program, 'uAberration'), this.props.aberrationIntensity);
        gl.uniform1f(gl.getUniformLocation(program, 'uCornerRadius'), this.props.cornerRadius);
        gl.uniform1f(gl.getUniformLocation(program, 'uOverLight'), this.props.overLight ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'uTime'), performance.now() / 1000.0);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    updateSVGFilters() {
        // Shift SVG filter center point based on coordinates
        const filterId = this.props.mode === 'standard' ? `liquid-glass-refract-map-${this.element.id || 'gen'}` : `liquid-glass-polar-map-${this.element.id || 'gen'}`;
        const mapElement = document.getElementById(filterId);
        
        if (mapElement) {
            // Apply spring-mass offset mapping displacement scale
            const xPercent = (this.mouse.x / this.size.width) * 100;
            const yPercent = (this.mouse.y / this.size.height) * 100;
            
            // Adjust coordinates attributes in SVG displacement filter
            mapElement.setAttribute('scale', this.props.displacementScale * 0.45);
            
            const feTurbulence = mapElement.previousElementSibling;
            if (feTurbulence) {
                feTurbulence.setAttribute('numOctaves', '2');
                feTurbulence.setAttribute('baseFrequency', '0.008');
            }
        }
    }

    updateProminentTilt() {
        // Interactive 3D hover rotation for Acrylic glass layout
        const maxTilt = 4; // degrees
        const tiltX = -((this.mouse.y / this.size.height) - 0.5) * maxTilt;
        const tiltY = ((this.mouse.x / this.size.width) - 0.5) * maxTilt;

        this.element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        
        // spec specular glare follow shift
        const glowX = (this.mouse.x / this.size.width) * 100;
        const glowY = (this.mouse.y / this.size.height) * 100;
        
        this.element.style.backgroundImage = `
            linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%),
            radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.15) 0%, transparent 60%)
        `;
    }

    cleanupWebGL() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.gl = null;
            this.shaderProgram = null;
        }
        
        // Reset styles possibly overwritten by mode actions
        this.element.style.backdropFilter = '';
        this.element.style.webkitBackdropFilter = '';
        this.element.style.filter = '';
        this.element.style.transform = '';
        this.element.style.backgroundImage = '';
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.cleanupWebGL();

        const trackTarget = this.props.mouseContainer ? this.props.mouseContainer : this.element;
        trackTarget.removeEventListener('mousemove', this.onMouseMove);
        trackTarget.removeEventListener('mouseleave', this.onMouseLeave);
        window.removeEventListener('resize', this.onResize);
    }
}

// --------------------------------------------------
// 2.3 PLAYGROUND PAGE ENGINE AND EVENT BINDING
// --------------------------------------------------
function initLiquidGlassEngine() {
    const playgroundSec = document.getElementById('tab-liquid-glass');
    if (!playgroundSec) return;

    // Grab controls elements
    const controlMode = document.getElementById('ctrl-mode');
    const controlScale = document.getElementById('ctrl-scale');
    const valScale = document.getElementById('val-scale');
    const controlBlur = document.getElementById('ctrl-blur');
    const valBlur = document.getElementById('val-blur');
    const controlSat = document.getElementById('ctrl-sat');
    const valSat = document.getElementById('val-sat');
    const controlAberration = document.getElementById('ctrl-aberration');
    const valAberration = document.getElementById('val-aberration');
    const controlElasticity = document.getElementById('ctrl-elasticity');
    const valElasticity = document.getElementById('val-elasticity');
    const controlRadius = document.getElementById('ctrl-radius');
    const valRadius = document.getElementById('val-radius');
    const controlLight = document.getElementById('ctrl-light');
    const controlBg = document.getElementById('ctrl-bg');

    // Showcase containers
    const glassCard = document.getElementById('playground-glass-card');
    const glassBtn = document.getElementById('playground-glass-btn');
    const glassMouseContainer = document.getElementById('playground-mouse-container');
    const mouseContainerWrapper = document.getElementById('mouse-container-wrapper');

    if (!glassCard || !glassBtn || !glassMouseContainer) return;

    // Instantiate Liquid Glass controls
    const cardGlassInstance = new LiquidGlass(glassCard, {
        id: 'glass-card',
        displacementScale: parseInt(controlScale.value),
        blurAmount: parseFloat(controlBlur.value),
        saturation: parseInt(controlSat.value),
        aberrationIntensity: parseInt(controlAberration.value),
        elasticity: parseFloat(controlElasticity.value),
        cornerRadius: parseInt(controlRadius.value),
        padding: "24px",
        mode: controlMode.value,
        overLight: controlLight.checked
    });

    const btnGlassInstance = new LiquidGlass(glassBtn, {
        id: 'glass-btn',
        displacementScale: parseInt(controlScale.value) * 0.7,
        blurAmount: parseFloat(controlBlur.value),
        saturation: parseInt(controlSat.value),
        aberrationIntensity: parseInt(controlAberration.value),
        elasticity: parseFloat(controlElasticity.value),
        cornerRadius: 100, // Round pills border
        padding: "10px 24px",
        mode: controlMode.value,
        overLight: controlLight.checked
    });

    const containerGlassInstance = new LiquidGlass(glassMouseContainer, {
        id: 'glass-container',
        displacementScale: parseInt(controlScale.value),
        blurAmount: parseFloat(controlBlur.value),
        saturation: parseInt(controlSat.value),
        aberrationIntensity: parseInt(controlAberration.value),
        elasticity: parseFloat(controlElasticity.value),
        cornerRadius: parseInt(controlRadius.value),
        padding: "20px",
        mode: controlMode.value,
        overLight: controlLight.checked,
        mouseContainer: mouseContainerWrapper // respond to mouse movement anywhere in the parent
    });

    // Helper to update properties across instances
    function updateProperties() {
        const mode = controlMode.value;
        const scale = parseInt(controlScale.value);
        const blur = parseFloat(controlBlur.value);
        const sat = parseInt(controlSat.value);
        const aberration = parseInt(controlAberration.value);
        const elasticity = parseFloat(controlElasticity.value);
        const radius = parseInt(controlRadius.value);
        const light = controlLight.checked;

        // Reflect labels text
        valScale.textContent = scale;
        valBlur.textContent = blur.toFixed(4);
        valSat.textContent = sat + '%';
        valAberration.textContent = aberration;
        valElasticity.textContent = elasticity.toFixed(2);
        valRadius.textContent = radius + 'px';

        // Apply new props dynamically
        [cardGlassInstance, btnGlassInstance, containerGlassInstance].forEach((inst, idx) => {
            inst.props.mode = mode;
            inst.props.displacementScale = idx === 1 ? scale * 0.7 : scale; // Slightly reduced scale for small button
            inst.props.blurAmount = blur;
            inst.props.saturation = sat;
            inst.props.aberrationIntensity = aberration;
            inst.props.elasticity = elasticity;
            inst.props.cornerRadius = idx === 1 ? 100 : radius;
            inst.props.overLight = light;
            
            // Trigger rendering state updates
            inst.element.style.borderRadius = `${inst.props.cornerRadius}px`;
            inst.updateMode();
            inst.updateSizes();
        });
    }

    // Bind controls event listeners
    controlMode.addEventListener('change', updateProperties);
    controlScale.addEventListener('input', updateProperties);
    controlBlur.addEventListener('input', updateProperties);
    controlSat.addEventListener('input', updateProperties);
    controlAberration.addEventListener('input', updateProperties);
    controlElasticity.addEventListener('input', updateProperties);
    controlRadius.addEventListener('input', updateProperties);
    controlLight.addEventListener('change', updateProperties);

    // Dynamic background switcher controls
    controlBg.addEventListener('change', () => {
        const playgroundBg = document.getElementById('playground-viewport-bg');
        if (!playgroundBg) return;

        playgroundBg.className = 'playground-background ' + controlBg.value;
    });

    // Initialize labels
    updateProperties();
}
