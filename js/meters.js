class Meter {
    constructor(element, maxValue = 100) {
        this.element = element;
        this.maxValue = maxValue;
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <svg viewBox="0 0 200 120">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y1="0%">
                        <stop offset="0%" style="stop-color: #ff4444"/>
                        <stop offset="50%" style="stop-color: #ffff44"/>
                        <stop offset="100%" style="stop-color: #44ff44"/>
                    </linearGradient>
                </defs>
                <path class="meter-bg" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke-width="10" stroke-linecap="round"/>
                <path class="meter-value" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" stroke-width="10" stroke-linecap="round"/>
                <line id="gauge-arm" x1="100" y1="100" x2="100" y2="30" stroke="currentColor" stroke-width="2"/>
                <circle cx="100" cy="100" r="5" fill="currentColor"/>
                <text x="100" y="80" text-anchor="middle" class="meter-text">0%</text>
            </svg>
        `;
    }

    setValue(value) {
        const percentage = (value / this.maxValue) * 100;
        const path = this.element.querySelector('.meter-value');
        const text = this.element.querySelector('.meter-text');
        const arm = this.element.querySelector('#gauge-arm');
        
        // Calculate the arc path for value indicator
        const angle = (percentage / 100) * Math.PI;
        const x = 100 - 80 * Math.cos(angle);
        const y = 100 - 80 * Math.sin(angle);
        
        path.setAttribute('d', `M 20 100 A 80 80 0 0 1 ${x} ${y}`);
        
        // Update gauge arm
        const armAngle = Math.PI - angle;
        const armX = 100 + 70 * Math.cos(armAngle);
        const armY = 100 - 70 * Math.sin(armAngle);
        arm.setAttribute('x2', armX);
        arm.setAttribute('y2', armY);
        
        text.textContent = this.maxValue === 100 ? 
            `${Math.round(percentage)}%` : 
            `${value}/${this.maxValue}`;
    }

    setSplitValue(gaugeValue, textValue) {
        const percentage = (gaugeValue / this.maxValue) * 100;
        const path = this.element.querySelector('.meter-value');
        const text = this.element.querySelector('.meter-text');
        const arm = this.element.querySelector('#gauge-arm');
        
        // Calculate the arc path for value indicator
        const angle = (percentage / 100) * Math.PI;
        const x = 100 - 80 * Math.cos(angle);
        const y = 100 - 80 * Math.sin(angle);
        
        path.setAttribute('d', `M 20 100 A 80 80 0 0 1 ${x} ${y}`);
        
        // Update gauge arm
        const armAngle = Math.PI - angle;
        const armX = 100 + 70 * Math.cos(armAngle);
        const armY = 100 - 70 * Math.sin(armAngle);
        arm.setAttribute('x2', armX);
        arm.setAttribute('y2', armY);
        
        text.textContent = this.maxValue === 100 ? 
            `${Math.round(percentage)}%` : 
            `${textValue}/${this.maxValue}`;
    }
}