import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Download, Upload, Zap, Volume2, Settings, Activity } from 'lucide-react';

// Core synthesis engine (preserved from original)
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
    // New parameters for advanced features
    this.fm_freq = 0;
    this.fm_depth = 0;
    this.lfo_rate = 0;
    this.lfo_depth = 0;
    this.reverb_wet = 0;
    this.delay_time = 0;
    this.delay_feedback = 0;
    this.sound_vol = 0.5;
    this.sample_rate = 44100;
    this.sample_size = 16;
  }

  pickupCoin() {
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
    this.wave_type = Math.floor(Math.random() * 3);
    this.p_base_freq = 0.3 + Math.random() * 0.6;
    this.p_freq_ramp = -0.35 - Math.random() * 0.3;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + Math.random() * 0.2;
    this.p_env_decay = Math.random() * 0.4;
    this.p_hpf_freq = Math.random() * 0.3;
    return this;
  }

  explosion() {
    this.wave_type = NOISE;
    this.p_base_freq = Math.pow(0.1 + Math.random() * 0.4, 2);
    this.p_freq_ramp = -0.1 + Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + Math.random() * 0.3;
    this.p_env_decay = Math.random() * 0.5;
    this.p_env_punch = 0.2 + Math.random() * 0.6;
    if (Math.random() > 0.5) {
      this.p_pha_offset = -0.3 + Math.random() * 0.9;
      this.p_pha_ramp = -Math.random() * 0.3;
    }
    return this;
  }

  powerUp() {
    this.wave_type = Math.random() > 0.5 ? SAWTOOTH : SQUARE;
    this.p_base_freq = 0.2 + Math.random() * 0.3;
    this.p_freq_ramp = 0.1 + Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = Math.random() * 0.4;
    this.p_env_decay = 0.1 + Math.random() * 0.4;
    return this;
  }

  hitHurt() {
    this.wave_type = Math.floor(Math.random() * 3);
    if (this.wave_type === SINE) this.wave_type = NOISE;
    this.p_base_freq = 0.2 + Math.random() * 0.6;
    this.p_freq_ramp = -0.3 - Math.random() * 0.4;
    this.p_env_attack = 0;
    this.p_env_sustain = Math.random() * 0.1;
    this.p_env_decay = 0.1 + Math.random() * 0.2;
    if (Math.random() > 0.5) this.p_hpf_freq = Math.random() * 0.3;
    return this;
  }

  jump() {
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

  random() {
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
    return this;
  }
}

// Simplified audio synthesis engine
class AudioSynthesizer {
  constructor() {
    this.audioContext = null;
    this.initAudio();
  }

  async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  generateBuffer(params, duration = 1.0) {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let phase = 0;
    let frequency = params.p_base_freq * 440; // Convert to Hz
    let envelope = 1;
    let dutyCycle = 0.5 - params.p_duty * 0.5;

    const attackSamples = Math.floor(params.p_env_attack * sampleRate);
    const sustainSamples = Math.floor(params.p_env_sustain * sampleRate);
    const decaySamples = Math.floor(params.p_env_decay * sampleRate);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Envelope calculation
      if (i < attackSamples) {
        envelope = i / attackSamples;
      } else if (i < attackSamples + sustainSamples) {
        envelope = 1 + (1 - ((i - attackSamples) / sustainSamples)) * 2 * params.p_env_punch;
      } else if (i < attackSamples + sustainSamples + decaySamples) {
        const decayProgress = (i - attackSamples - sustainSamples) / decaySamples;
        envelope = Math.max(0, 1 - decayProgress);
      } else {
        envelope = 0;
      }

      // Frequency modulation
      frequency += params.p_freq_ramp * 10;
      frequency = Math.max(frequency, 20); // Prevent negative frequencies
      
      // FM synthesis
      if (params.fm_depth > 0) {
        const fmOsc = Math.sin(2 * Math.PI * params.fm_freq * 50 * t);
        frequency += fmOsc * params.fm_depth * 100;
      }

      // LFO modulation
      if (params.lfo_depth > 0) {
        const lfo = Math.sin(2 * Math.PI * params.lfo_rate * 5 * t);
        frequency += lfo * params.lfo_depth * 50;
      }

      // Vibrato
      if (params.p_vib_strength > 0) {
        const vibrato = Math.sin(2 * Math.PI * params.p_vib_speed * 50 * t);
        frequency += vibrato * params.p_vib_strength * frequency * 0.1;
      }

      // Waveform generation
      let sample = 0;
      phase += (2 * Math.PI * frequency) / sampleRate;
      if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
      
      switch (params.wave_type) {
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
          sample = Math.random() * 2 - 1;
          break;
        default:
          sample = Math.sin(phase);
          break;
      }

      // Apply envelope and volume
      data[i] = sample * envelope * params.sound_vol * 0.3; // Scale down to prevent clipping
    }

