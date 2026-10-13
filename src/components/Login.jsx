import React, { useState } from 'react';
import { Boxes, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('Usuario123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = await authService.login(email, password);
      if (session.ok === false) {
        toast.error('Credenciales Inválidas');
        return;
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

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-[24px]"
      id="login-view"
    >
      <div className="w-full max-w-[440px] bg-white border border-solid border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] py-[40px] px-[36px] flex flex-col">
        {/* Identidad de Marca */}
        <div className="flex flex-col items-center text-center mb-[28px]">
          <div className="w-[48px] h-[48px] bg-[#0b1c30] rounded-[10px] flex items-center justify-center text-white mb-[12px]">
            <Boxes size={28} />
          </div>
          <h1 className="text-[20px] leading-[1.5] font-[800] text-[var(--text-primary)] tracking-[-0.02em]">
            Inventario IA
          </h1>
          <span className="text-[12px] leading-[1.5] text-[var(--text-secondary)] font-[500]">
            Gestión Zero-Touch
          </span>
        </div>

        {/* Selector de Pestañas: Iniciar Sesión / Registro */}
        <div className="flex bg-[#f1f5f9] p-[4px] rounded-[var(--radius-md)] mb-[24px] gap-[4px] border border-solid border-[#e2e8f0]">
          <button
            type="button"
            className="flex-1 py-[8px] px-[12px] border-none bg-white text-[#0b1c30] text-[13px] leading-[1.5] font-[700] rounded-[var(--radius-sm)] cursor-pointer transition-all duration-150 ease-in-out text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            id="tab-active-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="flex-1 py-[8px] px-[12px] border-none bg-transparent text-[#64748b] hover:text-[#0f172a] text-[13px] leading-[1.5] font-[600] rounded-[var(--radius-sm)] cursor-pointer transition-all duration-150 ease-in-out text-center"
            onClick={onSwitchToRegister}
            id="tab-switch-to-register"
          >
            Registro
          </button>
        </div>

        <h2 className="text-[16px] leading-[1.5] font-[700] text-[var(--text-primary)] mb-[4px]">
          Iniciar Sesión
        </h2>
        <p className="text-[13px] leading-[1.5] text-[var(--text-secondary)] mb-[24px]">
          Ingrese sus credenciales corporativas para acceder al sistema.
        </p>

        {error && (
          <div className="bg-[#fee2e2] border border-solid border-[#fecaca] text-[#991b1b] py-[10px] px-[14px] rounded-[var(--radius-sm)] text-[12px] leading-[1.5] font-[500] mb-[16px] flex items-center gap-[8px]">
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
              <Mail
                size={15}
                className="absolute left-[12px] text-[#94a3b8] pointer-events-none"
              />
              <input
                id="login-email"
                type="email"
                className="form-input !pl-[36px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@gmail.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              CONTRASEÑA
            </label>
            <div className="relative flex items-center">
              <Lock
                size={15}
                className="absolute left-[12px] text-[#94a3b8] pointer-events-none"
              />
              <input
                id="login-password"
                type="password"
                className="form-input !pl-[36px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-[12px] mb-[16px] text-[12px]">
            <label className="flex items-center gap-[6px] cursor-pointer text-[#64748b]">
              <input type="checkbox" defaultChecked />
              <span>Recordar este dispositivo</span>
            </label>
            <a
              href="#recuperar"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Para restablecer su contraseña, contacte a un administrador o use la opción de Registro.'
                );
              }}
              className="text-[#0b1c30] font-[600] no-underline hover:underline"
            >
              ¿Olvidó su contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0b1c30] hover:enabled:bg-[#1e293b] disabled:opacity-60 disabled:cursor-not-allowed text-white border-none rounded-[var(--radius-sm)] p-[12px] text-[14px] leading-[1.5] font-[600] cursor-pointer mt-[12px] transition-colors duration-150 ease-in-out flex items-center justify-center gap-[8px]"
            disabled={loading}
            id="btn-login-submit"
          >
            <span>{loading ? 'Accediendo...' : 'Acceder al Sistema'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Enlace para cambiar a Registro */}
        <div className="mt-[18px] text-center text-[13px] leading-[1.5] text-[#64748b] flex items-center justify-center gap-[6px]">
          <span>¿No tienes una cuenta aún?</span>
          <button
            type="button"
            className="bg-transparent border-none text-[#0b1c30] font-[700] cursor-pointer p-0 text-[13px] leading-[1.5] underline transition-opacity duration-150 hover:opacity-80"
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