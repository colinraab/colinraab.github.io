/**
 * Optimized Audio Controller
 * Reduces memory usage and improves performance
 */

export class AudioController {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.playerElement = null;
    this.eventListenersSetup = false;
    
    // Performance optimizations
    this.updateThrottle = 250; // ms
    this.lastUpdateTime = 0;
    this.cachedDuration = 0;
    
    // Memory management
    this.maxCacheSize = 2; // Only cache 2 tracks max
    this.trackCache = new Map();
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupPlayer());
    } else {
      this.setupPlayer();
    }
    
    this.setupViewTransitionHandlers();
  }

  setupViewTransitionHandlers() {
    document.addEventListener('astro:before-swap', () => {
      this.saveTransitionState();
    });
    
    document.addEventListener('astro:after-swap', () => {
      this.restoreAfterTransition();
    });
  }

  saveTransitionState() {
    if (this.currentTrack && this.audio) {
      const state = {
        track: this.currentTrack,
        currentTime: this.audio.currentTime,
        duration: this.cachedDuration || this.audio.duration,
        isPlaying: this.isPlaying,
        volume: this.audio.volume,
        isVisible: !this.playerElement.classList.contains('hidden'),
        wasPlaying: !this.audio.paused
      };
      
      // Use smaller storage footprint
      const compactState = {
        t: state.track,
        ct: Math.round(state.currentTime * 10) / 10, // Round to 0.1s precision
        d: Math.round(state.duration * 10) / 10,
        p: state.isPlaying,
        v: Math.round(state.volume * 100) / 100, // Round to 2 decimal places
        vis: state.isVisible,
        wp: state.wasPlaying
      };
      
      sessionStorage.setItem('audioState', JSON.stringify(compactState));
      
      if (!this.audio.paused) {
        this.audio.pause();
      }
    }
  }

  restoreAfterTransition() {
    setTimeout(() => {
      this.eventListenersSetup = false;
      this.setupPlayer();
      
      const savedState = sessionStorage.getItem('audioState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          
          // Expand compact state
          const expandedState = {
            track: state.t,
            currentTime: state.ct,
            duration: state.d,
            isPlaying: state.p,
            volume: state.v,
            isVisible: state.vis,
            wasPlaying: state.wp
          };
          
          this.currentTrack = expandedState.track;
          this.cachedDuration = expandedState.duration;
          this.updateTrackInfo(expandedState.track);
          
          if (expandedState.isVisible) {
            this.showPlayer();
          }
          
          this.audio.src = expandedState.track.url;
          
          const onCanPlay = () => {
            this.audio.currentTime = expandedState.currentTime || 0;
            this.audio.volume = expandedState.volume || 0.7;
            
            if (expandedState.wasPlaying || expandedState.isPlaying) {
              this.showResumeIndicator();
              this.isPlaying = false;
              this.updatePlayPauseButton();
            } else {
              this.isPlaying = false;
              this.updatePlayPauseButton();
            }
            
            this.audio.removeEventListener('canplay', onCanPlay);
          };
          
          this.audio.addEventListener('canplay', onCanPlay);
          
        } catch (e) {
          console.error('Error restoring audio state:', e);
        }
      }
    }, 100); // Reduced delay
  }

  setupPlayer() {
    this.playerElement = document.getElementById('global-audio-player');
    this.audio = document.getElementById('global-audio');
    
    if (!this.playerElement || !this.audio) {
      setTimeout(() => this.setupPlayer(), 50);
      return;
    }

    this.setupEventListeners();
    this.setupAudioEventListeners();
    
    if (!sessionStorage.getItem('audioState')) {
      this.restoreState();
    }
  }

  setupEventListeners() {
    if (this.eventListenersSetup) return;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressSlider = document.getElementById('progress-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const closeBtn = document.getElementById('close-player-btn');

    // Use passive listeners where possible
    this.playPauseHandler = () => this.togglePlayPause();
    this.progressHandler = (e) => this.seekTo(e.target.value);
    this.volumeHandler = (e) => this.setVolume(e.target.value);
    this.closeHandler = () => this.closePlayer();

    if (playPauseBtn) playPauseBtn.addEventListener('click', this.playPauseHandler);
    if (progressSlider) progressSlider.addEventListener('input', this.progressHandler);
    if (volumeSlider) volumeSlider.addEventListener('input', this.volumeHandler);
    if (closeBtn) closeBtn.addEventListener('click', this.closeHandler);
    
    this.eventListenersSetup = true;
  }

  removeEventListeners() {
    if (!this.eventListenersSetup) return;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressSlider = document.getElementById('progress-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const closeBtn = document.getElementById('close-player-btn');

    if (playPauseBtn) playPauseBtn.removeEventListener('click', this.playPauseHandler);
    if (progressSlider) progressSlider.removeEventListener('input', this.progressHandler);
    if (volumeSlider) volumeSlider.removeEventListener('input', this.volumeHandler);
    if (closeBtn) closeBtn.removeEventListener('click', this.closeHandler);
    
    this.eventListenersSetup = false;
  }

  setupAudioEventListeners() {
    this.audio.addEventListener('loadedmetadata', () => {
      this.cachedDuration = this.audio.duration;
      this.updateDuration();
    });
    
    // Throttled progress updates
    this.audio.addEventListener('timeupdate', () => {
      const now = Date.now();
      if (now - this.lastUpdateTime >= this.updateThrottle) {
        this.updateProgress();
        this.lastUpdateTime = now;
      }
    });
    
    this.audio.addEventListener('ended', () => this.onTrackEnded());
  }

  // Clean up audio cache to manage memory
  manageCache() {
    if (this.trackCache.size >= this.maxCacheSize) {
      const oldestKey = this.trackCache.keys().next().value;
      this.trackCache.delete(oldestKey);
    }
  }

  async loadTrack(track) {
    if (!this.currentTrack && this.playerElement.classList.contains('hidden')) {
      if (!this.eventListenersSetup) {
        this.setupEventListeners();
      }
    }
    
    if (this.currentTrack && this.currentTrack.url !== track.url) {
      this.pause();
      this.audio.currentTime = 0;
    }
    
    this.currentTrack = track;
    this.updateTrackInfo(track);
    this.showPlayer();
    this.removeResumeIndicator();
    
    // Manage cache
    this.manageCache();
    this.trackCache.set(track.url, track);
    
    this.audio.src = track.url;
    
    try {
      await this.play();
      this.saveState();
      return true;
    } catch (error) {
      return new Promise((resolve) => {
        const onCanPlay = async () => {
          this.audio.removeEventListener('canplay', onCanPlay);
          try {
            await this.play();
            resolve(true);
          } catch (secondError) {
            this.isPlaying = false;
            this.updatePlayPauseButton();
            this.showResumeIndicator();
            resolve(false);
          }
        };
        
        this.audio.addEventListener('canplay', onCanPlay);
        this.saveState();
      });
    }
  }

  updateTrackInfo(track) {
    const titleEl = document.getElementById('current-track-title');
    const artistEl = document.getElementById('current-track-artist');
    
    if (titleEl) titleEl.textContent = track.title || 'Unknown Track';
    if (artistEl) artistEl.textContent = track.artist || '';
  }

  showResumeIndicator() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.classList.add('needs-resume');
      playPauseBtn.title = 'Click to resume playback';
    }
  }

  removeResumeIndicator() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.classList.remove('needs-resume');
      playPauseBtn.title = '';
    }
  }

  async togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      try {
        await this.play();
        this.removeResumeIndicator();
      } catch (error) {
        console.error('Playback failed:', error);
      }
    }
  }

  async play() {
    await this.audio.play();
    this.isPlaying = true;
    this.updatePlayPauseButton();
    this.saveState();
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayPauseButton();
    this.saveState();
  }

  updatePlayPauseButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (this.isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    }
  }

  seekTo(percentage) {
    const time = (percentage / 100) * (this.cachedDuration || this.audio.duration);
    this.audio.currentTime = time;
  }

  setVolume(percentage) {
    this.audio.volume = percentage / 100;
    localStorage.setItem('globalAudioVolume', percentage);
  }

  updateProgress() {
    const duration = this.cachedDuration || this.audio.duration;
    if (duration) {
      const percentage = (this.audio.currentTime / duration) * 100;
      const progressSlider = document.getElementById('progress-slider');
      const currentTimeEl = document.getElementById('current-time');
      
      if (progressSlider) progressSlider.value = percentage;
      if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
  }

  updateDuration() {
    const durationEl = document.getElementById('duration');
    if (durationEl) durationEl.textContent = this.formatTime(this.cachedDuration);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  showPlayer() {
    if (!this.playerElement.classList.contains('hidden')) {
      return;
    }
    
    this.playerElement.classList.remove('hidden');
    
    const playerContent = this.playerElement.querySelector('.player-content');
    if (!playerContent) return;
    
    playerContent.style.opacity = '0';
    this.playerElement.style.height = 'auto';
    this.playerElement.style.overflow = 'hidden';
    
    const naturalHeight = this.playerElement.offsetHeight;
    
    this.playerElement.style.height = '0px';
    playerContent.style.opacity = '0';
    
    document.body.style.paddingTop = naturalHeight + 'px';
    
    if (typeof anime !== 'undefined') {
      const tl = anime.timeline({
        easing: 'easeOutCubic'
      });
      
      tl.add({
        targets: this.playerElement,
        height: ['0px', naturalHeight + 'px'],
        duration: 300, // Faster animation
        easing: 'easeOutCubic'
      });
      
      tl.add({
        targets: playerContent,
        opacity: [0, 1],
        duration: 200, // Faster fade in
        easing: 'easeOutQuad',
        complete: () => {
          this.playerElement.style.height = '';
          this.playerElement.style.overflow = '';
          playerContent.style.opacity = '';
        }
      }, '-=50');
      
    } else {
      this.playerElement.style.height = '';
      this.playerElement.style.overflow = '';
      playerContent.style.opacity = '';
    }
  }

  closePlayer() {
    this.pause();
    
    const playerContent = this.playerElement.querySelector('.player-content');
    
    if (typeof anime !== 'undefined') {
      const tl = anime.timeline({
        easing: 'easeInCubic',
        complete: () => {
          this.playerElement.classList.add('hidden');
          document.body.style.paddingTop = '0';
          
          this.playerElement.style.height = '';
          this.playerElement.style.overflow = '';
          if (playerContent) {
            playerContent.style.opacity = '';
          }
          
          this.currentTrack = null;
          this.audio.src = '';
          this.audio.currentTime = 0;
          this.isPlaying = false;
          this.removeResumeIndicator();
          this.updatePlayPauseButton();
          
          // Clear states
          localStorage.removeItem('globalAudioState');
          sessionStorage.removeItem('audioState');
          
          // Clear cache
          this.trackCache.clear();
        }
      });
      
      tl.add({
        targets: playerContent,
        opacity: [1, 0],
        duration: 150, // Faster close
        easing: 'easeInQuad'
      });
      
      tl.add({
        targets: this.playerElement,
        height: [this.playerElement.offsetHeight + 'px', '0px'],
        duration: 250, // Faster collapse
        easing: 'easeInCubic',
        begin: () => {
          this.playerElement.style.overflow = 'hidden';
          document.body.style.paddingTop = '0';
        }
      }, '-=25');
      
    } else {
      this.playerElement.classList.add('hidden');
      document.body.style.paddingTop = '0';
      
      this.currentTrack = null;
      this.audio.src = '';
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.removeResumeIndicator();
      this.updatePlayPauseButton();
      
      localStorage.removeItem('globalAudioState');
      sessionStorage.removeItem('audioState');
      this.trackCache.clear();
    }
  }

  onTrackEnded() {
    this.isPlaying = false;
    this.updatePlayPauseButton();
    this.saveState();
  }

  saveState() {
    if (this.currentTrack) {
      const state = {
        track: this.currentTrack,
        currentTime: Math.round(this.audio.currentTime * 10) / 10, // Round to save space
        isPlaying: this.isPlaying,
        volume: Math.round(this.audio.volume * 100) / 100 // Round to save space
      };
      localStorage.setItem('globalAudioState', JSON.stringify(state));
    }
  }

  restoreState() {
    const savedState = localStorage.getItem('globalAudioState');
    const savedVolume = localStorage.getItem('globalAudioVolume');
    
    if (savedVolume) {
      this.setVolume(savedVolume);
      const volumeSlider = document.getElementById('volume-slider');
      if (volumeSlider) volumeSlider.value = savedVolume;
    }
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.currentTrack = state.track;
        this.audio.src = state.track.url;
        this.audio.currentTime = state.currentTime || 0;
        this.updateTrackInfo(state.track);
        this.showPlayer();
        
        if (state.isPlaying) {
          this.isPlaying = false;
          this.updatePlayPauseButton();
        }
      } catch (e) {
        console.error('Error restoring audio state:', e);
      }
    }
  }
}

// Initialize optimized audio player
if (typeof window !== 'undefined') {
  window.AudioPlayer = new AudioController();

  window.loadGlobalTrack = async function(track) {
    if (window.optimizedAudioPlayer) {
      const playbackStarted = await window.AudioPlayer.loadTrack(track);
      if (!playbackStarted) {
        // Resume indicator will show
      }
    } else {
      console.error('AudioPlayer not initialized');
    }
  };
}