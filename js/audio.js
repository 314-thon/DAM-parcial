/* ============================================================
   DAM Tutor Interactivo - Sistema de Audio y Síntesis Web Audio API
   ============================================================ */
    const soundManager = {
      ctx: null,
      isMuted: false,
      isMusicMuted: false,
      musicAudio: null,
      ringtoneAudio: null,
      callActiveAudio: null,
      ringPending: false,
      _unlockAttached: false,
      _ringUnlockAttached: false,

      init() {
        try {
          const savedAudio = localStorage.getItem('dam_audio_muted');
          if (savedAudio !== null) {
            this.isMuted = (savedAudio === 'true');
          }
          const savedMusic = localStorage.getItem('dam_music_muted');
          if (savedMusic !== null) {
            this.isMusicMuted = (savedMusic === 'true');
          }
        } catch (e) {}

        this.initMusic();
        this.initRingtone(); // Pre-cargar el ringtone de Eminem
        this.initCallActiveAudio(); // Pre-cargar audio de Inspector Morfi al atender
        this.updateUI();

        // Si no está muteada, intentar reproducción inmediata
        if (!this.isMusicMuted && !this.isMuted) {
          this.playMusic();
        }
      },

      initMusic() {
        if (!this.musicAudio) {
          try {
            this.musicAudio = new Audio('assets/audio/end_credits_music.mp3');
            this.musicAudio.loop = true;
            this.musicAudio.volume = 0.03; // 3% de volumen requerido (suave de fondo)

            this.musicAudio.addEventListener('play', () => this.updateMusicBtnUI());
            this.musicAudio.addEventListener('pause', () => this.updateMusicBtnUI());
          } catch (e) {
            console.warn('Audio initialization error:', e);
          }
        }
      },

      getAudioContext() {
        try {
          if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
          }
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          return this.ctx;
        } catch (e) {
          return null;
        }
      },

      playMusic() {
        this.initMusic();
        if (!this.musicAudio || this.isMusicMuted || this.isMuted) return;
        this.musicAudio.volume = 0.03;
        const playPromise = this.musicAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.updateMusicBtnUI();
          }).catch(() => {
            // Si el navegador bloqueó el autoplay sin interacción previa, capturar el primer toque
            this.setupAutoplayUnlock();
          });
        }
      },

      setupAutoplayUnlock() {
        if (this._unlockAttached) return;
        this._unlockAttached = true;
        const unlock = () => {
          if (!this.isMusicMuted && !this.isMuted && this.musicAudio && this.musicAudio.paused) {
            this.musicAudio.volume = 0.03;
            this.musicAudio.play().then(() => {
              this.updateMusicBtnUI();
              window.removeEventListener('click', unlock);
              window.removeEventListener('pointerdown', unlock);
              window.removeEventListener('keydown', unlock);
              this._unlockAttached = false;
            }).catch(() => {});
          }
        };
        window.addEventListener('click', unlock);
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
      },

      toggleMusic() {
        this.initMusic();
        
        // Si la música está pausada o silenciada, activarla y reproducir
        if (this.musicAudio.paused || this.isMusicMuted) {
          this.isMusicMuted = false;
          this.musicAudio.volume = 0.03;
          this.musicAudio.play().then(() => {
            this.updateMusicBtnUI();
          }).catch(() => {
            this.setupAutoplayUnlock();
          });
        } else {
          // Si estaba reproduciendo activamente, pausarla
          this.isMusicMuted = true;
          this.musicAudio.pause();
        }

        try {
          localStorage.setItem('dam_music_muted', this.isMusicMuted);
        } catch (e) {}

        this.updateMusicBtnUI();
        if (!this.isMuted) this.playClick();
      },

      toggleMute() {
        this.isMuted = !this.isMuted;
        try {
          localStorage.setItem('dam_audio_muted', this.isMuted);
        } catch (e) {}

        if (this.isMuted) {
          this.stopRing();
          this.stopCallActive();
        }

        if (this.musicAudio) {
          if (this.isMuted) {
            this.musicAudio.pause();
          } else if (!this.isMusicMuted) {
            this.musicAudio.volume = 0.03;
            this.musicAudio.play().catch(() => {
              this.setupAutoplayUnlock();
            });
          }
        }

        this.updateUI();
        if (!this.isMuted) {
          this.playClick();
        }
      },

      updateUI() {
        this.updateMuteBtnUI();
        this.updateMusicBtnUI();
      },

      updateMusicBtnUI() {
        const btn = document.getElementById('music-toggle-btn');
        if (!btn) return;
        const isPlaying = this.musicAudio && !this.musicAudio.paused;
        if (this.isMusicMuted || this.isMuted) {
          btn.innerHTML = '🎵 Música: OFF';
          btn.classList.add('muted');
        } else if (isPlaying) {
          btn.innerHTML = '🎵 Música: ON';
          btn.classList.remove('muted');
        } else {
          btn.innerHTML = '🎵 Música: ON';
          btn.classList.remove('muted');
        }
      },

      updateMuteBtnUI() {
        const btn = document.getElementById('mute-toggle-btn');
        if (btn) {
          if (this.isMuted) {
            btn.innerHTML = '🔇 Sonido: OFF';
            btn.classList.add('muted');
          } else {
            btn.innerHTML = '🔊 Sonido: ON';
            btn.classList.remove('muted');
          }
        }
      },

      playClick() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      },

      playSelect() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      },

      playSuccess() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.15, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.22);
        });
      },

      playError() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.linearRampToValueAtTime(190, now + 0.2);
        osc2.frequency.setValueAtTime(220, now);
        osc2.frequency.linearRampToValueAtTime(130, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
      },

      playFlip() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      },

      playDrop() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      },

      initRingtone() {
        if (!this.ringtoneAudio) {
          try {
            this.ringtoneAudio = new Audio('assets/audio/Eminem - The Real Slim Shady (Marimba Ringtone).mp3');
            this.ringtoneAudio.preload = 'auto';
            this.ringtoneAudio.loop = true; // No para de sonar en loop continuo
            this.ringtoneAudio.volume = 0.05; // 5% de volumen
          } catch (e) {
            console.warn('Ringtone audio initialization error:', e);
          }
        } else {
          this.ringtoneAudio.volume = 0.05;
        }
      },

      playRing() {
        if (this.isMuted) return;
        this.initRingtone();
        this.ringPending = true;
        if (this.ringtoneAudio) {
          try {
            this.ringtoneAudio.volume = 0.05; // Asegurar 5% de volumen
            this.ringtoneAudio.currentTime = 0;
            const p = this.ringtoneAudio.play();
            if (p !== undefined) {
              p.then(() => {
                this.ringPending = false;
              }).catch(e => {
                console.warn('Ringtone autoplay blocked by browser policy, queuing for user gesture:', e);
                this.setupRingtoneAutoplayUnlock();
                this._playSynthRing();
              });
            }
          } catch (e) {
            this.setupRingtoneAutoplayUnlock();
            this._playSynthRing();
          }
        } else {
          this._playSynthRing();
        }
      },

      setupRingtoneAutoplayUnlock() {
        if (this._ringUnlockAttached) return;
        this._ringUnlockAttached = true;
        const cleanup = () => {
          window.removeEventListener('pointerdown', unlockRing);
          window.removeEventListener('click', unlockRing);
          window.removeEventListener('touchstart', unlockRing);
          window.removeEventListener('keydown', unlockRing);
          this._ringUnlockAttached = false;
        };
        const unlockRing = (e) => {
          if (!this.ringPending || currentSimScenario !== 'llamada' || this.isMuted) {
            this.ringPending = false;
            cleanup();
            return;
          }
          if (e && e.target && (e.target.closest('.call-btn') || e.target.closest('.active-call-hangup-btn'))) {
            return;
          }
          this.initRingtone();
          if (this.ringtoneAudio) {
            this.ringtoneAudio.play().then(() => {
              this.ringPending = false;
            }).catch(() => {});
          }
          cleanup();
        };
        window.addEventListener('pointerdown', unlockRing);
        window.addEventListener('click', unlockRing);
        window.addEventListener('touchstart', unlockRing);
        window.addEventListener('keydown', unlockRing);
      },

      stopRing() {
        this.ringPending = false;
        if (this.ringtoneAudio) {
          try {
            this.ringtoneAudio.pause();
            this.ringtoneAudio.currentTime = 0;
          } catch (e) {}
        }
      },

      initCallActiveAudio() {
        if (!this.callActiveAudio) {
          try {
            this.callActiveAudio = new Audio('assets/audio/Inspector_Morfi_mp3.mp3');
            this.callActiveAudio.preload = 'auto';
            this.callActiveAudio.loop = true; // Sigue sonando mientras el usuario esté en la llamada
            this.callActiveAudio.volume = 0.25; // Nivel cómodo y audible
          } catch (e) {
            console.warn('Call active audio initialization error:', e);
          }
        }
      },

      playCallActive() {
        if (this.isMuted) return;
        this.stopRing(); // Asegurar corte del ringtone previo
        this.initCallActiveAudio();
        if (this.callActiveAudio) {
          try {
            this.callActiveAudio.volume = 0.25;
            this.callActiveAudio.currentTime = 0;
            const p = this.callActiveAudio.play();
            if (p !== undefined) {
              p.catch(e => {
                console.warn('Call active audio autoplay blocked:', e);
              });
            }
          } catch (e) {}
        }
      },

      stopCallActive() {
        if (this.callActiveAudio) {
          try {
            this.callActiveAudio.pause();
            this.callActiveAudio.currentTime = 0;
          } catch (e) {}
        }
      },

      _playSynthRing() {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [0, 0.18, 0.36].forEach(offset => {
          const o1 = ctx.createOscillator();
          const o2 = ctx.createOscillator();
          const g = ctx.createGain();
          o1.type = 'sine';
          o2.type = 'sine';
          o1.frequency.setValueAtTime(853, now + offset);
          o2.frequency.setValueAtTime(960, now + offset);
          g.gain.setValueAtTime(0.1, now + offset);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
          o1.connect(g);
          o2.connect(g);
          g.connect(ctx.destination);
          o1.start(now + offset);
          o2.start(now + offset);
          o1.stop(now + offset + 0.12);
          o2.stop(now + offset + 0.12);
        });
      }
    };
    window.soundManager = soundManager;

