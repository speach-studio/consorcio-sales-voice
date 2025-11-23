import React, { useState } from 'react';
import { ScriptConfig, ScriptRule } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Wand2, 
  Plus, 
  Trash2, 
  Save, 
  PlayCircle, 
  Bot, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ScriptEditorProps {
  scriptConfig: ScriptConfig;
  setScriptConfig: (config: ScriptConfig) => void;
  onTestScript: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  scriptConfig, 
  setScriptConfig,
  onTestScript
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'persona' | 'rules'>('persona');

  const generateScript = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      
      // Define schema for structured output
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          basePersona: {
            type: Type.STRING,
            description: "The core personality and instructions for the AI agent."
          },
          rules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                condition: { type: Type.STRING, description: "The trigger condition (e.g., 'User asks for price')" },
                instruction: { type: Type.STRING, description: "How the AI should respond to this condition" }
              }
            }
          }
        },
        required: ["basePersona", "rules"]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a sales script configuration based on this description: "${prompt}". 
                  Focus on Brazilian consortium sales context if not specified.
                  Include specific branching rules for common objections or signals.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        const newRules: ScriptRule[] = data.rules.map((r: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          condition: r.condition,
          instruction: r.instruction
        }));

        setScriptConfig({
          basePersona: data.basePersona,
          rules: newRules
        });
      }
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate script. Please check API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addRule = () => {
    const newRule: ScriptRule = {
      id: Math.random().toString(36).substr(2, 9),
      condition: '',
      instruction: ''
    };
    setScriptConfig({
      ...scriptConfig,
      rules: [...scriptConfig.rules, newRule]
    });
    setActiveTab('rules');
  };

  const updateRule = (id: string, field: 'condition' | 'instruction', value: string) => {
    const newRules = scriptConfig.rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    );
    setScriptConfig({ ...scriptConfig, rules: newRules });
  };

  const removeRule = (id: string) => {
    setScriptConfig({
      ...scriptConfig,
      rules: scriptConfig.rules.filter(r => r.id !== id)
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Generator Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                AI Script Generator
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A friendly agent selling truck consortiums to small business owners, handling price objections aggressively."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && generateScript()}
              />
              <button
                onClick={generateScript}
                disabled={isGenerating || !prompt}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Wand2 size={18} />
                )}
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Column: Base Persona */}
        <div className="lg:col-span-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-blue-400" />
              <h3 className="font-semibold text-white">Base Persona</h3>
            </div>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={scriptConfig.basePersona}
              onChange={(e) => setScriptConfig({...scriptConfig, basePersona: e.target.value})}
              placeholder="Define the agent's personality, goals, and tone..."
              className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 leading-relaxed focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Right Column: Branching Rules */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-green-400" />
              <h3 className="font-semibold text-white">Branching Logic & Rules</h3>
            </div>
            <button
              onClick={addRule}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
            >
              <Plus size={14} />
              Add Rule
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {scriptConfig.rules.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <p>No rules defined yet.</p>
                <p className="text-sm mt-1">Add a rule to handle specific objections or signals.</p>
              </div>
            ) : (
              scriptConfig.rules.map((rule, index) => (
                <div key={rule.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 group hover:border-slate-700 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className="flex-none w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-800">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                          If User Says / Context:
                        </label>
                        <input
                          type="text"
                          value={rule.condition}
                          onChange={(e) => updateRule(rule.id, 'condition', e.target.value)}
                          placeholder="e.g., 'It's too expensive'"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                          AI Instruction / Branch:
                        </label>
                        <textarea
                          value={rule.instruction}
                          onChange={(e) => updateRule(rule.id, 'instruction', e.target.value)}
                          placeholder="e.g., Pivot to the 'Half-Parcel' plan benefits..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-green-300 focus:ring-1 focus:ring-green-500 resize-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-2">
         <button className="px-6 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-colors flex items-center gap-2">
            <Save size={18} />
            Save Template
         </button>
         <button 
           onClick={onTestScript}
           className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-900/20 transition-colors flex items-center gap-2"
         >
            <PlayCircle size={20} />
            Test in Simulator
         </button>
      </div>
    </div>
  );
};