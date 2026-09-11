import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FlipHorizontal, 
  Maximize2, 
  Minimize2, 
  Type, 
  Gauge, 
  Sparkles,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Wand2,
  Tv,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings2,
  X
} from 'lucide-react';

interface TeleprompterProps {
  initialScript?: string;
  onClose?: () => void;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({
  initialScript = '',
  onClose,
}) => {
  const [scriptText, setScriptText] = useState(
    initialScript ||
    `Welcome to Scripa.studio High-Retention Teleprompter!

Line up your smartphone or webcam lens right behind this active eyeline focus area.

When you hit Play or press the Spacebar, this text will smoothly scroll at your configured words-per-minute (WPM).

You can enable Voice Follow Mode so the prompter listens to your spoken words and advances automatically!

You can also turn on your Webcam to record video clips live while reading your AI scripts.`
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [speedWpm, setSpeedWpm] = useState(140); // Words per minute
  const [fontSizePx, setFontSizePx] = useState(32);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono' | 'display'>('sans');
  const [themeMode, setThemeMode] = useState<'glass' | 'obsidian' | 'oled' | 'paper'>('glass');
  const [isMirrored, setIsMirrored] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Webcam & Video Recording
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraOpacity, setCameraOpacity] = useState(60); // 0-100% overlay opacity

  // Voice Follow (Speech Recognition) Mode
  const [isVoiceFollowActive, setIsVoiceFollowActive] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Audio mic meter
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stats
  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDurationSecs = Math.round((wordCount / Math.max(50, speedWpm)) * 60);

  // Sync script updates if initialScript changes
  useEffect(() => {
    if (initialScript) {
      setScriptText(initialScript);
    }
  }, [initialScript]);

  // Keyboard Shortcuts (Space, Up/Down, R, M, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside textarea or input
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSpeedWpm((prev) => Math.min(350, prev + 10));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSpeedWpm((prev) => Math.max(50, prev - 10));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetScroll();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMirrored((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 60FPS Smooth requestAnimationFrame Scrolling Loop
  useEffect(() => {
    let lastTime = performance.now();

    const scrollStep = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (scrollAreaRef.current && isPlaying && countdown === null && !isVoiceFollowActive) {
        // Pixels per second calculation based on font size and WPM speed
        const pixelsPerSec = (speedWpm / 60) * (fontSizePx * 0.9);
        scrollAreaRef.current.scrollTop += pixelsPerSec * delta;

        // Auto stop when reached end
        if (
          scrollAreaRef.current.scrollTop + scrollAreaRef.current.clientHeight >=
          scrollAreaRef.current.scrollHeight - 15
        ) {
          setIsPlaying(false);
          if (isRecordingVideo) {
            stopVideoRecording();
          }
          return;
        }
      }

      if (isPlaying && countdown === null && !isVoiceFollowActive) {
        animFrameRef.current = requestAnimationFrame(scrollStep);
      }
    };

    if (isPlaying && countdown === null && !isVoiceFollowActive) {
      animFrameRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, speedWpm, fontSizePx, countdown, isVoiceFollowActive]);

  // Video Recording Timer
  useEffect(() => {
    if (isRecordingVideo) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingVideo]);

  // Voice Follow Mode (Speech Recognition API)
  useEffect(() => {
    if (!isVoiceFollowActive) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition Voice Follow is not supported in this browser. Please use Google Chrome or Edge.');
      setIsVoiceFollowActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpokenTranscript(currentTranscript);

        // Advance scroll proportional to spoken word count
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop += (fontSizePx * 0.8);
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (isVoiceFollowActive) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech Recognition Error:', err);
      setIsVoiceFollowActive(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [isVoiceFollowActive, fontSizePx]);

  // Webcam Controls
  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        videoStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError('Camera access denied or unequipped. Grant browser camera permission.');
      }
    }
  };

  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (isRecordingVideo) {
      stopVideoRecording();
    }
  };

  // Start with 3-2-1 Countdown
  const triggerStartWithCountdown = (andRecord = false) => {
    setCountdown(3);
    let count = 3;

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        setIsPlaying(true);
        if (andRecord) {
          startVideoRecording();
        }
      }
    }, 1000);
  };

  const startVideoRecording = async () => {
    if (!videoStreamRef.current) {
      await toggleCamera();
    }
    if (!videoStreamRef.current) return;

    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(videoStreamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      setRecordingSeconds(0);
      setIsRecordingVideo(true);
      mediaRecorder.start(1000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVideo(false);
  };

  const handleResetScroll = () => {
    setIsPlaying(false);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  };

  const handleCleanScriptForReading = () => {
    let clean = scriptText;
    clean = clean.replace(/\[\d+:\d+[^\]]*\]/gi, '');
    clean = clean.replace(/\[(Visual|B-Roll|Sound FX|Spoken|On-Screen)[^\]]*\]/gi, '');
    clean = clean.replace(/^#+\s+/gm, '');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
    clean = clean.replace(/\*(.*?)\*/g, '$1');
    clean = clean.replace(/\n{3,}/g, '\n\n').trim();
    setScriptText(clean);
  };

  const toggleAudioVoiceover = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser environment.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.rate = speedWpm / 150; // map WPM to TTS rate
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen ${isFullscreen ? 'p-0 bg-slate-950 text-white' : 'max-w-7xl mx-auto px-2 sm:px-4 py-4'} space-y-4 font-sans select-none`}
    >
      {/* Top Header Control Suite */}
      {!isFullscreen && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Studio Teleprompter
                </h2>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  60FPS Smooth
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {wordCount} Words | Est {estimatedDurationSecs}s | Key Shortcuts: [Space] Play, [R] Reset, [M] Mirror
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  triggerStartWithCountdown(false);
                }
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 text-white shadow-md transition-all active:scale-95 ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              {isPlaying ? 'PAUSE PROMPTER' : 'START AUTO-SCROLL'}
            </button>

            <button
              onClick={handleResetScroll}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
              title="Reset to Top (Key: R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCleanScriptForReading}
              className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-200"
              title="Remove timestamps, B-roll notes, and markdown tags"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              Clean Script
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                title="Close Teleprompter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Control Bar: Speed, Font Size, Mirror, Themes, Webcam */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Speed Controls */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Scroll Speed</span>
            <span className="font-mono text-emerald-400 font-extrabold">{speedWpm} WPM</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeedWpm((prev) => Math.max(50, prev - 10))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="50"
              max="350"
              step="5"
              value={speedWpm}
              onChange={(e) => setSpeedWpm(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <button
              onClick={() => setSpeedWpm((prev) => Math.min(350, prev + 10))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Size Controls */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Text Size</span>
            <span className="font-mono text-indigo-400 font-extrabold">{fontSizePx}px</span>
          </div>
          <input
            type="range"
            min="18"
            max="72"
            step="2"
            value={fontSizePx}
            onChange={(e) => setFontSizePx(Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Display Presets & Mirror Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
              isMirrored
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            {isMirrored ? 'Mirrored Glass' : 'Normal Text'}
          </button>

          <select
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white font-bold focus:outline-none"
          >
            <option value="glass">Glass Tint</option>
            <option value="obsidian">Dark Obsidian</option>
            <option value="oled">High-Contrast OLED</option>
            <option value="paper">Paper Light</option>
          </select>
        </div>

        {/* Voice Follow & Selfie Camera */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceFollowActive(!isVoiceFollowActive)}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
              isVoiceFollowActive
                ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Auto-scroll matches your spoken voice in microphone"
          >
            <Mic className="w-3.5 h-3.5 text-purple-300" />
            {isVoiceFollowActive ? 'Voice Follow ON' : 'Voice Follow'}
          </button>

          <button
            onClick={toggleCamera}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isCameraActive
                ? 'bg-rose-900/80 text-rose-200 border-rose-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isCameraActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
            {isCameraActive ? 'Cam Off' : 'Selfie Cam'}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            title="Toggle Fullscreen Mode (Key: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Studio Prompter Stage */}
      <div 
        className={`relative min-h-[520px] sm:min-h-[580px] rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-2xl ${
          themeMode === 'obsidian'
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : themeMode === 'oled'
            ? 'bg-black border-slate-900 text-white'
            : themeMode === 'paper'
            ? 'bg-white border-slate-300 text-slate-950'
            : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}
      >
        {/* Live Selfie Video Background */}
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100 scale-x-[-1]' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Camera Tint Mask for High Readability */}
        {isCameraActive && (
          <div 
            className="absolute inset-0 bg-slate-950 z-5 pointer-events-none transition-opacity"
            style={{ opacity: cameraOpacity / 100 }}
          />
        )}

        {/* 3-2-1 Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <span className="text-8xl font-black text-emerald-400 animate-ping font-mono">
              {countdown}
            </span>
            <span className="text-sm font-black text-slate-200 mt-6 tracking-widest uppercase">
              Get Ready to Speak...
            </span>
          </div>
        )}

        {/* Eyeline Focus Indicator */}
        <div className="absolute top-1/3 left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-6 opacity-60">
          <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full" />
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold bg-slate-950/90 px-3.5 py-1 rounded-full border border-emerald-500/40 shadow-lg">
            👁️ EYELINE FOCUS AREA
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full" />
        </div>

        {/* Teleprompter Text Canvas */}
        <div
          ref={scrollAreaRef}
          className="relative z-10 h-[520px] sm:h-[580px] overflow-y-auto px-6 sm:px-16 py-36 space-y-6 scroll-smooth"
        >
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            className={`w-full min-h-[900px] bg-transparent resize-none border-none focus:outline-hidden font-sans font-extrabold tracking-wide transition-all ${
              isMirrored ? 'scale-x-[-1]' : ''
            } ${
              themeMode === 'paper' ? 'text-slate-950 drop-shadow-xs' : 'text-slate-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]'
            }`}
            style={{ 
              fontSize: `${fontSizePx}px`, 
              lineHeight: lineHeight,
            }}
            spellCheck={false}
          />
        </div>

        {/* Floating Bottom Recording Toolbar */}
        {isCameraActive && (
          <div className="relative z-30 p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                REC {formatTime(recordingSeconds)}
              </span>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
                <span>Tint Opacity:</span>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={cameraOpacity}
                  onChange={(e) => setCameraOpacity(Number(e.target.value))}
                  className="w-24 accent-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isRecordingVideo) {
                    stopVideoRecording();
                  } else {
                    triggerStartWithCountdown(true);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  isRecordingVideo
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                {isRecordingVideo ? 'Stop Recording' : 'Record Video Clip'}
              </button>

              {recordedVideoUrl && (
                <a
                  href={recordedVideoUrl}
                  download={`scripa_teleprompter_clip_${Date.now()}.webm`}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
