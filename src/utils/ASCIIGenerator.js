/**
 * Optimized ASCII Generator
 * Reduces memory usage and improves performance through:
 * - String pooling and reuse
 * - Reduced DOM manipulation
 * - Smarter frame rate management
 * - Memory-efficient pattern generation
 */

export class ASCIIGenerator {
  constructor() {
    this.chars = ['.', ':', ';', '+', '*', '%', '@', '#'];
    this.patterns = {
      waves: this.generateWaves.bind(this),
      // grid: this.generateGrid.bind(this),
      noise: this.generateNoise.bind(this),
      circuit: this.generateCircuit.bind(this)
    };
    
    // Caching for performance
  this.dimensionsCache = null;
    this.lastResizeTime = 0;
    this.resizeThrottle = 250; // ms
    
    // String builder for efficiency
    this.stringPool = [];
    this.poolIndex = 0;
    this.maxPoolSize = 5;
  }

  // Optimized wave patterns with reduced calculations
  generateWaves(width, height, time = 0) {
    // Reuse string from pool if available
    let result = this.getPooledString();
    
    // Reduce time precision to avoid excessive recalculation
    const normalizedTime = Math.floor(time / 50) * 50;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Simplified wave calculation
        const wave1 = Math.sin(x * 0.08 + normalizedTime * 0.005) * 0.4;
        const wave2 = Math.sin(y * 0.12 + normalizedTime * 0.004) * 0.4;
        const intensity = (wave1 + wave2 + 1) * 0.5;
        const charIndex = Math.min(Math.floor(intensity * this.chars.length), this.chars.length - 1);
        result += this.chars[charIndex];
      }
      result += '\n';
    }
    return result;
  }

  // Optimized grid with better caching
  generateGrid(width, height, density = 0.25) {
    let result = this.getPooledString();
    
    // Slightly tighter grid to reduce character count
    const horizontalSpacing = 8;
    const verticalSpacing = 5;
    
    // Pre-calculate random values to avoid repeated Math.random() calls
    const randomGrid = new Float32Array(Math.ceil(width * height / 20));
    for (let i = 0; i < randomGrid.length; i++) {
      randomGrid[i] = Math.random();
    }
    
    let randomIndex = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // const isLine = (x % horizontalSpacing === 0 || y % verticalSpacing === 0);
        // if (isLine && randomGrid[randomIndex % randomGrid.length] < density) {
        //   result += this.chars[Math.floor(randomGrid[(randomIndex + 1) % randomGrid.length] * 4) + 2];
        // } else {
          result += randomGrid[(randomIndex + 2) % randomGrid.length] < 0.1 ? this.chars[0] : ' ';
        // }
        randomIndex++;
      }
      result += '\n';
    }
    return result;
  }

  // Simplified noise generation
  generateNoise(width, height, intensity = 0.4) {
    let result = this.getPooledString();
    
    // Use a smaller random pool for better performance
    const randomPool = new Float32Array(1000);
    for (let i = 0; i < randomPool.length; i++) {
      randomPool[i] = Math.random();
    }
    
    let poolIndex = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noise = randomPool[poolIndex % randomPool.length];
        poolIndex++;
        
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

  // Optimized circuit pattern
  generateCircuit(width, height) {
    let result = this.getPooledString();
    
    // Slightly larger spacing to reduce total characters
    const horizontalSpacing = 12;
    const verticalSpacing = 7;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // const isLine = (x % horizontalSpacing === 0) || (y % verticalSpacing === 0);
        // const isJunction = (x % horizontalSpacing === 0) && (y % verticalSpacing === 0);
        
        // if (isJunction) {
        //   result += '+';
        // } else if (isLine) {
        //   result += x % horizontalSpacing === 0 ? '|' : '-';
        // } else {
          result += Math.random() < 0.05 ? '.' : ' '; // Reduced noise
        // }
      }
      result += '\n';
    }
    return result;
  }

  // String pooling for memory efficiency
  getPooledString() {
    if (this.stringPool.length > this.poolIndex) {
      const str = this.stringPool[this.poolIndex];
      this.stringPool[this.poolIndex] = ''; // Clear the string
      this.poolIndex = (this.poolIndex + 1) % this.maxPoolSize;
      return '';
    }
    return '';
  }

  // Optionally allow measuring based on a DOM element to account for font metrics
  attachMeasureElement(el) {
    this.measureElement = el || null;
    this.dimensionsCache = null;
  }

  // Throttled dimension calculation
  calculateDimensions() {
    const now = Date.now();
    if (this.dimensionsCache && (now - this.lastResizeTime) < this.resizeThrottle) {
      return this.dimensionsCache;
    }

    let vw, vh;
    
    if (this.measureElement) {
      const rect = this.measureElement.getBoundingClientRect();
      vw = rect.width;
      vh = rect.height;
    } else if (window.visualViewport) {
      vw = window.visualViewport.width;
      vh = window.visualViewport.height;
    } else {
      vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    }
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      vw += 10; // Reduced padding
      vh += 10;
    }
    
    // Determine character dimensions. Prefer measuring from the actual element to avoid rounding gaps.
    let charWidth, lineHeight;
    if (this.measureElement) {
      // Use computed styles to get accurate line-height in pixels
      const cs = window.getComputedStyle(this.measureElement);
      const fontSizePx = parseFloat(cs.fontSize) || 12;
      const lineHeightPx = cs.lineHeight === 'normal' ? fontSizePx * 1.2 : parseFloat(cs.lineHeight);
      lineHeight = lineHeightPx || fontSizePx;

      // Measure average character width using multiple characters for stability
      const probe = document.createElement('span');
      probe.textContent = 'MMMMMMMMMM';
      probe.style.visibility = 'hidden';
      probe.style.whiteSpace = 'pre';
      this.measureElement.appendChild(probe);
      const rect = probe.getBoundingClientRect();
      this.measureElement.removeChild(probe);
      const measuredWidth = rect.width || fontSizePx * 6; // rough fallback
      charWidth = measuredWidth / 10;
    } else {
      // Fallback to heuristic based on viewport
      let fontSize;
      if (isMobile) {
        const vmin = Math.min(vw, vh) / 100;
        fontSize = Math.min(Math.max(vmin * 1.8, 5), 8); // Larger font on mobile
      } else {
        const vmin = Math.min(vw, vh) / 100;
        fontSize = Math.min(Math.max(vmin * 1.2, 8), 12); // Larger font overall
      }
      charWidth = fontSize * 0.6;
      lineHeight = fontSize;
    }

    // Slightly over-generate to ensure full coverage, clipping via overflow hidden
    const width = Math.ceil(vw / charWidth) + 2;
    const height = Math.ceil(vh / lineHeight) + 2;
    
    this.dimensionsCache = { width, height };
    this.lastResizeTime = now;
    
    return this.dimensionsCache;
  }

  // Main generation method with optimizations
  generate(pattern = 'waves', options = {}) {
    const { width, height } = this.calculateDimensions();
    const generator = this.patterns[pattern] || this.patterns.waves;
    
    const result = generator(
      options.width || width,
      options.height || height,
      options.time || Date.now(),
      ...Object.values(options).slice(3)
    );
    
    // Store in pool for potential reuse
    if (this.stringPool.length < this.maxPoolSize) {
      this.stringPool.push('');
    }
    
    return result;
  }
}

