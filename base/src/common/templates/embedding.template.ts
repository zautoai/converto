export const BOTTOMBAR_JS = `
const apiUrl = "{{ApiUrl}}";
const baseUrl = "{{BaseUrl}}";

class API {
    static endpoint = {
        agent: "api/agents/",
        leadAgent: 'api/{{avatarId}}/leads',
        vote: 'api/conversations/message/',
    };
}

class SVG {
    static baseUrl = baseUrl;
    static urls = {
        send: baseUrl + "assets/bot/svgs/send.svg",
        upArrow: baseUrl + "assets/bot/svgs/up_arrow.svg",
        like: baseUrl + "assets/bot/svgs/like.svg",
        likeFill: baseUrl + "assets/bot/svgs/like_fill.svg",
        dislike: baseUrl + "assets/bot/svgs/dislike.svg",
        dislikeFill: baseUrl + "assets/bot/svgs/dislike_fill.svg",
    }
}

class AUDIO {
    static urls = {
        bloop: baseUrl + 'assets/bot/sounds/bloop.mp3',
        pop: baseUrl + 'assets/bot/sounds/pop.mp3'
    }
}

class ChatHistory {
    constructor() {
        this.chatHistory = [];
    }

    //   add single message
    addMessage(messageObject) {
        this.chatHistory.push(messageObject);
    }

    //   add multiple messages
    addMessages(messageObjects) {
        this.chatHistory = this.chatHistory.concat(messageObjects);
    }

    //   Get all messages
    getMessages() {
        return this.chatHistory;
    }

    //   get single message by Id
    getMessageById(messageId) {
        return (
            this.chatHistory.find((message) => message.id === messageId) || null
        );
    }

    // get single message by role
    deleteLeadFromChat() {
        const messageIndex = this.chatHistory.findIndex(
            (message) => message.role === SentBy.LEAD
        );
        if (messageIndex !== -1) {
            this.chatHistory.splice(messageIndex, 1);
        }
    }

    //   get last message from history
    getLastMessage() {
        if (this.chatHistory.length === 0) {
            return null;
        }
        return this.chatHistory[this.chatHistory.length - 1];
    }

    //   get first message from history
    getFirstMessage() {
        if (this.chatHistory.length === 0) {
            return null;
        }
        return this.chatHistory[0];
    }

    //   delete single message by Id
    deleteMessage(messageId) {
        const messageIndex = this.chatHistory.findIndex(
            (message) => message.id === messageId
        );

        if (messageIndex !== -1) {
            this.chatHistory.splice(messageIndex, 1);
        }
    }

    //   clear chat history
    clearChatHistory() {
        this.chatHistory = [];
    }
}

class LeadData {
    constructor() {
        this.type = "";
        this.title = "";
        this.fieldName = "";
    }
}



const rootElement = document.getElementById("zauto_root");


const markdownScript = document.createElement('script');
markdownScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
rootElement.appendChild(markdownScript);

const socketScript = document.createElement('script');
socketScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.1.2/socket.io.js';
rootElement.appendChild(socketScript);

const monentScript = document.createElement('script');
monentScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
rootElement.appendChild(monentScript);

let chatBot, botHeader, messageInput, sendMessageButton, messageContainer, typingIndicator,convoContainer;
const avatarId = "{{avatarId}}";
let avatarData = {
    displayName: "Blink",
}

let chatHistory = new ChatHistory();
let convoId = null;
let isTyping = false;
let uiInitialized = false;
let isActive = true;
let isStandalone = {{standAloneFlag}};

let scriptsLoaded = 0;
const totalScripts = 3;
socketScript.onload = function () {
    scriptsLoaded++;
    if (scriptsLoaded === totalScripts) {
        initialize();
    }
}
markdownScript.onload = function () {
    scriptsLoaded++;
    if (scriptsLoaded === totalScripts) {
        initialize();
    }
}

monentScript.onload = function () {
    scriptsLoaded++;
    if (scriptsLoaded === totalScripts) {
        initialize();
    }
}

function initialize() {
   
    // UIComponent initialization function
    function initUIComponent() {
        if (uiInitialized) {
            console.warn("UI is already initialized. Skipping...");
            return;
        }
        uiInitialized = true;

        if (rootElement) {
            // Link a style sheet
            const styleSheet = document.createElement("link");
            styleSheet.rel = "stylesheet";
            styleSheet.href = baseUrl + "assets/bot/css/zauto.css";
            rootElement.appendChild(styleSheet);
            const fontStyleSheet = document.createElement("link");
            fontStyleSheet.rel = "stylesheet";
            fontStyleSheet.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300&display=swap";
            document.head.appendChild(fontStyleSheet);
            rootElement.style.fontFamily = "Inter, sans-serif";

            // Chat bot container
            chatBot = document.createElement("div");
            chatBot.className = "zauto_chatbot";
            chatBot.classList.add(isStandalone ? "middle_center" : "bottom_center");
            rootElement.appendChild(chatBot);

            convoContainer = document.createElement("div");
            convoContainer.className = "zauto_convo_container";
            convoContainer.classList.add(isStandalone ? "state_active" : "state_idle")
            convoContainer.setAttribute("tabindex", "0");
            chatBot.appendChild(convoContainer);

            botHeader = generateHeader(convoContainer);

            const expandNob = document.createElement("div");
            expandNob.className = "zauto_expand_nob";
            expandNob.classList.add("zauto_shadow");
            fetch(SVG.urls.upArrow)
            .then(response => response.text())
            .then(svgData => {
                expandNob.innerHTML = svgData;
            });
            messageContainer = generateMessageContainer(convoContainer);
            if(isStandalone)
            {
                messageContainer.classList.toggle("expand");
                expandNob.classList.toggle("expand");
                botHeader.classList.toggle("visible");
            }
            else
            {
                convoContainer.appendChild(expandNob);
            }

            expandNob.addEventListener("click", () => {
                messageContainer.classList.toggle("expand");
                expandNob.classList.toggle("expand");
                botHeader.classList.toggle("visible");
                const isExpanded = messageContainer.classList.contains('expand');
                messageContainer.classList.toggle('no-scroll', !isExpanded);
                scrollTop(300, false);
            });

            const { input, sendBtn } = generateMessageInput(chatBot);
            messageInput = input;
            sendMessageButton = sendBtn;
            messageInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    sendMessage();
                }
            });
            sendBtn.addEventListener("click", (event) => {
                sendMessage();
            });
            generatePoweredBy(convoContainer);
            if(!isStandalone)
            {
                generateCloseBtn();
            }

            // handle active and inactive states based on foucs and blur
            
            if(!isStandalone)
            {
                convoContainer.addEventListener("focus", (eventArg) => {
                    if (!eventArg.relatedTarget || !convoContainer.contains(eventArg.relatedTarget)) {
                        toggleChatBot(true, eventArg);
                    }
                });
                
                convoContainer.addEventListener("blur", (eventArg) => {
                    if (!eventArg.relatedTarget || !convoContainer.contains(eventArg.relatedTarget)) {
                        toggleChatBot(false, eventArg);
                    }
                });
    
                convoContainer.querySelectorAll("a").forEach(element => {
                    element.addEventListener("focus", () => {
                        toggleChatBot(true);
                    });
                    element.addEventListener("blur", () => {
                        toggleChatBot(false);
                    });
                });
    
                messageInput.addEventListener("focus", (eventArg) => {
                    toggleChatBot(true,eventArg);
                });
    
                messageInput.addEventListener("blur", (eventArg) => {
                    toggleChatBot(false,eventArg);
                });
    
                sendMessageButton.addEventListener("focus", (eventArg) => {
                    toggleChatBot(true,eventArg);
                });
    
                sendMessageButton.addEventListener("blur", (eventArg) => {
                    toggleChatBot(false,eventArg);
                });
            }
        }
    }

    function toggleChatBot(_isActive, eventArg) {
        if(eventArg.type == "blur" && eventArg.relatedTarget)
        {
            return;
        }
        isActive = _isActive;
        if (isActive) {
            if (!convoContainer.classList.contains("state_active")) {
                convoContainer.classList.add("state_active");
            }
            if (convoContainer.classList.contains("state_idle")) {
                convoContainer.classList.remove("state_idle");
            }
        } else {
            if (!convoContainer.classList.contains("state_idle")) {
                convoContainer.classList.add("state_idle");
            }
            if (convoContainer.classList.contains("state_active")) {
                convoContainer.classList.remove("state_active");
            }
        }
    }

    // Function to generate close Btn
    function generateCloseBtn()
    {
        if(convoContainer)
        {
            const closeBtn = document.createElement('button');
            closeBtn.className = "zauto_close_btn";
            closeBtn.innerText = "✖"
            convoContainer.appendChild(closeBtn);
            closeBtn.addEventListener("click",(eventArg)=>{
                toggleChatBot(false,eventArg);
            });
        }
    }

    // Function to generate header
    function generateHeader(parent) {
        const header = document.createElement('div');
        header.className = "zauto_header";
        header.innerText = "Avatar"
        parent.appendChild(header);
        return header;
    }

    function updateBotHeader(name) {
        botHeader.innerText = name;
    }

    // Function to generate message input
    function generateMessageInput(parent) {
        const messageInputContainer = document.createElement("div");
        messageInputContainer.className = "zauto_message_input_container";
        messageInputContainer.classList.add("zauto_shadow");
        parent.appendChild(messageInputContainer);

        const messageInput = document.createElement("input");
        messageInput.className = "zauto_message_input";
        messageInput.type = "text";
        messageInput.placeholder = "Ask me anything!";
        messageInputContainer.appendChild(messageInput);

        const sendBtn = document.createElement("button");
        sendBtn.className = "zauto_send_btn";
        messageInputContainer.appendChild(sendBtn);

        fetch(SVG.urls.send)
            .then(response => response.text())
            .then(svgData => {
                sendBtn.innerHTML = svgData;
            });
        
        const input = messageInput;
        return { input, sendBtn };
    }

    // Function to generate message container
    function generateMessageContainer(parent) {
        const messageContainer = document.createElement("div");
        messageContainer.className = "zauto_chat_container";
        messageContainer.classList.add("expandable");
        parent.appendChild(messageContainer);

        return messageContainer;
    }

    function scrollTop(delay = 0, enableSmoothScroll = true) {
        setTimeout(() => {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: enableSmoothScroll ? 'smooth' : 'auto'
            });
        }, delay);

    }

    // Function to add a message to the container
    async function addMessage(id,markdownText, isUser = false, sendByName = "Blink", doAnimation = true, timestamp = null,vote=null) {

        if(id != null)
        {
            var oldelement = document.getElementById(id);
            if(oldelement) return;
        }

        const messageframe = document.createElement("div");
        messageframe.id = id;
        messageframe.className = "zauto_message_frame";
        messageframe.classList.add(isUser ? "right" : "left");
        messageContainer.appendChild(messageframe);

        const message = document.createElement("div");
        message.className = "zauto_message";
        messageframe.appendChild(message);

        const sentBy = document.createElement("div");
        sentBy.className = "zauto_sentby";
        sentBy.textContent = isUser ? "You" : sendByName;
        message.appendChild(sentBy);

        const messageText = document.createElement("div");
        messageText.className = "zauto_message_text";
        messageText.style.marginBottom = '10px';
        message.appendChild(messageText);

        const messageFooter = document.createElement("div");
        messageFooter.className = "zauto_message_footer";
        message.appendChild(messageFooter);

        addTimeStamp(messageFooter, timestamp);
        if (!isUser) {
            generateReactionPanel(messageFooter,id,vote)
        }

        setTimeout(() => {
            messageframe.classList.add('visible');
        }, 10);

        //const htmlContent = markdownText;

        const typingSpeed = 20; // Adjust the speed as needed
        let charIndex = 0;

        async function typeNextCharacter() {
            if (charIndex < htmlContent.length && doAnimation) {
                const currentChar = htmlContent.charAt(charIndex);
                messageText.innerHTML += currentChar;
                charIndex++;
                setTimeout(typeNextCharacter, typingSpeed);
                scrollTop(0, false);
                getLastMessage();
            } else {
                // Typing animation complete, render Markdown content
                messageText.innerHTML = ''; // Clear the typed text
                renderMarkdown(htmlContent, messageText);
                scrollTop();
            }
        }
        messageText.innerHTML = markdownText;
        scrollTop();
        //await typeNextCharacter(); // Start typing animation

        return messageframe;
    }

    function addTimeStamp(parent, timestamp) {
        const timestampSpan = document.createElement('span');
        timestampSpan.className = "zauto_timestamp";
        const timeDifference = moment().diff(moment(timestamp), 'minutes');
        // Format the timestamp based on the time difference
        let formattedTimestamp;
        if (timeDifference < 1) {
            formattedTimestamp = 'just now';
        } else if (timeDifference < 60) {
            formattedTimestamp = \`\${timeDifference} min ago\`;
        } else if (timeDifference < 24 * 60) { // Less than 24 hours
            formattedTimestamp = \`\${Math.floor(timeDifference / 60)} hr ago\`;
        } else {
            formattedTimestamp = \`\${Math.floor(timeDifference / (24 * 60))} days ago\`;
        }
        timestampSpan.innerText = formattedTimestamp;
        parent.appendChild(timestampSpan);
    }

    function renderMarkdown(markdownContent, outputElement) {
        const markedContent = markdown(markdownContent);
        outputElement.innerHTML = markedContent;
    }

    // voting
    function generateReactionPanel(parent,id,vote) {
        const reactionPanel = document.createElement('div');
        reactionPanel.className = "zauto_reaction_panel";

        if(!vote)
        {
            // Like button
            const likeButton = createReactionButton(reactionPanel,'UPVOTE',id);
            reactionPanel.appendChild(likeButton);
    
            // Dislike button
            const dislikeButton = createReactionButton(reactionPanel,'DOWNVOTE',id);
            reactionPanel.appendChild(dislikeButton);
        }
        else
        {
            const reactionButton = changeReactionButton(vote);
            reactionPanel.appendChild(reactionButton);
        }

        parent.appendChild(reactionPanel);
    }

    function createReactionButton(reactionPanel,reactionType,id) {
        const button = document.createElement('div');
        button.className = "zauto_reaction_button";

        const SVGUrl = reactionType == "UPVOTE" ? SVG.urls.like : SVG.urls.dislike;
        fetch(SVGUrl)
        .then(response => response.text())
        .then(svgData => {
            button.innerHTML = svgData;
        });

        button.addEventListener('click', function () {
            
            const payload = {vote: reactionType};
            let endpoint = \`\${apiUrl}\${API.endpoint.vote}\${id}\`;
            fetch(endpoint, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    console.error(\`HTTP error! Status: \${response.status}\`);
                }
                return response.json();
            })
            .then(data => {
                const buttons = reactionPanel.querySelectorAll('.zauto_reaction_button');
                buttons.forEach((btn) => {
                    reactionPanel.removeChild(btn);
                });
                reactionPanel.appendChild(changeReactionButton(reactionType));
                playPopSound(AUDIO.urls.pop);
            });
            
        });
        button.classList.add(reactionType.toLowerCase());
        return button;
    }

    function changeReactionButton(reactionType)
    {
        const button = document.createElement('div');
        button.className = "zauto_reaction_button";
        
        const SVGUrl = reactionType == "UPVOTE" ? SVG.urls.likeFill : SVG.urls.dislikeFill;
        fetch(SVGUrl)
        .then(response => response.text())
        .then(svgData => {
            button.innerHTML = svgData;
        });

        button.classList.add(reactionType.toLowerCase());
        button.classList.add('active');
        return button;
    }

    // Function to generate "Powered by" section
    function generatePoweredBy(parent) {
        const poweredByContainer = document.createElement("div");
        poweredByContainer.className = "poweredby_container";
        parent.appendChild(poweredByContainer);

        const poweredByText = document.createElement("p");
        poweredByText.className = "poweredby_text";
        poweredByText.textContent = "Powered by ";
        poweredByContainer.appendChild(poweredByText);

        // Create the anchor element
        const poweredByLink = document.createElement("a");
        poweredByLink.href = "https://zauto.ai"; 
        poweredByLink.target = "_blank";
        poweredByContainer.appendChild(poweredByLink);

        const poweredByImage = document.createElement("img");
        poweredByImage.className = "poweredby_img";
        poweredByImage.src = "https://zauto.ai/images/Logo-white.webp";
        poweredByImage.alt = "ZautoAI";

        // Append the image to the anchor element
        poweredByLink.appendChild(poweredByImage);

        return poweredByContainer;
    }

    function getMessageHistoryUI() {
        chatHistory.getMessages().forEach(chat => {
            const sendByName = chat.role == 'assistant' ? avatarData.displayName : "You";
            addMessage(chat.id,chat.content, chat.role != 'assistant', sendByName, false, new Date(chat.createdAt).getTime(),chat.vote);
        });
        getLastMessage();
        scrollTop(10, false);
    }

    function generateTypingIndicator() {
        const messageframe = document.createElement("div");
        messageframe.className = "zauto_message_frame";
        messageframe.classList.add("left");
        messageContainer.appendChild(messageframe);

        const message = document.createElement("div");
        message.className = "zauto_message";
        messageframe.appendChild(message);

        const sentBy = document.createElement("div");
        sentBy.className = "zauto_sentby";
        sentBy.textContent = avatarData?.displayName || "Bot";
        message.appendChild(sentBy);

        const messageText = document.createElement("div");
        messageText.className = "zauto_message_text";
        messageText.innerHTML = "Typing..."
        message.appendChild(messageText);

        setTimeout(() => {
            messageframe.classList.add('visible');
            scrollTop(10, false);
        }, 10);

        return messageframe;
    }

    function generateLeadForm(leadData) {
        // Check if a lead form already exists
        const existingForm = document.querySelector(".zauto_message_frame.zauto_lead_container");

        // If it exists, remove it
        if (existingForm) {
            existingForm.remove();
        }

        const formContainer = document.createElement("div");
        formContainer.className = "zauto_message_frame zauto_lead_container";
        messageContainer.appendChild(formContainer);

        const label = document.createElement("label")
        label.innerText = \`\Enter your \${leadData?.title}\`
        label.style.padding = "0";
        label.style.marginBottom = "5px";
        formContainer.appendChild(label);

        const leadForm = document.createElement("form");
        formContainer.appendChild(leadForm);

        const inputSubmitDiv = document.createElement("div");
        inputSubmitDiv.className = "zauto_lead_input_group";

        const leadInput = document.createElement("input");
        leadInput.className = "zauto_form_controler";
        leadInput.type = "text";
        leadInput.placeholder = \`\Enter your \${leadData?.title}\`

        const submitButton = document.createElement("button");
        submitButton.className = "zauto_form_btn"
        submitButton.type = "submit";

        // send svg
        const sendSvg = document.createElement("div");
        fetch(SVG.urls.send)
        .then(response => response.text())
        .then(svgData => {
            sendSvg.innerHTML = svgData;
        });
        submitButton.appendChild(sendSvg);

        // leaoding spinner
        const spinner = document.createElement("div");
        spinner.style.display = "none";
        spinner.className = "zauto_spinner";

        submitButton.appendChild(spinner);

        inputSubmitDiv.appendChild(leadInput);
        inputSubmitDiv.appendChild(submitButton);
        
        leadForm.appendChild(inputSubmitDiv);

        setTimeout(() => {
            formContainer.classList.add("visible");
        }, 10);

        leadForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const leadInputValue = leadInput.value.trim();

            if (leadInputValue.length > 0) {
                let payload = { convId: convoId };
                if (leadData.type == 'info') {
                    const jsonData = {};
                    jsonData[leadData.fieldName] = leadInputValue;
                    payload[leadData.type] = JSON.stringify(jsonData);
                }
                else {
                    payload[leadData.type] = leadInputValue;
                }
                sendSvg.style.display = 'none'
                spinner.style.display = "inline-block";
                leadInput.disabled = true;
                submitButton.disabled = true;
                convoContainer.focus();

                // submit lead
                let endpoint = \`\${apiUrl}\${API.endpoint.leadAgent.replace('{{avatarId}}', avatarId)}\`;
                fetch(endpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                })
                    .then(response => {
                        if (!response.ok) {
                            console.error(\`HTTP error! Status: \${response.status}\`);
                        }
                        return response.json();
                    })
                    .then(data => {

                        formContainer.remove();
                        const messageText = \`\${leadData?.title} is \${leadInputValue}\`;
                        sendMessage(messageText);
                        leadInput.value = "";
                    });

            }
        });

        if(!isStandalone)
        {
            leadInput.addEventListener("focus", (eventArg) => {
                toggleChatBot(true,eventArg);
            });
    
            leadInput.addEventListener("blur", (eventArg) => {
                toggleChatBot(false,eventArg);
            });
    
            submitButton.addEventListener("focus", (eventArg) => {
                toggleChatBot(true,eventArg);
            });
    
            submitButton.addEventListener("blur", (eventArg) => {
                toggleChatBot(false,eventArg);
            });
        }
        leadInput.focus();
    }

    function getLastMessage() {
        setTimeout(() => {
            const lastMessageElement = document.querySelector(".zauto_message_frame:last-child");
            let extraPx = 0;
            if (lastMessageElement && lastMessageElement.classList.contains("zauto_lead_container")) {
                extraPx = 10;
            }
            if (lastMessageElement && messageContainer) {
                const offsetHeight = lastMessageElement.offsetHeight;
                const maxHeight = Math.round(Math.min(0.75 * window.innerHeight, offsetHeight));
                messageContainer.style.height = maxHeight + extraPx + "px";
                messageContainer.style.maxHeight = maxHeight + extraPx + "px";
            }
        }, 10);
    }

    function generateCTA(ctaData) {
        const existingForm = document.querySelector(".zauto_message_frame.zauto_cta_container");
        if (existingForm) {
            existingForm.remove();
        }
        const ctaContainer = document.createElement("div");
        ctaContainer.className = "zauto_message_frame zauto_cta_container";
        messageContainer.appendChild(ctaContainer);
    
        const description = document.createElement("p");
        description.className = "zauto_cta_desc";
        description.innerText = ctaData.description;
        ctaContainer.appendChild(description);
    
        const leadForm = document.createElement("form");
        ctaContainer.appendChild(leadForm);
    
        const nameInput = document.createElement("input");
        const emailInput = document.createElement("input");
        if (ctaData.type === "LEADMAGNET") {
            const nameLabel = document.createElement("label");
            nameLabel.innerText = "Name";
            nameLabel.style.padding = "0";
            nameLabel.style.marginBottom = "5px";
            leadForm.appendChild(nameLabel);
    
            nameInput.className = "zauto_form_controler";
            nameInput.type = "text";
            nameInput.placeholder = "Name";
            nameInput.required = true;
            leadForm.appendChild(nameInput);
    
            const emailLabel = document.createElement("label");
            emailLabel.innerText = "Email";
            emailLabel.style.padding = "0";
            emailLabel.style.marginBottom = "5px";
            leadForm.appendChild(emailLabel);
    
            emailInput.className = "zauto_form_controler";
            emailInput.type = "email";
            emailInput.placeholder = "Email";
            emailInput.required = true;
            leadForm.appendChild(emailInput);
        }
        // Submit Button
        const submitButton = document.createElement("button");
        submitButton.className = "zauto_cta_btn";
        submitButton.innerText = ctaData.name;
        submitButton.type = "submit";
        leadForm.appendChild(submitButton);

        leadForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const formData = {
                convId: convoId,
                name: nameInput.value,
                email: emailInput.value
            };
            if (ctaData.type === "LEADMAGNET")
            {
                if (formData.name === '' || formData.email === '') {
                    return;
                }
            }
            let endpoint = \`\${apiUrl}\${API.endpoint.leadAgent.replace('{{avatarId}}', avatarId)}\`;
            fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    console.error(\`\HTTP error! Status: \${response.status}\`);
                }
                return response.json();
            })
            .then(data => {
                window.open(ctaData.link, '_blank');
                ctaContainer.remove();
            });
        });

        setTimeout(() => {
            ctaContainer.classList.add("visible");
        }, 10);
    
    }


    // Call the function
    getLastMessage();
    const socket = io(apiUrl, {
        query: {
            "visitId": getVisit()
        }
    });
    const headers = {
        'Content-Type': 'application/json',
    };

    let eventsRegistered = false;
    function registerSocketEvents(socket) {
        if (!eventsRegistered) {
            // handle connection
            socket.on('convCreated', (data) => {
                convoId = data.id;
                setVisitor(data.visitorId);
                setVisit(data.visitId);
                getChatHistory();
            });
    
            // handle connection fail
            socket.on('convCreateFailed', (data) => {
                console.log('conv connection Failed: ', data);
            });
    
            // handle receive messages
            socket.on('replyMessage', (data) => {
                handleReceiveMessage(data);
            });
            socket.on('messageFailed', (data) => {
                console.log('replyMessage: ', data);
            });
    
            // lead
            socket.on('leadfound', (data) => {
                let leadData = new LeadData();
                leadData.type = data?.content?.type;
                leadData.title = data?.content?.title;
                leadData.fieldName = formateFieldName(data?.content?.title);
                if (isOtherLead(leadData?.type)) {
                    leadData.type = "info";
                }
                generateLeadForm(leadData);
                console.log(data);
            });
    
            eventsRegistered = true;
        }
    }
    
    if (socket) {
        socket.on('connect', () => {
            initUIComponent();
            getAvatar();
            registerSocketEvents(socket);
        });
    }

    window.addEventListener('beforeunload', () => {
        if (socket) {
            socket.disconnect();
        }
    });

    function isOtherLead(text) {
        const keywords = ['email', 'mobile', 'name', 'whatsapp', 'phone'];
        const lowerCaseText = text.toLowerCase();
        if (keywords.includes(lowerCaseText)) {
            return false;
        }
        return true;
    }

    function formateFieldName(filedName) {
        return filedName.toLocaleLowerCase().replace(' ', '_');
    }

    function playPopSound(audioUrl) {
        if(audioUrl)
        {
            const audioPlayer = new Audio();
            audioPlayer.src = audioUrl;
            audioPlayer.play();
        }
    }

    function getAvatar() {
        const queryParams = addReferrerToExistingQuery(document.referrer);
        let endpoint = \`\${apiUrl}\${API.endpoint.agent}\${avatarId}\${queryParams}\`
        if (getVisitor()) endpoint += \`\&visitor=\${getVisitor()}\`
        fetch(endpoint, {
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(\`HTTP error! Status: \${response.status}\`);
            }
            return response.json();
        })
        .then(data => {
            avatarData = { ...data };
            updateBotStyle(avatarData?.styles)
            updateBotHeader(avatarData.displayName);
            setVisitor(data?.visitor?.id);
            setVisit(data?.visit?.id);
            createConvo(data?.id, data?.welcomeMsg);
        });
    }

    function createConvo(agentId, welcomeMsg) {
        if (agentId) {
            const payload = {
                agentId: agentId,
                visitorId: getVisitor(),
                visitId: getVisit(),
                chatMessage: {
                    messages: [
                        {
                            role: 'assistant',
                            content: welcomeMsg
                        }
                    ]
                }
            }
            socket.emit('createConversation', payload);
        }
    }

    function getChatHistory() {
        if (convoId) {
            let endpoint = \`\${apiUrl}\${API.endpoint.agent}\${avatarData?.id}/chat/\${convoId}\`;
            fetch(endpoint, {
                headers: headers
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(\`HTTP error! Status: \${response.status}\`);
                    }
                    return response.json();
                })
                .then(data => {
                    chatHistory.addMessages(data);
                    if (chatHistory.getMessages().length == 1) playPopSound(AUDIO.urls.bloop);                    
                    getMessageHistoryUI();
                });
        }
        else {
            console.error("Convo ID missiong");
        }
    }

    let canSendMessage = true;
    function sendMessage(message = null) {
        if(!canSendMessage)
        {
            return;
        }
        let messageText = message ? message : messageInput.value.trim();
        messageText = maskSensitiveInfo(messageText);
        if (messageText.length > 0) {
            canSendMessage = false;
            const payload = {
                agentId: avatarId,
                convId: convoId,
                chatMessage: {
                    messages: [
                        {
                            role: "user",
                            content: messageText
                        }
                    ]
                }
            };
            // send on sokect event
            socket.emit('message', payload);
            addMessage(null,messageText, true, "You", false, new Date().getTime());
            messageInput.value = "";
            scrollTop(10, false);
            getLastMessage();
            setTimeout(() => {
                typingIndicator = generateTypingIndicator();
            }, 300);
        }
    }

    function handleReceiveMessage(data) {
        if (typingIndicator) {
            typingIndicator.remove();
        }
        chatHistory.addMessage(data.message);
        addMessage(data?.message?.id,refindeMessage(data?.message?.content), false, avatarData?.displayName, true, new Date().getTime());
        playPopSound(AUDIO.urls.bloop);
        canSendMessage = true;
        messageInput.focus();

        function refindeMessage(message) {
            const wordsToRemove = ['<END_OF_TURN>', '<END_OF_CHAT>'];
            const pattern = new RegExp(wordsToRemove.join('|'), 'gi');
            const resultString = message.replace(pattern, '');
            return resultString;
        }
    }

    function maskSensitiveInfo(inputString) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\d{3})\d{3}(\d{4})/g;

        const emailSuffix = inputString.split("@")[1];
        const maskedEmails = inputString.replace(emailRegex, \`XXXX@\${emailSuffix}\`);
        const maskedPhoneNumbers = maskedEmails.replace(phoneRegex, "$1XXX$2");

        return maskedPhoneNumbers;
    }

    function markdown(message) {
        const htmlContent = marked.parse(message);
        return htmlContent;
    }

    function updateBotStyle(style) {
        if (style) {
            const styleJson = JSON.parse(style);
            document.documentElement.style.setProperty('--main-color', styleJson?.primaryColor || '#6C22A6');
            document.documentElement.style.setProperty('--user-font-color', styleJson?.textColor || '#ffffff');
            document.documentElement.style.setProperty('--font-size', styleJson?.fontSize + 'px' || '16px');
        }
    }

    function addReferrerToExistingQuery(referrerURL) {
        const currentHost = window.location.hostname;
        const hostname = new URL(referrerURL).hostname;
        const existingQuery = window.location.search.slice(1); 
        const newQueryParam = \`source=\${hostname || "site"}&homeSource=\${currentHost}\`;    
        if (existingQuery) {
            return \`?\${existingQuery}&\${newQueryParam}\`;
        } else {
            return \`?\${newQueryParam}\`;
        }
    }

    // getters and setters

    function setVisitor(id) {
        localStorage.setItem("visitorId", id);
    }

    function getVisitor(id) {
        return localStorage.getItem("visitorId") || null;
    }

    function setVisit(id) {
        localStorage.setItem("visitId", id);
    }

    function getVisit(id) {
        return localStorage.getItem("visitId") || null;
    }
}


`