import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Download, Upload, Zap, Volume2, Settings, Activity, Lock, Unlock, Copy, RotateCcw, Shuffle, PauseCircle, Headphones } from 'lucide-react';

// Core synthesis engine constants
const SQUARE = 0, SAWTOOTH = 1, SINE = 2, NOISE = 3;

class SynthParams {
  constructor() {
    this.wave_type = SQUARE;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.3;
    this.p_env_punch = 0;
    this.p_env_decay = 0.4;
    this.p_base_freq = 0.3;
    this.p_freq_limit = 0;
    this.p_freq_ramp = 0;
    this.p_freq_dramp = 0;
    this.p_vib_strength = 0;
    this.p_vib_speed = 0;
    this.p_arp_mod = 0;
    this.p_arp_speed = 0;
    this.p_duty = 0;
    this.p_duty_ramp = 0;
    this.p_repeat_speed = 0;
    this.p_pha_offset = 0;
    this.p_pha_ramp = 0;
    this.p_lpf_freq = 1;
    this.p_lpf_ramp = 0;
    this.p_lpf_resonance = 0;
    this.p_hpf_freq = 0;
    this.p_hpf_ramp = 0;
    // Enhanced features
    this.fm_freq = 0;
    this.fm_depth = 0;
    this.lfo_rate = 0;
    this.lfo_depth = 0;
    this.noise_type = 0; // 0=white, 1=pink, 2=brown
    this.sub_bass = 0;
    this.distortion = 0;
    this.chorus_rate = 0;
    this.chorus_depth = 0;
    this.reverb_size = 0;
    this.reverb_decay = 0;
    this.delay_time = 0;
    this.delay_feedback = 0;
    this.ring_mod_freq = 0;
    this.ring_mod_depth = 0;
    this.bit_crush = 0;
    this.sample_reduction = 0;
    this.sound_vol = 0.5;
    this.sample_rate = 44100;
    this.sample_size = 16;
    this.flanger_rate = 0;
    this.flanger_depth = 0;
    this.flanger_delay = 0.5; // a default value
  }

  // validate all
  validate() {
    for (const key in this) {
      if (typeof this[key] === 'number' && (isNaN(this[key]) || !isFinite(this[key]))) {
        console.warn(`Invalid parameter ${key}: ${this[key]}, setting to 0`);
        this[key] = 0;
      }
    }
    return this;
  }

  // Preset methods
  pickupCoin() {
    this.reset();
    this.wave_type = SAWTOOTH;
    this.p_base_freq = 0.4 + Math.random() * 0.5;
    this.p_env_attack = 0;
    this.p_env_sustain = Math.random() * 0.1;
    this.p_env_decay = 0.1 + Math.random() * 0.4;
    this.p_env_punch = 0.3 + Math.random() * 0.3;
    if (Math.random() > 0.5) {
      this.p_arp_speed = 0.5 + Math.random() * 0.2;
      this.p_arp_mod = 0.2 + Math.random() * 0.4;
    }
    return this;
  }

  laserShoot() {
    this.reset();
    this.wave_type = Math.floor(Math.random() * 3);
    this.p_base_freq = 0.3 + Math.random() * 0.6;
    this.p_freq_ramp = -0.35 - Math.random() * 0.3;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + Math.random() * 0.2;
    this.p_env_decay = Math.random() * 0.4;
    this.p_hpf_freq = Math.random() * 0.3;
    this.distortion = Math.random() * 0.3;
    return this;
  }

  explosion() {
    this.reset();
    this.wave_type = NOISE;
    this.noise_type = 0;
    this.p_base_freq = Math.pow(0.1 + Math.random() * 0.4, 2);
    this.p_freq_ramp = -0.1 + Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + Math.random() * 0.3;
    this.p_env_decay = Math.random() * 0.5;
    this.p_env_punch = 0.2 + Math.random() * 0.6;
    this.distortion = 0.2 + Math.random() * 0.5;
    this.reverb_size = Math.random() * 0.4;
    if (Math.random() > 0.5) {
      this.p_pha_offset = -0.3 + Math.random() * 0.9;
      this.p_pha_ramp = -Math.random() * 0.3;
    }
    return this;
  }

  powerUp() {
    this.reset();
    this.wave_type = Math.random() > 0.5 ? SAWTOOTH : SQUARE;
    this.p_base_freq = 0.2 + Math.random() * 0.3;
    this.p_freq_ramp = 0.1 + Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = Math.random() * 0.4;
    this.p_env_decay = 0.1 + Math.random() * 0.4;
    this.chorus_rate = Math.random() * 0.3;
    this.chorus_depth = Math.random() * 0.2;
    return this;
  }

  hitHurt() {
    this.reset();
    this.wave_type = Math.floor(Math.random() * 3);
    if (this.wave_type === SINE) this.wave_type = NOISE;
    this.p_base_freq = 0.2 + Math.random() * 0.6;
    this.p_freq_ramp = -0.3 - Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = Math.random() * 0.1;
    this.p_env_decay = 0.1 + Math.random() * 0.2;
    if (Math.random() > 0.5) this.p_hpf_freq = Math.random() * 0.3;
    this.distortion = Math.random() * 0.4;
    return this;
  }

  jump() {
    this.reset();
    this.wave_type = SQUARE;
    this.p_duty = Math.random() * 0.6;
    this.p_base_freq = 0.3 + Math.random() * 0.3;
    this.p_freq_ramp = 0.1 + Math.random() * 0.2;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + Math.random() * 0.3;
    this.p_env_decay = 0.1 + Math.random() * 0.2;
    if (Math.random() > 0.5) this.p_hpf_freq = Math.random() * 0.3;
    if (Math.random() > 0.5) this.p_lpf_freq = 1 - Math.random() * 0.6;
    return this;
  }

  ambient() {
    this.reset();
    this.wave_type = SINE;
    this.p_base_freq = 0.1 + Math.random() * 0.3;
    this.p_env_attack = 0.3 + Math.random() * 0.5;
    this.p_env_sustain = 0.5 + Math.random() * 0.5;
    this.p_env_decay = 0.3 + Math.random() * 0.7;
    this.fm_freq = Math.random() * 0.3;
    this.fm_depth = Math.random() * 0.4;
    this.reverb_size = 0.6 + Math.random() * 0.4;
    this.reverb_decay = 0.5 + Math.random() * 0.5;
    this.p_lpf_freq = 0.3 + Math.random() * 0.4;
    return this;
  }

  bell() {
    this.reset();
    this.wave_type = SINE;
    this.p_base_freq = 0.5 + Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1;
    this.p_env_decay = 0.6 + Math.random() * 0.4;
    this.fm_freq = 0.8 + Math.random() * 0.2;
    this.fm_depth = 0.3 + Math.random() * 0.4;
    this.reverb_size = 0.3 + Math.random() * 0.3;
    return this;
  }

