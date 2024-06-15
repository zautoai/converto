const apiUrl = "{{ApiUrl}}";
const avatarId = "{{avatarId}}";
class API {
    static endpoint = {
        agent: "api/agents/",
        leadAgent: 'api/agents/{{avatarId}}/chat/lead',
        vote: 'api/conversations/message/',
        calendarDates: 'api/calendar/available-dates/{{avatarId}}',
        calendarSlots: 'api/calendar/available-slots/{{avatarId}}',
        calendarBookEvent: 'api/calendar/book-event/{{avatarId}}',
    };
}

let isStandalone = '{{standAloneFlag}}';

const ReactionType = {
    NULL: null,
    UPVOTE: 'UPVOTE',
    DOWNVOTE: 'DOWNVOTE',
};
  

class EventEmitter {

    constructor() {
        this.events = {};
    }

    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    off(eventName, listener) {
        const listeners = this.events[eventName];
        if (!listeners) {
            return;
        }
        const index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    emit(eventName, data) {
        const listeners = this.events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        listeners.forEach(listener => {
            listener(data);
        });
    }
}

class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.isPaused = false;

        // Event listeners
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.isPaused = false;
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.isPaused = true;
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.isPaused = false;
        });
    }

    load(src) {
        this.audio.src = src;
        this.audio.load();
    }

    play() {
        if (!this.isPlaying) {
            this.audio.play();
        }
    }

    pause() {
        if (this.isPlaying) {
            this.audio.pause();
        }
    }

    stop() {
        if (this.isPlaying || this.isPaused) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    setVolume(volume) {
        this.audio.volume = volume;
    }

    getCurrentTime() {
        return this.audio.currentTime;
    }

    getDuration() {
        return this.audio.duration;
    }
}

class Utils {
    constructor()
    {

    }

    markdown(text) {
        const markdownText = marked.parse(text);
        return markdownText;
    }

    formatRelativeDate(date) {
        const now = moment();
        const diffSeconds = now.diff(date, 'seconds');

        if (diffSeconds < 60) {
            return 'just now';
        } else if (diffSeconds < 3600) {
            const diffMinutes = Math.floor(diffSeconds / 60);
            return `${diffMinutes} min ago`;
        } else if (diffSeconds < 86400) {
            const diffHours = Math.floor(diffSeconds / 3600);
            return `${diffHours} hr ago`;
        } else if (diffSeconds < 604800) { // Less than a week
            const diffDays = Math.floor(diffSeconds / 86400);
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffSeconds < 2592000) { // Less than a month (30 days)
            const diffWeeks = Math.floor(diffSeconds / 604800);
            return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        } else if (diffSeconds < 31536000) { // Less than a year (365 days)
            const diffMonths = Math.floor(diffSeconds / 2592000);
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else {
            const diffYears = Math.floor(diffSeconds / 31536000);
            return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        }
    }

    isOtherLead(text) {
        const keywords = ['email', 'mobile', 'name', 'whatsapp', 'phone'];
        const lowerCaseText = text.toLowerCase();
        if (keywords.includes(lowerCaseText)) {
            return false;
        }
        return true;
    }

    formateFieldName(filedName) {
        return filedName.toLocaleLowerCase().replace(' ', '_');
    }

    maskSensitiveInfo(inputString) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\d{3})\d{3}(\d{4})/g;
    
        const emailSuffix = inputString.split("@")[1];
        const maskedEmails = inputString.replace(emailRegex, `XXXX@${emailSuffix}`);
        const maskedPhoneNumbers = maskedEmails.replace(phoneRegex, "$1XXX$2");
    
        return maskedPhoneNumbers;
    }

    formatDatePipe(datetimeString, outputFormat) {
        if (!datetimeString || !outputFormat) {
            return "Invalid input";
        }
    
        let dateObj = new Date(datetimeString);
        
        if (isNaN(dateObj.getTime())) {
            return "Invalid datetime";
        }
    
        let formattedDatetime;
        if (outputFormat.toLowerCase() === "iso") {
            formattedDatetime = dateObj.toISOString();
        } else {
            formattedDatetime = moment(dateObj).format(outputFormat);
        }
    
        return formattedDatetime;
    }
    
}

class RestClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async get(endpoint, queryParams = {}) {
        const url = new URL(endpoint, this.baseURL);
        Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': "{{ORG_ID}}"
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData; // Throw the error object received from the server
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    async post(endpoint, data) {
        const url = new URL(endpoint, this.baseURL);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': "{{ORG_ID}}"
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData; // Throw the error object received from the server
            }
            return await response.json();
        } catch (error) {
            console.error('Error posting data:', error);
            throw error;
        }
    }

    async put(endpoint, data) {
        const url = new URL(endpoint, this.baseURL);
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {  
                    'Content-Type': 'application/json',
                    'x-tenant-id': "{{ORG_ID}}"
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData; // Throw the error object received from the server
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }

    async patch(endpoint, data) {
        const url = new URL(endpoint, this.baseURL);
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': "{{ORG_ID}}"
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData; // Throw the error object received from the server
            }
            return await response.json();
        } catch (error) {
            console.error('Error patching data:', error);
            throw error;
        }
    }

    async delete(endpoint) {
        const url = new URL(endpoint, this.baseURL);
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'x-tenant-id': "{{ORG_ID}}"
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData; // Throw the error object received from the server
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting data:', error);
            throw error;
        }
    }
}

class ChatBotUI {

    constructor(eventEmitter) {
        if (new.target === ChatBotUI) {
            throw new TypeError("Cannot instantiate abstract class ChatBotUI");
        }
        this.rootElement = document.getElementById('zauto_root');
        this.eventEmitter = eventEmitter;
        this.OnInit();
        this.setupEventListeners();
    }

    OnInit() {
        throw new Error("Method 'setupUI' must be implemented by subclasses");
    }
    
    setupEventListeners()
    {
        throw new Error("Method 'setupEventListeners' must be implemented by subclasses");
    }

    updateElement(element, attributes = {}) {
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        }
    }

    createElement(tagName, attributes = {}) {
        const element = document.createElement(tagName);
        this.updateElement(element, attributes);
        return element;
    }

    appendElement(parent, ...children) {
        children.forEach(child => {
            parent.appendChild(child);
        });
    }

    removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}

class MyChatBotUI extends ChatBotUI {
    constructor(eventEmitter) {
        super(eventEmitter);
        this.isOpen = false;
        this.utils = new Utils();
        this.avatarData = null;
        this.historyData = [];
        this.chatProperties = {
            ctas:[],
            pageNavigators:[],
            starters:[]
        };
        this.toggleInputAndButton(false);
    }

    OnInit()
    {
        this.setupUI();
        this.msgAudio = new AudioPlayer();
        this.msgAudio.load('{{ApiUrl}}assets/bot/sounds/mgs_sound.mp3');
    }

