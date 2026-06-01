import Peer, { SignalData as PeerSignalData } from 'simple-peer';
import type { SignalData } from '../types';

interface WebRTCManagerOptions {
  localStream: MediaStream;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onSignal: (signal: SignalData) => void;
  onConnect?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onStream?: (stream: MediaStream) => void;
  initiator?: boolean;
}

export class WebRTCManager {
  private peer: Peer.Instance | null = null;
  private localStream: MediaStream;
  private remoteVideoRef: React.RefObject<HTMLVideoElement>;
  private onSignal: (signal: SignalData) => void;
  private onConnect?: () => void;
  private onClose?: () => void;
  private onError?: (error: Error) => void;
  private onStream?: (stream: MediaStream) => void;
  private initiator: boolean;
  private roomId: string;
  private userId: number;
  private remoteUserId: number;

  constructor(
    roomId: string,
    userId: number,
    remoteUserId: number,
    options: WebRTCManagerOptions
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.remoteUserId = remoteUserId;
    this.localStream = options.localStream;
    this.remoteVideoRef = options.remoteVideoRef;
    this.onSignal = options.onSignal;
    this.onConnect = options.onConnect;
    this.onClose = options.onClose;
    this.onError = options.onError;
    this.onStream = options.onStream;
    this.initiator = options.initiator || false;
  }

  createPeer(): void {
    const peer = new Peer({
      initiator: this.initiator,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (data: PeerSignalData) => {
      const signalType = (data.type || 'ice-candidate') as 'offer' | 'answer' | 'ice-candidate';
      const sdpData = data as any;
      this.onSignal({
        type: signalType,
        sdp: sdpData.sdp ? { type: sdpData.type, sdp: sdpData.sdp } : undefined,
        candidate: sdpData.candidate ? sdpData.candidate : undefined,
        roomId: this.roomId,
        senderId: this.userId,
        targetId: this.remoteUserId,
      });
    });

    peer.on('connect', () => {
      this.onConnect?.();
    });

    peer.on('stream', (stream: MediaStream) => {
      if (this.remoteVideoRef.current) {
        this.remoteVideoRef.current.srcObject = stream;
      }
      this.onStream?.(stream);
    });

    peer.on('close', () => {
      this.onClose?.();
    });

    peer.on('error', (err: Error) => {
      console.error('WebRTC error:', err);
      this.onError?.(err);
    });

    this.peer = peer;
  }

  signal(data: PeerSignalData): void {
    if (this.peer) {
      this.peer.signal(data);
    } else {
      console.warn('Peer not initialized. Signal ignored:', data);
    }
  }

  toggleAudio(enabled: boolean): void {
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled: boolean): void {
    this.localStream.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  isAudioEnabled(): boolean {
    return this.localStream.getAudioTracks().every((track) => track.enabled);
  }

  isVideoEnabled(): boolean {
    return this.localStream.getVideoTracks().every((track) => track.enabled);
  }

  destroy(): void {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.localStream.getTracks().forEach((track) => {
      track.stop();
    });
    if (this.remoteVideoRef.current) {
      this.remoteVideoRef.current.srcObject = null;
    }
  }

  getPeer(): Peer.Instance | null {
    return this.peer;
  }
}

export default WebRTCManager;
