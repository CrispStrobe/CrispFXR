
# CrispFXR

A modern web-based 8-bit sound synthesizer for creating (retro game) audio effects. Built with React and Web Audio API.

## Features

- **Real-time Waveform Visualization** - See your sound as you create it
- **Spectrum Analyzer** - Frequency domain analysis
- **Advanced Synthesis Engine** - Square, sawtooth, sine, and noise waveforms
- **FM Synthesis** - Frequency modulation for complex tones
- **LFO Modulation** - Low-frequency oscillation effects
- **Classic Presets** - Pickup coin, laser shot, explosion, power-up, and more
- **WAV Export** - Download high-quality audio files
- **Preset System** - Save and load custom sound configurations
- **Filter Effects** - Low-pass, high-pass, and phaser effects
- **Envelope Control** - Attack, sustain, decay, and punch parameters

## Live Demo

[Visit CrispFXR](https://crispfxr.vercel.app)

## Usage

1. **Choose a Preset** - Start with one of the built-in sound presets
2. **Adjust Parameters** - Use the sliders to modify the sound
3. **Play & Preview** - Click "Play Sound" to hear your creation
4. **Export Audio** - Download as WAV file for use in your projects
5. **Save Presets** - Export parameter settings as JSON for later use

## Development

### Prerequisites
- Node.js 16+
- npm

### Setup
```bash
git clone https://github.com/CrispStrobe/CrispFXR.git
cd CrispFXR
npm install
npm start
```

### Build for Production
```bash
npm run build
```

## Technology Stack

- **React 19** - UI framework
- **Web Audio API** - Audio synthesis and processing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Canvas API** - Waveform visualization

## Browser Support

Works in all modern browsers that support Web Audio API:
- Chrome 66+
- Firefox 60+
- Safari 14.1+
- Edge 79+

## Credits

Based on the original [jsfxr](https://github.com/chr15m/jsfxr) by Chris McCormick, which is a JavaScript port of [sfxr](http://www.drpetter.se/project_sfxr.html) by DrPetter.

## License

MIT License - feel free to use in your projects.