    setupUI() {
        
        this.floatingBtn = this.createFloatingButton();
        if(!isStandalone)
        {
            this.appendElement(this.rootElement,this.floatingBtn);
        }

        // Create chatbot container
        this.container = this.createElement('div', { class: `zauto-chatbot-container ${isStandalone ? "standalone active":''} zauto-shadow` });
        this.appendElement(this.rootElement, this.container);
        
        this.floatingBtn.addEventListener('click', () =>{
            this.toggleBot();
        });

        // Create header
        this.topbar = this.createElement('div',{ class:'zauto-top-bar'});
        this.header = this.createElement('div', { class: 'zauto-chatbot-header' });
        this.profilePic = this.createElement('img', { src: `${apiUrl}/assets/bot/imgs/default_avatar.png`, alt: 'Profile Picture', class: 'zauto-profile-pic' });
        this.nameElement = this.createElement('div', { class: 'zauto-bot-name' });
        this.nameElement.textContent = 'Chatbot Name';

        this.closeBtn = this.createElement('button', { class: 'zauto-header-button' });
        this.closeIcon = this.createElement('i', { class: 'fa-solid fa-xmark' });
        this.appendElement(this.closeBtn,this.closeIcon);
        
        this.agentHandoverBtn = this.createElement('button', { class: 'zauto-header-button zauto-header-agent-button' });
        this.agentHandoverIcon = this.createElement('i', { class: 'fa-solid fa-headset' });
        this.appendElement(this.agentHandoverBtn,this.agentHandoverIcon);

        // agent handover form
        this.agentForm = this.createAgentForm();
        this.agentForm.style.minHeight = (this.container.offsetHeight / 3) + 'px';
        
        // Create chat input elements
        this.messageInput = this.createElement('input', { type: 'text', placeholder: 'Type your message...', class: 'zauto-chat-input' });
        this.sendMessageButton = this.createElement('button', { class: 'zauto-send-btn' });
        this.sendIcon = this.createElement('i', { class: 'fa-solid fa-paper-plane' });
        this.chatInputContainer = this.createElement('div', { class: 'zauto-chat-input-container zauto-shadow' });
    
        // Create chat message container
        this.chatContainer = this.createElement('div', { class: 'zauto-chat-messages' });
    
        // Add "Powered by" text
        this.poweredByContainer = this.createElement('div', { class: 'zauto-powered-by-container' });
        this.poweredByText = this.createElement('div', { class: 'zauto-powered-by-text' });
        this.poweredByText.textContent = 'Powered by ';
        this.poweredByLink = this.createElement('a', { href: 'https://zauto.ai', target: '_blank' });
        this.poweredByLink.textContent = 'ZautoAI';

        this.recentMessagesContainer = this.createElement('div', { class: 'zauto-recent-messages-container' });
        this.appendElement(this.rootElement, this.recentMessagesContainer);
    
        // Append elements to the container
        this.appendElement(this.container, this.topbar);
        this.appendElement(this.topbar,this.header,this.agentForm);
        this.appendElement(this.header, this.profilePic, this.nameElement);
        this.appendElement(this.sendMessageButton, this.sendIcon);
        this.appendElement(this.container, this.chatContainer, this.chatInputContainer);
        this.appendElement(this.chatInputContainer, this.messageInput, this.sendMessageButton);
        this.appendElement(this.container, this.poweredByContainer);
        this.appendElement(this.poweredByContainer, this.poweredByText, this.poweredByLink);
        this.appendElement(this.header, this.agentHandoverBtn);
        
        if(!isStandalone) 
        {
            this.appendElement(this.header, this.closeBtn);
            // Add event listeners
            this.closeBtn.addEventListener('click', (event)=>{
                this.toggleBot();
            });
        }

        this.sendMessageButton.addEventListener('click', () => {
            const trimmedValue = this.messageInput.value.trim();
            const sanitizedValue = this.utils.maskSensitiveInfo(trimmedValue);
            this.sendMessage(sanitizedValue);
        });
        this.messageInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                let textContent = this.messageInput.value.trim();
                textContent = this.utils.maskSensitiveInfo(textContent);
                this.sendMessage(textContent);
            }
        });

        this.agentHandoverBtn.addEventListener('click',(event)=>{
            this.agentForm.classList.toggle('active');
        });

        this.agentForm.addEventListener('submit', this.connectWithAgent.bind(this));
    }
    
    setupEventListeners()
    {
        this.eventEmitter.on("historyReceived",(historyData)=>{
            this.historyData = historyData;
            for(const message of historyData)
            {
                this.displayMessage(message);
            }
            if(historyData && historyData.length <= 1)
            {
                this.processChatPropertyContent({content:this.chatProperties});
            }
            const lastLeadForm = localStorage.getItem('leadForm');
            if(lastLeadForm)
            {
                const content = JSON.parse(lastLeadForm);
                this.leadData = {content};
                this.leadForm = this.createLeadForm(content);
                this.showLeadForm();
                this.leadForm.addEventListener('submit', this.leadFormSubmission.bind(this));
            }
        });
        this.eventEmitter.on("avatarDataReceived",(data)=>{
            this.avatarData = data;
            if(data.starters){
                const _starters = data.starters.split(',');
                const starters = _starters.map(starter => {
                    return {content:starter, type:'starter'}
                });
                this.chatProperties.starters = starters;
            }
            // Create and append typing indicator
            this.typingIndicator = this.createTypingIndicator();

            this.updateBotStyle(data.styles);
            this.nameElement.textContent = this.avatarData.displayName;
            if(data.logoUrl) this.profilePic.src = data.logoUrl;
            var imgElement = this.floatingBtn.querySelector('img');
            if(imgElement)
            {
                imgElement.src = data.logoUrl;
            }
            this.toggleInputAndButton(true);
        });
        this.eventEmitter.on("messageReceived",(data)=>{
            this.clearStarterProperties();
            this.hideTypingIndicator();
            this.toggleInputAndButton(true);
            this.displayMessage(data.message)
            this.displayRecentMessage(data.message);
            localStorage.removeItem('leadForm');
            this.msgAudio.play();
            // this.wakeup();
        });
        this.eventEmitter.on("leadFound",(data)=>{
            if(this.calendarForm) return;
            if (this.leadForm) {
                this.removeElement(this.leadForm);
            }
            if (this.ctaForm) {
                this.removeElement(this.ctaForm);
                this.ctaForm = null;
                this.ctaData = null;
            }
            this.clearStarterProperties();
            console.log(data);
            this.leadData = data;
            this.leadForm = this.createLeadForm(data.content);
            this.showLeadForm();
            this.leadForm.addEventListener('submit', this.leadFormSubmission.bind(this));
        });
        this.eventEmitter.on("ctaSelected",(data)=>{
            this.processChatPropertyContent(data);
        });
        this.eventEmitter.on("startersRecived",(data)=>{
            if(data.starters)
            {
                if (!this.chatProperties.starters) {
                    this.chatProperties.starters = [];
                }
                
                this.chatProperties = {
                ...this.chatProperties,
                starters: [...this.chatProperties.starters, ...data.starters]
                };
                this.chatStarterElements = this.createStarterProperties(this.chatProperties);
                this.appendElement(this.chatContainer,this.chatStarterElements);
                this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
            }
        });
        this.eventEmitter.on("leadSubmitted",(message)=>{
            this.displayMessage(message)
            if (this.leadForm) {
                this.removeElement(this.leadForm);
                this.leadForm = null;
                this.leadData = null;
                localStorage.removeItem('leadForm');
            }
            setTimeout(() => {
                this.showTypingIndicator();
            }, 500);
        });
        this.eventEmitter.on("leadSubmitFailed",(data)=>{
            this.leadFormSumitFailed(data);
        });
        this.eventEmitter.on("wakeupBot",(wakeup)=>{
            // this.wakeup();
            const _fMessageHistory = this.historyData.filter(message => (message.role === 'assistant' && message.type === 'TEXT'));
            const startIndex = Math.max(0, _fMessageHistory.length - 3);
            for (let i = startIndex; i < _fMessageHistory.length; i++) {
                const message = _fMessageHistory[i];
                setTimeout(() => {
                    this.displayRecentMessage(message);
                }, (i - startIndex) * 300);
            }
            
        });
        this.eventEmitter.on("aiSuspended",(data)=>{
            this.resetAgentForm();
        });
        this.eventEmitter.on("resumeAIAgent",(data)=>{
            this.resetAgentForm();
        });
        this.eventEmitter.on("availableDateRecived",(dates)=>{
            if(this.calendarForm)
            {
                this.removeElement(this.calendarForm);
            }
            if (this.ctaForm) {
                this.removeElement(this.ctaForm);
                this.ctaForm = null;
                this.ctaData = null;
            }
            this.calendarForm = this.createCalendarForm({type:'date',dates:dates});
            this.showCalendarForm()
        });
        this.eventEmitter.on("availableSlotsRecived",(dates)=>{
            if(this.calendarForm)
            {
                this.removeElement(this.calendarForm);
            }
            this.calendarForm = this.createCalendarForm({type:'slots',slots:dates});
            this.showCalendarForm()
        });
        this.eventEmitter.on("eventBooked",(dates)=>{
            if(this.calendarForm)
            {
                this.removeElement(this.calendarForm);
            }
        });
        this.eventEmitter.on("ctaFormSubmitted",(data)=>{
            this.clearStarterProperties();
            if (data.ctaData && data.ctaData.type === 'CTA') {
                window.open(data.ctaData.link, '_blank');
            } else if (data.ctaData && data.ctaData.type === 'CALENDAR') {
                if (data.ctaData.link) {
                    window.open(data.ctaData.link, '_blank');
                } else {
                    this.eventEmitter.emit('getAvailableDates', data.ctaData);
                }
            }
        });
    }
    
    wakeup()
    {
        if(isStandalone || !this.chatContainer) return;
        this.container.classList.add('active');
    }

    updateBotStyle(style)
    {
        if (style) {
            const styleJson = JSON.parse(style);
            document.documentElement.style.setProperty('--main-color', styleJson?.primaryColor || '#6C22A6');
            document.documentElement.style.setProperty('--user-font-color', styleJson?.textColor || '#ffffff');
            document.documentElement.style.setProperty('--message-font-size', styleJson?.fontSize + 'px' || '16px');
        }
    }

    toggleInputAndButton(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendMessageButton.disabled = !enabled;
        if (enabled) {
            this.messageInput.focus();
        }
    }

    createAgentForm() {
        // Create form element
        const agentForm = this.createElement('form', { class: 'zauto-agent-form zauto-shadow' });
        const formContainer = this.createElement('div',{class:'zauto-agent-form-cotainer'});
        const message = this.createElement('p', { textContent: "Connect with human agent."});
    
        // Name input
        const inputGroupContainerName = this.createElement('div', { class: 'zauto-input-group' });
        const nameLabel = this.createElement('label', { for: 'name', textContent: 'Name' });
        const nameInput = this.createElement('input', { type: 'text', id: 'name', name: 'name', placeholder:'Name', required: true });
        this.appendElement(inputGroupContainerName,nameLabel,nameInput);        
        // Email input
        const inputGroupContainerEmail = this.createElement('div', { class: 'zauto-input-group' });
        const emailLabel = this.createElement('label', { for: 'email', textContent: 'Email' });
        const emailInput = this.createElement('input', { type: 'email', id: 'email', name: 'email', placeholder:'Email', required: true });
        this.appendElement(inputGroupContainerEmail,emailLabel,emailInput);
        // Create submit button
        const submitButton = this.createElement('button', { type: 'submit', class: 'zauto-submit-btn', textContent: 'Connect' });
        this.appendElement(agentForm,formContainer);
        this.appendElement(formContainer,message,inputGroupContainerName,inputGroupContainerEmail,submitButton);

    
        return agentForm;
    }   

    createFloatingButton()
    {
        const btn = this.createElement('div',{class:'zauto-floating-btn zauto-shadow'})
        // const chatIcon = this.createElement('i',{class:"fa-solid fa-message"})
        const img = this.createElement('img', { class:'zauto-image', alt:"..."});
        img.src = `${apiUrl}/assets/bot/imgs/default_avatar.png`;
        this.appendElement(btn,img);
        return btn;
    }

    displayMessage(message) {
        if(message.type != 'TEXT')
        {
            this.displayActivity(message);
            return;
        }
        this.clearStarterProperties();
        message.content = this.utils.maskSensitiveInfo(message.content);
        let markdownContent = this.utils.markdown(message.content);
        const messageFrameElement = this.createElement('div', { class: `zauto-message-frame ${message.role === 'assistant' ? 'bot-message' : 'user-message'}` });
        const messageContainer = this.createElement('div', { class: 'zauto-message-container zauto-shadow' });
        const messageElement = this.createElement('div', { class: 'zauto-message' });
        messageElement.innerHTML = markdownContent;

        const imageElement = this.createElement('img', { src: `${apiUrl}/assets/bot/imgs/default_avatar.png`, alt: '...', class:'zauto-profile-pic' });
        if(this.avatarData.logoUrl) imageElement.src = this.avatarData.logoUrl;

        let sendByName = message.role === 'assistant' ? this.avatarData.displayName : message.role;
        sendByName = sendByName.replaceAll('user','You');
        const sentByElement = this.createElement('div', { textContent: sendByName, class: 'zauto-sentby' });
    
        const timestampAndReactionsContainer = this.createElement('div', { class: 'zauto-timestamp-reactions-container' });
        const timestamp = this.utils.formatRelativeDate(message.createdAt);
        const timestampElement = this.createElement('div', { textContent: timestamp, class: 'zauto-timestamp' });
    
        if(message.role === 'assistant')
        {
            this.appendElement(messageFrameElement,imageElement);
        }
        if (message.role === 'assistant') this.appendElement(messageContainer, sentByElement);
        this.appendElement(this.chatContainer, messageFrameElement);
        this.appendElement(messageFrameElement,messageContainer);
        this.appendElement(messageFrameElement, timestampAndReactionsContainer);
        this.appendElement(messageContainer, messageElement);
        this.appendElement(timestampAndReactionsContainer, timestampElement);
        const containerWidth = messageContainer.offsetWidth;
        timestampAndReactionsContainer.style.width = (containerWidth - 10) + 'px';

        if (message.role === 'assistant') {
            const reactionContainer = this.createReactionButtons(message);
            this.appendElement(timestampAndReactionsContainer, reactionContainer);
        }
    
        setTimeout(() => {
            messageFrameElement.classList.add('visible');
        }, 10);
    
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    createReactionButtons(message) {
        // Like and Dislike buttons
        const reactionContainer = this.createElement('div');
        const likeButton = this.createElement('button');
        likeButton.className = 'zauto-reaction-btn';
        const likeIcon = this.createElement('i');
        likeIcon.className = 'fa-solid fa-thumbs-up';
        const dislikeButton = this.createElement('button');
        dislikeButton.className = 'zauto-reaction-btn';
        const dislikeIcon = this.createElement('i');
        dislikeIcon.className = 'fa-solid fa-thumbs-down';
        if(message.vote == ReactionType.NULL)
        {
            const likeButtonClickHandler = () => {
                likeButton.classList.add('active');
                dislikeButton.classList.remove('active');
                likeButton.removeEventListener('click', likeButtonClickHandler);
                dislikeButton.remove();
                this.eventEmitter.emit('reactionSent',{id: message.id,reactionType: ReactionType.UPVOTE});
            };
            
            const dislikeButtonClickHandler = () => {
                dislikeButton.classList.add('active');
                likeButton.classList.remove('active');
                dislikeButton.removeEventListener('click', dislikeButtonClickHandler);
                likeButton.remove();
                this.eventEmitter.emit('reactionSent',{id: message.id,reactionType: ReactionType.DOWNVOTE});
            };
            likeButton.addEventListener('click', likeButtonClickHandler);
            dislikeButton.addEventListener('click', dislikeButtonClickHandler);
        }
    
        if(message.vote != ReactionType.DOWNVOTE)
        {
            reactionContainer.appendChild(likeButton);
            likeButton.appendChild(likeIcon);
            if(message.vote == ReactionType.UPVOTE)
            {
                likeButton.classList.add('active');
            }
        }
        if(message.vote != ReactionType.UPVOTE)
        {
            reactionContainer.appendChild(dislikeButton);
            dislikeButton.appendChild(dislikeIcon);
            if(message.vote == ReactionType.DOWNVOTE)
            {
                dislikeButton.classList.add('active');
            }
        }
    
        return reactionContainer;
    }

    createTypingIndicator() {
        const typingIndicatorFrame = this.createElement('div', { class: 'zauto-message-frame bot-message' });
        const typingIndicatorContainer = this.createElement('div', { class: 'zauto-message-container zauto-shadow' });
        const typingIndicatorContent = this.createElement('div', { class: 'zauto-message zauto-typing-indicator' });
        const imageElement = this.createElement('img', { src: `${apiUrl}/assets/bot/imgs/default_avatar.png`, alt: '...', class:'zauto-profile-pic' });
        if(this.avatarData.logoUrl) imageElement.src = this.avatarData.logoUrl;
        let sendByName = this.avatarData.displayName || 'assistant' ;
        const sentByElement = this.createElement('div', { textContent: sendByName, class: 'zauto-sentby' });

        // Create bouncing dots
        const dotsContainer = this.createElement('div', { class: 'zauto-bouncing-dots-container' });
        for (let i = 0; i < 3; i++) {
            const dot = this.createElement('span', { class: 'zauto-dot', style: `animation-delay: ${i * 0.2}s` });
            dotsContainer.appendChild(dot);
        }

        typingIndicatorContent.appendChild(dotsContainer);
        this.appendElement(typingIndicatorFrame,imageElement);
        this.appendElement(typingIndicatorContainer, sentByElement);
        this.appendElement(typingIndicatorContainer, typingIndicatorContent);
        this.appendElement(typingIndicatorFrame, typingIndicatorContainer);

        return typingIndicatorFrame;
    }
    
    showTypingIndicator() {
        this.appendElement(this.chatContainer, this.typingIndicator);
        setTimeout(() => {
            this.typingIndicator.classList.add('visible');
        }, 10);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.removeElement(this.typingIndicator)
    }

    createLeadForm(leadField) {
        
        const leadForm = this.createElement('form', { class: 'zauto-lead-form' });
        const label = this.createElement('label', { textContent: leadField.title });
        const input = this.createElement('input', { type: 'text', placeholder: leadField.title, name: leadField.type,required: leadField.required });
        this.appendElement(leadForm, label);
        const inputButtonContainer = this.createElement('div', { class: 'zauto-input-group' });
        this.appendElement(inputButtonContainer, input);
        const submitButton = this.createElement('button', { type: 'submit', class: 'zauto-submit-btn', textContent: 'Submit' });
    
        this.appendElement(inputButtonContainer, submitButton);
        this.appendElement(leadForm, inputButtonContainer);    
        return leadForm;
    }

    getLastMessage() {
        const messages = document.querySelectorAll('.zauto-message-frame.bot-message');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            return lastMessage.querySelector('.zauto-message-container');
        } else {
            return null;
        }
    }
    
    showLeadForm()
    {
        const parent = this.getLastMessage();
        this.appendElement(parent, this.leadForm);
        setTimeout(() => {
            this.leadForm.classList.add('visible');
            const inputField = this.leadForm.querySelector('input[type="text"]');
            if (inputField) {
                inputField.focus();
            }
        }, 10);   
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    displayActivity(message)
    {
        if(message.type != 'ACTIVITY')
        {
            return;
        }
        const activityContainer = this.createElement('div', { class: 'zauto-activity-container' });
        const activeText = this.createElement('div', { class: 'zauto-activity' });
        activeText.innerHTML = `<div>${this.utils.formatRelativeDate(message.createdAt)}</div><div>${message.content}</div>`;
        this.appendElement(this.chatContainer, activityContainer);
        this.appendElement(activityContainer, activeText);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    createCalendarForm(data) {
        if(this.calendarForm)
        {
            this.removeElement(this.calendarForm);
        }
        const calendarForm = this.createElement('div', { class: 'zauto-lead-form zauto-shadow' });
        
        const buttonsContainer = this.createElement('div', { class: 'zauto-calendar-form' });
        
        if (data.type === 'date') {
            const titleElement = this.createElement('h4', { textContent: 'Select date' }); 
            for (let date of data.dates) {
                date = this.utils.formatDatePipe(date,'yyyy-MMM-DD');
                const element = this.createElement('button', { textContent: date});
                this.appendElement(buttonsContainer, element);
                element.addEventListener('click',(event)=>{
                    const formattedDate = this.utils.formatDatePipe(event.target.textContent,'yyyy-MM-DD');
                    this.eventEmitter.emit('availableDateSelected',formattedDate);
                    buttonsContainer.querySelectorAll('button').forEach(button => {
                        button.disabled = true;
                    });
                });
            }
            this.appendElement(calendarForm, titleElement);
            this.appendElement(calendarForm, buttonsContainer);
        }
        else if (data.type === 'slots')
        {
            const titleElement = this.createElement('h4', { textContent: 'Select time' }); 
            for (let slot of data.slots){
                const start = this.utils.formatDatePipe(slot.start,'HH:mm');
                const end = this.utils.formatDatePipe(slot.end,'HH:mm');
                const element = this.createElement('button', { textContent:  `${start} - ${end}`});
                this.appendElement(buttonsContainer, element);
                element.addEventListener('click',(event)=>{
                    this.eventEmitter.emit('bookEvent',slot);
                    buttonsContainer.querySelectorAll('button').forEach(button => {
                        button.disabled = true;
                    });
                });
                
            }
            if(data.slots.length == 0)
            {
                const backBtn = this.createElement('button', { textContent:  `back`});
                this.appendElement(buttonsContainer, backBtn);
                backBtn.addEventListener('click',(event)=>{
                    this.eventEmitter.emit('getAvailableDates',null);
                    backBtn.disabled = true;
                });
            }
            this.appendElement(calendarForm, titleElement);
            this.appendElement(calendarForm, buttonsContainer);
        }
        
        return calendarForm;
    }

    showCalendarForm()
    {
        this.appendElement(this.chatContainer, this.calendarForm);
        setTimeout(() => {
            this.calendarForm.classList.add('visible');
            const inputField = this.calendarForm.querySelector('input[type="text"]');
            if (inputField) {
                inputField.focus();
            }
        }, 10);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    sendMessage(textContent) {
        this.clearStarterProperties();
        if (textContent) {
            const message = {
                content:textContent,
                createdAt: new Date().toISOString(),
                role:'user',
                type:'TEXT'
            };
            this.displayMessage(message);
            this.messageInput.value = '';
            this.toggleInputAndButton(false);
            setTimeout(() => {
                this.showTypingIndicator();
                this.eventEmitter.emit('messageSent', message);
                localStorage.removeItem('leadForm');
            }, 1000);
        }
    }

    leadFormSubmission(event) {
        event.preventDefault();
        if(!this.leadData) return;
        const formData = {};
        const formElements = event.target.elements;

        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                formData[element.name] = element.value;
                element.disabled = true;
            }
        }
        event.target.querySelector('button[type="submit"]').disabled = true;
        if (this.utils.isOtherLead(this.leadData.content.type)) {
            this.leadData.content.type = "info";
        }
        const leadFieldValue = Object.values(formData)[0];
        this.leadData["fieldName"] = this.utils.formateFieldName(this.leadData.content.title);
        this.leadData = {...this.leadData,...{leadFieldValue}};
        this.eventEmitter.emit('leadFormSent', this.leadData);
    }

    leadFormSumitFailed(data) {
        if (!this.leadForm) {
            throw Error('LeadForm form not found');
        }
        this.leadForm.reset(); 
        const formElements = this.leadForm.elements;
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.disabled = false; // Enable input
                
                // Remove existing error messages
                const existingErrorMessage = element.parentNode.parentNode.querySelector('.zauto-error-message');
                if (existingErrorMessage) {
                    existingErrorMessage.remove();
                }
                
                // Display new error message
                const errorElement = document.createElement('div');
                errorElement.className = 'zauto-error-message';
                errorElement.textContent = data.message;
                element.parentNode.parentNode.insertBefore(errorElement, element.parentNode.nextSibling);
            }
        }
        const submitButton = this.leadForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        this.leadForm.querySelector('button[type="submit"]').disabled = false;
    }

    connectWithAgent(event) {
        event.preventDefault();
        const formData = {};
        const formElements = event.target.elements;
        const submitButton = event.target.querySelector('button[type="submit"]');
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                formData[element.name] = element.value;
                element.disabled = true;
            }
        }
        submitButton.disabled = true;
        submitButton.textContent = 'Connecting...'; 
        this.eventEmitter.emit('connectWithAgent', formData);
    }

    resetAgentForm()
    {
        if(!this.agentForm)
        {
            throw Error('Agent form not found')
        }
        this.agentForm.reset(); 
        const formElements = this.agentForm.elements;
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.disabled = false; // Enable input
            }
        }
        const submitButton = this.agentForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Connect'; 
        this.agentForm.querySelector('button[type="submit"]').disabled = false;
        this.agentForm.classList.remove('active');
    }

    clearStarterProperties()
    {
        if(this.chatStarterElements)
        {
            this.removeElement(this.chatStarterElements);
            this.chatStarterElements = null;
        }
        if(this.ctaForm)
        {
            this.removeElement(this.ctaForm);
            this.ctaForm = null;
        }
    }

    processChatPropertyContent(data)
    {
        if(data.content)
        {
            var _ctas = [];
            var _pageNavigators = [];
            var _starters = [];
            if(!this.chatStarterElements)
            {
                this.chatStarterElements = this.createElement('ul', { class: 'zauto-starters' });
            }
            console.log(this.chatStarterElements.children);
            if (data.content.ctas && data.content.ctas.length) {
                _ctas = data.content.ctas.map(cta => {
                    return {
                        content: cta.name,
                        link: cta.link,
                        type: cta.type
                    };
                });
                const ctas = this.createCtas(_ctas,this.handleChatCtaClick.bind(this));
                for (let element of ctas) {
                    this.chatStarterElements.appendChild(element);
                }
            }

            if (data.content.pageNavigators && data.content.pageNavigators.length) {
                _pageNavigators = data.content.pageNavigators.map(cta => {
                    return {
                        content: cta.name,
                        link: cta.link,
                        type: cta.type
                    };
                });
                const pageNavigators = this.createPageNavigations(_pageNavigators,this.handleChatNavigatonClick.bind(this));
                for (let element of pageNavigators) {
                    this.chatStarterElements.appendChild(element);
                }
            }
            
            if (data.content.starters && data.content.starters.length) {
                _starters = data.content.starters.map(starter => {
                    return {
                        content: starter.content,
                        type: 'starter'
                    };
                });
                const starters = this.createStarters(_starters,this.handleChatStarterClick.bind(this));
                for (let element of starters) {
                    this.chatStarterElements.appendChild(element);
                }
            }

            const elementsToSort = Array.from(this.chatStarterElements.children);
            const uniqueElements = [];
            const seenContent = new Set();
            for (const element of elementsToSort) {
                const aTag = element.querySelector('a');
                if (aTag)
                {
                    const content = aTag.textContent.trim();
                    if (!seenContent.has(content)) {
                        uniqueElements.push(element);
                        seenContent.add(content);
                    } else {
                        this.chatStarterElements.removeChild(element);
                    }
                }
                else {
                    uniqueElements.push(element);
                }
            }
            uniqueElements.sort((a, b) => {
                const classA = getClassPriority(a.classList);
                const classB = getClassPriority(b.classList);
                if (classA < classB) return -1;
                if (classA > classB) return 1;
                return 0;
            });


            while (this.chatStarterElements.firstChild) {
                this.chatStarterElements.removeChild(this.chatStarterElements.firstChild);
            }

            uniqueElements.forEach(element => {
                this.chatStarterElements.appendChild(element);
            });

            this.appendElement(this.chatContainer, this.chatStarterElements);
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

            function getClassPriority(classList) {
                if (classList.contains('cta')) return 1;
                if (classList.contains('navigator')) return 2;
                if (classList.contains('starter')) return 3;
                return 0; 
            }

        } 
    }

    handleChatStarterClick(event,element)
    {
        if(element.parentNode)
        {
            this.sendMessage(event.content);
            element.parentNode.remove();
        }
    }

    handleChatNavigatonClick(event,element)
    {
        if(element.parentNode)
        {
            window.open(event.link, '_blank');
            element.parentNode.remove();
        }
    }

    handleChatCtaClick(event,element)
    {
        if(element.parentNode)
        {
            this.ctaForm = this.createCtaForm(event);
            // element.parentNode.remove();
        }
    }

    createStarters(starters,callback) {

        return this.generateElements(starters, 'content','starter',callback);
    }

    createPageNavigations(pageNavigations,callback)
    {
        return this.generateElements(pageNavigations, 'content','navigator',callback);
    }

    createCtas(ctas,callback)
    {
        return this.generateElements(ctas, 'content', 'cta',callback);
    }

    generateElements(items, contentProperty,type,callback)
    {
        const elements = [];
        if (items.length <= 0) {
            return elements;
        }
        for (let item of items) {
            if (!item[contentProperty]) continue;
            const element = this.createElement('li',{class:type});
            const anchor = this.createElement('a', {role:'button', class : `zauto-${type} zauto-shadow`});
            const icon = type == 'navigator' ? `<i class="fa-solid fa-globe"></i>` : '';
            anchor.innerHTML = `${icon} <span>${item[contentProperty]}</span>`;
            anchor.addEventListener('click', () => {
                if (callback && typeof callback === 'function') {
                    callback(item,element); 
                }
            });
            this.appendElement(element,anchor);
            elements.push(element);
        }
        return elements;
    }

    createCtaForm(ctaData) {
        if(this.ctaForm)
        {
            this.removeElement(this.ctaForm);
        }
        const ctaForm = this.createElement('form', { class: 'zauto-lead-form zauto-cta-form zauto-shadow' });
    
        // Create input group for name
        const inputGroupContainerName = this.createElement('div', { class: 'zauto-input-group' });
        const nameLabel = this.createElement('label');
        nameLabel.textContent = 'Full Name';
        const nameInput = this.createElement('input', { type: 'text', name: 'fullName', placeholder: 'Enter your name', required: true });
    
        // Create input group for email
        const inputGroupContainerEmail = this.createElement('div', { class: 'zauto-input-group' });
        const emailLabel = this.createElement('label');
        emailLabel.textContent = 'Email';
        const emailInput = this.createElement('input', { type: 'email', name: 'email', placeholder: 'Enter your email', required: true });
    
        // Create submit button
        const submitButton = this.createElement('button', { type: 'submit',class:'zauto-cta-btn' });
        submitButton.textContent = 'Submit';
    
        // Append elements to form
        this.appendElement(inputGroupContainerName, nameLabel, nameInput);
        this.appendElement(inputGroupContainerEmail, emailLabel, emailInput);
        ctaForm.append(inputGroupContainerName, inputGroupContainerEmail, submitButton);
        
        // Add event listener to form
        ctaForm.addEventListener('submit', this.handleCtaFormSubmit.bind(this,ctaData));

        // Append form to chat container
        this.appendElement(this.chatContainer, ctaForm);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        return ctaForm;
    }

    handleCtaFormSubmit(ctaData,event) {
        event.preventDefault();
        const formElements = event.target.elements;
        const formData = {};
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                formData[element.name] = element.value;
                element.disabled = true;
            }
        }
        event.target.querySelector('button[type="submit"]').disabled = true;        
        this.eventEmitter.emit('ctaFormSubmit', {formData,ctaData});
    }   

    displayRecentMessage(message)
    {
        const MAX_MESSAGE_COUNT = 3;
        if (message.type !== 'TEXT' || message.role !== 'assistant' || isStandalone || this.isOpen) {
            return;
        }
        message.content = this.utils.maskSensitiveInfo(message.content);
        let markdownContent = this.utils.markdown(message.content);
        const messageContainer = this.createElement('div', { class: 'zauto-message-container zauto-shadow' });
        const messageElement = this.createElement('div', { class: 'zauto-message' });
        messageElement.innerHTML = markdownContent;
        this.appendElement(this.recentMessagesContainer, messageContainer);
        this.appendElement(messageContainer,messageElement);
        const childElements = this.recentMessagesContainer.children;
        if(childElements.length > MAX_MESSAGE_COUNT)
        {
            this.recentMessagesContainer.removeChild(childElements[0]);
        }
        setTimeout(() => {
            messageContainer.classList.add('visible');
        }, 10);
        messageContainer.addEventListener('click', () => {
            this.toggleBot();
        });
    }
    
    toggleBot()
    {
        this.isOpen = !this.isOpen; 
        if (this.isOpen) {
            this.container.classList.add('active');
            const childElements = Array.from(this.recentMessagesContainer.children);
            for (const child of childElements) {
                this.recentMessagesContainer.removeChild(child); 
            }
        } else {
            this.container.classList.remove('active');
            this.agentForm.classList.remove('active');
        }
    }
}

