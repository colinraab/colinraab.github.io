/**
 * Procedural ASCII Art Generator
 * Creates responsive ASCII patterns that adapt to screen size
 */

export class ASCIIGenerator {
  constructor() {
    this.chars = ['.', ':', ';', '+', '*', '%', '@', '#'];
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
    // Adjust spacing to create square-appearing grid cells
    // Since characters are ~0.6 aspect ratio (width/height), we need wider spacing horizontally
    const horizontalSpacing = 6; // Wider horizontal spacing
    const verticalSpacing = 4;   // Narrower vertical spacing
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x % horizontalSpacing === 0 || y % verticalSpacing === 0) && Math.random() < density) {
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
    // Adjust spacing to create square-appearing grid cells
    // Since characters are ~0.6 aspect ratio (width/height), we need wider spacing horizontally
    const horizontalSpacing = 10; // Wider horizontal spacing for square cells
    const verticalSpacing = 6;    // Vertical spacing
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isLine = (x % horizontalSpacing === 0) || (y % verticalSpacing === 0);
        const isJunction = (x % horizontalSpacing === 0) && (y % verticalSpacing === 0);
        
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
      vw += 20;
      vh += 20;
    }
    
    // Calculate based on actual font size being used
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
    
    const width = Math.ceil(vw / charWidth) + 2; 
    const height = Math.ceil(vh / lineHeight) + 2;
    
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
  constructor(element, generator, pattern = 'waves', fps = 12, options = {}) {
    this.element = element;
    this.generator = generator;
    this.pattern = pattern;
    this.isAnimating = false;
    this.animationId = null;
    this.startTime = Date.now();
    this.initialFps = fps;
    this.currentFps = fps;
    this.targetFps = fps;
    this.frameInterval = 1000 / fps; // ms between frames
    this.lastFrameTime = 0;
    
    // FPS transition options
    this.fpsTransitionDuration = options.fpsTransitionDuration || 2000; // 2 seconds
    this.fpsTransitionStartTime = null;
    this.fpsTransitionStartFps = 0;
    this.isTransitioningFps = false;
    
    // Static mode options
    this.staticMode = options.staticMode || false;
    this.staticCharacterChangeInterval = options.staticCharacterChangeInterval || 2000; // 2 seconds
    this.staticCharacterChangeCount = options.staticCharacterChangeCount || 6;
    this.lastStaticChangeTime = 0;
    this.currentStaticPattern = '';
    
    // Progressive reveal options
    this.progressiveReveal = options.progressiveReveal || false;
    this.revealDuration = options.revealDuration || 2000;
    this.revealStartTime = null;
    this.fullPattern = '';
    this.patternPositions = [];
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.lastFrameTime = Date.now();
    this.lastStaticChangeTime = Date.now();
    
    // Initialize progressive reveal if enabled
    if (this.progressiveReveal) {
      this.revealStartTime = Date.now();
      this.initializeProgressiveReveal();
    }
    
    this.animate();
  }

  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  // Method to transition FPS smoothly
  transitionToFps(targetFps, duration = this.fpsTransitionDuration) {
    // Store the starting FPS for this transition
    this.fpsTransitionStartFps = this.currentFps;
    this.targetFps = targetFps;
    this.fpsTransitionDuration = duration;
    this.fpsTransitionStartTime = Date.now();
    this.isTransitioningFps = true;
  }

  // Method to enable static mode (used for non-landing pages)
  enableStaticMode() {
    this.staticMode = true;
    
    // Generate initial static pattern if not already set
    if (!this.currentStaticPattern) {
      const currentTime = Date.now() - this.startTime;
      this.currentStaticPattern = this.generator.generate(this.pattern, { time: currentTime });
      this.element.textContent = this.currentStaticPattern;
    }
    
    this.transitionToFps(0);
  }

  // Method to briefly animate when navigating (page transitions)
  triggerPageTransition() {
    if (this.staticMode) {
      // First phase: quickly ramp up to higher FPS
      this.transitionToFps(8, 500); // Burst to 8 fps over 0.5 seconds
      
      // Second phase: slowly transition back to 0
      setTimeout(() => {
        // Start the slow transition back to 0 FPS
        this.transitionToFps(0, 2000); // Then slow back to 0 over 2 seconds
      }, 500); // Wait for first transition to complete
    }
  }

  // Update current FPS based on transition
  updateFps() {
    if (!this.isTransitioningFps) return;

    const now = Date.now();
    const elapsed = now - this.fpsTransitionStartTime;
    const progress = Math.min(elapsed / this.fpsTransitionDuration, 1);

    // Use linear interpolation for smoother, more predictable transitions
    this.currentFps = this.fpsTransitionStartFps + (this.targetFps - this.fpsTransitionStartFps) * progress;

    if (progress >= 1) {
      this.currentFps = this.targetFps;
      this.isTransitioningFps = false;
    }

    this.frameInterval = this.currentFps > 0 ? 1000 / this.currentFps : Infinity;
  }

  // Update a few random characters in static mode
  updateStaticCharacters() {
    if (!this.staticMode || this.currentFps > 0.1) return;

    const now = Date.now();
    if (now - this.lastStaticChangeTime < this.staticCharacterChangeInterval) return;

    // Generate initial pattern if not set
    if (!this.currentStaticPattern) {
      const currentTime = now - this.startTime;
      this.currentStaticPattern = this.generator.generate(this.pattern, { time: currentTime });
      this.element.textContent = this.currentStaticPattern;
      this.lastStaticChangeTime = now;
      return;
    }

    // Convert string to array for easier manipulation
    let patternArray = this.currentStaticPattern.split('');
    const nonWhitespacePositions = [];

    // Find all non-whitespace, non-newline positions
    for (let i = 0; i < patternArray.length; i++) {
      const char = patternArray[i];
      if (char !== ' ' && char !== '\n') {
        nonWhitespacePositions.push(i);
      }
    }

    // Only proceed if we have positions to update
    if (nonWhitespacePositions.length === 0) return;

    // Randomly select positions to update
    const positionsToUpdate = [];
    for (let i = 0; i < Math.min(this.staticCharacterChangeCount, nonWhitespacePositions.length); i++) {
      const randomIndex = Math.floor(Math.random() * nonWhitespacePositions.length);
      const position = nonWhitespacePositions[randomIndex];
      if (!positionsToUpdate.includes(position)) {
        positionsToUpdate.push(position);
      }
    }

    // Update selected positions with new random characters
    const chars = ['.', ':', ';', '+', '*', '%', '#', '-', '|'];
    positionsToUpdate.forEach(pos => {
      patternArray[pos] = chars[Math.floor(Math.random() * chars.length)];
    });

    this.currentStaticPattern = patternArray.join('');
    this.element.textContent = this.currentStaticPattern;
    this.lastStaticChangeTime = now;
  }

  initializeProgressiveReveal() {
    // Generate the full pattern once
    const currentTime = Date.now() - this.startTime;
    this.fullPattern = this.generator.generate(this.pattern, { time: currentTime });
    
    // Create an array of all non-whitespace character positions for random reveal
    this.patternPositions = [];
    for (let i = 0; i < this.fullPattern.length; i++) {
      const char = this.fullPattern[i];
      if (char !== ' ' && char !== '\n') {
        this.patternPositions.push(i);
      }
    }
    
    // Shuffle the positions for random reveal order
    for (let i = this.patternPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.patternPositions[i], this.patternPositions[j]] = [this.patternPositions[j], this.patternPositions[i]];
    }
  }

  getProgressivePattern(progress) {
    if (!this.progressiveReveal || progress >= 1) {
      return this.fullPattern;
    }
    
    // Create a pattern with spaces for unrevealed characters
    let revealedPattern = '';
    const revealCount = Math.floor(this.patternPositions.length * progress);
    const revealedPositions = new Set(this.patternPositions.slice(0, revealCount));
    
    for (let i = 0; i < this.fullPattern.length; i++) {
      const char = this.fullPattern[i];
      if (char === '\n') {
        revealedPattern += char;
      } else if (char === ' ' || revealedPositions.has(i)) {
        revealedPattern += char;
      } else {
        revealedPattern += ' ';
      }
    }
    
    return revealedPattern;
  }

  animate() {
    if (!this.isAnimating) return;

    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;

    // Update FPS if transitioning
    this.updateFps();

    // Handle static mode character updates
    if (this.staticMode && this.currentFps <= 0.1) {
      this.updateStaticCharacters();
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

    // Only update if enough time has passed (based on current FPS)
    if (deltaTime >= this.frameInterval && this.currentFps > 0.1) {
      const currentTime = now - this.startTime;
      
      let ascii;
      if (this.progressiveReveal && this.revealStartTime) {
        const revealElapsed = now - this.revealStartTime;
        const revealProgress = Math.min(revealElapsed / this.revealDuration, 1);
        
        // For static patterns like 'circuit', keep the same pattern
        // For animated patterns like 'waves', update the pattern
        if (this.pattern === 'waves') {
          this.fullPattern = this.generator.generate(this.pattern, { time: currentTime });
          // Update pattern positions for new pattern
          this.updatePatternPositions();
        }
        
        ascii = this.getProgressivePattern(revealProgress);
        
        // Once reveal is complete, switch to normal animation
        if (revealProgress >= 1) {
          this.progressiveReveal = false;
        }
      } else {
        ascii = this.generator.generate(this.pattern, { time: currentTime });
      }
      
      this.element.textContent = ascii;
      
      // Store current pattern for static mode
      if (this.staticMode) {
        this.currentStaticPattern = ascii;
      }
      
      this.lastFrameTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updatePatternPositions() {
    // Update positions for animated patterns
    this.patternPositions = [];
    for (let i = 0; i < this.fullPattern.length; i++) {
      const char = this.fullPattern[i];
      if (char !== ' ' && char !== '\n') {
        this.patternPositions.push(i);
      }
    }
    
    // Shuffle the positions for random reveal order
    for (let i = this.patternPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.patternPositions[i], this.patternPositions[j]] = [this.patternPositions[j], this.patternPositions[i]];
    }
  }

  resize() {
    // Regenerate on resize
    if (this.isAnimating) {
      const currentTime = Date.now() - this.startTime;
      
      if (this.progressiveReveal && this.revealStartTime) {
        // Reinitialize progressive reveal with new dimensions
        this.initializeProgressiveReveal();
        const revealElapsed = Date.now() - this.revealStartTime;
        const revealProgress = Math.min(revealElapsed / this.revealDuration, 1);
        const ascii = this.getProgressivePattern(revealProgress);
        this.element.textContent = ascii;
      } else {
        const ascii = this.generator.generate(this.pattern, { time: currentTime });
        this.element.textContent = ascii;
        
        // Update static pattern if in static mode
        if (this.staticMode) {
          this.currentStaticPattern = ascii;
        }
      }
    }
  }
}
