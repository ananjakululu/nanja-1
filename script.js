document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------
    // 0. DYNAMIC ENHANCEMENTS & SMART FILE VIEWER INJECTION
    // -------------------------------------------------------
    const dynamicStyles = document.createElement("style");
    dynamicStyles.innerText = `
        .p-card { transition: opacity 0.3s ease, transform 0.3s ease; } 
        .p-card.hiding { opacity: 0; transform: scale(0.95); pointer-events: none; }
        .typewriter-cursor { border-right: 2px solid var(--primary); animation: blink 1s step-end infinite; margin-left: 2px; } 
        @keyframes blink { 50% { opacity: 0; } }
        
        /* Smart File Viewer Styles */
        #smart-viewer-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85); z-index: 100000; 
            display: none; flex-direction: column; opacity: 0; transition: opacity 0.3s ease;
        }
        #smart-viewer-overlay.active { display: flex; opacity: 1; }
        #sv-toolbar {
            background: #1e1e1e; color: white; padding: 10px 20px; 
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 10;
        }
        #sv-title { font-weight: 600; font-size: 1rem; opacity: 0.9; }
        #sv-actions { display: flex; gap: 10px; align-items: center; }
        #sv-actions button {
            background: rgba(255,255,255,0.1); border: none; color: white; 
            padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 1rem;
            transition: background 0.2s;
        }
        #sv-actions button:hover { background: rgba(255,255,255,0.3); }
        #sv-zoom-controls { display: none; gap: 5px; }
        #sv-zoom-controls span { color: #aaa; font-size: 0.8rem; min-width: 40px; text-align: center; }
        #sv-content { flex-grow: 1; display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative; background: #f4f4f4;}
        #sv-frame { width: 100%; height: 100%; border: none; background: white; }
        #sv-image { max-width: 95%; max-height: 95%; object-fit: contain; transition: transform 0.2s ease; transform-origin: center center; }
    `;
    document.head.appendChild(dynamicStyles);

    // Inject the HTML structure for the File Viewer into the body
    const viewerHTML = `
        <div id="smart-viewer-overlay">
            <div id="sv-toolbar">
                <div id="sv-title">Document Preview</div>
                <div id="sv-actions">
                    <div id="sv-zoom-controls">
                        <button id="sv-zoom-out">-</button>
                        <span id="sv-zoom-level">100%</span>
                        <button id="sv-zoom-in">+</button>
                        <button id="sv-zoom-reset">Reset</button>
                    </div>
                    <button id="sv-download" title="Download"><i class="ri-download-2-line"></i></button>
                    <button id="sv-fullscreen" title="Fullscreen"><i class="ri-fullscreen-line"></i></button>
                    <button id="sv-close" title="Close" style="background: #d32f2f; font-weight: bold;">✕</button>
                </div>
            </div>
            <div id="sv-content">
                <iframe id="sv-frame" style="display:none;"></iframe>
                <img id="sv-image" style="display:none;" alt="Preview">
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', viewerHTML);

    // Smart Viewer Logic Variables
    let currentZoom = 100;
    let currentViewerUrl = '';

    // Bind Viewer Controls
    document.getElementById('sv-close').addEventListener('click', closeSmartViewer);
    document.getElementById('sv-download').addEventListener('click', () => {
        if(currentViewerUrl) window.open(currentViewerUrl, '_blank');
    });
    document.getElementById('sv-fullscreen').addEventListener('click', () => {
        const elem = document.getElementById('smart-viewer-overlay');
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    });
    
    document.getElementById('sv-zoom-in').addEventListener('click', () => applyZoom(20));
    document.getElementById('sv-zoom-out').addEventListener('click', () => applyZoom(-20));
    document.getElementById('sv-zoom-reset').addEventListener('click', () => applyZoom(0, true));

    function applyZoom(amount, reset = false) {
        if (reset) currentZoom = 100;
        else currentZoom += amount;
        
        currentZoom = Math.max(50, Math.min(400, currentZoom)); // Clamp between 50% and 400%
        document.getElementById('sv-image').style.transform = `scale(${currentZoom / 100})`;
        document.getElementById('sv-zoom-level').innerText = currentZoom + '%';
    }


    // -------------------------------------------------------
    // 1. DATA STORE (Computing & Informatics Context)
    // -------------------------------------------------------
    const DATA = {
        skills: [
            { name: "Python & OOP", level: 90, icon: "ri-code-s-slash-line" },
            { name: "HTML & CSS", level: 95, icon: "ri-html5-line" },
            { name: "Networking (Cisco)", level: 80, icon: "ri-router-line" },
            { name: "Database Design (SQL)", level: 85, icon: "ri-database-2-line" },
            { name: "Curriculum Design", level: 90, icon: "ri-book-read-line" }
        ],
        projects: [
            {
                id: 'project-1',
                title: "CBC-Aligned Plan: Python Functions",
                category: "lesson",
                tag: "Lesson Design",
                desc: "Comprehensive lesson plan integrating problem-based learning for 2nd-year Programming students.",
                links: [
                    { text: "Plan Doc", icon: "ri-file-pdf-line", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "viewer" },
                    { text: "Reflection", icon: "ri-quill-pen-line", url: "reflections.html", type: "link" }
                ]
            },
            {
                id: 'project-2',
                title: "H5P: Network Topologies",
                category: "media",
                tag: "Instructional Media",
                desc: "Interactive branching scenario teaching Star, Bus, and Mesh topologies with quizzes.",
                links: [
                    { text: "Interactive Demo", icon: "ri-play-circle-line", url: "#", type: "external" }
                ]
            },
            {
                id: 'project-3',
                title: "Auto-Grading Script (Python)",
                category: "assessment",
                tag: "Assessment Tool",
                desc: "A custom Python script utilizing RegEx to automatically grade student SQL queries.",
                links: [
                    { text: "View Code", icon: "ri-github-line", url: "https://github.com/Nanjakululu", type: "external" }
                ]
            }
        ],
        logs: [
            { day: "Day 1", date: "Monday", title: "Introduction to OOP", desc: "Delivered an introductory lesson on Object-Oriented Programming concepts using Python.", evidence: "#" },
            { day: "Day 2", date: "Tuesday", title: "Networking Lab: Cabling", desc: "Hands-on practical session on Ethernet cabling standards (T568A/B).", evidence: "#" },
            { day: "Day 3", date: "Wednesday", title: "Database Normalization", desc: "Covered 1NF, 2NF, and 3NF. Students worked in groups to normalize data tables.", evidence: "#" }
        ]
    };

    // -------------------------------------------------------
    // 2. RENDERING FUNCTIONS
    // -------------------------------------------------------

    const skillsContainer = document.getElementById('skills-render');
    if (skillsContainer) {
        DATA.skills.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'skill-item';
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <div style="font-weight: 600;"><i class="${skill.icon}" style="color: var(--primary); margin-right: 8px;"></i> ${skill.name}</div>
                    <div style="font-weight: 700; color: var(--primary);">${skill.level}%</div>
                </div>
                <div style="width: 100%; height: 8px; background: var(--bg); border-radius: 10px; overflow: hidden;">
                    <div class="progress-fill" data-width="${skill.level}" style="height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); width: 0%; transition: width 1.5s ease-out;"></div>
                </div>
            `;
            skillsContainer.appendChild(item);
        });
    }

    const projectsContainer = document.getElementById('projects-render');
    if (projectsContainer) {
        DATA.projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'p-card card';
            card.setAttribute('data-category', proj.category);
            card.setAttribute('data-aos', 'fade-up');
            
            let linksHtml = proj.links.map(l => {
                if (l.type === 'viewer') {
                    return `<button class="btn btn-sm btn-outline" onclick="openSmartViewer('${l.url}', '${l.text}')"><i class="${l.icon}"></i> ${l.text}</button>`;
                } else if (l.type === 'external') {
                    return `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline"><i class="${l.icon}"></i> ${l.text}</a>`;
                } else {
                    return `<a href="${l.url}" class="btn btn-sm btn-outline"><i class="${l.icon}"></i> ${l.text}</a>`;
                }
            }).join('');
            
            card.innerHTML = `
                <span class="project-tag tag-${proj.category}">${proj.tag}</span>
                <h3 style="margin-top: 0.5rem;">${proj.title}</h3>
                <p class="text-muted" style="font-size: 0.9rem; flex-grow: 1;">${proj.desc}</p>
                <div class="project-links" style="margin-top: 1rem;">${linksHtml}</div>
                <div class="card-footer">
                   <div></div>
                   <button class="btn btn-sm btn-request" data-project="${proj.title}"><i class="ri-chat-new-line"></i> Feedback</button>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    const logsContainer = document.getElementById('logs-render');
    if (logsContainer) {
        DATA.logs.forEach((log, index) => {
            const card = document.createElement('article');
            card.className = 'card activity-card';
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', index * 100);
            card.innerHTML = `
                <div class="card-header">
                    <span class="day-badge">${log.day}</span>
                    <span class="text-muted">${log.date}</span>
                </div>
                <h3>${log.title}</h3>
                <p class="text-muted">${log.desc}</p>
                <div class="tag-group">
                    <span class="tag">Computing</span>
                </div>
                <div class="project-links">
                    <a href="${log.evidence}" class="btn btn-sm btn-outline"><i class="ri-file-pdf-line"></i> View Log</a>
                </div>
            `;
            logsContainer.appendChild(card);
        });
    }

    // -------------------------------------------------------
    // 3. CORE UI LOGIC
    // -------------------------------------------------------

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }

    const toggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isDark = htmlElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }

    function updateIcon(theme) {
        if (toggle) toggle.innerHTML = theme === 'dark' ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
    }

    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('ri-menu-line'); icon.classList.toggle('ri-close-line');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('ri-close-line'); icon.classList.add('ri-menu-line');
            });
        });
    }

    const typedTitle = document.getElementById('typed-title');
    if (typedTitle) {
        const titles = ["Hello, I'm Alex.", "I Teach Computing.", "I Build Curricula.", "I Develop Solutions."];
        let titleIndex = 0, charIndex = 0, isDeleting = false;
        function type() {
            const current = titles[titleIndex];
            typedTitle.innerHTML = current.substring(0, charIndex) + '<span class="typewriter-cursor"></span>';
            if (!isDeleting && charIndex < current.length) { charIndex++; setTimeout(type, 80); }
            else if (isDeleting && charIndex > 0) { charIndex--; setTimeout(type, 40); }
            else { isDeleting = !isDeleting; if (!isDeleting) titleIndex = (titleIndex + 1) % titles.length; setTimeout(type, 1200); }
        }
        type();
    }

    const skillBars = document.querySelectorAll('.progress-fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.style.width = entry.target.getAttribute('data-width') + '%'; observer.unobserve(entry.target); }
        });
    }, { threshold: 0.5 });
    skillBars.forEach(bar => observer.observe(bar));

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
            const filter = btn.getAttribute('data-filter');
            document.querySelectorAll('.p-card').forEach(card => {
                const shouldShow = filter === 'all' || card.getAttribute('data-category') === filter;
                if (!shouldShow) { card.classList.add('hiding'); setTimeout(() => { card.style.display = 'none'; }, 300); }
                else { card.style.display = 'block'; setTimeout(() => { card.classList.remove('hiding'); }, 10); }
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-request')) openModal(e.target.closest('.btn-request').getAttribute('data-project'));
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) { e.preventDefault(); targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="ri-arrow-up-line"></i>';
    backToTop.className = 'btn btn-primary'; backToTop.id = 'backToTopBtn';
    backToTop.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; display: none; align-items: center; justify-content: center; z-index: 99; box-shadow: var(--shadow-lg);';
    document.body.appendChild(backToTop);
    window.addEventListener('scroll', () => { backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none'; });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // -------------------------------------------------------
    // 4. PAGE SPECIFIC ENHANCEMENTS
    // -------------------------------------------------------
    const counterElement = document.getElementById('counter');
    if (counterElement) {
        let counted = false;
        const animateCounter = () => {
            if (counted) return;
            const rect = counterElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                counted = true; let count = 0; const target = 5; 
                const interval = setInterval(() => { if (count >= target) clearInterval(interval); else { count++; counterElement.innerText = count; } }, 250);
            }
        };
        window.addEventListener('scroll', animateCounter); animateCounter();
    }

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => { progressBar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100 + '%'; });
    }

    const timelineCards = document.querySelectorAll('.accordion-card');
    if (timelineCards.length > 0) {
        timelineCards.forEach(card => { card.addEventListener('click', () => { const isActive = card.classList.contains('active'); timelineCards.forEach(c => c.classList.remove('active')); if (!isActive) card.classList.add('active'); }); });
    }
});

// -------------------------------------------------------
// 5. GLOBAL FUNCTIONS
// -------------------------------------------------------

function openModal(projectName) {
    const modal = document.getElementById('feedbackModal');
    const input = document.getElementById('project-name');
    if (input) input.value = projectName || 'General Inquiry';
    if (modal) { modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
}

function closeModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = 'auto'; }
}

// NEW SMART VIEWER GLOBAL FUNCTION
function openSmartViewer(url, title) {
    if(!url || url === '#') return;
    
    const overlay = document.getElementById('smart-viewer-overlay');
    const frame = document.getElementById('sv-frame');
    const img = document.getElementById('sv-image');
    const titleEl = document.getElementById('sv-title');
    const zoomControls = document.getElementById('sv-zoom-controls');
    
    currentViewerUrl = url;
    titleEl.innerText = title || "Document Preview";
    
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
    
    if (isImage) {
        frame.style.display = 'none';
        img.style.display = 'block';
        img.src = url;
        zoomControls.style.display = 'flex';
        applySmartZoom(0, true); // reset zoom
    } else {
        img.style.display = 'none';
        frame.style.display = 'block';
        frame.src = url;
        zoomControls.style.display = 'none'; // hide zoom for PDFs
    }
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSmartViewer() {
    const overlay = document.getElementById('smart-viewer-overlay');
    overlay.classList.remove('active');
    document.getElementById('sv-frame').src = "";
    document.getElementById('sv-image').src = "";
    document.body.style.overflow = 'auto';
    
    // Exit fullscreen if user used it
    if (document.fullscreenElement) document.exitFullscreen();
}

function applySmartZoom(amount, reset = false) {
    let currentZoom = parseInt(document.getElementById('sv-zoom-level').innerText);
    if (reset) currentZoom = 100;
    else currentZoom += amount;
    
    currentZoom = Math.max(50, Math.min(400, currentZoom));
    document.getElementById('sv-image').style.transform = `scale(${currentZoom / 100})`;
    document.getElementById('sv-zoom-level').innerText = currentZoom + '%';
}

function copyLinkedInLink() {
    const text = 'https://linkedin.com/in/alex-michar';
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text);
    else {
        const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-999999px"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea);
    }
    const textElement = document.getElementById('linkedin-text');
    if(textElement){ textElement.innerText = 'Copied!'; setTimeout(() => { textElement.innerText = 'Copy LinkedIn'; }, 2000); }
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'feedbackModal') closeModal();
    if (e.target.id === 'smart-viewer-overlay') closeSmartViewer(); // Close if clicking dark background
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeSmartViewer(); }
});