  bass() {
    this.reset();
    this.wave_type = SAWTOOTH;
    this.p_base_freq = 0.05 + Math.random() * 0.15;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.3 + Math.random() * 0.4;
    this.p_env_decay = 0.2 + Math.random() * 0.3;
    this.sub_bass = 0.4 + Math.random() * 0.6;
    this.p_lpf_freq = 0.2 + Math.random() * 0.3;
    this.distortion = Math.random() * 0.2;
    return this;
  }

  lead() {
    this.reset();
    this.wave_type = SAWTOOTH;
    this.p_base_freq = 0.4 + Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.4 + Math.random() * 0.4;
    this.p_env_decay = 0.2 + Math.random() * 0.3;
    this.p_vib_speed = 0.2 + Math.random() * 0.3;
    this.p_vib_strength = 0.1 + Math.random() * 0.2;
    this.chorus_rate = Math.random() * 0.2;
    this.delay_time = Math.random() * 0.3;
    return this;
  }

  random() {
    this.reset();
    this.wave_type = Math.floor(Math.random() * 4);
    this.p_base_freq = Math.pow(Math.random(), 2);
    this.p_freq_ramp = Math.pow(Math.random() * 2 - 1, 5);
    this.p_env_attack = Math.pow(Math.random() * 2 - 1, 3);
    this.p_env_sustain = Math.pow(Math.random() * 2 - 1, 2);
    this.p_env_decay = Math.random() * 2 - 1;
    this.p_env_punch = Math.pow(Math.random() * 0.8, 2);
    this.p_duty = Math.random() * 2 - 1;
    this.p_duty_ramp = Math.pow(Math.random() * 2 - 1, 3);
    this.p_vib_strength = Math.pow(Math.random() * 2 - 1, 3);
    this.p_vib_speed = Math.random() * 2 - 1;
    this.p_arp_mod = Math.random() * 2 - 1;
    this.p_arp_speed = Math.random() * 2 - 1;
    this.p_lpf_freq = 1 - Math.pow(Math.random(), 3);
    this.p_lpf_ramp = Math.pow(Math.random() * 2 - 1, 3);
    this.p_hpf_freq = Math.pow(Math.random(), 5);
    this.p_hpf_ramp = Math.pow(Math.random() * 2 - 1, 5);
    this.distortion = Math.random() * 0.4;
    this.reverb_size = Math.random() * 0.5;
    return this;
  }

  reset() {
    Object.assign(this, new SynthParams());
    return this;
  }

  clone() {
    const clone = new SynthParams();
    Object.assign(clone, this);
    return clone;
  }

  morphTo(target, amount) {
    const result = this.clone();
    for (const key in result) {
      if (typeof result[key] === 'number' && typeof target[key] === 'number') {
        result[key] = result[key] + (target[key] - result[key]) * amount;
      }
    }
    return result;
  }
}

// Enhanced audio synthesis engine
class AudioSynthesizer {
  constructor() {
    console.log('AudioSynthesizer constructor called');
    this.audioContext = null;
    this.masterGain = null;
    // this.initAudio();
  }

  async initAudio() {
    try {
      console.log('Initializing audio context...');
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio context created:', this.audioContext);
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.isInitialized = true;
      console.log('Audio initialization complete');
    } catch (e) {
      console.error('Audio initialization failed:', e);
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initAudio();
    }
  }