class ChatBotLogic {
    
    constructor(eventEmitter,rootUrl,avatarId) {
        this.utils = new Utils();
        this.isLoaded = false;
        this.avatarId = avatarId;
        this.convoId = null;
        this.apiUrl = apiUrl;
        this.history = [];
        this.eventEmitter = eventEmitter;
        this.restClient = new RestClient(this.apiUrl);

        this.headers = {
            'Content-Type': 'application/json',
        };
        this.avatarData = null;
        this.socket = io(rootUrl, {
            query: {
                "visitId": this.getVisit(),
                "orgId": "{{ORG_ID}}"
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
            if(this.isLoaded) return;
            this.isLoaded = true;
            this.getAvatar(avatarId);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('convCreated', (data) => {
            this.convoId = data.id;
            this.setVisitor(data.visitorId);
            this.setVisit(data.visitId);
            this.getChatHistory(data.id);
        });
        
        
        this.socket.on('replyMessage', (data) => {
            this.eventEmitter.emit("messageReceived",data);
        });



        this.socket.on('leadfound', (data) => {
            this.eventEmitter.emit("leadFound",data);
            localStorage.setItem("leadForm",JSON.stringify(data.content));
        });
        this.socket.on('ctaselected', (data) => {
            console.log(data);
            this.eventEmitter.emit("ctaSelected",data);
        });
        this.socket.on('aiSuspended', (data) => {
            console.log(data);
            this.eventEmitter.emit("aiSuspended",data);
        });
        this.socket.on('resumeAIAgent', (data) => {
            console.log(data);
            this.eventEmitter.emit("resumeAIAgent",data);
        });
        this.socket.on('scheduleFound', (data) => {
            this.getAvailableDates();
        });
        this.eventEmitter.on('messageSent', (message) => {
            this.sendMessage(message);
        });
        this.eventEmitter.on('reactionSent',(data) =>{
            console.log(data);
            const payload = {vote: data.reactionType};
            let endpoint = `${this.apiUrl}${API.endpoint.vote}${data.id}`;
            this.restClient.patch(endpoint,payload)
            .then(data => {
            })
            .catch(error => {
                console.log(error);
            });
        });
        this.eventEmitter.on('leadFormSent',(leadData)=>{
            let payload = { };
            if (leadData.content.type == 'info') {
                const jsonData = {};
                jsonData[leadData.fieldName] = leadData.leadFieldValue;
                payload[leadData.content.type] = JSON.stringify(jsonData);
            }
            else {
                payload[leadData.content.type] = leadData.leadFieldValue;
            }
            function callback(error, res) {
                if (error) {
                    console.log(error);
                    this.eventEmitter.emit('leadSubmitFailed',error);
                } else {
                    const textContent = `${leadData.content.title} is ${leadData.leadFieldValue}`;
                    const message = {
                        content:textContent,
                        createdAt: new Date().toISOString(),
                        role:'user',
                        type:'TEXT'
                    };
                    this.sendMessage(message);
                    this.eventEmitter.emit('leadSubmitted',message);
                }
            }
            this.sendLead(payload,callback.bind(this));
        });
        this.eventEmitter.on('connectWithAgent',(formData)=>{
            if(!this.convoId)
            {
                throw Error('convId missing');
            }
            console.log(formData);
            this.socket.emit('requestHumanSupport',{convId:this.convoId,lead:formData});
        });

        this.eventEmitter.on('getAvailableDates', (data)=>{
            this.getAvailableDates();
        });
        this.eventEmitter.on('availableDateSelected', (date)=>{
            this.getAvailableSlots(date);
        });
        this.eventEmitter.on('bookEvent', (date)=>{
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const payload = {
                convoId: this.convoId,
                summary: "Meeting",
                start: {
                    dateTime:date.start,
                    timeZone:timeZone
                },
                end: {
                    dateTime:date.end,
                    timeZone:timeZone
                },
            };
            const eventDate = this.utils.formatDatePipe(date.start,'yyyy-MMM-DD')
            const startTime = this.utils.formatDatePipe(date.start,'HH:mm')
            const endTime = this.utils.formatDatePipe(date.end,'HH:mm')
            const _message = `At ${eventDate} ${startTime} - ${endTime}`;
            const message = {
                content:_message,
                createdAt: new Date().toISOString(),
                role:'user',
                type:'TEXT'
            };
            const callback = (error, data) => {
                if (error) {
                    console.error('Error:', error);
                } else {
                    console.log('Data:', data);
                    this.eventEmitter.emit('eventBooked', data);
                    this.eventEmitter.emit('leadSubmitted',message);
                    this.sendMessage(message);
                }
            };
            this.sendBookEvent(payload,callback);
        });

        this.eventEmitter.on('ctaFormSubmit', (data)=>{
            function callback(error, res) {
                if (error) {
                    console.error('Error:', error);
                } else {
                    console.log('Data:', res);
                    this.eventEmitter.emit('ctaFormSubmitted', data);
                }
            }
            this.sendLead(data.formData, callback.bind(this));
        });
        setTimeout(() => {
            this.eventEmitter.emit('wakeupBot', true);
        }, 3000);

        this.eventEmitter.on('sendTrackingData', (data)=>{
            if(!this.convoId){
                throw Error('convId missing');
            }

            if(!this.avatarId)
            {
                throw Error('avatarId missing');
            }
            const endpoint = `${this.apiUrl}${API.endpoint.agent}${this.avatarId}/track/${this.convoId}`;
            this.restClient.post(endpoint,data)
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
        });

    }

    extractTenantId() {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        return subdomain;
    }

    getAvatar()
    {
        const queryParams = this.addReferrerToExistingQuery(document.referrer);
        let endpoint = `${this.apiUrl}${API.endpoint.agent}${this.avatarId}${queryParams}`
        if (this.getVisitor()) endpoint += `&visitor=${this.getVisitor()}`
        this.restClient.get(endpoint)
        .then(data => {
            this.avatarData = data;
            this.setVisitor(data?.visitor?.id);
            this.setVisit(data?.visit?.id);
            this.createConvo(data.welcomeMsg);
            this.eventEmitter.emit("avatarDataReceived",data);
            setTimeout(() => {
                
            }, data.wakeupTime || 5000);
        })
        .catch(error => {
            console.log(error);
        });
    }

    createConvo(welcomeMsg) {
        if (this.avatarId) {
            const payload = {
                agentId: this.avatarId,
                visitorId: this.getVisitor(),
                visitId: this.getVisit(),
                orgId:"{{ORG_ID}}",
                chatMessage: {
                    messages: [
                        {
                            role: 'assistant',
                            content: welcomeMsg
                        }
                    ]
                }
            }
            this.socket.emit('createConversation', payload);
        }
        else
        {
            throw Error('avatarId missing');
        }
    }


    getChatHistory(convoId)
    {
        if (convoId) {
            let endpoint = `${this.apiUrl}${API.endpoint.agent}${this.avatarId}/chat/${convoId}`;
            this.restClient.get(endpoint)
            .then(data => { 
                this.eventEmitter.emit("historyReceived",data);
                this.history = data;
            })
            .catch(error => {
                console.log(error);
            });
            this.trackNavigation();
        }
        else
        {
            throw Error('convoId missing');
        }
    }

    addReferrerToExistingQuery(referrerURL) {
        const currentHost = window.location.hostname;
        const hostname = referrerURL ? new URL(referrerURL).hostname : null;
        const existingQuery = window.location.search.slice(1); 
        const newQueryParam = `source=${hostname || "site"}&homeSource=${currentHost}`;    
        if (existingQuery) {
            return `?${existingQuery}&${newQueryParam}`;
        } else {
            return `?${newQueryParam}`;
        }
    }

    sendMessage(message)
    {
        if(!this.avatarId)
        {
            throw Error('Avatar ID missing');
        }
        if(!this.convoId)
        {
            throw Error('Convo ID missing');
        }
        const payload = {
            agentId: this.avatarId,
            convId: this.convoId,
            orgId:"{{ORG_ID}}",
            chatMessage: {
                messages: [
                    {
                        role: "user",
                        content: message.content
                    }
                ]
            }
        };
        this.socket.emit('message', payload);
    }

    sendLead(payload,callback)
    {
        if(!this.convoId)
        {
            throw Error('convId missing');
        }
        payload = {...payload, conversationId: this.convoId };
        let endpoint = `${this.apiUrl}${API.endpoint.leadAgent.replace('{{avatarId}}', this.avatarId)}`;
        this.restClient.post(endpoint,payload)
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
    }

    trackNavigation()
    {
        const urlObject = window.location;
        if(!urlObject)
        {
            throw Error("urlObject missing");
        }
        let currentUrl = urlObject.origin + urlObject.pathname;
        // const hasFileExtension = /\.\w+$/.test(currentUrl);
        const segments = currentUrl.split('/');
        const lastSegment = segments.filter(segment => segment !== '').pop();
        const hasFileExtension = lastSegment && /\.\w+$/.test(lastSegment);
        if (hasFileExtension && currentUrl.endsWith("/")) {
            currentUrl = currentUrl.slice(0, -1);
        }
        const payload = {
            agentId: this.avatarId,
            convId: this.convoId,
            orgId:"{{ORG_ID}}",
            url: currentUrl
        };
        this.socket.emit("navigate",payload);
    }

    // calendar
    getAvailableDates()
    {
        if(!this.avatarId)
        {
            throw Error('Avatar ID missing');
        }
        let endpoint = `${this.apiUrl}${API.endpoint.calendarDates}`;
        this.restClient.get(endpoint)
        .then(data => {
            this.eventEmitter.emit('availableDateRecived',data);
        })
        .catch(error => {
            console.log(error);
        });
    }

    getAvailableSlots(date){
        if(!this.avatarId)
        {
            throw Error('Avatar ID missing');
        }
        if(!date)
        {
            throw Error('Date missing');
        }
        let endpoint = `${this.apiUrl}${API.endpoint.calendarSlots}?date=${date}`;
        this.restClient.get(endpoint)
        .then(data => {
            this.eventEmitter.emit('availableSlotsRecived',data);
        })
        .catch(error => {
            console.log(error);
        });
    }

    async sendBookEvent(payload, callback) {
        let endpoint = `${this.apiUrl}${API.endpoint.calendarBookEvent}`;
        this.restClient.post(endpoint,payload)
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
    }

    setVisitor(id) {
        localStorage.setItem("visitorId", id);
    }

    getVisitor() {
        return localStorage.getItem("visitorId") || null;
    }

    setVisit(id) {
        localStorage.setItem("visitId", id);
    }

    getVisit() {
        return localStorage.getItem("visitId") || null;
    }


}

class WebsiteTracker {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.maxScrollDepth = 0; // Initialize as a class property
        this.actionHistory = []; // Initialize as a class property
        this.initializeTracking();
        this.journeyTrackerInit();
    }

    trackButtonClick(event) {
        const data = {
            type: event.target.tagName.toLowerCase(),
            text: event.target.textContent.trim(),
            id: event.target.id,
            link: event.target.href || ''
        };
        this.eventEmitter.emit('sendTrackingData', {data: JSON.stringify(data)});
    }

    initializeTracking() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', this.trackButtonClick.bind(this));
        });
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', this.trackButtonClick.bind(this));
        });
    }

    journeyTrackerInit() {
        const apiRootUrl = '{{API_ROOT_URL}}';
        const tenantId = "{{ORG_ID}}";
        const currentPageUrl = window.location.origin + window.location.pathname;
        const buttons = document.querySelectorAll('button');
        const links = document.querySelectorAll('a');
        let scrollTimeout;

        const socket = io(apiRootUrl, {query: {orgId: tenantId}});
        socket.on('connect', () => {
            console.log('Socket connected for tracking');
            this.handleActionHistory(socket);
            this.createSession(apiRootUrl, tenantId, currentPageUrl, socket);
        });

        buttons.forEach(button => {
            button.addEventListener('click', this.trackButtonClick.bind(this));
        });
        links.forEach(link => {
            link.addEventListener('click', this.trackButtonClick.bind(this));
        });

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.trackScrollDepth(socket, currentPageUrl), 100);
        });

        window.addEventListener('beforeunload', () => {
            if (!this.getVisitId()) return;
            const data = {
                "visitId": this.getVisitId(),
                "data": "",
                "type": "PAGE_CLOSED",
                "url": currentPageUrl
            }
            this.appendActionHistory(data);
        });
    }

    handleActionHistory(socket) {
        const actionStr = localStorage.getItem("prospectAction");
        if (actionStr) {
            const _actionHistory = JSON.parse(actionStr);
            setTimeout(() => {
                for (const action of _actionHistory) {
                    socket.emit('prospectAction', action);
                }
            }, 500);
        }
        localStorage.removeItem("prospectAction");
    }

    createSession(apiRootUrl, tenantId, currentPageUrl, socket) {
        const data = {};
        const visitorId = this.getVisitorId();
        fetch(`${apiRootUrl}/api/visitors?${(visitorId ? `visitorId=${visitorId}` : '')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "x-tenant-id": tenantId
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create session');
            }
            return response.json();
        })
        .then(responseData => {
            console.log('Session created successfully');
            console.log('Response Data:', responseData);
            this.setVisitorId(responseData.visitorId);
            this.setVisitId(responseData.visitId);
            this.trackPageView(socket, currentPageUrl);
        })
        .catch(error => {
            console.error('Error creating session:', error.message);
        });
    }

    trackPageView(socket, currentPageUrl) {
        if (!this.getVisitId()) return;
        const data = {
            "visitId": this.getVisitId(),
            "type": "PAGE_VIEWED",
            "url": currentPageUrl
        }
        socket.emit('prospectAction', data);
    }

    trackScrollDepth(socket, currentPageUrl) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const currentScrollDepth = (scrollTop / (docHeight - winHeight)) * 100;
        if (currentScrollDepth > this.maxScrollDepth) {
            console.log(currentScrollDepth, this.maxScrollDepth);
            this.maxScrollDepth = currentScrollDepth;
            if (!this.getVisitId()) return;
            const data = {
                "visitId": this.getVisitId(),
                "type": "PAGE_VIEWED",
                "scrollDepth": Math.round(this.maxScrollDepth),
                "url": currentPageUrl
            }
            socket.emit('prospectAction', data);
        }
    }

    appendActionHistory(action) {
        this.actionHistory.push(action);
        localStorage.setItem("prospectAction", JSON.stringify(this.actionHistory));
    }

    getVisitorId() {
        return localStorage.getItem("visitorId");
    }

    setVisitorId(id) {
        localStorage.setItem("visitorId", id);
    }

    getVisitId() {
        return localStorage.getItem("visitId");
    }

    setVisitId(id) {
        localStorage.setItem("visitId", id);
    }
}



function loadExternalResources(rootElementId, resourceList, callback) {
    const rootElement = document.getElementById(rootElementId);
    rootElement.style.fontFamily = "Inter, sans-serif";
    let resourcesLoaded = 0;
    const totalResources = resourceList.length;

    function loadScript(src) {
        const scriptElement = document.createElement('script');
        scriptElement.src = src;
        scriptElement.onload = () => checkInitialization();
        rootElement.appendChild(scriptElement);
    }

    function loadStylesheet(href) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = href;
        linkElement.onload = () => checkInitialization();
        rootElement.appendChild(linkElement);
    }

    function checkInitialization() {
        resourcesLoaded++;
        if (resourcesLoaded === totalResources && typeof callback === 'function') {
            callback();
        }
    }

    for (const resource of resourceList) {
        if (resource.type === 'script') {
            loadScript(resource.src);
        } else if (resource.type === 'stylesheet') {
            loadStylesheet(resource.href);
        }
    }
}

// Usage
const resourceList = [
    { type: 'script', src: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js' },
    { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.1.2/socket.io.js' },
    { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js' },
    { type: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap' },
    { type: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },
    { type: 'stylesheet', href: `${apiUrl}assets/bot/css/zautobot_v2.css` },
];


loadExternalResources("zauto_root", resourceList, function () {
    const eventEmitter = new EventEmitter();
    const tracker = new WebsiteTracker(eventEmitter);
    const chatBotUI = new MyChatBotUI(eventEmitter);
    const chatBotLogic = new ChatBotLogic(eventEmitter,apiUrl,avatarId);
    console.log("Initialization completed!");
});