// Optimized Animation controller with smarter frame management
export class ASCIIAnimator {
  constructor(element, generator, pattern = 'circuit', fps = 8, options = {}) {
    this.element = element;
    this.generator = generator;
    // Allow generator to measure character size from the actual element
    if (this.generator && typeof this.generator.attachMeasureElement === 'function') {
      this.generator.attachMeasureElement(this.element);
    }
    this.pattern = pattern;
    this.isAnimating = false;
    this.animationId = null;
    this.startTime = Date.now();
    this.initialFps = fps;
    this.currentFps = fps;
    this.targetFps = fps;
    this.frameInterval = 1000 / fps;
    this.lastFrameTime = 0;
    
    // Optimized FPS management
    this.fpsTransitionDuration = options.fpsTransitionDuration || 1500; // Faster transitions
    this.fpsTransitionStartTime = null;
    this.fpsTransitionStartFps = 0;
    this.isTransitioningFps = false;
    
    // Enhanced static mode
    this.staticMode = options.staticMode || false;
    this.staticCharacterChangeInterval = options.staticCharacterChangeInterval || 3000; // Less frequent
    this.staticCharacterChangeCount = options.staticCharacterChangeCount || 3; // Fewer changes
    this.lastStaticChangeTime = 0;
    this.currentStaticPattern = '';
    
    // Optimized progressive reveal
    this.progressiveReveal = options.progressiveReveal || false;
    this.revealDuration = options.revealDuration || 1500; // Faster reveal
    this.revealStartTime = null;
    this.fullPattern = '';
    this.patternPositions = [];
    
    // Performance monitoring
    this.frameSkipCount = 0;
    this.maxFrameSkip = 2; // Skip frames if falling behind
    
    // Request idle callback support
    this.supportsRequestIdleCallback = 'requestIdleCallback' in window;
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.lastFrameTime = Date.now();
    this.lastStaticChangeTime = Date.now();
    
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

  // Optimized FPS transition
  transitionToFps(targetFps, duration = this.fpsTransitionDuration) {
    if (Math.abs(this.currentFps - targetFps) < 0.1) return; // Skip tiny changes
    
    this.fpsTransitionStartFps = this.currentFps;
    this.targetFps = targetFps;
    this.fpsTransitionDuration = duration;
    this.fpsTransitionStartTime = Date.now();
    this.isTransitioningFps = true;
  }

  enableStaticMode() {
    this.staticMode = true;
    
    if (!this.currentStaticPattern) {
      const currentTime = Date.now() - this.startTime;
      this.currentStaticPattern = this.generator.generate(this.pattern, { time: currentTime });
      this.element.textContent = this.currentStaticPattern;
    }
    
    this.transitionToFps(0, 1000); // Faster transition to static
  }

  // Optimized page transition animation
  triggerPageTransition() {
    if (this.staticMode) {
      this.transitionToFps(4, 300); // Shorter burst
      setTimeout(() => {
        this.transitionToFps(0, 1200);
      }, 400);
    }
  }

  updateFps() {
    if (!this.isTransitioningFps) return;

    const now = Date.now();
    const elapsed = now - this.fpsTransitionStartTime;
    const progress = Math.min(elapsed / this.fpsTransitionDuration, 1);

    // Use easing for smoother transitions
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    this.currentFps = this.fpsTransitionStartFps + (this.targetFps - this.fpsTransitionStartFps) * easeProgress;

    if (progress >= 1) {
      this.currentFps = this.targetFps;
      this.isTransitioningFps = false;
    }

    this.frameInterval = this.currentFps > 0 ? 1000 / this.currentFps : Infinity;
  }

  // Optimized static character updates
  updateStaticCharacters() {
    if (!this.staticMode || this.currentFps > 0.1) return;

    const now = Date.now();
    if (now - this.lastStaticChangeTime < this.staticCharacterChangeInterval) return;

    if (!this.currentStaticPattern) {
      const currentTime = now - this.startTime;
      this.currentStaticPattern = this.generator.generate(this.pattern, { time: currentTime });
      this.element.textContent = this.currentStaticPattern;
      this.lastStaticChangeTime = now;
      return;
    }

    // More efficient character replacement
    const patternArray = this.currentStaticPattern.split('');
    const changePositions = [];
    
    // Pre-select positions to change
    for (let i = 0; i < this.staticCharacterChangeCount && i < patternArray.length; i++) {
      let pos;
      do {
        pos = Math.floor(Math.random() * patternArray.length);
      } while (patternArray[pos] === ' ' || patternArray[pos] === '\n');
      
      if (!changePositions.includes(pos)) {
        changePositions.push(pos);
      }
    }

    // Apply changes
    const chars = ['.', ':', ';', '+', '*', '-', '|'];
    changePositions.forEach(pos => {
      patternArray[pos] = chars[Math.floor(Math.random() * chars.length)];
    });

    this.currentStaticPattern = patternArray.join('');
    this.element.textContent = this.currentStaticPattern;
    this.lastStaticChangeTime = now;
  }

  // Optimized progressive reveal
  initializeProgressiveReveal() {
    const currentTime = Date.now() - this.startTime;
    this.fullPattern = this.generator.generate(this.pattern, { time: currentTime });
    
    this.patternPositions = [];
    // Include all non-newline positions for a perfectly smooth transition
    for (let i = 0; i < this.fullPattern.length; i++) {
      if (this.fullPattern[i] !== '\n') {
        this.patternPositions.push(i);
      }
    }
    
    // Shuffle for random reveal
    for (let i = this.patternPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.patternPositions[i], this.patternPositions[j]] = [this.patternPositions[j], this.patternPositions[i]];
    }

    // Initialize reveal mask for performance
    this.revealMask = new Uint8Array(this.fullPattern.length);
    this.lastRevealCount = 0;
  }

