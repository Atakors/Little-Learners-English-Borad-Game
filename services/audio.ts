
// Simple 8-bit sound synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTimeOffset: number = 0, volume: number = 0.1) => {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

    gain.gain.setValueAtTime(volume, ctx.currentTime + startTimeOffset);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTimeOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTimeOffset);
    osc.stop(ctx.currentTime + startTimeOffset + duration);
};

export const playStepSound = () => {
    // Short high blip for stepping
    playTone(600, 'square', 0.05, 0, 0.05);
};

export const playDiceRollSound = () => {
    // Rapid random blips
    for(let i=0; i<8; i++) {
        const time = i * 0.08;
        const freq = 200 + Math.random() * 400;
        playTone(freq, 'square', 0.05, time, 0.05);
    }
};

export const playCorrectSound = () => {
    // Rising coin sound
    playTone(523.25, 'square', 0.1, 0, 0.1); // C5
    playTone(659.25, 'square', 0.4, 0.1, 0.1); // E5
};

export const playIncorrectSound = () => {
    // Falling buzz
    playTone(150, 'sawtooth', 0.2, 0, 0.1);
    playTone(100, 'sawtooth', 0.4, 0.15, 0.1);
};

export const playWinSound = () => {
    // Fanfare
    const now = 0;
    const notes = [
        { f: 523.25, t: 0, d: 0.2 }, // C
        { f: 659.25, t: 0.2, d: 0.2 }, // E
        { f: 783.99, t: 0.4, d: 0.2 }, // G
        { f: 1046.50, t: 0.6, d: 0.6 }, // C (High)
        { f: 783.99, t: 0.6, d: 0.6 }, // G (Harmonic)
    ];

    notes.forEach(n => {
        playTone(n.f, 'square', n.d, n.t, 0.1);
    });
};

export const playStartGameSound = () => {
    // Power up sound
    playTone(220, 'square', 0.1, 0, 0.1);
    playTone(440, 'square', 0.1, 0.1, 0.1);
    playTone(880, 'square', 0.4, 0.2, 0.1);
};

export const playUIHoverSound = () => {
   // Very subtle click
   playTone(800, 'triangle', 0.02, 0, 0.01);
};