  generateNoise(type, length) {
    const noise = new Float32Array(length);
    let b0 = 0, b1 = 0, b2 = 0, b6 = 0;
    
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      
      switch (type) {
        case 0: // White noise
          noise[i] = white;
          break;
        case 1: // Pink noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          noise[i] = b0 + b1 + b2 + white * 0.3104856;
          break;
        case 2: // Brown noise
          b6 = (b6 + white * 0.02) * 0.996;
          noise[i] = b6 * 3.5;
          break;
        default:
          noise[i] = white;
          break;
      }
    }
    return noise;
  }

  applyDistortion(sample, amount) {
    if (amount <= 0) return sample;
    const drive = 1 + amount * 10;
    return Math.tanh(sample * drive) / drive;
  }

  applyBitCrush(sample, amount) {
    if (amount <= 0) return sample;
    const bits = Math.floor(16 - amount * 15);
    const levels = Math.pow(2, bits);
    return Math.floor(sample * levels) / levels;
  }

  async generateBuffer(params, duration = 1.0) {
    console.log('generateBuffer called with:', { params, duration });
    
    await this.ensureInitialized();
    
    if (!this.audioContext || !this.isInitialized) {
      console.warn('Audio context not available or not initialized');
      return null;
    }

    try {
      // Validate and sanitize parameters
      if (!params) {
        console.warn('No parameters provided, using defaults');
        params = new SynthParams();
      }
      
      // Create safe parameters with fallbacks
      console.log('Creating safe parameters...');
      const safeParams = {
        wave_type: Math.max(0, Math.min(3, Math.floor(params.wave_type || 0))),
        p_env_attack: Math.max(0, Math.min(3, params.p_env_attack || 0)),
        p_env_sustain: Math.max(0, Math.min(3, params.p_env_sustain || 0.3)),
        p_env_decay: Math.max(0, Math.min(3, params.p_env_decay || 0.4)),
        p_env_punch: Math.max(0, Math.min(3, params.p_env_punch || 0)),
        p_base_freq: Math.max(0.001, Math.min(2, params.p_base_freq || 0.3)),
        p_freq_limit: Math.max(0, Math.min(1, params.p_freq_limit || 0)),
        p_freq_ramp: Math.max(-1, Math.min(1, params.p_freq_ramp || 0)),
        p_freq_dramp: Math.max(-1, Math.min(1, params.p_freq_dramp || 0)),
        p_vib_strength: Math.max(0, Math.min(1, params.p_vib_strength || 0)),
        p_vib_speed: Math.max(0, Math.min(1, params.p_vib_speed || 0)),
        p_arp_mod: Math.max(-1, Math.min(1, params.p_arp_mod || 0)),
        p_arp_speed: Math.max(0, Math.min(1, params.p_arp_speed || 0)),
        p_duty: Math.max(-1, Math.min(1, params.p_duty || 0)),
        p_duty_ramp: Math.max(-1, Math.min(1, params.p_duty_ramp || 0)),
        p_repeat_speed: Math.max(0, Math.min(1, params.p_repeat_speed || 0)),
        p_pha_offset: Math.max(-1, Math.min(1, params.p_pha_offset || 0)),
        p_pha_ramp: Math.max(-1, Math.min(1, params.p_pha_ramp || 0)),
        p_lpf_freq: Math.max(0, Math.min(1, params.p_lpf_freq || 1)),
        p_lpf_ramp: Math.max(-1, Math.min(1, params.p_lpf_ramp || 0)),
        p_lpf_resonance: Math.max(0, Math.min(1, params.p_lpf_resonance || 0)),
        p_hpf_freq: Math.max(0, Math.min(1, params.p_hpf_freq || 0)),
        p_hpf_ramp: Math.max(-1, Math.min(1, params.p_hpf_ramp || 0)),
        fm_freq: Math.max(0, Math.min(1, params.fm_freq || 0)),
        fm_depth: Math.max(0, Math.min(1, params.fm_depth || 0)),
        lfo_rate: Math.max(0, Math.min(1, params.lfo_rate || 0)),
        lfo_depth: Math.max(0, Math.min(1, params.lfo_depth || 0)),
        noise_type: Math.max(0, Math.min(2, Math.floor(params.noise_type || 0))),
        sub_bass: Math.max(0, Math.min(1, params.sub_bass || 0)),
        distortion: Math.max(0, Math.min(1, params.distortion || 0)),
        chorus_rate: Math.max(0, Math.min(1, params.chorus_rate || 0)),
        chorus_depth: Math.max(0, Math.min(1, params.chorus_depth || 0)),
        reverb_size: Math.max(0, Math.min(1, params.reverb_size || 0)),
        reverb_decay: Math.max(0, Math.min(1, params.reverb_decay || 0)),
        delay_time: Math.max(0, Math.min(1, params.delay_time || 0)),
        delay_feedback: Math.max(0, Math.min(1, params.delay_feedback || 0)),
        ring_mod_freq: Math.max(0, Math.min(1, params.ring_mod_freq || 0)),
        ring_mod_depth: Math.max(0, Math.min(1, params.ring_mod_depth || 0)),
        bit_crush: Math.max(0, Math.min(1, params.bit_crush || 0)),
        sample_reduction: Math.max(0, Math.min(1, params.sample_reduction || 0)),
        sound_vol: Math.max(0, Math.min(1, params.sound_vol || 0.5)),
        flanger_rate: Math.max(0, Math.min(1, params.flanger_rate || 0)),
        flanger_depth: Math.max(0, Math.min(1, params.flanger_depth || 0)),
        flanger_delay: Math.max(0.1, Math.min(1, params.flanger_delay || 0.5))
      };

      const sampleRate = this.audioContext.sampleRate;
      const safeDuration = Math.max(0.1, Math.min(10, duration));
      const length = Math.floor(sampleRate * safeDuration);

      console.log('Buffer details:', { sampleRate, safeDuration, length });
      
      if (length <= 0 || length > sampleRate * 10) {
        console.error('Invalid buffer length:', length);
        return null;
      }
      
      console.log('Creating audio buffer...');
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      console.log('Audio buffer created, starting synthesis...');

      let phase = 0, subPhase = 0, fmPhase = 0;
      let frequency = safeParams.p_base_freq * 440;
      let envelope = 1;
      let dutyCycle = Math.max(0.01, Math.min(0.99, 0.5 - safeParams.p_duty * 0.5));
      let arpTime = 0;
      let arpValue = 1;
      
      // Pre-generate noise if needed
      let noise = null;
      if (safeParams.wave_type === NOISE) {
        try {
          console.log('Generating noise...');
          noise = this.generateNoise(safeParams.noise_type, length);
          console.log('Noise generated successfully');
        } catch (e) {
          console.warn('Noise generation failed:', e);
          noise = new Float32Array(length).fill(0);
        }
      }

      console.log('Starting sample generation loop...');

      // Effect state with safe initialization
      const maxDelaySize = Math.floor(sampleRate * 0.5);
      const delayBuffer = new Array(maxDelaySize).fill(0);
      let delayIndex = 0;
      
      const maxChorusSize = Math.floor(sampleRate * 0.02);
      const chorusDelay = new Array(maxChorusSize).fill(0);
      let chorusIndex = 0;
      
      const maxFlangerSize = Math.floor(sampleRate * 0.02);
      const flangerBuffer = new Array(maxFlangerSize).fill(0);
      let flangerIndex = 0;

      const attackSamples = Math.floor(safeParams.p_env_attack * sampleRate);
      const sustainSamples = Math.floor(safeParams.p_env_sustain * sampleRate);
      const decaySamples = Math.floor(safeParams.p_env_decay * sampleRate);

      for (let i = 0; i < length; i++) {
        try {
          const t = i / sampleRate;
          
          // Envelope calculation with bounds checking
          if (i < attackSamples) {
            envelope = attackSamples > 0 ? i / attackSamples : 1;
          } else if (i < attackSamples + sustainSamples) {
            const sustainProgress = sustainSamples > 0 ? (i - attackSamples) / sustainSamples : 0;
            envelope = 1 + (1 - sustainProgress) * 2 * safeParams.p_env_punch;
          } else if (i < attackSamples + sustainSamples + decaySamples) {
            const decayProgress = decaySamples > 0 ? (i - attackSamples - sustainSamples) / decaySamples : 1;
            envelope = Math.max(0, 1 - decayProgress);
          } else {
            envelope = 0;
          }

          // Arpeggiator with bounds checking
          if (safeParams.p_arp_speed > 0) {
            arpTime += safeParams.p_arp_speed * 50 / sampleRate;
            if (arpTime >= 1) {
              arpTime = 0;
              arpValue = 1 + safeParams.p_arp_mod * (Math.random() * 2 - 1);
            }
          }

          // Frequency modulation with bounds checking
          frequency += safeParams.p_freq_ramp * 10;
          frequency = Math.max(20, Math.min(20000, frequency));
          
          // Apply arpeggiator
          let currentFreq = frequency * Math.max(0.1, Math.min(10, arpValue));

          // FM synthesis
          if (safeParams.fm_depth > 0 && safeParams.fm_freq > 0) {
            fmPhase += (2 * Math.PI * safeParams.fm_freq * 50) / sampleRate;
            if (fmPhase > 2 * Math.PI) fmPhase -= 2 * Math.PI;
            const fmOsc = Math.sin(fmPhase);
            currentFreq += fmOsc * safeParams.fm_depth * 100;
          }

          // LFO modulation
          if (safeParams.lfo_depth > 0 && safeParams.lfo_rate > 0) {
            const lfo = Math.sin(2 * Math.PI * safeParams.lfo_rate * 5 * t);
            currentFreq += lfo * safeParams.lfo_depth * 50;
          }

          // Vibrato
          if (safeParams.p_vib_strength > 0 && safeParams.p_vib_speed > 0) {
            const vibrato = Math.sin(2 * Math.PI * safeParams.p_vib_speed * 50 * t);
            currentFreq += vibrato * safeParams.p_vib_strength * currentFreq * 0.1;
          }

          // Duty cycle modulation
          if (safeParams.p_duty_ramp !== 0) {
            dutyCycle += safeParams.p_duty_ramp * 0.0001;
            dutyCycle = Math.max(0.01, Math.min(0.99, dutyCycle));
          }

          // Waveform generation with bounds checking
          let sample = 0;
          currentFreq = Math.max(20, Math.min(20000, currentFreq));
          phase += (2 * Math.PI * currentFreq) / sampleRate;
          if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
          
          switch (safeParams.wave_type) {
            case SQUARE:
              sample = (phase / (2 * Math.PI)) < dutyCycle ? 1 : -1;
              break;
            case SAWTOOTH:
              sample = (phase / Math.PI) - 1;
              break;
            case SINE:
              sample = Math.sin(phase);
              break;
            case NOISE:
              sample = noise && noise[i] ? noise[i] : (Math.random() * 2 - 1);
              break;
            default:
              sample = Math.sin(phase);
              break;
          }

          // Clamp sample to prevent overflow
          sample = Math.max(-1, Math.min(1, sample));

          // Sub-bass oscillator
          if (safeParams.sub_bass > 0) {
            subPhase += (Math.PI * currentFreq) / sampleRate;
            if (subPhase > 2 * Math.PI) subPhase -= 2 * Math.PI;
            const subSample = Math.sin(subPhase);
            sample += subSample * safeParams.sub_bass * 0.5;
          }

          // Ring modulation
          if (safeParams.ring_mod_depth > 0 && safeParams.ring_mod_freq > 0) {
            const ringOsc = Math.sin(2 * Math.PI * safeParams.ring_mod_freq * 200 * t);
            sample *= (1 - safeParams.ring_mod_depth + safeParams.ring_mod_depth * ringOsc);
          }

          // Low-pass filter (simple)
          if (safeParams.p_lpf_freq < 1) {
            const cutoff = Math.max(0, Math.min(1, safeParams.p_lpf_freq));
            const prevSample = i > 0 ? data[i - 1] : 0;
            sample = sample * cutoff + (1 - cutoff) * prevSample;
          }

          // High-pass filter (simple)
          if (safeParams.p_hpf_freq > 0) {
            const prevSample = i > 0 ? data[i - 1] : 0;
            sample = sample - prevSample * Math.max(0, Math.min(1, safeParams.p_hpf_freq));
          }

          // Apply distortion
          if (safeParams.distortion > 0) {
            sample = this.applyDistortion(sample, safeParams.distortion);
          }

          // Apply bit crushing
          if (safeParams.bit_crush > 0) {
            sample = this.applyBitCrush(sample, safeParams.bit_crush);
          }

          // Chorus effect
          if (safeParams.chorus_rate > 0 && safeParams.chorus_depth > 0) {
            const chorusLfo = Math.sin(2 * Math.PI * safeParams.chorus_rate * 5 * t);
            const chorusDelayTime = Math.floor(0.01 * sampleRate + chorusLfo * 0.005 * sampleRate);
            const chorusDelayedIndex = (chorusIndex - Math.max(1, Math.min(maxChorusSize - 1, chorusDelayTime)) + maxChorusSize) % maxChorusSize;
            const chorused = chorusDelay[chorusDelayedIndex] || 0;
            sample += chorused * safeParams.chorus_depth * 0.3;
            chorusDelay[chorusIndex] = sample;
            chorusIndex = (chorusIndex + 1) % maxChorusSize;
          }

          // Delay effect
          if (safeParams.delay_time > 0) {
            const delayTimeInSamples = Math.floor(safeParams.delay_time * sampleRate * 0.3);
            const delayedIndex = (delayIndex - Math.max(1, Math.min(maxDelaySize - 1, delayTimeInSamples)) + maxDelaySize) % maxDelaySize;
            const delayed = delayBuffer[delayedIndex] || 0;
            sample += delayed * safeParams.delay_feedback * 0.5;
            delayBuffer[delayIndex] = sample;
            delayIndex = (delayIndex + 1) % maxDelaySize;
          }

          // Flanger effect
          if (safeParams.flanger_rate > 0 && safeParams.flanger_depth > 0) {
            const flangerLfo = Math.sin(2 * Math.PI * safeParams.flanger_rate * 1 * t);
            const baseDelay = Math.floor(safeParams.flanger_delay * 0.01 * sampleRate);
            const modDelay = Math.floor(flangerLfo * safeParams.flanger_depth * 0.005 * sampleRate);
            const totalDelay = Math.max(1, Math.min(maxFlangerSize - 1, baseDelay + modDelay));
            const flangerDelayedIndex = (flangerIndex - totalDelay + maxFlangerSize) % maxFlangerSize;
            const flanged = flangerBuffer[flangerDelayedIndex] || 0;
            sample += flanged * 0.3;
            flangerBuffer[flangerIndex] = sample;
            flangerIndex = (flangerIndex + 1) % maxFlangerSize;
          }

          // Final bounds checking and envelope application
          sample = Math.max(-1, Math.min(1, sample));
          envelope = Math.max(0, Math.min(1, envelope));
          
          // Apply envelope and volume
          const finalSample = sample * envelope * safeParams.sound_vol * 0.3;
          data[i] = Math.max(-1, Math.min(1, isNaN(finalSample) ? 0 : finalSample));
          
          // Log progress every 10000 samples to avoid spam
          if (i % 10000 === 0 && i > 0) {
            console.log(`Generated ${i}/${length} samples (${Math.round(i/length*100)}%)`);
          }

        } catch (sampleError) {
          console.error(`Error at sample ${i}:`, sampleError);
          data[i] = 0; // Safe fallback
        }
      }

      console.log('Buffer created successfully');
      return buffer;
    } catch (error) {
      console.error('Error in generateBuffer:', error);
      console.error('Error stack:', error.stack);
      console.error('Parameters:', params);
      console.error('Duration:', duration);
      return null;
    }
  }

  async playBuffer(buffer) {
    if (!this.audioContext || !buffer) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    source.start();
    return source;
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }
}

