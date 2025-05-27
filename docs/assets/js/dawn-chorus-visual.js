// Dawn Chorus Visualization
export class DawnChorusVisualizer {
    constructor(canvas, audioEngine) {
        this.canvas = canvas;
        this.audioEngine = audioEngine;
        this.ctx = canvas.getContext('2d');
        this.analyser = null;
        this.dataArray = null;
        this.animationFrame = null;
        this.sunPosition = { x: 0.5, y: 0.8 }; // Start position (normalized)
        this.sunTargetY = 0.2; // Target Y position (normalized)
        this.sunColor = '#ff9d00';
        this.sunRadius = 40;
        this.sunRays = 12;
        this.sunRayLength = 60;
        this.particles = [];
        this.lastFrameTime = 0;
        this.resizeObserver = null;
        
        // Initialize
        this.setupCanvas();
        this.setupResizeObserver();
        this.createParticles(50);
    }
    
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set the canvas size in pixels (scaled for high DPI displays)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale the context to ensure proper drawing
        this.ctx.scale(dpr, dpr);
        
        // Set the canvas display size in CSS pixels
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }
    
    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(entries => {
            this.setupCanvas();
        });
        
        this.resizeObserver.observe(this.canvas);
    }
    
    createParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.1,
                color: `hsla(${40 + Math.random() * 40}, 80%, 60%, ${Math.random() * 0.5 + 0.1})`
            });
        }
    }
    
    start() {
        if (!this.analyser) {
            this.analyser = this.audioEngine.getAnalyser();
            if (this.analyser) {
                this.dataArray = new Uint8Array(this.analyser.size);
            } else {
                console.warn('Analyser not available, visualization will be limited');
                this.dataArray = new Uint8Array(256); // Fallback array
            }
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.lastFrameTime = performance.now();
        this.animate();
    }
    
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    animate(currentTime = 0) {
        try {
            const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
            this.lastFrameTime = currentTime;
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Get audio data if analyser is available
            if (this.analyser && this.dataArray) {
                this.analyser.getValue(this.dataArray);
            }
            
            // Update sun position based on progress
            const progress = this.audioEngine?.getProgress?.() || 0;
            this.sunPosition.y = 0.8 - (0.6 * progress); // Move sun up as time progresses
            
            // Update sun color based on progress (warmer as sun rises)
            const hue = 40 + (progress * 20); // 40 (orange) to 60 (yellow)
            this.sunColor = `hsl(${hue}, 100%, 50%)`;
            
            // Draw gradient background
            this.drawBackground(progress);
            
            // Draw particles
            this.updateParticles(deltaTime);
            this.drawParticles();
            
            // Draw sun with current progress
            this.drawSun(progress);
            
            // Draw audio visualization
            this.drawVisualization();
            
            // Continue animation loop
            this.animationFrame = requestAnimationFrame((t) => this.animate(t));
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
    
    drawBackground(progress) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Update gradient colors based on progress (dawn to day)
        const hue = 220 - (progress * 60); // Blue (220) to warm (160)
        const saturation = 80 - (progress * 40); // More saturated at night
        const lightness = 10 + (progress * 30); // Darker at night
        
        gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
        gradient.addColorStop(1, `hsl(${hue - 20}, ${saturation}%, ${lightness - 5}%)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawSun(progress) {
        try {
            const centerX = this.canvas.width / 2;
            const sunY = this.canvas.height - (progress * (this.canvas.height * 0.8));
            const sunRadius = Math.min(100, this.canvas.width * 0.15);
            
            // Create gradient for sun
            const gradient = this.ctx.createRadialGradient(
                centerX, sunY, 0,
                centerX, sunY, sunRadius * 1.5
            );
            
            // Add color stops with alpha for glow effect
            gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 180, 70, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
            
            // Draw sun glow
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(centerX, sunY, sunRadius * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Draw sun core
            this.ctx.beginPath();
            this.ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgb(255, 165, 0)';
            this.ctx.fill();
            
            // Draw sun rays
            const rayCount = 12;
            const rayLength = sunRadius * 1.5;
            const rayAngle = (Math.PI * 2) / rayCount;
            
            this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < rayCount; i++) {
                const angle = i * rayAngle;
                const startX = centerX + Math.cos(angle) * sunRadius;
                const startY = sunY + Math.sin(angle) * sunRadius;
                const endX = centerX + Math.cos(angle) * rayLength;
                const endY = sunY + Math.sin(angle) * rayLength;
                
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        } catch (error) {
            console.error('Error drawing sun:', error);
        }
    }
    
    updateParticles(deltaTime) {
        try {
            const progress = this.audioEngine?.getProgress?.() || 0;
            
            this.particles.forEach(particle => {
                if (!particle) return;
                
                // Move particles up
                particle.y -= (particle.speed || 0.1) * 10 * (deltaTime || 0.016) * (1 + progress);
                
                // Add some horizontal movement
                if (particle.x !== undefined) {
                    particle.x += Math.sin((particle.y || 0) * 0.01) * 0.5;
                }
                
                // Reset particles that go off screen
                if (particle.y < -10) {
                    particle.y = this.canvas.height + 10;
                    particle.x = Math.random() * this.canvas.width;
                }
            });
        } catch (error) {
            console.error('Error updating particles:', error);
        }
    }
    
    drawParticles() {
        try {
            this.particles.forEach(particle => {
                if (!particle || particle.x === undefined || particle.y === undefined) return;
                
                this.ctx.save();
                this.ctx.fillStyle = particle.color || 'rgba(255, 255, 255, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size || 2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.restore();
            });
        } catch (error) {
            console.error('Error drawing particles:', error);
        }
    }
    
    drawVisualization() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = (width / this.dataArray.length) * 2.5;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const barHeight = (this.dataArray[i] / 255) * (height * 0.3);
            const hue = 40 + (i / this.dataArray.length * 60);
            const opacity = 0.1 + (i / this.dataArray.length * 0.9);
            
            // Draw top wave
            this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${opacity})`;
            this.ctx.fillRect(
                x, 
                height / 2 - barHeight / 2, 
                barWidth, 
                barHeight / 2
            );
            
            // Draw bottom wave (mirrored)
            this.ctx.fillRect(
                x, 
                height / 2, 
                barWidth, 
                barHeight / 2
            );
            
            x += barWidth + 1;
        }
    }
    
    getTimeOfDay() {
        const progress = this.audioEngine.getProgress();
        const hour = 4 + (progress * 3); // 4:00 AM to 7:00 AM
        const minute = Math.floor((hour % 1) * 60);
        
        return {
            hour: Math.floor(hour),
            minute: minute,
            ampm: hour >= 12 ? 'PM' : 'AM',
            progress: progress
        };
    }
    
    getStatusMessage() {
        const time = this.getTimeOfDay();
        const hour = time.hour + (time.ampm === 'PM' && time.hour !== 12 ? 12 : 0);
        
        if (hour < 5) return 'The night is still...';
        if (hour < 5.5) return 'First light touches the horizon...';
        if (hour < 6) return 'Birds begin to stir...';
        if (hour < 6.5) return 'Dawn chorus builds...';
        if (hour < 7) return 'Morning song fills the air...';
        return 'A new day has arrived...';
    }
    
    cleanup() {
        this.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
