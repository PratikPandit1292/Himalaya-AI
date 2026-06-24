import React, { useState, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isLoading: boolean;
}

/**
 * VoiceInput Component
 * Records audio and sends to backend for transcription
 * Supports local transcription or external STT API
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      console.log('[VOICE] Starting audio recording...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[VOICE] Recording stopped, processing audio...');
        setIsRecording(false);
        setIsTranscribing(true);
        
        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log(`[VOICE] Audio blob created: ${audioBlob.size} bytes`);
          
          // Convert to base64
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              // Send to backend for transcription
              console.log('[VOICE] Sending audio to backend for transcription...');
              const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  audio: base64Audio,
                  mimeType: 'audio/webm'
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transcription failed');
              }

              const data = await response.json();
              console.log('[VOICE] Transcribed text:', data.transcript);
              
              if (data.transcript && data.transcript.trim()) {
                onTranscript(data.transcript);
              } else {
                setError('❌ Could not understand. Please try again.');
              }
            } catch (err) {
              console.error('[VOICE] Transcription error:', err);
              setError(`❌ ${err instanceof Error ? err.message : 'Transcription failed'}`);
            } finally {
              setIsTranscribing(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          console.error('[VOICE] Audio processing error:', err);
          setError('❌ Failed to process audio');
          setIsTranscribing(false);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('[VOICE] Recorder error:', event.error);
        setError(`❌ Recording error: ${event.error}`);
        setIsRecording(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      console.log('[VOICE] Recording started');
    } catch (err) {
      console.error('[VOICE] Error accessing microphone:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      if (errorMsg.includes('NotAllowedError')) {
        setError('❌ Microphone permission denied. Check browser settings.');
      } else if (errorMsg.includes('NotFoundError')) {
        setError('❌ No microphone found. Check your device.');
      } else {
        setError(`❌ Cannot access microphone: ${errorMsg}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('[VOICE] Stopping recording...');
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('[VOICE] Stopped track:', track.kind);
        });
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading || isTranscribing}
        className={`rounded-lg p-3 transition-all transform ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg'
            : isTranscribing
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        title={
          isRecording 
            ? 'Stop recording' 
            : isTranscribing 
            ? 'Processing...' 
            : 'Click to start speaking'
        }
        aria-label="Voice input"
      >
        {isTranscribing ? (
          <Loader size={18} className="animate-spin" />
        ) : isRecording ? (
          <Square size={18} />
        ) : (
          <Mic size={18} />
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 whitespace-nowrap bg-gray-800 text-white text-xs py-2 px-3 rounded opacity-0 hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {isRecording
          ? '🔴 Recording... Click to stop'
          : isTranscribing
          ? '⏳ Transcribing your speech...'
          : '🎤 Click to speak your question'}
      </div>

      {/* Error message with setup guide */}
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-red-600 text-white text-xs py-3 px-4 rounded max-w-sm z-10 shadow-lg">
          <div className="font-bold mb-2">🎤 Get Voice Working in 2 Minutes</div>
          <div className="text-left text-xs mb-2 space-y-2">
            <div>
              <div className="font-bold text-green-300 mb-1">✅ Option 1: AssemblyAI (FREE - Recommended)</div>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Go to <a href="https://www.assemblyai.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">www.assemblyai.com</a></li>
                <li>Sign up (free, NO credit card needed)</li>
                <li>Copy your API key</li>
                <li>Edit <code className="bg-gray-700 px-1 rounded">travel chatbot/.env</code></li>
                <li>Add: <code className="bg-gray-700 px-1 rounded">ASSEMBLYAI_API_KEY=key</code></li>
              </ol>
            </div>
            <div className="border-t border-gray-500 pt-2">
              <div className="font-bold mb-1">💳 Option 2: OpenAI Whisper (PAID)</div>
              <p className="text-yellow-200">Cost: ~$0.02 per minute. Add OPENAI_API_KEY instead.</p>
            </div>
          </div>
          <div className="text-yellow-200 text-xs mb-2">Then restart Flask backend (Ctrl+C, run: python app.py)</div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 bg-white text-red-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
