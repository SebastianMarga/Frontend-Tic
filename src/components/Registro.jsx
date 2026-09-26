import React, { useState } from 'react';
import { Boxes, User, Mail, Lock, Shield, UserCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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
      className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6"
      id="registro-view"
    >
      <div className="w-full max-w-[480px] bg-white border border-border rounded-lg shadow-md py-10 px-9 flex flex-col">
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
            className="flex-1 py-2 px-3 border-none bg-transparent text-slate-500 text-[13px] font-semibold rounded-sm cursor-pointer transition-all text-center hover:text-slate-900"
            onClick={onSwitchToLogin}
            id="tab-switch-to-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="flex-1 py-2 px-3 border-none bg-white text-[#0b1c30] text-[13px] font-bold rounded-sm cursor-pointer transition-all text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            id="tab-active-registro"
          >
            Registro
          </button>
        </div>

        <h2 className="text-base font-bold text-text-primary mb-1">
          Crear Nueva Cuenta
        </h2>
        <p className="text-[13px] text-text-secondary mb-6">
          Complete los datos para habilitar su acceso y firma operativa en el inventario.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 py-2.5 px-3.5 rounded-sm text-xs font-medium mb-4 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 py-2.5 px-3.5 rounded-sm text-xs font-semibold mb-4 flex items-center gap-2">
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
              <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="reg-name"
                type="text"
                className="form-input pl-9"
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
              <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                className="form-input pl-9"
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
              className="bg-slate-50 border-[1.5px] border-border rounded-sm py-3 px-3.5 flex flex-col gap-2"
              id="card-role-locked-operator"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 bg-[#0b1c30] text-white py-1 px-2.5 rounded text-[11px] font-bold tracking-wide">
                  <UserCheck size={14} />
                  <span>OPERATOR</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Rol Predeterminado
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">
                Acceso operativo para registro de entradas, salidas y auditoría de inventario físico.
              </p>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-700 py-2 px-2.5 rounded text-[11px] text-blue-900 leading-snug">
                <Shield size={13} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Política de Seguridad:</strong> La asignación del rol <strong>ADMIN</strong> requiere autorización y solo puede ser otorgada editando el perfil por otro usuario con rol Administrador.
                </span>
              </div>
            </div>
          </div>

          {/* Contraseñas */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                CONTRASEÑA
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  id="reg-password"
                  type="password"
                  className="form-input pl-9"
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
                <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  className="form-input pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox de términos y trazabilidad */}
          <div className="my-3.5 mb-4.5 text-xs">
            <label className="flex items-start gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5"
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
            className="w-full bg-[#0b1c30] text-white border-none rounded-sm py-3 text-sm font-semibold cursor-pointer mt-3 transition-colors flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
            id="btn-register-submit"
          >
            <span>{loading ? 'Creando cuenta...' : 'Completar Registro y Acceder'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Enlace para volver a Iniciar Sesión */}
        <div className="mt-4 text-center text-[13px] text-slate-500 flex items-center justify-center gap-1.5">
          <span>¿Ya tienes una cuenta registrada?</span>
          <button
            type="button"
            className="bg-none border-none text-[#0b1c30] font-bold cursor-pointer p-0 text-[13px] underline hover:opacity-80"
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