    return buffer;
  }

  async playBuffer(buffer) {
    if (!this.audioContext || !buffer) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
    return source;
  }
}

// Waveform visualization component
const WaveformDisplay = ({ audioBuffer, isPlaying }) => {
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

    // Waveform
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

  }, [audioBuffer, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={120}
      className="w-full h-24 bg-gray-900 rounded border border-gray-700"
    />
  );
};

// Spectrum analyzer component
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
    <canvas
      ref={canvasRef}
      width={200}
      height={100}
      className="w-full h-20 bg-gray-900 rounded border border-gray-700"
    />
  );
};

// WAV file export utility
function audioBufferToWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const samples = audioBuffer.getChannelData(0);
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  
  // WAV header
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
  
  // Convert float32 samples to int16
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.floor(sample * 0x7FFF);
    view.setInt16(offset, intSample, true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

// Parameter slider component
const ParamSlider = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <span className="text-xs text-gray-400 font-mono">{value.toFixed(3)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
    />
  </div>
);

export default function ModernJSfxr() {
  const [params, setParams] = useState(new SynthParams());
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [exportFormat, setExportFormat] = useState('wav');
  const synthRef = useRef(new AudioSynthesizer());

  const updateParam = useCallback((param, value) => {
    setParams(prev => {
      const newParams = { ...prev };
      newParams[param] = value;
      return newParams;
    });
  }, []);

  const generateSound = useCallback(async () => {
    const buffer = synthRef.current.generateBuffer(params, 1.5);
    setAudioBuffer(buffer);
  }, [params]);

  const playSound = useCallback(async () => {
    if (!audioBuffer) return;
    
    setIsPlaying(true);
    await synthRef.current.playBuffer(audioBuffer);
    setTimeout(() => setIsPlaying(false), 1500);
  }, [audioBuffer]);

  const loadPreset = useCallback((presetName) => {
    const newParams = new SynthParams();
    newParams[presetName]();
    setParams(newParams);
  }, []);

  const exportSound = useCallback(() => {
    if (!audioBuffer) return;
    
    if (exportFormat === 'wav') {
      const wavBlob = audioBufferToWav(audioBuffer);
      downloadBlob(wavBlob, `fxr-sound-${Date.now()}.wav`);
    } else if (exportFormat === 'json') {
      const jsonData = JSON.stringify(params, null, 2);
      const jsonBlob = new Blob([jsonData], { type: 'application/json' });
      downloadBlob(jsonBlob, `fxr-preset-${Date.now()}.json`);
    }
  }, [audioBuffer, exportFormat, params]);

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
        setParams(preset);
      } catch (error) {
        alert('Invalid preset file');
      }
    };
    reader.readAsText(file);
  }, []);

  // Generate sound when parameters change
  useEffect(() => {
    const timeoutId = setTimeout(generateSound, 100);
    return () => clearTimeout(timeoutId);
  }, [generateSound]);

  const presets = [
    { name: 'pickupCoin', label: 'Pickup Coin', color: 'bg-yellow-500 text-black' },
    { name: 'laserShoot', label: 'Laser Shot', color: 'bg-red-600 text-white' },
    { name: 'explosion', label: 'Explosion', color: 'bg-orange-500 text-black' },
    { name: 'powerUp', label: 'Power Up', color: 'bg-green-600 text-white' },
    { name: 'hitHurt', label: 'Hit/Hurt', color: 'bg-purple-600 text-white' },
    { name: 'jump', label: 'Jump', color: 'bg-blue-600 text-white' },
    { name: 'random', label: 'Random', color: 'bg-gray-700 text-white' }
  ];

  const waveTypes = ['Square', 'Sawtooth', 'Sine', 'Noise'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            CrispFXR
          </h1>
          <p className="text-gray-400 text-lg">Advanced 8-bit Sound Synthesizer</p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={playSound}
              disabled={!audioBuffer}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 font-semibold"
            >
              <Play className="w-5 h-5" />
              Play Sound
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
                disabled={!audioBuffer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                <Download className="w-5 h-5" />
                Export
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
                Import Preset
              </label>
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Waveform Display */}
          <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Waveform
            </h3>
            <WaveformDisplay audioBuffer={audioBuffer} isPlaying={isPlaying} />
          </div>

          {/* Spectrum Analyzer */}
          <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4">Spectrum Analyzer</h3>
            <SpectrumAnalyzer audioBuffer={audioBuffer} />
          </div>
        </div>

        {/* Presets */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Sound Presets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
              { id: 'modulation', label: 'Modulation', icon: Volume2 },
              { id: 'effects', label: 'Effects', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
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
                  <h4 className="font-semibold mb-3 text-blue-400">Waveform Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {waveTypes.map((wave, idx) => (
                      <label key={wave} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={params.wave_type === idx}
                          onChange={() => updateParam('wave_type', idx)}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{wave}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <ParamSlider
                  label="Base Frequency"
                  value={params.p_base_freq}
                  onChange={(v) => updateParam('p_base_freq', v)}
                />
                <ParamSlider
                  label="Frequency Ramp"
                  value={params.p_freq_ramp}
                  onChange={(v) => updateParam('p_freq_ramp', v)}
                  min={-1}
                  max={1}
                />
                <ParamSlider
                  label="Duty Cycle"
                  value={params.p_duty}
                  onChange={(v) => updateParam('p_duty', v)}
                  min={-1}
                  max={1}
                />
                <ParamSlider
                  label="Duty Ramp"
                  value={params.p_duty_ramp}
                  onChange={(v) => updateParam('p_duty_ramp', v)}
                  min={-1}
                  max={1}
                />
                <ParamSlider
                  label="Arpeggiation"
                  value={params.p_arp_mod}
                  onChange={(v) => updateParam('p_arp_mod', v)}
                  min={-1}
                  max={1}
                />
              </>
            )}

            {activeTab === 'envelope' && (
              <>
                <ParamSlider
                  label="Attack Time"
                  value={params.p_env_attack}
                  onChange={(v) => updateParam('p_env_attack', v)}
                />
                <ParamSlider
                  label="Sustain Time"
                  value={params.p_env_sustain}
                  onChange={(v) => updateParam('p_env_sustain', v)}
                />
                <ParamSlider
                  label="Decay Time"
                  value={params.p_env_decay}
                  onChange={(v) => updateParam('p_env_decay', v)}
                />
                <ParamSlider
                  label="Sustain Punch"
                  value={params.p_env_punch}
                  onChange={(v) => updateParam('p_env_punch', v)}
                />
                <ParamSlider
                  label="Repeat Speed"
                  value={params.p_repeat_speed}
                  onChange={(v) => updateParam('p_repeat_speed', v)}
                />
              </>
            )}

            {activeTab === 'modulation' && (
              <>
                <ParamSlider
                  label="FM Frequency"
                  value={params.fm_freq}
                  onChange={(v) => updateParam('fm_freq', v)}
                />
                <ParamSlider
                  label="FM Depth"
                  value={params.fm_depth}
                  onChange={(v) => updateParam('fm_depth', v)}
                />
                <ParamSlider
                  label="LFO Rate"
                  value={params.lfo_rate}
                  onChange={(v) => updateParam('lfo_rate', v)}
                />
                <ParamSlider
                  label="LFO Depth"
                  value={params.lfo_depth}
                  onChange={(v) => updateParam('lfo_depth', v)}
                />
                <ParamSlider
                  label="Vibrato Speed"
                  value={params.p_vib_speed}
                  onChange={(v) => updateParam('p_vib_speed', v)}
                />
                <ParamSlider
                  label="Vibrato Strength"
                  value={params.p_vib_strength}
                  onChange={(v) => updateParam('p_vib_strength', v)}
                />
              </>
            )}

            {activeTab === 'effects' && (
              <>
                <ParamSlider
                  label="Low-pass Filter"
                  value={params.p_lpf_freq}
                  onChange={(v) => updateParam('p_lpf_freq', v)}
                />
                <ParamSlider
                  label="Low-pass Resonance"
                  value={params.p_lpf_resonance}
                  onChange={(v) => updateParam('p_lpf_resonance', v)}
                />
                <ParamSlider
                  label="High-pass Filter"
                  value={params.p_hpf_freq}
                  onChange={(v) => updateParam('p_hpf_freq', v)}
                />
                <ParamSlider
                  label="Phaser Offset"
                  value={params.p_pha_offset}
                  onChange={(v) => updateParam('p_pha_offset', v)}
                  min={-1}
                  max={1}
                />
                <ParamSlider
                  label="Phaser Sweep"
                  value={params.p_pha_ramp}
                  onChange={(v) => updateParam('p_pha_ramp', v)}
                  min={-1}
                  max={1}
                />
                <ParamSlider
                  label="Master Volume"
                  value={params.sound_vol}
                  onChange={(v) => updateParam('sound_vol', v)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  );
}