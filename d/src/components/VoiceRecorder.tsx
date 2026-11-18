import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

const MAX_SECONDS = 60;

type State =
  | { kind: 'idle' }
  | { kind: 'asking' }
  | { kind: 'recording'; seconds: number }
  | { kind: 'recorded'; seconds: number; url: string }
  | { kind: 'error'; message: string };

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Record a short voice message instead of typing (max 60 s).
 * Some people find talking easier than writing; it's always optional.
 * Prototype: audio stays in this browser tab and is never uploaded.
 * The recording indicator is a steady dot + a timer in words (no blinking: calm mode).
 */
export function VoiceRecorder({ onChange }: { onChange: (seconds: number | null) => void }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const seconds = useRef(0);
  const urlRef = useRef<string | null>(null);

  const stopTracks = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(
    () => () => {
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stopTracks();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState({ kind: 'error', message: "Recording isn't available in this browser. You can write instead." });
      return;
    }
    setState({ kind: 'asking' });
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const r = new MediaRecorder(s);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        stopTracks();
        const url = URL.createObjectURL(new Blob(chunks, { type: r.mimeType || 'audio/webm' }));
        urlRef.current = url;
        const secs = Math.max(1, seconds.current);
        setState({ kind: 'recorded', seconds: secs, url });
        onChange(secs);
      };
      recorder.current = r;
      seconds.current = 0;
      r.start();
      setState({ kind: 'recording', seconds: 0 });
      timer.current = window.setInterval(() => {
        seconds.current += 1;
        setState({ kind: 'recording', seconds: seconds.current });
        if (seconds.current >= MAX_SECONDS) r.stop();
      }, 1000);
    } catch {
      stopTracks();
      setState({
        kind: 'error',
        message: "We couldn't use your microphone. You can allow it in your browser settings, or write instead.",
      });
    }
  };

  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop();

  const discard = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setState({ kind: 'idle' });
    onChange(null);
  };

  return (
    <div className="voice">
      {(state.kind === 'idle' || state.kind === 'error') && (
        <>
          <button type="button" className="btn btn--secondary btn--block" onClick={start}>
            <Icon name="mic" size={20} /> Start recording
          </button>
          <p className="voice__hint muted small">Up to 1 minute. You can listen back before sending.</p>
          {state.kind === 'error' && <p className="voice__error" role="alert">{state.message}</p>}
        </>
      )}

      {state.kind === 'asking' && <p className="muted" role="status">Waiting for microphone permission…</p>}

      {state.kind === 'recording' && (
        <>
          <p className="voice__live" role="status">
            <span className="voice__dot" aria-hidden="true" />
            Recording · {mmss(state.seconds)} <span className="muted">of {mmss(MAX_SECONDS)}</span>
          </p>
          <button type="button" className="btn btn--primary btn--block" onClick={stop}>
            <Icon name="stop" size={20} /> Stop recording
          </button>
        </>
      )}

      {state.kind === 'recorded' && (
        <div className="voice__clip">
          <p className="voice__label">
            <Icon name="check" size={18} /> Voice message · {mmss(state.seconds)}
          </p>
          <audio controls src={state.url} aria-label="Listen to your voice message" />
          <button type="button" className="btn btn--quiet" onClick={discard}>
            <Icon name="trash" size={18} /> Delete and record again
          </button>
        </div>
      )}
    </div>
  );
}
