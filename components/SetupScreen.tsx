import React, { useState } from 'react';
import { Database, Save, AlertCircle, HelpCircle } from 'lucide-react';

const SetupScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (!url || !key) return;
    localStorage.setItem('sb_url', url.trim());
    localStorage.setItem('sb_key', key.trim());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
             <Database size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          Configuração do Banco de Dados
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Para continuar, conecte seu projeto do Supabase.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-sm font-mono"
              placeholder="https://your-project.supabase.co"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Project API Key (Anon)</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-sm font-mono"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start">
            <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Você pode encontrar essas informações no painel do Supabase em <strong>Settings &gt; API</strong>. Copie a URL e a chave pública "anon".
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!url || !key}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} /> Salvar e Conectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;