(function () {
    function init() {
        let iframeLoaded = false;
        if (window.chatWidgetInitialized) {
            return;
        }
        window.chatWidgetInitialized = true;

        function chatbotInit() {
            const widgetContainer = document.getElementById('converto-chat-widget');
            const iframe = document.createElement('iframe');
            iframe.setAttribute('id', 'converto-bot-ui');
            iframe.src = '{{API_ROOT_URL}}';
            iframe.style.border = 'none';
            iframe.style.display = 'none';
            iframe.onload = function () {
                iframeLoaded = true;
                // processCommands()
            };
            if (widgetContainer) {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.position = 'relative';
                widgetContainer.appendChild(iframe);
                iframe.style.display = 'block';
            }
            else {
                iframe.style.position = 'fixed';
                iframe.style.zIndex = '9999999';
                iframe.style.width = window.innerWidth < 640 ? '100%' : '400px';
                iframe.style.height = window.innerWidth < 640 ? '90%' : '80vh';
                iframe.style.bottom = window.innerWidth < 640 ? '0' : '80px';
                iframe.style.right = window.innerWidth < 640 ? '0' : '16px';
                iframe.style.borderRadius = window.innerWidth < 640 ? '0' : '0.75rem';
                iframe.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                const toggleButton = document.createElement('button');
                toggleButton.setAttribute('id', 'converto-chat-icon');
                toggleButton.style.overflow = 'hidden';
                toggleButton.innerHTML = '<img src="{{API_ROOT_URL}}/assets/images/brand/fav_black_png.png" style="width: 64px; height: 64px;" alt="" />';
                toggleButton.style.padding = '0';
                toggleButton.style.backgroundColor = 'var(--chat-color)';
                toggleButton.style.color = 'var(--chat-text-color)';
                toggleButton.style.borderRadius = '9999px';
                toggleButton.style.position = 'fixed';
                toggleButton.style.display = 'flex';
                toggleButton.style.justifyContent = 'center';
                toggleButton.style.alignItems = 'center';
                toggleButton.style.bottom = '16px';
                toggleButton.style.right = '16px';
                toggleButton.style.width = '64px';
                toggleButton.style.height = '64px';
                toggleButton.style.zIndex = '9999998';
                toggleButton.style.border = 'none';
                toggleButton.style.cursor = 'pointer';
                toggleButton.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                document.body.appendChild(toggleButton);

                setTimeout(function () {
                    const showPopup = window.innerWidth < 640 ? false : false
                    if (showPopup && iframe.style.display === 'none') {
                        iframe.contentWindow.postMessage({ openChat: true }, '*');
                        iframe.style.display = 'block';
                        tooltip.style.display = 'none';
                        toggleButton.innerHTML = '<img src="{{API_ROOT_URL}}/assets/images/brand/fav_black_png.png" style="width: 40px; height: 40px;" alt="" />';
                        toggleButton.style.width = '48px';
                        toggleButton.style.height = '48px';
                    }
                }, window.innerWidth < 640 ? 0 : 0
                );

                toggleButton.onclick = () => {
                    if (iframe.style.display === 'none') {
                        iframe.contentWindow.postMessage({ openChat: true }, '*');
                        iframe.style.display = 'block';
                        tooltip.style.display = 'none';
                        toggleButton.innerHTML = '<img src="{{API_ROOT_URL}}/assets/images/brand/fav_black_png.png" style="width: 40px; height: 40px;" alt="" />';
                        toggleButton.style.width = '48px';
                        toggleButton.style.height = '48px';
                    } else {
                        iframe.contentWindow.postMessage({ closeChat: true }, '*');
                        iframe.style.display = 'none';
                        // tooltip.style.display = 'block';
                        toggleButton.innerHTML = '<img src="{{API_ROOT_URL}}/assets/images/brand/fav_black_png.png" style="width: 64px; height: 64px;" alt="" />';
                        toggleButton.style.width = '64px';
                        toggleButton.style.height = '64px';
                    }
                };

                window.addEventListener('resize', () => {
                    iframe.style.bottom = window.innerWidth < 640 ? '0' : '5rem';
                    iframe.style.right = window.innerWidth < 640 ? '0' : '1rem';
                    iframe.style.width = window.innerWidth < 640 ? '100%' : '448px';
                    iframe.style.height = window.innerWidth < 640 ? '100%' : '90vh';
                    iframe.style.borderRadius = window.innerWidth < 640 ? '0' : '0.75rem';
                });
            }
        }

        function journeyTrackerInit()
        {
            const apiRootUrl = '{{API_ROOT_URL}}';
            const tenantId = "{{ORG_ID}}";
            const currentPageUrl = window.location.origin + window.location.pathname;
            const buttons = document.querySelectorAll('button');
            const links = document.querySelectorAll('a');
            let maxScrollDepth = 0;
            let scrollTimeout;

            let actionHistory = [];

            const socket = io(apiRootUrl,{query:{orgId:tenantId}});
            socket.on('connect', () => {
                console.log('Socket connected');
                handleActionHistory();
                createSession();
            });
            
            buttons.forEach(button => {
                button.addEventListener('click', trackButtonClick);
            });
            links.forEach(link => {
                link.addEventListener('click', trackLinkClicked);
            });

            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(trackScrollDepth, 100); 
            });

            window.addEventListener('beforeunload', function(event) {
                if(!getVisitId())return;
                const data = {
                    "visitId": getVisitId(),
                    "data": "",
                    "type": "PAGE_CLOSED",
                    "url": currentPageUrl
                }
                appendActionHistory(data);
            })

            function handleActionHistory()
            {
                const actionStr = localStorage.getItem("prospectAction");
                if(actionStr)
                {
                    const _actionHistory = JSON.parse(actionStr);
                    setTimeout(function () {
                        for(const action of _actionHistory){
                            socket.emit('prospectAction', action);
                        }
                    },500)
                }
                localStorage.removeItem("prospectAction");
            }

            function createSession()
            {
                const data = {};
                const visitorId = getVisitorId();
                fetch(`${apiRootUrl}/api/visitors?${(visitorId ? `visitorId=${visitorId}`:'')}`, {
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
                    setVisitorId(responseData.visitorId);
                    setVisitId(responseData.visitId);
                    trackPageView();
                })
                .catch(error => {
                    console.error('Error creating session:', error.message);
                });
            }

            function trackButtonClick(event){
                if(!getVisitId()) return;
                const clickData = {
                    type: event.target.tagName.toLowerCase(),
                    text: event.target.textContent.trim(),
                    id: event.target.id,
                    link:event.target.href || ''
                };
                const data = {
                    "visitId": getVisitId(),
                    "data": JSON.stringify(clickData),
                    "type": "LINK_CLICKED",
                    "url": currentPageUrl
                }
                appendActionHistory(data);
            }
            
            function trackLinkClicked(event)
            {
                if(!getVisitId()) return;
                const clickData = {
                    type: event.target.tagName.toLowerCase(),
                    text: event.target.textContent.trim(),
                    id: event.target.id,
                    link:event.target.href || ''
                };
                const data = {
                    "visitId": getVisitId(),
                    "data": JSON.stringify(clickData),
                    "type": "LINK_CLICKED",
                    "url": currentPageUrl
                }
                appendActionHistory(data);
            }

            function trackPageView()
            {
                if(!getVisitId()) return;
                const data = {
                    "visitId": getVisitId(),
                    "type": "PAGE_VIEWED",
                    "url": currentPageUrl
                }
                socket.emit('prospectAction', data);
            }

            function trackScrollDepth() {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight;
                const winHeight = window.innerHeight;
                const currentScrollDepth = (scrollTop / (docHeight - winHeight)) * 100;

                if (currentScrollDepth > maxScrollDepth) {
                    maxScrollDepth = currentScrollDepth;
                    if(!getVisitId()) return;
                    const data = {
                        "visitId": getVisitId(),
                        "type": "PAGE_VIEWED",
                        "scrollDepth":Math.round(maxScrollDepth),
                        "url": currentPageUrl
                    }
                    socket.emit('prospectAction', data);
                }
            }
            
            function appendActionHistory(action) {
                actionHistory.push(action);
                localStorage.setItem("prospectAction",JSON.stringify(actionHistory));
            }

            function getVisitorId()
            {
                return localStorage.getItem("visitorId");
            }

            function setVisitorId(id)
            {
                localStorage.setItem("visitorId", id);
            }

            function getVisitId()
            {
                return localStorage.getItem("visitId");
            }

            function setVisitId(id)
            {
                localStorage.setItem("visitId", id);
            }
        }

        function loadScript(url, callback=null)
        {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onload = function() {
                console.log(`Script loaded: ${url}`);
                if (callback) callback();
            };

            script.onerror = function() {
                console.error(`Error loading script: ${url}`);
            };
            document.head.appendChild(script);
        }


        setTimeout(function () {
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.1.2/socket.io.js",journeyTrackerInit);
            // journeyTrackerInit()
            chatbotInit()
        }, 1000);
    }
    
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
