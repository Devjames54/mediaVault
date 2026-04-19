import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { useAuth } from '../context/AuthContext';
import { useDeletionRequests } from '../context/DeletionRequestContext';
import { Download, ArrowLeft, Lock, Play, Pause, Volume2, VolumeX, Maximize, Minimize, AlertTriangle, ExternalLink } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { BannerAd, NativeBannerAd } from '../components/Ads';
import { getFixedUrl } from '../lib/supabase';

export function MediaView() {
  const { id } = useParams<{ id: string }>();
  const { media } = useMedia();
  const { user } = useAuth();
  const { addRequest } = useDeletionRequests();
  const navigate = useNavigate();

  const item = media.find(m => m.id === id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [item]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume || 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const relatedMedia = useMemo(() => {
    if (!item) return [];
    return media
      .filter(m => m.id !== item.id && m.category !== 'ad')
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (item.category) {
          if (a.category === item.category) scoreA += 2;
          if (b.category === item.category) scoreB += 2;
        }
        if (a.type === item.type) scoreA += 1;
        if (b.type === item.type) scoreB += 1;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [media, item]);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">Media not found</h2>
        <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300">
          Return to Home
        </button>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!user) return;
    setIsDownloading(true);
    try {
      const fixedUrl = getFixedUrl(item.url);
      const response = await fetch(fixedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/\s+/g, '_').toLowerCase()}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed', error);
      window.open(getFixedUrl(item.url), '_blank');
    } finally {
      setIsDownloading(false);
      setShowDownloadConfirm(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !item) return;
    
    addRequest(item.id, reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div 
          ref={containerRef}
          className="aspect-video bg-black flex items-center justify-center relative group"
        >
          {item.type === 'video' ? (
            <>
              <video 
                ref={videoRef}
                src={getFixedUrl(item.url)} 
                autoPlay
                className="w-full h-full object-contain cursor-pointer"
                poster={item.thumbnailUrl ? getFixedUrl(item.thumbnailUrl) : undefined}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col gap-3">
                {/* Progress Bar with subtler background */}
                <div 
                  className="w-full h-1.5 bg-black/40 backdrop-blur-sm rounded-full cursor-pointer relative hover:h-2 transition-all group/progress"
                  onClick={handleSeek}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
                  />
                </div>
                
                {/* Controls Row */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors focus:outline-none">
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                    </button>
                    
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="hover:text-indigo-400 transition-colors focus:outline-none">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange}
                        className="hidden sm:block w-0 group-hover/volume:w-24 transition-all duration-300 accent-indigo-500 cursor-pointer opacity-0 group-hover/volume:opacity-100"
                      />
                    </div>
                    
                    <div className="text-xs sm:text-sm font-medium tabular-nums text-zinc-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  
                  <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition-colors focus:outline-none">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <img 
              src={getFixedUrl(item.url)} 
              alt={item.title} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100">{item.title}</h1>
              {item.category && (
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-md border border-indigo-500/20 uppercase tracking-wider">
                  {item.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowReportModal(true)}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Request Deletion
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="https://www.profitablecpmratenetwork.com/a28v6vs8kz?key=3b03c444eff3c42df665f815e2cc24f2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg w-full sm:w-auto justify-center"
            >
              <ExternalLink className="w-5 h-5" />
              HD Version
            </a>
            {user ? (
              <button 
                onClick={() => setShowDownloadConfirm(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center"
              >
                <Download className="w-5 h-5" />
                Download {item.type === 'video' ? 'Video' : 'Image'}
              </button>
            ) : (
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex items-start sm:items-center gap-3">
                <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-300 font-medium">Login required to download</p>
                  <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300">
                    Sign in or create an account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="my-8 flex flex-col items-center gap-4">
        <BannerAd />
        <NativeBannerAd />
      </div>

      {relatedMedia.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-6">Related Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedMedia.map(relatedItem => (
              <MediaCard key={relatedItem.id} item={relatedItem} />
            ))}
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Confirm Download</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to download "{item.title}"? This file will be saved to your device.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDownloadConfirm(false)}
                disabled={isDownloading}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-100 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Request Deletion
            </h3>
            
            {reportSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-zinc-300 font-medium">Request submitted successfully.</p>
                <p className="text-zinc-500 text-sm mt-1">Our admin team will review it shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <p className="text-zinc-400 mb-4 text-sm">
                  Please provide a reason for requesting the deletion of "{item.title}". This request will be sent directly to the administrators.
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason for deletion..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] mb-6"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-red-500/20"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
