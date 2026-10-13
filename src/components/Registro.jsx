import React, { useState } from 'react';
import {
  Boxes,
  User,
  Mail,
  Lock,
  Shield,
  UserCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export default function Registro({ onRegisterSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor ingrese su nombre completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingrese un correo electrónico corporativo válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!acceptTerms) {
      setError('Debe aceptar las políticas del sistema.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(name, email, password);
      toast.success('Registro Exitoso');

      onRegisterSuccess();
      onSwitchToLogin();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-[24px]"
      id="registro-view"
    >
      <div className="w-full max-w-[480px] bg-white border border-solid border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] py-[40px] px-[36px] flex flex-col">
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
            className="flex-1 py-[8px] px-[12px] border-none bg-transparent text-[#64748b] hover:text-[#0f172a] text-[13px] leading-[1.5] font-[600] rounded-[var(--radius-sm)] cursor-pointer transition-all duration-150 ease-in-out text-center"
            onClick={onSwitchToLogin}
            id="tab-switch-to-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="flex-1 py-[8px] px-[12px] border-none bg-white text-[#0b1c30] text-[13px] leading-[1.5] font-[700] rounded-[var(--radius-sm)] cursor-pointer transition-all duration-150 ease-in-out text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            id="tab-active-registro"
          >
            Registro
          </button>
        </div>

        <h2 className="text-[16px] leading-[1.5] font-[700] text-[var(--text-primary)] mb-[4px]">
          Crear Nueva Cuenta
        </h2>
        <p className="text-[13px] leading-[1.5] text-[var(--text-secondary)] mb-[24px]">
          Complete los datos para habilitar su acceso y firma operativa en el
          inventario.
        </p>

        {error && (
          <div className="bg-[#fee2e2] border border-solid border-[#fecaca] text-[#991b1b] py-[10px] px-[14px] rounded-[var(--radius-sm)] text-[12px] leading-[1.5] font-[500] mb-[16px] flex items-center gap-[8px]">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#ecfdf5] border border-solid border-[#a7f3d0] text-[#065f46] py-[10px] px-[14px] rounded-[var(--radius-sm)] text-[12px] leading-[1.5] font-[600] mb-[16px] flex items-center gap-[8px]">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nombre Completo */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              NOMBRE COMPLETO
            </label>
            <div className="relative flex items-center">
              <User
                size={15}
                className="absolute left-[12px] text-[#94a3b8] pointer-events-none"
              />
              <input
                id="reg-name"
                type="text"
                className="form-input !pl-[36px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Morales"
                required
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              CORREO ELECTRÓNICO CORPORATIVO
            </label>
            <div className="relative flex items-center">
              <Mail
                size={15}
                className="absolute left-[12px] text-[#94a3b8] pointer-events-none"
              />
              <input
                id="reg-email"
                type="email"
                className="form-input !pl-[36px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofia.morales@inventario.ia"
                required
              />
            </div>
          </div>

          {/* Rol del usuario - Estrictamente OPERATOR en registro público */}
          <div className="form-group">
            <label className="form-label">ROL ASIGNADO EN REGISTRO</label>
            <div
              className="bg-[#f8fafc] border-[1.5px] border-solid border-[#e2e8f0] rounded-[var(--radius-sm)] py-[12px] px-[14px] flex flex-col gap-[8px]"
              id="card-role-locked-operator"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-[6px] bg-[#0b1c30] text-white py-[4px] px-[10px] rounded-[4px] text-[11px] leading-[1.5] font-[700] tracking-[0.04em]">
                  <UserCheck size={14} />
                  <span>OPERATOR</span>
                </div>
                <span className="text-[11px] leading-[1.5] text-[#64748b] font-[500]">
                  Rol Predeterminado
                </span>
              </div>
              <p className="text-[12px] text-[#334155] m-0 leading-[1.4]">
                Acceso operativo para registro de entradas, salidas y auditoría
                de inventario físico.
              </p>
              <div className="flex items-start gap-[8px] bg-[#eff6ff] border border-solid border-[#bfdbfe] border-l-[3px] border-l-[#1d4ed8] py-[8px] px-[10px] rounded-[4px] text-[11px] text-[#1e3a8a] leading-[1.4]">
                <Shield size={13} className="shrink-0 mt-[2px]" />
                <span>
                  <strong>Política de Seguridad:</strong> La asignación del rol{' '}
                  <strong>ADMIN</strong> requiere autorización y solo puede ser
                  otorgada editando el perfil por otro usuario con rol
                  Administrador.
                </span>
              </div>
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                CONTRASEÑA
              </label>
              <div className="relative flex items-center">
                <Lock
                  size={15}
                  className="absolute left-[12px] text-[#94a3b8] pointer-events-none"
                />
                <input
                  id="reg-password"
                  type="password"
                  className="form-input !pl-[36px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">
                CONFIRMAR CONTRASEÑA
              </label>
              <div className="relative flex items-center">
                <Lock
                  size={15}
                  className="absolute left-[12px] text-[#94a3b8] pointer-events-none"
                />
                <input
                  id="reg-confirm-password"
                  type="password"
                  className="form-input !pl-[36px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox de términos y trazabilidad */}
          <div className="mt-[14px] mb-[18px] text-[12px]">
            <label className="flex items-start gap-[8px] cursor-pointer text-[#475569]">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-[2px]"
                id="chk-accept-terms"
              />
              <span>
                Acepto los términos y políticas de seguridad Zero-Touch.
              </span>
            </label>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className="w-full bg-[#0b1c30] hover:enabled:bg-[#1e293b] disabled:opacity-60 disabled:cursor-not-allowed text-white border-none rounded-[var(--radius-sm)] p-[12px] text-[14px] leading-[1.5] font-[600] cursor-pointer mt-[12px] transition-colors duration-150 ease-in-out flex items-center justify-center gap-[8px]"
            disabled={loading}
            id="btn-register-submit"
          >
            <span>
              {loading
                ? 'Creando cuenta...'
                : 'Completar Registro y Acceder'}
            </span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Enlace para volver a Iniciar Sesión */}
        <div className="mt-[18px] text-center text-[13px] leading-[1.5] text-[#64748b] flex items-center justify-center gap-[6px]">
          <span>¿Ya tienes una cuenta registrada?</span>
          <button
            type="button"
            className="bg-transparent border-none text-[#0b1c30] font-[700] cursor-pointer p-0 text-[13px] leading-[1.5] underline transition-opacity duration-150 hover:opacity-80"
            onClick={onSwitchToLogin}
            id="btn-link-switch-to-login"
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
}