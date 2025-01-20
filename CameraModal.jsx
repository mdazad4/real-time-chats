import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaTimes, FaSync, FaCircle } from 'react-icons/fa';
import './CameraModal.css';

const CameraModal = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isFrontCamera]);

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }
      
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);
    setIsRecording(true);
    setTimer(0);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.start();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);

      // Create video blob and send it
      setTimeout(() => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        onCapture({
          type: 'video/webm',
          name: 'camera-video.webm'
        }, blob);
      }, 250);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      onCapture({
        type: 'image/jpeg',
        name: 'camera-photo.jpg'
      }, blob);
    }, 'image/jpeg', 0.8);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="camera-modal">
      <div className="camera-content">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-preview"
        />
        
        <div className="camera-controls">
          <button className="control-btn close" onClick={onClose}>
            <FaTimes />
          </button>
          
          <button className="control-btn switch" onClick={switchCamera}>
            <FaSync />
          </button>
          
          {isRecording && (
            <div className="recording-indicator">
              <FaCircle className="recording-dot" />
              <span>{formatTime(timer)}</span>
            </div>
          )}
          
          <button
            className={`capture-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : (e => {
              if (e.detail === 1) { // Single click
                takePhoto();
              } else if (e.detail === 2) { // Double click
                startRecording();
              }
            })}
          >
            <FaCamera />
          </button>
        </div>

        <div className="camera-instructions">
          {isRecording ? (
            <p>Tap to stop recording</p>
          ) : (
            <p>Tap for photo • Double tap for video</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
