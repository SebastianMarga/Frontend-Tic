import React, { useState } from 'react';
import { Boxes, User, Mail, Lock, Shield, UserCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import './Login.css';

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
      setError('Debe aceptar las políticas de trazabilidad y uso del sistema.');
      return;
    }

    setLoading(true);

    try {
      // El registro público es estrictamente con rol OPERATOR
      const session = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'OPERATOR'
      });

      setSuccessMsg('¡Cuenta registrada exitosamente! Iniciando sesión...');
      setTimeout(() => {
        if (session?.user) {
          onRegisterSuccess(session.user);
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" id="registro-view">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        {/* Identidad de Marca */}
        <div className="login-brand-header">
          <div className="login-logo-box">
            <Boxes size={28} />
          </div>
          <h1 className="login-system-name">Inventario IA</h1>
          <span className="login-system-sub">Gestión Zero-Touch</span>
        </div>

        {/* Selector de Pestañas: Iniciar Sesión / Registro */}
        <div className="auth-tabs-switcher">
          <button
            type="button"
            className="auth-tab-btn"
            onClick={onSwitchToLogin}
            id="tab-switch-to-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="auth-tab-btn active"
            id="tab-active-registro"
          >
            Registro
          </button>
        </div>

        <h2 className="login-form-title">Crear Nueva Cuenta</h2>
        <p className="login-form-desc">
          Complete los datos para habilitar su acceso y firma operativa en el inventario.
        </p>

        {error && (
          <div className="login-error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="login-success-box">
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
            <div className="input-with-icon-wrapper">
              <User size={15} className="input-field-icon" />
              <input
                id="reg-name"
                type="text"
                className="form-input with-icon"
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
            <div className="input-with-icon-wrapper">
              <Mail size={15} className="input-field-icon" />
              <input
                id="reg-email"
                type="email"
                className="form-input with-icon"
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
            <div className="role-locked-info-card" id="card-role-locked-operator">
              <div className="role-locked-header">
                <div className="role-locked-badge">
                  <UserCheck size={14} />
                  <span>OPERATOR</span>
                </div>
                <span className="role-locked-tag">Rol Predeterminado</span>
              </div>
              <p className="role-locked-desc">
                Acceso operativo para registro de entradas, salidas y auditoría de inventario físico.
              </p>
              <div className="role-locked-policy">
                <Shield size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
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
              <div className="input-with-icon-wrapper">
                <Lock size={15} className="input-field-icon" />
                <input
                  id="reg-password"
                  type="password"
                  className="form-input with-icon"
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
              <div className="input-with-icon-wrapper">
                <Lock size={15} className="input-field-icon" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  className="form-input with-icon"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox de términos y trazabilidad */}
          <div style={{ margin: '14px 0 18px', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: '#475569' }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{ marginTop: '2px' }}
                id="chk-accept-terms"
              />
              <span>
                Acepto los términos de trazabilidad operativa y políticas de seguridad Zero-Touch.
              </span>
            </label>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className="login-btn-submit"
            disabled={loading}
            id="btn-register-submit"
          >
            <span>{loading ? 'Creando cuenta...' : 'Completar Registro y Acceder'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Enlace para volver a Iniciar Sesión */}
        <div className="auth-switch-footer">
          <span>¿Ya tienes una cuenta registrada?</span>
          <button
            type="button"
            className="auth-switch-link-btn"
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