// Smooth parameter interpolation hook
const useSmoothParam = (targetValue, speed = 0.1) => {
  const [currentValue, setCurrentValue] = useState(targetValue || 0);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentValue(current => {
        const target = targetValue || 0;
        const diff = target - current;
        if (Math.abs(diff) < 0.001) return target;
        return current + diff * speed;
      });
    }, 16);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetValue, speed]);
  
  return currentValue;
};

// Enhanced waveform display
const WaveformDisplay = ({ audioBuffer, isPlaying, title = "Waveform" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = audioBuffer.getChannelData(0);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1f2937');
    gradient.addColorStop(1, '#111827');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Waveform with glow effect
    if (isPlaying) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
    }
    
    ctx.strokeStyle = isPlaying ? '#10b981' : '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const step = data.length / canvas.width;
    for (let i = 0; i < canvas.width; i++) {
      const sample = data[Math.floor(i * step)] || 0;
      const x = i;
      const y = (sample * canvas.height * 0.4) + (canvas.height / 2);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [audioBuffer, isPlaying]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-24 bg-gray-900 rounded border border-gray-700"
      />
    </div>
  );
};

// Spectrum analyzer
const SpectrumAnalyzer = ({ audioBuffer }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = audioBuffer.getChannelData(0);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const bins = 32;
    const binWidth = canvas.width / bins;
    
    for (let i = 0; i < bins; i++) {
      const start = Math.floor(i * data.length / bins);
      const end = Math.floor((i + 1) * data.length / bins);
      let sum = 0;
      
      for (let j = start; j < end; j++) {
        sum += Math.abs(data[j] || 0);
      }
      
      const height = Math.min((sum / (end - start)) * canvas.height * 2, canvas.height);
      
      // Gradient bars
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#ef4444');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(i * binWidth, canvas.height - height, binWidth - 1, height);
    }
  }, [audioBuffer]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-white">Spectrum</h3>
      <canvas
        ref={canvasRef}
        width={200}
        height={100}
        className="w-full h-20 bg-gray-900 rounded border border-gray-700"
      />
    </div>
  );
};

