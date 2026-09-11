import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Type, 
  Gauge, 
  FlipHorizontal, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Sparkles,
  Tv,
  Clock,
  Video,
  VideoOff,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  Wand2,
  ListFilter
} from 'lucide-react';
import { GeneratedProject } from '../types';

interface TeleprompterStudioProps {
  savedProjects: GeneratedProject[];
}

export const TeleprompterStudio: React.FC<TeleprompterStudioProps> = ({ savedProjects }) => {
  const [scriptText, setScriptText] = useState<string>(
    `[0:00 - Hook]
Stop scrolling if you want to grow your creator channel 10x faster in 2026.

[0:05 - Problem]
Most creators spend hours struggling to write engaging video scripts from scratch, missing out on viral retention.

[0:15 - Solution]
Instead, use Scripa.studio to generate high-converting hooks, scene-by-scene timing, and read-ready teleprompter text in seconds.

[0:35 - Action]
Save this video right now, try out the studio, and start creating viral shorts today!`
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(140); // Words Per Minute (WPM)
  const [fontSize, setFontSize] = useState(28); // Text Size
  const [lineHeight, setLineHeight] = useState(1.6);
  const [isMirrored, setIsMirrored] = useState(false);
  const [themeMode, setThemeMode] = useState<'transparent' | 'obsidian' | 'dark' | 'light'>('transparent');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Camera & Video Recording States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Countdown Timer State
  const [countdown, setCountdown] = useState<number | null>(null);

  // Audio Mic state
  const [isMicActive, setIsMicActive] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate stats
  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / Math.max(60, scrollSpeed)) * 60);

  // High-Performance 60FPS smooth requestAnimationFrame scroll loop
  useEffect(() => {
    let lastTime = performance.now();

    const scrollStep = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (teleprompterRef.current && isPlaying && countdown === null) {
        // Calculate scroll speed in pixels per second based on font size and WPM
        // Approx ~25 words per line depending on font size
        const pps = (scrollSpeed / 60) * (fontSize * 0.85);
        teleprompterRef.current.scrollTop += pps * delta;

        // Auto-pause when reaching bottom
        if (
          teleprompterRef.current.scrollTop + teleprompterRef.current.clientHeight >=
          teleprompterRef.current.scrollHeight - 10
        ) {
          setIsPlaying(false);
          if (isRecordingVideo) {
            stopVideoRecording();
          }
          return;
        }
      }

      if (isPlaying && countdown === null) {
        animFrameRef.current = requestAnimationFrame(scrollStep);
      }
    };

    if (isPlaying && countdown === null) {
      animFrameRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, scrollSpeed, fontSize, countdown]);

  // Video Recording Timer
  useEffect(() => {
    if (isRecordingVideo) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVideo]);

  // Handle Webcam Camera Initialization
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
        setIsMicActive(true);
        setupAudioAnalyzer(stream);
      } catch (err: any) {
        console.error('Webcam camera access error:', err);
        setCameraError('Camera access unavailable. Check browser permissions.');
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
    setIsMicActive(false);
    if (isRecordingVideo) {
      stopVideoRecording();
    }
  };

  // Audio spectrum analyzer
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (analyser && videoStreamRef.current && videoStreamRef.current.active) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
    } catch (e) {
      // Ignore audio level failover
    }
  };

  // Start Prompter with 3-2-1 Countdown
  const triggerStartWithCountdown = (andRecordVideo = false) => {
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
        if (andRecordVideo) {
          startVideoRecording();
        }
      }
    }, 1000);
  };

  // Start Video Clip Recording
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
    if (teleprompterRef.current) {
      teleprompterRef.current.scrollTop = 0;
    }
  };

  // One-Click AI Clean Teleprompter Script Formatter
  const handleCleanScriptForReading = () => {
    let clean = scriptText;
    // Strip timestamps like [0:00 - Hook], B-roll brackets [Visual: ...], Markdown headers ###
    clean = clean.replace(/\[\d+:\d+[^\]]*\]/gi, '');
    clean = clean.replace(/\[(Visual|B-Roll|Sound FX|Spoken|On-Screen)[^\]]*\]/gi, '');
    clean = clean.replace(/^#+\s+/gm, '');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
    clean = clean.replace(/\*(.*?)\*/g, '$1');
    clean = clean.replace(/>\s*/g, '');
    clean = clean.replace(/\n{3,}/g, '\n\n').trim();
    setScriptText(clean);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreenStage = () => {
    if (!stageContainerRef.current) return;
    if (!document.fullscreenElement) {
      stageContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Studio Suite 2.0
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Smooth 60FPS Teleprompter
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tv className="w-6 h-6 text-indigo-400" /> Studio Teleprompter & Live Camera Recording
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Read scripts smoothly on desktop or phone, record your video live, and clean up AI outputs with one click.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="bg-slate-900/80 border border-slate-700/80 p-2 sm:p-2.5 rounded-xl text-center min-w-[70px]">
            <span className="text-[9px] text-slate-400 block uppercase">Words</span>
            <span className="text-xs sm:text-sm font-bold text-indigo-300">{wordCount}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/80 p-2 sm:p-2.5 rounded-xl text-center min-w-[70px]">
            <span className="text-[9px] text-slate-400 block uppercase">Est Time</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-300">{estimatedSeconds}s</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/80 p-2 sm:p-2.5 rounded-xl text-center min-w-[85px]">
            <span className="text-[9px] text-slate-400 block uppercase">Rec Time</span>
            <span className="text-xs sm:text-sm font-bold text-rose-400">{formatTime(recordingSeconds)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls & Script Importer Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
          {/* Script Importer */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>📜 Load Script from Vault</span>
              <span className="text-[10px] text-indigo-600 font-mono font-bold">{savedProjects.length} Available</span>
            </label>
            <select
              onChange={(e) => {
                const selected = savedProjects.find((p) => p.id === e.target.value);
                if (selected) {
                  setScriptText(selected.output);
                  handleResetScroll();
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose AI Generated Script --</option>
              {savedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({new Date(p.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* AI One-Click Clean Script Action */}
          <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">AI Script Cleaner</span>
              <span className="text-[10px] text-indigo-700 block">Remove timestamps & B-roll direction tags</span>
            </div>
            <button
              onClick={handleCleanScriptForReading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-transform active:scale-95 shadow-xs whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Clean Text
            </button>
          </div>

          {/* Teleprompter Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" /> Prompter Speed & Display
            </h4>

            {/* Reading Speed Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Reading Speed (WPM)</span>
                <span className="font-mono text-indigo-600 font-bold">{scrollSpeed} WPM</span>
              </div>
              <input
                type="range"
                min="60"
                max="320"
                step="10"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>60 Slow</span>
                <span>140 Normal</span>
                <span>320 Fast</span>
              </div>
            </div>

            {/* Text Size Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Text Size</span>
                <span className="font-mono text-indigo-600 font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="64"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Theme & Glass Modes */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Overlay Backdrop</label>
                <select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                >
                  <option value="transparent">Glass Overlay</option>
                  <option value="obsidian">Dark Obsidian</option>
                  <option value="dark">Studio Dark</option>
                  <option value="light">Paper Light</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Hardware Mirror</label>
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`w-full text-xs font-bold p-2 rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    isMirrored
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  {isMirrored ? 'Mirrored' : 'Standard'}
                </button>
              </div>
            </div>
          </div>

          {/* Camera & Speech Controls */}
          <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-emerald-400" /> Camera Selfie Studio
              </span>
              {isCameraActive && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cam
                </span>
              )}
            </div>

            {cameraError && (
              <p className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                {cameraError}
              </p>
            )}

            {/* Audio Meter */}
            {isMicActive && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Mic Voice Level</span>
                  <span>{audioLevel}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={toggleCamera}
                className={`text-xs font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  isCameraActive
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-700 hover:bg-rose-900'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {isCameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-emerald-400" />}
                {isCameraActive ? 'Turn Off Cam' : 'Enable Camera'}
              </button>

              <button
                onClick={() => {
                  if (isRecordingVideo) {
                    stopVideoRecording();
                  } else {
                    triggerStartWithCountdown(true);
                  }
                }}
                className={`text-xs font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  isRecordingVideo
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                {isRecordingVideo ? 'Stop Video' : 'Record Video'}
              </button>
            </div>

            {/* Download Recorded Video */}
            {recordedVideoUrl && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-300 font-medium">✨ Video Recorded!</span>
                <a
                  href={recordedVideoUrl}
                  download={`scripa_teleprompter_clip_${Date.now()}.webm`}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download MP4
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Teleprompter Stage & Camera Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Stage Control Toolbar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false);
                  } else {
                    triggerStartWithCountdown(false);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 text-white shadow-xs transition-transform active:scale-95 ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'PAUSE AUTO-SCROLL' : 'START PROMPTER (3S)'}
              </button>

              <button
                onClick={handleResetScroll}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                title="Reset to Top"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={toggleFullscreenStage}
                className="p-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors"
                title="Fullscreen Prompter Mode"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Main Stage & Selfie Camera Container */}
          <div 
            ref={stageContainerRef}
            className={`relative min-h-[500px] sm:min-h-[540px] rounded-3xl overflow-hidden border-2 transition-all select-none shadow-2xl flex flex-col justify-between ${
              themeMode === 'obsidian'
                ? 'bg-slate-950 border-slate-800 text-slate-100'
                : themeMode === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : themeMode === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}
          >
            {/* Live Camera Video Background View */}
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${
                isCameraActive ? 'opacity-100 scale-x-[-1]' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Dark camera tint mask for text contrast */}
            {isCameraActive && (
              <div className="absolute inset-0 bg-slate-950/60 z-5 pointer-events-none" />
            )}

            {/* 3-2-1 Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
                <span className="text-8xl font-black text-amber-400 animate-ping">
                  {countdown}
                </span>
                <span className="text-sm font-extrabold text-slate-200 mt-4 tracking-widest uppercase">
                  Get Ready to Speak...
                </span>
              </div>
            )}

            {/* Eyeline Focal Line Indicator */}
            <div className="absolute top-1/3 left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-4 opacity-40">
              <div className="w-8 h-1 bg-rose-500 rounded-full" />
              <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-slate-950/80 px-3 py-1 rounded-full border border-rose-500/30">
                👁️ EYELINE FOCUS
              </div>
              <div className="w-8 h-1 bg-rose-500 rounded-full" />
            </div>

            {/* Teleprompter Scrollable Canvas */}
            <div
              ref={teleprompterRef}
              className="relative z-10 h-[500px] sm:h-[540px] overflow-y-auto px-6 sm:px-12 py-32 space-y-6 scroll-smooth"
            >
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className={`w-full min-h-[800px] bg-transparent resize-none border-none focus:outline-hidden font-sans font-extrabold tracking-wide transition-all ${
                  isMirrored ? 'scale-x-[-1]' : ''
                } ${
                  themeMode === 'light' ? 'text-slate-950 drop-shadow-xs' : 'text-slate-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                }`}
                style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: lineHeight,
                }}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