  getProgressivePattern(progress) {
    if (!this.progressiveReveal || progress >= 1) {
      return this.fullPattern;
    }
    
    const revealCount = Math.floor(this.patternPositions.length * progress);
    
    // Update mask if revealCount increased
    if (revealCount > this.lastRevealCount) {
      for (let i = this.lastRevealCount; i < revealCount; i++) {
        this.revealMask[this.patternPositions[i]] = 1;
      }
      this.lastRevealCount = revealCount;
    }
    
    let revealedPattern = '';
    for (let i = 0; i < this.fullPattern.length; i++) {
      const char = this.fullPattern[i];
      if (char === '\n' || this.revealMask[i]) {
        revealedPattern += char;
      } else {
        revealedPattern += ' ';
      }
    }
    
    return revealedPattern;
  }

  // Optimized main animation loop
  animate() {
    if (!this.isAnimating) return;

    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;

    this.updateFps();

    // Handle static mode
    if (this.staticMode && this.currentFps <= 0.1) {
      // Use requestIdleCallback for static updates when available
      if (this.supportsRequestIdleCallback) {
        requestIdleCallback(() => this.updateStaticCharacters());
      } else {
        this.updateStaticCharacters();
      }
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

    // Frame rate limiting with frame skipping
    if (deltaTime >= this.frameInterval && this.currentFps > 0.1) {
      // Skip frames if we're falling behind
      if (deltaTime > this.frameInterval * 2 && this.frameSkipCount < this.maxFrameSkip) {
        this.frameSkipCount++;
        this.animationId = requestAnimationFrame(() => this.animate());
        return;
      }
      
      this.frameSkipCount = 0;
      const currentTime = now - this.startTime;
      
      let ascii;
      if (this.progressiveReveal && this.revealStartTime) {
        const revealElapsed = now - this.revealStartTime;
        const revealProgress = Math.min(revealElapsed / this.revealDuration, 1);
        
        // Update full pattern every frame for dynamic reveal
        this.fullPattern = this.generator.generate(this.pattern, { time: currentTime });
        
        ascii = this.getProgressivePattern(revealProgress);
        
        if (revealProgress >= 1) {
          this.progressiveReveal = false;
        }
      } else {
        ascii = this.generator.generate(this.pattern, { time: currentTime });
      }
      
      this.element.textContent = ascii;
      
      if (this.staticMode) {
        this.currentStaticPattern = ascii;
      }
      
      this.lastFrameTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  resize() {
    // Debounced resize
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      if (this.isAnimating) {
        // Invalidate generator dimension cache on resize
        if (this.generator) {
          this.generator.dimensionsCache = null;
        }
        const currentTime = Date.now() - this.startTime;
        
        if (this.progressiveReveal && this.revealStartTime) {
          this.initializeProgressiveReveal();
          const revealElapsed = Date.now() - this.revealStartTime;
          const revealProgress = Math.min(revealElapsed / this.revealDuration, 1);
          const ascii = this.getProgressivePattern(revealProgress);
          this.element.textContent = ascii;
        } else {
          const ascii = this.generator.generate(this.pattern, { time: currentTime });
          this.element.textContent = ascii;
          
          if (this.staticMode) {
            this.currentStaticPattern = ascii;
          }
        }
      }
    }, 150);
  }
}