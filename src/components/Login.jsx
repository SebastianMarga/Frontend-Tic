import React, { useState } from 'react';
import { Boxes, Lock, Mail, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import { authService } from '../services/authService.js';
import './Login.css';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('admin@inventario.ia');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await authService.login(email, password);
      if (session?.user) {
        onLoginSuccess(session.user);
      }
    } catch (err) {
      setError(err.message || 'Error de autenticación');
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
    <div className="login-wrapper" id="login-view">
      <div className="login-card">
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
            className="auth-tab-btn active"
            id="tab-active-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="auth-tab-btn"
            onClick={onSwitchToRegister}
            id="tab-switch-to-register"
          >
            Registro
          </button>
        </div>

        <h2 className="login-form-title">Iniciar Sesión</h2>
        <p className="login-form-desc">
          Ingrese sus credenciales corporativas para acceder al sistema.
        </p>

        {error && (
          <div className="login-error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              CORREO ELECTRÓNICO
            </label>
            <div className="input-with-icon-wrapper">
              <Mail size={15} className="input-field-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input with-icon"
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
            <div className="input-with-icon-wrapper">
              <Lock size={15} className="input-field-icon" />
              <input
                id="login-password"
                type="password"
                className="form-input with-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '12px 0 16px',
              fontSize: '12px'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#64748b' }}>
              <input type="checkbox" defaultChecked />
              <span>Recordar este dispositivo</span>
            </label>
            <a
              href="#recuperar"
              onClick={(e) => {
                e.preventDefault();
                alert('Para restablecer su contraseña, contacte a un administrador o use la opción de Registro.');
              }}
              style={{ color: '#0b1c30', fontWeight: 600 }}
            >
              ¿Olvidó su contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="login-btn-submit"
            disabled={loading}
            id="btn-login-submit"
          >
            <span>{loading ? 'Accediendo...' : 'Acceder al Sistema'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Enlace para cambiar a Registro */}
        <div className="auth-switch-footer">
          <span>¿No tienes una cuenta aún?</span>
          <button
            type="button"
            className="auth-switch-link-btn"
            onClick={onSwitchToRegister}
            id="btn-link-switch-to-register"
          >
            Regístrate aquí
          </button>
        </div>

        {/* Atajos Rápidos para testing de roles */}
        <div className="login-demo-helpers">
          <span className="login-demo-title">Accesos de Prueba Rápidos:</span>
          <div className="login-demo-pills">
            <button
              type="button"
              className="login-demo-pill"
              onClick={() => handleQuickDemo('admin@inventario.ia', 'admin123')}
              id="btn-demo-admin"
            >
              Rol ADMIN
            </button>
            <button
              type="button"
              className="login-demo-pill"
              onClick={() => handleQuickDemo('miguel.gomez@inventarioia.com', 'operator123')}
              id="btn-demo-operator"
            >
              Rol OPERATOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

