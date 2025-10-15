class WebSpeedAnalyzer {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.urlInput = document.getElementById('urlInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.needle = document.getElementById('needle');
        this.speedValue = document.getElementById('speedValue');
        this.speedLabel = document.getElementById('speedLabel');
        this.gradeCard = document.getElementById('gradeCard');
        this.gradeValue = document.getElementById('gradeValue');
        this.detailedResults = document.getElementById('detailedResults');
        this.recentList = document.getElementById('recentList');
        this.notification = document.getElementById('notification');
        
        // Metric elements
        this.metricSize = document.getElementById('metricSize');
        this.metricRequests = document.getElementById('metricRequests');
        this.metricTTFB = document.getElementById('metricTTFB');
        this.metricRender = document.getElementById('metricRender');
        
        // Result elements
        this.resultDomain = document.getElementById('resultDomain');
        this.resultProtocol = document.getElementById('resultProtocol');
        this.resultDate = document.getElementById('resultDate');
        this.resultStatus = document.getElementById('resultStatus');
        
        this.currentTheme = 'dark';
        this.recentTests = JSON.parse(localStorage.getItem('recentTests') || '[]');
        
        this.initEventListeners();
        this.loadRecentTests();
        this.createSpeedometerMarks();
    }
    
    initEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.analyzeBtn.addEventListener('click', () => this.analyzeWebsite());
        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.analyzeWebsite();
            }
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.querySelector('.app-container').setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button
        const icon = this.themeToggle.querySelector('i');
        const text = this.themeToggle.querySelector('span');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        } else {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        }
    }
    
    createSpeedometerMarks() {
        const marksContainer = document.querySelector('.speedometer-marks');
        marksContainer.innerHTML = '';
        
        // Create marks from 0 to 5000ms
        for (let i = 0; i <= 10; i++) {
            const mark = document.createElement('div');
            mark.className = 'speedometer-mark';
            
            const value = i * 500; // 0 to 5000ms
            const angle = (i / 10) * 180; // 0 to 180 degrees
            
            mark.style.position = 'absolute';
            mark.style.width = '2px';
            mark.style.height = '12px';
            mark.style.background = 'var(--text-primary)';
            mark.style.bottom = '50%';
            mark.style.left = '50%';
            mark.style.transformOrigin = 'bottom center';
            mark.style.transform = `translateX(-50%) rotate(${angle}deg) translateY(-140px)`;
            
            // Add label for some marks
            if (i % 2 === 0) {
                const label = document.createElement('div');
                label.className = 'speedometer-label';
                label.textContent = value;
                label.style.position = 'absolute';
                label.style.color = 'var(--text-secondary)';
                label.style.fontSize = '0.75rem';
                label.style.fontFamily = 'var(--font-mono)';
                label.style.transform = `translateX(-50%) rotate(${-angle}deg)`;
                label.style.bottom = '50%';
                label.style.left = '50%';
                label.style.transformOrigin = 'bottom center';
                label.style.transform += ` translateY(-160px)`;
                
                marksContainer.appendChild(label);
            }
            
            marksContainer.appendChild(mark);
        }
    }
    
    async analyzeWebsite() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showNotification('Please enter a website URL', 'error');
            return;
        }
        
        // Validate URL format
        let validUrl;
        try {
            validUrl = new URL(url);
        } catch {
            this.showNotification('Please enter a valid URL with http:// or https://', 'error');
            return;
        }
        
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        try {
            // Simulate analysis (in a real app, you'd use actual performance APIs)
            const results = await this.simulatePerformanceAnalysis(validUrl);
            this.displayResults(results);
            this.saveToRecentTests(validUrl.href, results);
            this.showNotification('Website analysis complete!', 'success');
        } catch (error) {
            console.error('Analysis error:', error);
            this.showNotification('Failed to analyze website. Please try again.', 'error');
        } finally {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Speed';
        }
    }
    
    async simulatePerformanceAnalysis(url) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // Generate realistic performance data
        const loadTime = Math.floor(500 + Math.random() * 4500); // 500-5000ms
        const pageSize = Math.floor(500 + Math.random() * 4500); // 500-5000KB
        const requests = Math.floor(20 + Math.random() * 80); // 20-100 requests
        const ttfb = Math.floor(100 + Math.random() * 400); // 100-500ms
        const renderTime = Math.floor(loadTime * 0.3 + Math.random() * loadTime * 0.2);
        
        return {
            url: url.href,
            domain: url.hostname,
            protocol: url.protocol.replace(':', '').toUpperCase(),
            loadTime,
            pageSize,
            requests,
            ttfb,
            renderTime,
            status: '200 OK',
            timestamp: new Date().toLocaleString()
        };
    }
    
    displayResults(results) {
        // Update speedometer
        this.updateSpeedometer(results.loadTime);
        
        // Update metrics
        this.metricSize.textContent = `${results.pageSize} KB`;
        this.metricRequests.textContent = results.requests;
        this.metricTTFB.textContent = `${results.ttfb} ms`;
        this.metricRender.textContent = `${results.renderTime} ms`;
        
        // Update grade
        this.updatePerformanceGrade(results.loadTime);
        
        // Update detailed results
        this.resultDomain.textContent = results.domain;
        this.resultProtocol.textContent = results.protocol;
        this.resultDate.textContent = results.timestamp;
        this.resultStatus.textContent = results.status;
        
        // Show detailed results
        this.detailedResults.style.display = 'block';
    }
    
    updateSpeedometer(loadTime) {
        // Convert load time to angle (0-5000ms maps to 0-180 degrees)
        const maxTime = 5000;
        const angle = Math.min((loadTime / maxTime) * 180, 180);
        
        // Update needle position with smooth animation
        this.needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        
        // Update speed value with counting animation
        this.animateValue(this.speedValue, 0, loadTime, 1500);
        
        // Update color based on performance
        let color;
        if (loadTime < 1500) {
            color = 'var(--success)';
            this.speedLabel.textContent = 'Excellent';
        } else if (loadTime < 3000) {
            color = 'var(--warning)';
            this.speedLabel.textContent = 'Good';
        } else {
            color = 'var(--error)';
            this.speedLabel.textContent = 'Poor';
        }
        
        this.speedValue.style.color = color;
        this.speedLabel.style.color = color;
    }
    
    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(start + (end - start) * easeOut);
            
            element.textContent = value;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }
    
    updatePerformanceGrade(loadTime) {
        let grade, gradeText, iconClass, bgColor;
        
        if (loadTime < 1000) {
            grade = 'A+';
            gradeText = 'Excellent';
            iconClass = 'fas fa-star';
            bgColor = 'var(--success)';
        } else if (loadTime < 2000) {
            grade = 'B';
            gradeText = 'Good';
            iconClass = 'fas fa-thumbs-up';
            bgColor = 'var(--warning)';
        } else if (loadTime < 3500) {
            grade = 'C';
            gradeText = 'Average';
            iconClass = 'fas fa-check';
            bgColor = 'var(--warning)';
        } else {
            grade = 'D';
            gradeText = 'Poor';
            iconClass = 'fas fa-exclamation-triangle';
            bgColor = 'var(--error)';
        }
        
        this.gradeValue.textContent = grade;
        
        const gradeIcon = this.gradeCard.querySelector('.grade-icon');
        gradeIcon.innerHTML = `<i class="${iconClass}"></i>`;
        gradeIcon.style.background = bgColor;
        
        const gradeLabel = this.gradeCard.querySelector('.grade-label');
        gradeLabel.textContent = gradeText;
    }
    
    saveToRecentTests(url, results) {
        // Remove if already exists
        this.recentTests = this.recentTests.filter(test => test.url !== url);
        
        // Add to beginning
        this.recentTests.unshift({
            url,
            loadTime: results.loadTime,
            timestamp: results.timestamp
        });
        
        // Keep only last 5
        this.recentTests = this.recentTests.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('recentTests', JSON.stringify(this.recentTests));
        
        // Update UI
        this.loadRecentTests();
    }
    
    loadRecentTests() {
        this.recentList.innerHTML = '';
        
        if (this.recentTests.length === 0) {
            this.recentList.innerHTML = '<div class="recent-item"><span class="recent-url">No recent tests</span></div>';
            return;
        }
        
        this.recentTests.forEach(test => {
            const item = document.createElement('div');
            item.className = 'recent-item';
            item.innerHTML = `
                <span class="recent-url">${this.truncateUrl(test.url)}</span>
                <span class="recent-speed">${test.loadTime}ms</span>
            `;
            
            item.addEventListener('click', () => {
                this.urlInput.value = test.url;
                this.analyzeWebsite();
            });
            
            this.recentList.appendChild(item);
        });
    }
    
    truncateUrl(url, maxLength = 30) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength - 3) + '...';
    }
    
    showNotification(message, type) {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebSpeedAnalyzer();
});