// Parameter slider
const ParamSlider = ({ 
  label, 
  value = 0, // Default value
  onChange, 
  min = 0, 
  max = 1, 
  step = 0.01, 
  locked = false, 
  onToggleLock,
  suggestion = null 
}) => {
  const smoothValue = useSmoothParam(value, 0.1);
  
  const handleChange = (e) => {
    try {
      const newValue = parseFloat(e.target.value);
      if (!locked && !isNaN(newValue) && isFinite(newValue)) {
        onChange(newValue);
      }
    } catch (error) {
      console.error('Error updating parameter:', error);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-white">{label}</label>
          {onToggleLock && (
            <button
              onClick={onToggleLock}
              className={`p-1 rounded ${locked ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-300`}
            >
              {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
          )}
        </div>
        <span className="text-xs text-gray-200 font-mono bg-gray-800 px-2 py-1 rounded">
          {(smoothValue || 0).toFixed(3)}
        </span>
      </div>
      
      {suggestion && (
        <div className="text-xs text-blue-400 italic">{suggestion}</div>
      )}
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={handleChange}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${
          locked ? 'opacity-50 cursor-not-allowed' : ''
        } slider`}
      />
    </div>
  );
};

// WAV export utility
function audioBufferToWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const samples = audioBuffer.getChannelData(0);
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  let offset = 0;
  writeString(offset, 'RIFF'); offset += 4;
  view.setUint32(offset, buffer.byteLength - 8, true); offset += 4;
  writeString(offset, 'WAVE'); offset += 4;
  writeString(offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, format, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, bitDepth, true); offset += 2;
  writeString(offset, 'data'); offset += 4;
  view.setUint32(offset, samples.length * bytesPerSample, true); offset += 4;
  
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.floor(sample * 0x7FFF);
    view.setInt16(offset, intSample, true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

// Main component
export default function CompleteCrispFXR() {
  const [params, setParams] = useState(new SynthParams());
  const [paramsB, setParamsB] = useState(new SynthParams());
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioBufferB, setAudioBufferB] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [exportFormat, setExportFormat] = useState('wav');
  const [lockedParams, setLockedParams] = useState(new Set());
  const [activeSlot, setActiveSlot] = useState('A');
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [morphAmount, setMorphAmount] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Error boundary and logging
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      console.error('Error message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Line number:', event.lineno);
      console.error('Column number:', event.colno);
      console.error('Stack trace:', event.error?.stack);
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      console.error('Promise:', event.promise);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  const synthRef = useRef(null);

  // Initialize synth safely
  useEffect(() => {
    const initSynth = async () => {
      try {
        console.log('Creating AudioSynthesizer...');
        const synth = new AudioSynthesizer();
        await synth.initAudio(); // Wait for audio context to initialize
        synthRef.current = synth;
        console.log('AudioSynthesizer created and initialized successfully');
      } catch (error) {
        console.error('Failed to create AudioSynthesizer:', error);
      }
    };
    
    initSynth();
  }, []);

  const loopIntervalRef = useRef(null);

  const updateParam = useCallback((param, value) => {
    if (lockedParams.has(param)) return;
    
    try {
      const setterFunction = activeSlot === 'A' ? setParams : setParamsB;
      setterFunction(prev => {
        const newParams = { ...prev };
        newParams[param] = value;
        
        // Save to history
        setHistory(hist => [...hist.slice(0, historyIndex + 1), newParams]);
        // We use a unique variable (prevIndex) for the updater argument.
        setHistoryIndex(prevIndex => prevIndex + 1);
        
        return newParams;
      });
    } catch (error) {
      console.error('Error updating parameter:', param, value, error);
    }
  }, [lockedParams, activeSlot, historyIndex]);

  const toggleParamLock = useCallback((param) => {
    setLockedParams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(param)) {
        newSet.delete(param);
      } else {
        newSet.add(param);
      }
      return newSet;
    });
  }, []);

  const generateSound = useCallback(async () => {
    try {
      console.log('generateSound called, activeSlot:', activeSlot);
      
      if (!synthRef.current) {
        console.error('synthRef.current is null');
        return;
      }
      
      let currentParams = activeSlot === 'A' ? params : paramsB;
      console.log('Current params:', currentParams);
      
      // Validate parameters first
      if (!currentParams) {
        console.warn('No currentParams, creating default');
        currentParams = new SynthParams();
      }
      
      // Create a validated copy
      let validatedParams = Object.assign(new SynthParams(), currentParams);
      if (validatedParams.validate) {
        validatedParams = validatedParams.validate();
      }
      
      // Apply morphing if enabled
      if (morphAmount > 0 && morphAmount < 1) {
        const sourceParams = activeSlot === 'A' ? params : paramsB;
        const targetParams = activeSlot === 'A' ? paramsB : params;
        
        if (sourceParams && targetParams) {
          console.log('Applying morphing, amount:', morphAmount);
          let sourceSynth = Object.assign(new SynthParams(), sourceParams);
          let targetSynth = Object.assign(new SynthParams(), targetParams);
          
          if (sourceSynth.validate) sourceSynth = sourceSynth.validate();
          if (targetSynth.validate) targetSynth = targetSynth.validate();
          
          validatedParams = sourceSynth.morphTo(targetSynth, morphAmount);
        }
      }
      
      console.log('About to generate buffer...');
      const buffer = await synthRef.current.generateBuffer(validatedParams, 1.5); // ADD AWAIT!
      console.log('Buffer generated:', buffer);
      
      if (activeSlot === 'A') {
        setAudioBuffer(buffer);
      } else {
        setAudioBufferB(buffer);
      }
    } catch (error) {
      console.error('Error generating sound:', error);
      console.error('Stack trace:', error.stack);
    }
  }, [params, paramsB, activeSlot, morphAmount]);

  const playSound = useCallback(async (slot = activeSlot) => {
    const buffer = slot === 'A' ? audioBuffer : audioBufferB;
    if (!buffer) return;
    
    setIsPlaying(true);
    await synthRef.current.playBuffer(buffer);
    setTimeout(() => setIsPlaying(false), 1500);
  }, [audioBuffer, audioBufferB, activeSlot]);

  const loadPreset = useCallback((presetName) => {
    const newParams = new SynthParams();
    newParams[presetName]();
    
    if (activeSlot === 'A') {
      setParams(newParams);
    } else {
      setParamsB(newParams);
    }
    
    // Save to history
    setHistory(hist => [...hist.slice(0, historyIndex + 1), newParams]);
    // Note we must use a unique variable (prevIndex)
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [activeSlot, historyIndex]);

  const copySlot = useCallback(() => {
    if (activeSlot === 'A') {
      setParamsB({ ...params });
    } else {
      setParams({ ...paramsB });
    }
  }, [params, paramsB, activeSlot]);

  const morphSlots = useCallback(() => {
    const sourceParams = activeSlot === 'A' ? params : paramsB;
    const targetParams = activeSlot === 'A' ? paramsB : params;
    
    // Create SynthParams instances to use the morphTo method
    const sourceSynth = Object.assign(new SynthParams(), sourceParams);
    const targetSynth = Object.assign(new SynthParams(), targetParams);
    const morphed = sourceSynth.morphTo(targetSynth, 0.5);
    
    if (activeSlot === 'A') {
      setParams(morphed);
    } else {
      setParamsB(morphed);
    }
  }, [params, paramsB, activeSlot]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousParams = history[historyIndex - 1];
      if (activeSlot === 'A') {
        setParams(previousParams);
      } else {
        setParamsB(previousParams);
      }
    }
  }, [history, historyIndex, activeSlot]);

  const toggleLoop = useCallback(() => {
    if (isLooping) {
      clearInterval(loopIntervalRef.current);
      setIsLooping(false);
    } else {
      setIsLooping(true);
      loopIntervalRef.current = setInterval(() => {
        playSound();
      }, 2000);
    }
  }, [isLooping, playSound]);

  // Waveform-specific suggestions
  const getParameterSuggestion = (param, waveType) => {
  const suggestions = {
      [SQUARE]: {
        p_duty: "Try 0.1-0.9 for different timbres",
        p_duty_ramp: "Sweep for filter-like effects"
      },
      [SINE]: {
        fm_freq: "Add harmonics with FM",
        p_vib_speed: "Natural vibrato at 4-6Hz"
      },
      [NOISE]: {
        p_lpf_freq: "Essential for shaping noise",
        p_hpf_freq: "Remove unwanted low-end"
      }
    };
    
    return suggestions[waveType]?.[param] || null;
  };

  const exportSound = useCallback(() => {
    const buffer = activeSlot === 'A' ? audioBuffer : audioBufferB;
    const currentParams = activeSlot === 'A' ? params : paramsB;
    
    if (!buffer) return;
    
    if (exportFormat === 'wav') {
      const wavBlob = audioBufferToWav(buffer);
      downloadBlob(wavBlob, `crispfxr-sound-${activeSlot}-${Date.now()}.wav`);
    } else if (exportFormat === 'json') {
      const jsonData = JSON.stringify(currentParams, null, 2);
      const jsonBlob = new Blob([jsonData], { type: 'application/json' });
      downloadBlob(jsonBlob, `crispfxr-preset-${activeSlot}-${Date.now()}.json`);
    }
  }, [audioBuffer, audioBufferB, exportFormat, params, paramsB, activeSlot]);

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importPreset = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preset = JSON.parse(e.target.result);
        if (activeSlot === 'A') {
          setParams(preset);
        } else {
          setParamsB(preset);
        }
      } catch (error) {
        alert('Invalid preset file');
      }
    };
    reader.readAsText(file);
  }, [activeSlot]);

  // Update master volume
  useEffect(() => {
    // guard clause to ensure the synth is initialized.
    if (synthRef.current) {
      synthRef.current.setMasterVolume(masterVolume);
    }
  }, [masterVolume]);

  // Generate sound when parameters change
  useEffect(() => {
    const timeoutId = setTimeout(generateSound, 100);
    return () => clearTimeout(timeoutId);
  }, [generateSound]);

  // Cleanup loop on unmount
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          default:
            break;
        }
      } else {
        switch (e.key) {
          case ' ':
            e.preventDefault();
            playSound();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
            const presetIndex = parseInt(e.key) - 1;
            const presetNames = ['pickupCoin', 'laserShoot', 'explosion', 'powerUp', 'hitHurt', 'jump', 'ambient', 'random'];
            if (presetNames[presetIndex]) {
              loadPreset(presetNames[presetIndex]);
            }
            break;
          case 'a':
            setActiveSlot('A');
            break;
          case 'b':
            setActiveSlot('B');
            break;
          case 'l':
            toggleLoop();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, playSound, loadPreset, toggleLoop]);

  const currentParams = activeSlot === 'A' ? params : paramsB;
  const currentBuffer = activeSlot === 'A' ? audioBuffer : audioBufferB;

  const presets = [
    { name: 'pickupCoin', label: 'Pickup (1)', color: 'bg-yellow-600' },
    { name: 'laserShoot', label: 'Laser (2)', color: 'bg-red-600' },
    { name: 'explosion', label: 'Explosion (3)', color: 'bg-orange-600' },
    { name: 'powerUp', label: 'PowerUp (4)', color: 'bg-green-600' },
    { name: 'hitHurt', label: 'Hit (5)', color: 'bg-purple-600' },
    { name: 'jump', label: 'Jump (6)', color: 'bg-blue-600' },
    { name: 'ambient', label: 'Ambient (7)', color: 'bg-teal-600' },
    { name: 'random', label: 'Random (8)', color: 'bg-gray-600' }
  ];

  const waveTypes = ['Square', 'Sawtooth', 'Sine', 'Noise'];
  const noiseTypes = ['White', 'Pink', 'Brown'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            CrispFXR
          </h1>
          <p className="text-gray-400 text-lg">Advanced 8-bit Sound Synthesizer</p>
          <p className="text-gray-500 text-sm mt-2">
            Shortcuts: A/B (slots), 1-8 (presets), Space (play), Ctrl+Z (undo), L (loop)
          </p>
          
          {/* Master Controls */}
          <div className="flex justify-center items-center gap-6 mt-6 mb-4">
            {/* Master Volume */}
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-20 slider"
              />
              <span className="text-xs text-white bg-gray-800 px-2 py-1 rounded w-12 text-center">{Math.round(masterVolume * 100)}%</span>
            </div>

            {/* A/B Slot Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSlot('A')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSlot === 'A' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Slot A
              </button>
              <button
                onClick={copySlot}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                title="Copy to other slot"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={morphSlots}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                title="Morph slots"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSlot('B')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSlot === 'B' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Slot B
              </button>
            </div>

            {/* Morph Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-800">Morph:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={morphAmount}
                onChange={(e) => setMorphAmount(parseFloat(e.target.value))}
                className="w-20 slider"
              />
              <span className="text-xs text-white bg-gray-800 px-2 py-1 rounded w-12 text-center">{Math.round(morphAmount * 100)}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => playSound('A')}
              disabled={!audioBuffer}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 font-semibold"
            >
              <Play className="w-5 h-5" />
              Play A
            </button>
            
            <button
              onClick={() => playSound('B')}
              disabled={!audioBufferB}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-400 rounded-lg transition-colors flex items-center gap-2 font-semibold text-white"
            >
              <Play className="w-5 h-5" />
              Play B
            </button>

            <button
              onClick={toggleLoop}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold ${
                isLooping ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isLooping ? <PauseCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isLooping ? 'Stop Loop' : 'Loop'}
            </button>

            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-5 h-5" />
              Undo
            </button>
            
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="wav">WAV Audio</option>
                <option value="json">JSON Preset</option>
              </select>
              <button
                onClick={exportSound}
                disabled={!currentBuffer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                <Download className="w-5 h-5" />
                Export {activeSlot}
              </button>
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importPreset}
                className="hidden"
                id="preset-import"
              />
              <label
                htmlFor="preset-import"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 font-semibold cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Import
              </label>
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <WaveformDisplay 
              audioBuffer={audioBuffer} 
              isPlaying={isPlaying && activeSlot === 'A'} 
              title="Waveform A"
            />
          </div>

          <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <WaveformDisplay 
              audioBuffer={audioBufferB} 
              isPlaying={isPlaying && activeSlot === 'B'} 
              title="Waveform B"
            />
          </div>

          <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <SpectrumAnalyzer audioBuffer={currentBuffer} />
          </div>
        </div>

        {/* Presets */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Sound Presets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset.name)}
                className={`p-4 ${preset.color} hover:opacity-80 rounded-lg transition-all transform hover:scale-105 text-sm font-semibold shadow-lg`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter Controls */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic', icon: Settings },
              { id: 'envelope', label: 'Envelope', icon: Activity },
              { id: 'effects', label: 'Effects', icon: Zap },
              { id: 'advanced', label: 'Advanced', icon: Volume2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Parameter Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'basic' && (
              <>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-blue-300">Waveform Type</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {waveTypes.map((wave, idx) => (
                      <label key={wave} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={currentParams.wave_type === idx}
                          onChange={() => updateParam('wave_type', idx)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-white">{wave}</span>
                      </label>
                    ))}
                  </div>
                  
                  {currentParams.wave_type === NOISE && (
                    <>
                      <h4 className="font-semibold mb-3 text-purple-400">Noise Type</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {noiseTypes.map((noise, idx) => (
                          <label key={noise} className="flex items-center gap-1 cursor-pointer text-xs">
                            <input
                              type="radio"
                              checked={currentParams.noise_type === idx}
                              onChange={() => updateParam('noise_type', idx)}
                              className="text-purple-600"
                            />
                            <span className="text-white">{noise}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <ParamSlider
                  label="Base Frequency"
                  value={currentParams.p_base_freq}
                  onChange={(v) => updateParam('p_base_freq', v)}
                  locked={lockedParams.has('p_base_freq')}
                  onToggleLock={() => toggleParamLock('p_base_freq')}
                  suggestion={getParameterSuggestion('p_base_freq', currentParams.wave_type)}
                />
                <ParamSlider
                  label="Frequency Ramp"
                  value={currentParams.p_freq_ramp}
                  onChange={(v) => updateParam('p_freq_ramp', v)}
                  min={-1}
                  max={1}
                  locked={lockedParams.has('p_freq_ramp')}
                  onToggleLock={() => toggleParamLock('p_freq_ramp')}
                />
                {currentParams.wave_type === SQUARE && (
                  <>
                    <ParamSlider
                      label="Duty Cycle"
                      value={currentParams.p_duty}
                      onChange={(v) => updateParam('p_duty', v)}
                      min={-1}
                      max={1}
                      locked={lockedParams.has('p_duty')}
                      onToggleLock={() => toggleParamLock('p_duty')}
                      suggestion={getParameterSuggestion('p_duty', currentParams.wave_type)}
                    />
                    <ParamSlider
                      label="Duty Ramp"
                      value={currentParams.p_duty_ramp}
                      onChange={(v) => updateParam('p_duty_ramp', v)}
                      min={-1}
                      max={1}
                      locked={lockedParams.has('p_duty_ramp')}
                      onToggleLock={() => toggleParamLock('p_duty_ramp')}
                      suggestion={getParameterSuggestion('p_duty_ramp', currentParams.wave_type)}
                    />
                  </>
                )}
                <ParamSlider
                  label="Sub-Bass"
                  value={currentParams.sub_bass}
                  onChange={(v) => updateParam('sub_bass', v)}
                  locked={lockedParams.has('sub_bass')}
                  onToggleLock={() => toggleParamLock('sub_bass')}
                />
                <ParamSlider
                  label="Arpeggiation"
                  value={currentParams.p_arp_mod}
                  onChange={(v) => updateParam('p_arp_mod', v)}
                  min={-1}
                  max={1}
                  locked={lockedParams.has('p_arp_mod')}
                  onToggleLock={() => toggleParamLock('p_arp_mod')}
                />
              </>
            )}

            {activeTab === 'envelope' && (
              <>
                <ParamSlider
                  label="Attack Time"
                  value={currentParams.p_env_attack}
                  onChange={(v) => updateParam('p_env_attack', v)}
                  locked={lockedParams.has('p_env_attack')}
                  onToggleLock={() => toggleParamLock('p_env_attack')}
                />
                <ParamSlider
                  label="Sustain Time"
                  value={currentParams.p_env_sustain}
                  onChange={(v) => updateParam('p_env_sustain', v)}
                  locked={lockedParams.has('p_env_sustain')}
                  onToggleLock={() => toggleParamLock('p_env_sustain')}
                />
                <ParamSlider
                  label="Decay Time"
                  value={currentParams.p_env_decay}
                  onChange={(v) => updateParam('p_env_decay', v)}
                  locked={lockedParams.has('p_env_decay')}
                  onToggleLock={() => toggleParamLock('p_env_decay')}
                />
                <ParamSlider
                  label="Sustain Punch"
                  value={currentParams.p_env_punch}
                  onChange={(v) => updateParam('p_env_punch', v)}
                  locked={lockedParams.has('p_env_punch')}
                  onToggleLock={() => toggleParamLock('p_env_punch')}
                />
                <ParamSlider
                  label="Vibrato Speed"
                  value={currentParams.p_vib_speed}
                  onChange={(v) => updateParam('p_vib_speed', v)}
                  locked={lockedParams.has('p_vib_speed')}
                  onToggleLock={() => toggleParamLock('p_vib_speed')}
                  suggestion={getParameterSuggestion('p_vib_speed', currentParams.wave_type)}
                />
                <ParamSlider
                  label="Vibrato Strength"
                  value={currentParams.p_vib_strength}
                  onChange={(v) => updateParam('p_vib_strength', v)}
                  locked={lockedParams.has('p_vib_strength')}
                  onToggleLock={() => toggleParamLock('p_vib_strength')}
                />
              </>
            )}

            {activeTab === 'effects' && (
              <>
                <ParamSlider
                  label="Distortion"
                  value={currentParams.distortion}
                  onChange={(v) => updateParam('distortion', v)}
                  locked={lockedParams.has('distortion')}
                  onToggleLock={() => toggleParamLock('distortion')}
                />
                <ParamSlider
                  label="Bit Crush"
                  value={currentParams.bit_crush}
                  onChange={(v) => updateParam('bit_crush', v)}
                  locked={lockedParams.has('bit_crush')}
                  onToggleLock={() => toggleParamLock('bit_crush')}
                />
                <ParamSlider
                  label="Low-pass Filter"
                  value={currentParams.p_lpf_freq}
                  onChange={(v) => updateParam('p_lpf_freq', v)}
                  locked={lockedParams.has('p_lpf_freq')}
                  onToggleLock={() => toggleParamLock('p_lpf_freq')}
                  suggestion={getParameterSuggestion('p_lpf_freq', currentParams.wave_type)}
                />
                <ParamSlider
                  label="High-pass Filter"
                  value={currentParams.p_hpf_freq}
                  onChange={(v) => updateParam('p_hpf_freq', v)}
                  locked={lockedParams.has('p_hpf_freq')}
                  onToggleLock={() => toggleParamLock('p_hpf_freq')}
                  suggestion={getParameterSuggestion('p_hpf_freq', currentParams.wave_type)}
                />
                <ParamSlider
                  label="Chorus Rate"
                  value={currentParams.chorus_rate}
                  onChange={(v) => updateParam('chorus_rate', v)}
                  locked={lockedParams.has('chorus_rate')}
                  onToggleLock={() => toggleParamLock('chorus_rate')}
                />
                <ParamSlider
                  label="Delay Time"
                  value={currentParams.delay_time}
                  onChange={(v) => updateParam('delay_time', v)}
                  locked={lockedParams.has('delay_time')}
                  onToggleLock={() => toggleParamLock('delay_time')}
                />

                <ParamSlider
                  label="Flanger Rate"
                  value={currentParams.flanger_rate}
                  onChange={(v) => updateParam('flanger_rate', v)}
                  locked={lockedParams.has('flanger_rate')}
                  onToggleLock={() => toggleParamLock('flanger_rate')}
                />
                <ParamSlider
                  label="Flanger Depth"
                  value={currentParams.flanger_depth}
                  onChange={(v) => updateParam('flanger_depth', v)}
                  locked={lockedParams.has('flanger_depth')}
                  onToggleLock={() => toggleParamLock('flanger_depth')}
                />
                <ParamSlider
                  label="Flanger Delay"
                  value={currentParams.flanger_delay}
                  onChange={(v) => updateParam('flanger_delay', v)}
                  locked={lockedParams.has('flanger_delay')}
                  onToggleLock={() => toggleParamLock('flanger_delay')}
                />
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <ParamSlider
                  label="FM Frequency"
                  value={currentParams.fm_freq}
                  onChange={(v) => updateParam('fm_freq', v)}
                  locked={lockedParams.has('fm_freq')}
                  onToggleLock={() => toggleParamLock('fm_freq')}
                  suggestion={getParameterSuggestion('fm_freq', currentParams.wave_type)}
                />
                <ParamSlider
                  label="FM Depth"
                  value={currentParams.fm_depth}
                  onChange={(v) => updateParam('fm_depth', v)}
                  locked={lockedParams.has('fm_depth')}
                  onToggleLock={() => toggleParamLock('fm_depth')}
                />
                <ParamSlider
                  label="Ring Mod Freq"
                  value={currentParams.ring_mod_freq}
                  onChange={(v) => updateParam('ring_mod_freq', v)}
                  locked={lockedParams.has('ring_mod_freq')}
                  onToggleLock={() => toggleParamLock('ring_mod_freq')}
                />
                <ParamSlider
                  label="Ring Mod Depth"
                  value={currentParams.ring_mod_depth}
                  onChange={(v) => updateParam('ring_mod_depth', v)}
                  locked={lockedParams.has('ring_mod_depth')}
                  onToggleLock={() => toggleParamLock('ring_mod_depth')}
                />
                <ParamSlider
                  label="Delay Feedback"
                  value={currentParams.delay_feedback}
                  onChange={(v) => updateParam('delay_feedback', v)}
                  locked={lockedParams.has('delay_feedback')}
                  onToggleLock={() => toggleParamLock('delay_feedback')}
                />
                <ParamSlider
                  label="Master Volume"
                  value={currentParams.sound_vol}
                  onChange={(v) => updateParam('sound_vol', v)}
                  locked={lockedParams.has('sound_vol')}
                  onToggleLock={() => toggleParamLock('sound_vol')}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .slider {
          background: linear-gradient(90deg, #374151 0%, #3b82f6 50%, #8b5cf6 100%);
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .text-white {
          color: #ffffff !important;
        }
        .text-gray-200 {
          color: #e5e7eb !important;
        }
        .text-gray-300 {
          color: #d1d5db !important;
        }
        .text-gray-400 {
          color: #9ca3af !important;
        }
        .text-gray-500 {
          color: #6b7280 !important;
        }
        .text-blue-300 {
          color: #93c5fd !important;
        }
        .text-purple-400 {
          color: #c084fc !important;
        }
        
        .bg-gray-900\\/50 {
          background-color: rgba(17, 24, 39, 0.8) !important;
        }
        .bg-gray-800\\/50 {
          background-color: rgba(31, 41, 55, 0.8) !important;
        }

        button {
          color: inherit !important;
        }
        
        .bg-emerald-600 {
          background-color: #059669 !important;
          color: white !important;
        }
        
        .disabled\\:bg-gray-700:disabled {
          background-color: #374151 !important;
          color: #9ca3af !important;
        }
        
        .bg-yellow-600 { background-color: #d97706 !important; }
        .bg-red-600 { background-color: #dc2626 !important; }
        .bg-orange-600 { background-color: #ea580c !important; }
        .bg-green-600 { background-color: #16a34a !important; }
        .bg-purple-600 { background-color: #9333ea !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-teal-600 { background-color: #0d9488 !important; }
        .bg-gray-600 { background-color: #4b5563 !important; }
      `}</style>
    </div>
  );
}
