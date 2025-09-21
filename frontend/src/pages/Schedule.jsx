import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Schedule() {
  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    service: '',
    barber: '',
    start_time: '',
    notes: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Debug: vamos ver se os dados estão chegando
  console.log('Agendamentos carregados:', agendamentos);

  const carregarDados = async () => {
    try {
      const [servicosRes, barbeirosRes, agendamentosRes] = await Promise.all([
        api.get('/services/'),
        api.get('/barbers/'),
        api.get('/appointments/')
      ]);

      setServicos(servicosRes.data);
      setBarbeiros(barbeirosRes.data);
      setAgendamentos(agendamentosRes.data);
    } catch (error) {
      setErro('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    setNovoAgendamento({
      ...novoAgendamento,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      await api.post('/appointments/', novoAgendamento);
      setSucesso('Agendamento criado com sucesso!');
      setNovoAgendamento({
        service: '',
        barber: '',
        start_time: '',
        notes: ''
      });
      carregarDados();
    } catch (error) {
      if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat();
        setErro(errorMessages.join(', '));
      } else {
        setErro('Erro ao criar agendamento');
      }
    }
  };

  const cancelarAgendamento = async (agendamentoId) => {
    setErro('');
    setSucesso('');

    try {
      await api.patch(`/appointments/${agendamentoId}/`, {
        status: 'CANCELADO'
      });
      setSucesso('Agendamento cancelado com sucesso!');
      carregarDados();
    } catch (error) {
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro('Erro ao cancelar agendamento');
      }
    }
  };

  if (carregando) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">Barbearia LasVentura</div>
            <ul className="nav-links">
              <li>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Sair
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="page">
        <div className="container">
          <h1 className="page-title">Meus Agendamentos</h1>

          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ marginBottom: '20px', color: 'var(--gold)' }}>
                Novo Agendamento
              </h2>

              {erro && <div className="error">{erro}</div>}
              {sucesso && <div className="success">{sucesso}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Serviço</label>
                  <select
                    name="service"
                    className="form-select"
                    value={novoAgendamento.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map((servico) => (
                      <option key={servico.id} value={servico.id}>
                        {servico.name} - R$ {servico.price} ({servico.duration_minutes}min)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Barbeiro</label>
                  <select
                    name="barber"
                    className="form-select"
                    value={novoAgendamento.barber}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um barbeiro</option>
                    {barbeiros.map((barbeiro) => (
                      <option key={barbeiro.id} value={barbeiro.id}>
                        {barbeiro.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Data e Hora</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    className="form-input"
                    value={novoAgendamento.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Observações</label>
                  <textarea
                    name="notes"
                    className="form-input"
                    rows="3"
                    value={novoAgendamento.notes}
                    onChange={handleChange}
                    placeholder="Observações opcionais..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Agendar
                </button>
              </form>
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '20px', color: 'var(--gold)' }}>
                Histórico de Agendamentos
              </h2>

              {agendamentos.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  Nenhum agendamento encontrado.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {agendamentos.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      style={{
                        padding: '15px',
                        backgroundColor: 'var(--bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <strong>{agendamento.nome_servico}</strong>
                        </div>
                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: agendamento.status === 'CANCELADO' ? '#FF4444' :
                                           agendamento.status === 'REALIZADO' ? '#0088CC' :
                                           agendamento.status === 'CONFIRMADO' ? '#00AA00' : '#FFA500',
                            color: 'white'
                          }}
                        >
                          {agendamento.status}
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                        Barbeiro: {agendamento.nome_barbeiro}<br />
                        Data: {new Date(agendamento.start_time).toLocaleString('pt-BR')}
                        {agendamento.notes && (
                          <>
                            <br />
                            Obs: {agendamento.notes}
                          </>
                        )}
                      </div>

                      {agendamento.pode_cancelar && agendamento.status !== 'CANCELADO' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
                              cancelarAgendamento(agendamento.id);
                            }
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Cancelar Agendamento
                        </button>
                      )}

                      {!agendamento.pode_cancelar && agendamento.status !== 'CANCELADO' && agendamento.status !== 'REALIZADO' && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          ⏰ Cancelamento não disponível (menos de 3h para o horário)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;