import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Dumbbell, ArrowRight, Loader2, Mail, KeyRound, ArrowLeft, Hash } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'reset';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [view, setView] = useState<AuthView>('login');
  
  // Estado para controlar o fluxo de recuperação (email -> otp)
  const [resetStep, setResetStep] = useState<'email' | 'otp'>('email');
  
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  // Helper para traduzir erros do Supabase
  const translateError = (errorMsg: string) => {
    const msg = errorMsg.toLowerCase();
    // Senhas
    if (msg.includes("password should be at least 6 characters")) return "A senha deve ter pelo menos 6 caracteres.";
    // Login/Cadastro
    if (msg.includes("invalid login credentials")) return "Email ou senha incorretos.";
    if (msg.includes("user already registered")) return "Este email já está em uso.";
    // Tokens/Códigos
    if (msg.includes("token has expired")) return "O código expirou. Solicite um novo.";
    if (msg.includes("invalid token")) return "Código inválido. Verifique e tente novamente.";
    if (msg.includes("email not confirmed")) return "Email não confirmado. Verifique sua caixa de entrada.";
    // Rate Limits
    if (msg.includes("rate limit exceeded")) return "Muitas tentativas. Aguarde um momento.";
    if (msg.includes("security purposes")) return "Por segurança, aguarde alguns instantes antes de tentar novamente.";
    
    return errorMsg;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (view === 'signup') {
        // Cadastro com login automático (assumindo email confirmation desligado)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
            setMessage({ text: 'Conta criada com sucesso! Entrando...', type: 'success' });
        } else {
            // Fallback caso a confirmação de email ainda esteja ligada no servidor
            setMessage({ text: 'Cadastro realizado! Se necessário, verifique seu email.', type: 'success' });
        }
      }
    } catch (error: any) {
      setMessage({ text: translateError(error.message || 'Erro na autenticação'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        // Envia um código (OTP) para o email
        const { error } = await supabase.auth.signInWithOtp({
            email,
        });
        
        if (error) throw error;
        
        setMessage({ text: 'Código enviado! Verifique seu email.', type: 'success' });
        setResetStep('otp');
    } catch (error: any) {
        setMessage({ text: translateError(error.message || 'Erro ao enviar código'), type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage(null);

      try {
          const { error } = await supabase.auth.verifyOtp({
              email,
              token: otp,
              type: 'email'
          });

          if (error) throw error;
          
          // Se sucesso, o usuário está logado (sessão criada).
          // O App.tsx vai detectar a mudança de estado e redirecionar.
          setMessage({ text: 'Código verificado! Entrando...', type: 'success' });
          
      } catch (error: any) {
          setMessage({ text: translateError(error.message || 'Erro ao verificar código'), type: 'error' });
      } finally {
          setLoading(false);
      }
  };

  const switchView = (newView: AuthView) => {
      setView(newView);
      setResetStep('email'); // Reseta o passo de recuperação
      setOtp('');
      setMessage(null);
  };

  const getTitle = () => {
      switch(view) {
          case 'login': return 'Bem-vindo de volta';
          case 'signup': return 'Crie sua conta';
          case 'reset': return resetStep === 'email' ? 'Recuperar Senha' : 'Verificar Código';
      }
  };

  const getSubtitle = () => {
      switch(view) {
        case 'login': return 'Continue sua jornada de treinos.';
        case 'signup': return 'Comece a registrar sua evolução hoje.';
        case 'reset': return resetStep === 'email' ? 'Enviaremos um código para seu email.' : 'Digite o código recebido no email.';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
             {view === 'reset' ? <KeyRound size={32} className="text-white" /> : <Dumbbell size={32} className="text-white" />}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">
          IronTrack <span className="text-emerald-500">AI</span>
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-2 font-medium">
          {getTitle()}
        </p>
        <p className="text-center text-slate-400 dark:text-slate-500 mb-8 text-xs">
          {getSubtitle()}
        </p>

        {message && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-medium text-center ${message.type === 'error' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                {message.text}
            </div>
        )}

        <form onSubmit={
            view === 'reset' 
                ? (resetStep === 'email' ? handleSendResetCode : handleVerifyResetCode) 
                : handleAuth
            } className="space-y-4">
          
          {/* Campo de Email - Visível em Login, Signup e Reset (passo 1) */}
          {(view !== 'reset' || resetStep === 'email') && (
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="seu@email.com"
                    required
                    />
                </div>
            </div>
          )}
          
          {/* Campo de Senha - Apenas Login e Signup */}
          {view !== 'reset' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
          )}

          {/* Campo de Código (OTP) - Apenas Reset (passo 2) */}
          {view === 'reset' && resetStep === 'otp' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Código de Verificação</label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors tracking-widest font-mono"
                    placeholder="123456"
                    required
                    />
                </div>
              </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
                <>
                    {view === 'login' && <>Entrar <ArrowRight size={20} /></>}
                    {view === 'signup' && <>Criar Conta <ArrowRight size={20} /></>}
                    {view === 'reset' && resetStep === 'email' && <>Enviar Código <ArrowRight size={20} /></>}
                    {view === 'reset' && resetStep === 'otp' && <>Confirmar e Entrar <ArrowRight size={20} /></>}
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
            {view === 'login' ? (
                <>
                    <button 
                        onClick={() => switchView('signup')}
                        className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium transition-colors"
                    >
                        Não tem uma conta? <span className="text-emerald-500">Crie agora</span>
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => switchView('reset')}
                        className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium transition-colors"
                    >
                        Esqueceu a senha? <span className="text-emerald-500">Redefina agora</span>
                    </button>
                </>
            ) : (
                 <button 
                    onClick={() => switchView('login')}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium transition-colors flex items-center justify-center gap-1 w-full"
                >
                    <ArrowLeft size={16} /> Voltar para o Login
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;