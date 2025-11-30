
import React, { useState, useEffect } from 'react';
import { TileData } from '../types';
import { validateAnswer, generateSpeech, playAudioBuffer } from '../services/gemini';
import { Volume2, CheckCircle, XCircle, Mic, Loader2, ArrowRight, UserCheck, Bot, MicOff } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, playUIHoverSound } from '../services/audio';

interface Props {
  task: TileData;
  onComplete: () => void;
  currentPlayerName: string;
}

const TaskModal: React.FC<Props> = ({ task, onComplete, currentPlayerName }) => {
  const [answer, setAnswer] = useState('');
  // status: 'idle' = waiting for input, 'checking' = AI thinking, 'reviewed' = AI has spoken, 'correct' = Teacher approved, 'incorrect' = Teacher rejected/Retry
  const [status, setStatus] = useState<'idle' | 'checking' | 'reviewed' | 'correct' | 'incorrect'>('idle');
  const [aiFeedback, setAiFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Pre-fetch TTS audio if the task involves pronunciation
  useEffect(() => {
    if (task.category === 'speaking' && task.content) {
      setIsLoadingAudio(true);
      const textToSpeak = task.content.join('. ');
      generateSpeech(textToSpeak).then(buffer => {
        setAudioBuffer(buffer);
        setIsLoadingAudio(false);
      });
    }
  }, [task]);

  const handlePlayAudio = () => {
    if (audioBuffer) {
      playAudioBuffer(audioBuffer);
    }
  };

  const handleStartListening = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
          alert("Your browser does not support voice recognition. Please try using Google Chrome.");
          return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      playUIHoverSound();

      recognition.onstart = () => {
          setIsListening(true);
      };

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setAnswer(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
      };

      recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
      };

      recognition.onend = () => {
          setIsListening(false);
      };

      recognition.start();
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setStatus('checking');
    const result = await validateAnswer(task, answer);
    
    setAiFeedback({ isCorrect: result.isCorrect, text: result.feedback });
    setStatus('reviewed');
  };

  const handleTeacherVerdict = (approved: boolean) => {
      if (approved) {
          playCorrectSound();
          setStatus('correct');
      } else {
          playIncorrectSound();
          setStatus('incorrect');
          // Keep the previous input/feedback visible but allow editing
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6 text-white text-center shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold">{currentPlayerName}'s Turn</h2>
            <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-md">
                {task.title}
            </div>
        </div>

        {/* Content Scroll Area */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar">
            <p className="text-lg text-gray-700 text-center font-medium">
                {task.description}
            </p>

            {/* Pronunciation specific UI */}
            {task.category === 'speaking' && task.content && (
                <div className="flex flex-col items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {task.content.map(word => (
                            <span key={word} className="px-3 py-1 bg-white rounded-md shadow-sm text-lg font-bold text-orange-600">
                                {word}
                            </span>
                        ))}
                    </div>
                    <button 
                        onClick={handlePlayAudio} 
                        disabled={isLoadingAudio || !audioBuffer}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                        {isLoadingAudio ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                        Listen to AI
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="space-y-4">
                {(task.category !== 'speaking' || status !== 'correct') && (
                     <div className="relative">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Your Answer:</label>
                        <div className="relative">
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full border-gray-300 border-2 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all min-h-[100px]"
                                placeholder="Type or speak your answer here..."
                                disabled={status === 'correct' || status === 'checking' || isListening}
                            />
                            <button
                                type="button"
                                onClick={handleStartListening}
                                disabled={status === 'correct' || status === 'checking'}
                                className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
                                    isListening 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600'
                                }`}
                                title="Speak answer"
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        </div>
                     </div>
                )}
               
               {/* AI Feedback Section */}
               {(status === 'reviewed' || status === 'incorrect' || status === 'correct') && aiFeedback && (
                   <div className={`p-4 rounded-xl flex items-start gap-3 border transition-colors ${aiFeedback.isCorrect ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                       <div className={`p-2 rounded-full ${aiFeedback.isCorrect ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                           <Bot size={20} />
                       </div>
                       <div>
                           <p className="font-bold text-gray-800">AI Feedback</p>
                           <p className="text-sm text-gray-600 mt-1">{aiFeedback.text}</p>
                       </div>
                   </div>
               )}

               {/* Success Message */}
               {status === 'correct' && (
                   <div className="p-4 rounded-xl flex items-center gap-3 bg-green-50 border border-green-200 animate-in fade-in slide-in-from-bottom-2">
                       <CheckCircle className="text-green-600 shrink-0" size={24} />
                       <p className="font-bold text-green-800">Answer Accepted!</p>
                   </div>
               )}

               {/* Ask AI Button */}
               {status !== 'correct' && (
                    <button
                        onClick={handleAskAI}
                        disabled={status === 'checking' || !answer.trim()}
                        className="w-full bg-indigo-50 text-indigo-600 border border-indigo-200 py-3 rounded-xl font-bold hover:bg-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {status === 'checking' ? <Loader2 className="animate-spin" /> : <><Bot size={18} /> Ask AI for Feedback</>}
                    </button>
               )}
            </div>
            
            {/* Teacher / Final Verification Section */}
            <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <UserCheck size={16} />
                    Teacher Verification
                </div>
                
                {status === 'correct' ? (
                     <button
                        onClick={onComplete}
                        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02]"
                    >
                        Continue Turn <ArrowRight size={20} />
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleTeacherVerdict(true)}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-md transition-colors"
                        >
                            <CheckCircle size={18} />
                            Mark Correct
                        </button>
                        <button
                            onClick={() => handleTeacherVerdict(false)}
                            className="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <XCircle size={18} />
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
