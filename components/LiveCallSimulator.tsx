import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Phone, PhoneOff, Settings2, Volume2 } from 'lucide-react';
import { ScriptConfig } from '../types';

interface LiveCallSimulatorProps {
  scriptConfig?: ScriptConfig;
}

export const LiveCallSimulator: React.FC<LiveCallSimulatorProps> = ({ 
  scriptConfig
}) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{role: 'user' | 'model' | 'system', text: string}[]>([]);
  const [volume, setVolume] = useState(0);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Construct system instruction from config or default
  const getSystemInstruction = () => {
    if (!scriptConfig) {
      return `You are "Julia", a sales rep for "Consórcio Futuro". Qualify leads for vehicles/real estate. Be professional and warm.`;
    }

    let instruction = `${scriptConfig.basePersona}\n\nIMPORTANT: Follow these specific interaction rules based on user input:\n`;
    
    scriptConfig.rules.forEach((rule, index) => {
      instruction += `${index + 1}. IF USER SAYS: "${rule.condition}" -> THEN: ${rule.instruction}\n`;
    });
    
    return instruction;
  };

  const createBlob = (data: Float32Array): { data: string, mimeType: string } => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    return {
      data: base64,
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  };

  const startCall = async () => {
    setError(null);
    setStatus('connecting');
    setLogs(prev => [...prev, { role: 'system', text: 'Initializing connection with custom script...' }]);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found in environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: getSystemInstruction(),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setIsActive(true);
            setLogs(prev => [...prev, { role: 'system', text: 'Connected. Using active script configuration.' }]);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               let sum = 0;
               for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
               setVolume(Math.sqrt(sum / inputData.length));

               const pcmBlob = createBlob(inputData);
               sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
               });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            sourceRef.current = source;
            processorRef.current = scriptProcessor;
          },
          onmessage: async (msg: LiveServerMessage) => {
             const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (audioData) {
                const ctx = outputAudioContextRef.current;
                if (!ctx) return;

                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }
             if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            setStatus('disconnected');
            setIsActive(false);
            setLogs(prev => [...prev, { role: 'system', text: 'Call Ended.' }]);
            stopAudio();
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection Error: " + err.type);
            setStatus('disconnected');
            setIsActive(false);
            stopAudio();
          }
        }
      });
      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to start call");
      setStatus('disconnected');
    }
  };

  const endCall = () => {
     if (sessionRef.current) {
        sessionRef.current.then((session: any) => session.close());
     }
     stopAudio();
     setIsActive(false);
     setStatus('disconnected');
  };

  useEffect(() => {
    return () => { endCall(); };
  }, []);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'connecting' ? 'bg-yellow-500 animate-bounce' : 'bg-slate-500'}`} />
          <h2 className="text-lg font-semibold text-white">Live Simulator</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded">
          {status.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            status === 'connected' ? 'bg-blue-600/20 ring-4 ring-blue-500/20' : 'bg-slate-800'
          }`}>
             {status === 'connected' ? (
               <div className="flex gap-1 h-12 items-center">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} 
                         className="w-2 bg-blue-500 rounded-full transition-all duration-75"
                         style={{ 
                           height: isActive ? `${Math.max(10, Math.random() * (volume * 500 + 40))}px` : '4px',
                           opacity: isActive ? 1 : 0.5 
                         }}
                    />
                  ))}
               </div>
             ) : (
               <MicOff className="text-slate-600 w-12 h-12" />
             )}
          </div>
          
          {status === 'connected' && (
             <>
              <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_ease-out_infinite]" />
              <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-[ping_2s_ease-out_infinite_delay-300]" />
             </>
          )}
        </div>

        <div className="absolute bottom-8 text-center w-full px-8">
           {error ? (
             <p className="text-red-400 bg-red-900/20 py-2 px-4 rounded-lg inline-block border border-red-900/50">{error}</p>
           ) : (
             <p className="text-slate-400">
               {status === 'connected' ? 'AI Agent is listening...' : 'Ready to simulate inbound sales call'}
             </p>
           )}
        </div>
      </div>

      <div className="bg-slate-900 p-6 border-t border-slate-800">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
           <div className="flex gap-4">
              <button className="p-3 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
                 <Settings2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
                 <Volume2 className="w-5 h-5" />
              </button>
           </div>

           {status === 'connected' ? (
             <button 
               onClick={endCall}
               className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-900/20 transition-all transform hover:scale-105 active:scale-95"
             >
               <PhoneOff className="w-6 h-6" />
               End Call
             </button>
           ) : (
             <button 
               onClick={startCall}
               disabled={status === 'connecting'}
               className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {status === 'connecting' ? (
                 <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
               ) : (
                 <Phone className="w-6 h-6" />
               )}
               Start Simulation
             </button>
           )}
           
           <div className="w-24"></div>
        </div>
      </div>
      
      <div className="absolute top-20 left-4 w-64 h-48 pointer-events-none opacity-50">
        <div className="flex flex-col gap-2">
          {logs.slice(-3).map((log, idx) => (
             <div key={idx} className={`p-2 rounded-lg text-xs ${log.role === 'model' ? 'bg-blue-900/50 text-blue-200' : 'bg-slate-800/50 text-slate-300'}`}>
                <span className="font-bold opacity-75 mr-1">{log.role.toUpperCase()}:</span>
                {log.text}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};