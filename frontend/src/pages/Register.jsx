import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    senha: '',
    confirmar_senha: '',
    eh_barbeiro: false
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');

    if (formData.senha !== formData.confirmar_senha) {
      setErro('As senhas não coincidem');
      setCarregando(false);
      return;
    }

    try {
      await api.post('/register/', formData);
      setSucesso('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat();
        setErro(errorMessages.join(', '));
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card">
            <h1 className="page-title">Cadastrar</h1>

            {erro && <div className="error">{erro}</div>}
            {sucesso && <div className="success">{sucesso}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome de usuário</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  name="senha"
                  className="form-input"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar senha</label>
                <input
                  type="password"
                  name="confirmar_senha"
                  className="form-input"
                  value={formData.confirmar_senha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="eh_barbeiro"
                    checked={formData.eh_barbeiro}
                    onChange={handleChange}
                  />
                  <span className="form-label" style={{ margin: 0 }}>
                    Sou barbeiro
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={carregando}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ color: 'var(--gold)' }}>
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;