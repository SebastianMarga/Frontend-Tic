import React, { useState } from 'react';
import { Boxes, Lock, Mail, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('admin@inventario.ia');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = await authService.login(email, password);
      if (session.ok === false) {
        toast.error('Credenciales Inválidas');
        return
      }
      toast.success('Login Exitoso');
      onLoginSuccess(session.user);
    } catch (err) {
      toast.error(err.message);
      console.error(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleForgotPassword = () => {
    alert('Para restablecer su contraseña, contacte a un administrador o use la opción de Registro.');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6"
      id="login-view"
    >
      <div className="w-full max-w-[440px] bg-white border border-border rounded-lg shadow-md py-10 px-9 flex flex-col">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 bg-[#0b1c30] rounded-[10px] flex items-center justify-center text-white mb-3">
            <Boxes size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">
            Inventario IA
          </h1>
          <span className="text-xs text-text-secondary font-medium">
            Gestión Zero-Touch
          </span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-md mb-6 gap-1 border border-border">
          <button
            type="button"
            className="flex-1 py-2 px-3 border-none bg-white text-[#0b1c30] text-[13px] font-bold rounded-sm cursor-pointer transition-all text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            id="tab-active-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="flex-1 py-2 px-3 border-none bg-transparent text-slate-500 text-[13px] font-semibold rounded-sm cursor-pointer transition-all text-center hover:text-slate-900"
            onClick={onSwitchToRegister}
            id="tab-switch-to-register"
          >
            Registro
          </button>
        </div>

        <h2 className="text-base font-bold text-text-primary mb-1">
          Iniciar Sesión
        </h2>
        <p className="text-[13px] text-text-secondary mb-6">
          Ingrese sus credenciales corporativas para acceder al sistema.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 py-2.5 px-3.5 rounded-sm text-xs font-medium mb-4 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              CORREO ELECTRÓNICO
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                className="form-input pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@inventario.ia"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              CONTRASEÑA
            </label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="login-password"
                type="password"
                className="form-input pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center my-3 mb-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
              <input type="checkbox" defaultChecked />
              <span>Recordar este dispositivo</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[#0b1c30] font-semibold bg-transparent border-none cursor-pointer p-0"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0b1c30] text-white border-none rounded-sm py-3 text-sm font-semibold cursor-pointer mt-3 transition-colors flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
            id="btn-login-submit"
          >
            <span>{loading ? 'Accediendo...' : 'Acceder al Sistema'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-4 text-center text-[13px] text-slate-500 flex items-center justify-center gap-1.5">
          <span>¿No tienes una cuenta aún?</span>
          <button
            type="button"
            className="bg-none border-none text-[#0b1c30] font-bold cursor-pointer p-0 text-[13px] underline hover:opacity-80"
            onClick={onSwitchToRegister}
            id="btn-link-switch-to-register"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}