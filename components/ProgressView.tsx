import React, { useState, useEffect } from 'react';
import { getAllExerciseNames, getExerciseHistory } from '../services/storageService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Filter, Loader2 } from 'lucide-react';

const ProgressView: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [allExercises, setAllExercises] = useState<string[]>([]);
  const [metric, setMetric] = useState<'weight' | 'volume'>('weight');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
        const exercises = await getAllExerciseNames();
        setAllExercises(exercises);
        if (exercises.length > 0) {
            setSelectedExercise(exercises[0]);
        }
        setLoading(false);
    }
    loadExercises();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
        if (selectedExercise) {
            const data = await getExerciseHistory(selectedExercise);
            setChartData(data);
        }
    }
    loadHistory();
  }, [selectedExercise]);

  const currentMax = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 0;
  const currentVolumeMax = chartData.length > 0 ? Math.max(...chartData.map(d => d.volume)) : 0;

  if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      );
  }

  return (
    <div className="p-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Evolução</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Acompanhe seus ganhos</p>
        </div>
      </div>

      {allExercises.length > 0 ? (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Exercício</label>
                <select 
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                    {allExercises.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                    ))}
                </select>

                <div className="flex gap-2 mt-4">
                    <button 
                        onClick={() => setMetric('weight')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${metric === 'weight' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                        Carga Máxima
                    </button>
                    <button 
                        onClick={() => setMetric('volume')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${metric === 'volume' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                        Volume Total
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 text-xs">Recorde Atual</p>
                    <p className="text-2xl font-bold text-emerald-500">{currentMax} <span className="text-sm text-slate-400">kg</span></p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 text-xs">Volume Máx.</p>
                    <p className="text-2xl font-bold text-blue-500">{(currentVolumeMax / 1000).toFixed(1)}k <span className="text-sm text-slate-400">kg</span></p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg h-80">
                <ResponsiveContainer width="100%" height="100%">
                {metric === 'weight' ? (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={30} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#10b981" 
                            strokeWidth={4} 
                            dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                        />
                    </LineChart>
                ) : (
                    <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={35} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }}/>
                        <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVol)" strokeWidth={3} />
                    </AreaChart>
                )}
                </ResponsiveContainer>
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Registre treinos para desbloquear seus gráficos de evolução.</p>
        </div>
      )}
    </div>
  );
};

export default ProgressView;