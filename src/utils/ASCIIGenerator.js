/**
 * Procedural ASCII Art Generator
 * Creates responsive ASCII patterns that adapt to screen size
 */

export class ASCIIGenerator {
  constructor() {
    this.chars = ['.', ':', ';', '+', '*', '%', '@', '#'];
    this.lightChars = ['.', ',', "'", '`', '^', '"', '~', '-'];
    this.patterns = {
      waves: this.generateWaves.bind(this),
      grid: this.generateGrid.bind(this),
      noise: this.generateNoise.bind(this),
      circuit: this.generateCircuit.bind(this)
    };
  }

  // Generate wave patterns
  generateWaves(width, height, time = 0) {
    let result = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const wave1 = Math.sin(x * 0.1 + time * 0.01) * 0.5;
        const wave2 = Math.sin(y * 0.15 + time * 0.008) * 0.5;
        const intensity = (wave1 + wave2 + 1) * 0.5;
        const charIndex = Math.floor(intensity * this.chars.length);
        result += this.chars[Math.min(charIndex, this.chars.length - 1)];
      }
      result += '\n';
    }
    return result;
  }

  // Generate grid patterns
  generateGrid(width, height, density = 0.3) {
    let result = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x % 4 === 0 || y % 3 === 0) && Math.random() < density) {
          result += this.chars[Math.floor(Math.random() * 4) + 2];
        } else {
          result += this.chars[Math.floor(Math.random() * 2)];
        }
      }
      result += '\n';
    }
    return result;
  }

  // Generate noise patterns
  generateNoise(width, height, intensity = 0.5) {
    let result = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noise = Math.random();
        if (noise < intensity) {
          const charIndex = Math.floor(noise * this.chars.length / intensity);
          result += this.chars[charIndex];
        } else {
          result += ' ';
        }
      }
      result += '\n';
    }
    return result;
  }

  // Generate circuit-like patterns
  generateCircuit(width, height) {
    let result = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isLine = (x % 8 === 0) || (y % 6 === 0);
        const isJunction = (x % 8 === 0) && (y % 6 === 0);
        
        if (isJunction) {
          result += '+';
        } else if (isLine) {
          result += Math.random() < 0.7 ? '-' : '|';
        } else {
          result += Math.random() < 0.1 ? '.' : ' ';
        }
      }
      result += '\n';
    }
    return result;
  }

  // Calculate optimal dimensions for screen
  calculateDimensions() {
    // Get actual viewport dimensions accounting for mobile browser chrome
    let vw, vh;
    
    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      vw = window.visualViewport.width;
      vh = window.visualViewport.height;
    } else {
      // Fallback to traditional methods
      vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    }
    
    // On mobile, add some extra space to ensure full coverage
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      vw += 20; // Add extra width
      vh += 20; // Add extra height
    }
    
    // Calculate based on actual font size being used
    // Using CSS clamp(4px, 1.5vmin, 10px) on mobile, clamp(6px, 1vmin, 14px) on desktop
    let fontSize;
    if (isMobile) {
      const vmin = Math.min(vw, vh) / 100;
      fontSize = Math.min(Math.max(vmin * 1.5, 4), 10);
    } else {
      const vmin = Math.min(vw, vh) / 100;
      fontSize = Math.min(Math.max(vmin, 6), 14);
    }
    
    // For monospace fonts, character width ≈ 0.6 * font size, line height ≈ font size
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize;
    
    const width = Math.ceil(vw / charWidth) + 2; // Add extra columns
    const height = Math.ceil(vh / lineHeight) + 2; // Add extra rows
    
    return { width, height };
  }

  // Generate responsive ASCII art
  generate(pattern = 'waves', options = {}) {
    const { width, height } = this.calculateDimensions();
    const generator = this.patterns[pattern] || this.patterns.waves;
    
    return generator(
      options.width || width,
      options.height || height,
      options.time || Date.now(),
      ...Object.values(options).slice(3)
    );
  }
}

// Animation controller for dynamic ASCII
export class ASCIIAnimator {
  constructor(element, generator, pattern = 'waves', fps = 12) {
    this.element = element;
    this.generator = generator;
    this.pattern = pattern;
    this.isAnimating = false;
    this.animationId = null;
    this.startTime = Date.now();
    this.fps = fps;
    this.frameInterval = 1000 / fps; // ms between frames
    this.lastFrameTime = 0;
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.lastFrameTime = Date.now();
    this.animate();
  }

  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.isAnimating) return;

    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;

    // Only update if enough time has passed
    if (deltaTime >= this.frameInterval) {
      const currentTime = now - this.startTime;
      const ascii = this.generator.generate(this.pattern, { time: currentTime });
      this.element.textContent = ascii;
      this.lastFrameTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  resize() {
    // Regenerate on resize
    if (this.isAnimating) {
      const currentTime = Date.now() - this.startTime;
      const ascii = this.generator.generate(this.pattern, { time: currentTime });
      this.element.textContent = ascii;
    }
  }
}
