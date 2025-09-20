import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const response = await api.post('/token/', formData);
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Buscar dados do usuário
      const userResponse = await api.get('/user/');
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      if (userResponse.data.is_barber) {
        navigate('/barbeiro');
      } else {
        navigate('/agendamentos');
      }
    } catch (error) {
      setErro('Usuário ou senha incorretos');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card">
            <h1 className="page-title">Entrar</h1>

            {erro && <div className="error">{erro}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Usuário</label>
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
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={carregando}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Não tem uma conta?{' '}
              <Link to="/cadastro" style={{ color: 'var(--gold)' }}>
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;