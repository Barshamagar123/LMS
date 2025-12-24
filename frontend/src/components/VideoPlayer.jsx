import React, { forwardRef, useState, useImperativeHandle } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  VolumeDown,
  Fullscreen,
  Speed,
  SkipNext,
  SkipPrevious,
  Settings
} from '@mui/icons-material';
import { formatTime } from '../utils/formatTime';

const VideoPlayer = forwardRef(({
  src,
  type,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  onPlayPause,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  onFullscreen,
  onVolumeChange,
  onPlaybackRateChange,
  onNext,
  onPrevious
}, ref) => {
  const [showControls, setShowControls] = useState(true);
  const [volumeAnchorEl, setVolumeAnchorEl] = useState(null);
  const [speedAnchorEl, setSpeedAnchorEl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Expose video methods to parent
  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current) videoRef.current.play();
    },
    pause: () => {
      if (videoRef.current) videoRef.current.pause();
    },
    currentTime: videoRef.current ? videoRef.current.currentTime : 0,
    seekTo: (seconds) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
      }
    }
  }));

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const isVideo = type === 'VIDEO';

  // Format the video URL - add base URL if it's a relative path
  const formatVideoUrl = (url) => {
    if (!url) return '';
    
    // If it's a relative path, prepend the backend base URL
    if (url.startsWith('/uploads/') || url.startsWith('/')) {
      return `http://localhost:3000${url}`;
    }
    
    return url;
  };

  const handleSeek = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      onTimeUpdate(newValue);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    onVolumeChange(newVolume);
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    onPlaybackRateChange(rate);
  };

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen - make video cover entire screen
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
    // Call the parent's fullscreen handler
    if (onFullscreen) {
      onFullscreen();
    }
  };

  // Handle fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const renderPlayer = () => {
    if (!src) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          bgcolor="background.default"
        >
          <Typography color="text.secondary">
            No video content available
          </Typography>
        </Box>
      );
    }

    if (isVideo) {
      return (
        <video
          ref={videoRef}
          src={formatVideoUrl(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: isFullscreen ? 'cover' : 'contain',
            backgroundColor: '#000'
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onEnded}
          onPlay={() => onPlayPause(true)}
          onPause={() => onPlayPause(false)}
          controls={false}
          preload="metadata"
        >
          <source src={formatVideoUrl(src)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      // Handle other content types (PDF, Audio, etc.)
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          bgcolor="background.default"
        >
          <Typography color="text.secondary">
            Content type: {type}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        '&:hover .video-controls': {
          opacity: 1
        }
      }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      {renderPlayer()}

      {/* Custom Video Controls */}
      <Box
        className="video-controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          padding: 2,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          zIndex: 10
        }}
      >
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Slider
            value={currentTime}
            max={duration}
            onChange={handleSeek}
            sx={{
              color: '#fff',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                transition: '0.2s',
                '&:hover, &.Mui-focusVisible': {
                  width: 16,
                  height: 16
                }
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" sx={{ color: '#fff', mt: 0.5 }}>
            <Typography variant="caption">{formatTime(currentTime)}</Typography>
            <Typography variant="caption">{formatTime(duration)}</Typography>
          </Box>
        </Box>

        {/* Control Buttons */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Left Controls */}
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isPlaying ? "Pause" : "Play"}>
              <IconButton onClick={onPlayPause} sx={{ color: '#fff' }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Previous Lesson">
              <IconButton onClick={onPrevious} sx={{ color: '#fff' }}>
                <SkipPrevious />
              </IconButton>
            </Tooltip>

            <Tooltip title="Next Lesson">
              <IconButton onClick={onNext} sx={{ color: '#fff' }}>
                <SkipNext />
              </IconButton>
            </Tooltip>

            {/* Volume Control */}
            <Tooltip title="Volume">
              <IconButton 
                onClick={(e) => setVolumeAnchorEl(e.currentTarget)}
                sx={{ color: '#fff' }}
              >
                {volume === 0 ? <VolumeOff /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />}
              </IconButton>
            </Tooltip>

            <Typography variant="body2" sx={{ color: '#fff', minWidth: 40 }}>
              {Math.round(volume * 100)}%
            </Typography>

            <Menu
              anchorEl={volumeAnchorEl}
              open={Boolean(volumeAnchorEl)}
              onClose={() => setVolumeAnchorEl(null)}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(e, newValue) => handleVolumeChange(newValue)}
                  sx={{ width: 100 }}
                />
              </Box>
            </Menu>

            {/* Playback Speed */}
            <Tooltip title="Playback Speed">
              <IconButton 
                onClick={(e) => setSpeedAnchorEl(e.currentTarget)}
                sx={{ color: '#fff' }}
              >
                <Speed />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={speedAnchorEl}
              open={Boolean(speedAnchorEl)}
              onClose={() => setSpeedAnchorEl(null)}
            >
              {playbackRates.map(rate => (
                <MenuItem
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  selected={playbackRate === rate}
                >
                  {rate}x
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Right Controls */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              {playbackRate}x
            </Typography>

            {/* Fullscreen */}
            <Tooltip title="Fullscreen">
              <IconButton onClick={handleFullscreenToggle} sx={{ color: '#fff' }}>
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
