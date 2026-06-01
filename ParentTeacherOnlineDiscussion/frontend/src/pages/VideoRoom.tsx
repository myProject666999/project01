import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { roomAPI, appointmentAPI } from '../api';
import type { Appointment, SignalData } from '../types';
import { WebRTCManager } from '../utils/webrtc';
import { WebSocketClient } from '../utils/websocket';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Clock,
  AlertTriangle,
  Users,
  User,
} from 'lucide-react';
import Loading from '../components/Loading';

function VideoRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<number | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const wsRef = useRef<WebSocketClient | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playWarningSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 800;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 600);
    } catch (e) {
      console.error('Failed to play warning sound:', e);
    }
  }, []);

  useEffect(() => {
    const initRoom = async () => {
      if (!token || !roomId || !user) {
        setError('无效的访问参数');
        setLoading(false);
        return;
      }

      try {
        const response = await roomAPI.validateRoomToken(token);
        if (!response.data.valid) {
          setError('令牌已失效或无效');
          setLoading(false);
          return;
        }

        const apt = response.data.appointment;
        setAppointment(apt);

        const duration = apt.timeSlot?.duration || 30;
        setTimeLeft(duration * 60);

        const initiatorId = user.role === 'teacher' ? apt.teacherId : apt.parentId;
        const remoteId = user.role === 'teacher' ? apt.parentId : apt.teacherId;
        setRemoteUserId(remoteId);
        setIsInitiator(user.id === initiatorId);

        await appointmentAPI.updateAppointmentStatus(apt.id, 'in_progress');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        wsRef.current = new WebSocketClient(`/ws/room/${roomId}`, {
          onOpen: () => {
            console.log('WebSocket connected');
            wsRef.current?.send({
              type: 'join',
              data: { userId: user.id, role: user.role },
              roomId,
              senderId: user.id,
            });
          },
          onMessage: handleWebSocketMessage,
          onClose: () => {
            console.log('WebSocket disconnected');
          },
          onError: (err) => {
            console.error('WebSocket error:', err);
          },
        });
        wsRef.current.connect();

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to init room:', err);
        setError(err.response?.data?.message || '进入房间失败');
        setLoading(false);
      }
    };

    initRoom();

    return () => {
      cleanup();
    };
  }, [token, roomId, user]);

  useEffect(() => {
    if (loading || error || !isInitiator || !localStreamRef.current || !remoteUserId) return;

    const initWebRTC = setTimeout(() => {
      if (webrtcRef.current) return;

      webrtcRef.current = new WebRTCManager(
        roomId!,
        user!.id,
        remoteUserId,
        {
          localStream: localStreamRef.current!,
          remoteVideoRef: remoteVideoRef!,
          initiator: true,
          onSignal: (signal) => {
            wsRef.current?.send({
              type: 'signal',
              data: signal,
              roomId,
              senderId: user!.id,
            });
          },
          onConnect: () => {
            setIsConnected(true);
            startTimer();
          },
          onClose: () => {
            setIsConnected(false);
          },
          onError: (err) => {
            console.error('WebRTC error:', err);
          },
        }
      );
      webrtcRef.current.createPeer();
    }, 2000);

    return () => clearTimeout(initWebRTC);
  }, [loading, error, isInitiator, localStreamRef.current, remoteUserId]);

  const handleWebSocketMessage = useCallback(
    (message: any) => {
      switch (message.type) {
        case 'user-joined':
          if (!isInitiator && !webrtcRef.current && localStreamRef.current && remoteUserId) {
            webrtcRef.current = new WebRTCManager(
              roomId!,
              user!.id,
              remoteUserId,
              {
                localStream: localStreamRef.current!,
                remoteVideoRef: remoteVideoRef!,
                initiator: false,
                onSignal: (signal) => {
                  wsRef.current?.send({
                    type: 'signal',
                    data: signal,
                    roomId,
                    senderId: user!.id,
                  });
                },
                onConnect: () => {
                  setIsConnected(true);
                  startTimer();
                },
                onClose: () => {
                  setIsConnected(false);
                },
                onError: (err) => {
                  console.error('WebRTC error:', err);
                },
              }
            );
            webrtcRef.current.createPeer();
          }
          break;

        case 'signal':
          const signalData = message.data as SignalData;
          if (signalData.targetId === user?.id && webrtcRef.current) {
            webrtcRef.current.signal(signalData.sdp || signalData.candidate);
          }
          break;

        case 'user-left':
          setIsConnected(false);
          break;
      }
    },
    [isInitiator, remoteUserId, roomId, user]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleEndCall();
          return 0;
        }

        if (prev === 60) {
          setIsWarning(true);
          playWarningSound();
        }

        return prev - 1;
      });
    }, 1000);
  }, [playWarningSound]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    webrtcRef.current?.toggleAudio(newState);
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = newState;
    });
  };

  const toggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    webrtcRef.current?.toggleVideo(newState);
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = newState;
    });
  };

  const handleEndCall = async () => {
    if (!appointment) return;

    try {
      await roomAPI.endRoom(roomId!);
      await appointmentAPI.updateAppointmentStatus(appointment.id, 'completed');
    } catch (err) {
      console.error('Failed to end room:', err);
    } finally {
      cleanup();
      navigate(`/meeting-summary/${appointment.id}`);
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (webrtcRef.current) {
      webrtcRef.current.destroy();
      webrtcRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  if (loading) {
    return <Loading fullScreen text="正在进入房间..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">无法进入房间</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-6 w-6 text-white" />
          <div>
            <h1 className="text-white font-semibold">
              {appointment?.subject || '视频面谈'}
            </h1>
            <p className="text-gray-400 text-sm">
              {user?.role === 'teacher'
                ? `与 ${appointment?.parent?.name || '家长'} 通话中`
                : `与 ${appointment?.teacher?.name || '老师'} 通话中`}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isWarning
              ? 'bg-red-600 animate-pulse-warning'
              : isConnected
              ? 'bg-green-600'
              : 'bg-yellow-600'
          }`}
        >
          <Clock className="h-5 w-5 text-white" />
          <span className="text-white font-mono text-lg font-semibold">
            {formatTime(timeLeft)}
          </span>
          {isWarning && (
            <span className="text-white text-sm ml-2">还剩1分钟！</span>
          )}
        </div>
      </div>

      <div className="flex-1 relative p-4">
        <div className="h-full relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-xl bg-gray-800"
          />

          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 rounded-xl">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                <p className="text-lg">正在建立连接...</p>
                <p className="text-gray-400 text-sm mt-2">请等待对方加入</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 w-64 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-gray-800"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm flex items-center">
              <User className="h-3 w-3 mr-1" />
              {user?.name}
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-6">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${
            isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default VideoRoom;
