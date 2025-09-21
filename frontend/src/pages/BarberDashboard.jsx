import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function BarberDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [diasIndisponiveis, setDiasIndisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [filtroData, setFiltroData] = useState({
    start_date: '',
    end_date: ''
  });
  const [novaIndisponibilidade, setNovaIndisponibilidade] = useState({
    date: '',
    reason: 'Folga'
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      let url = '/appointments/';
      const params = new URLSearchParams();

      if (filtroData.start_date) params.append('start_date', filtroData.start_date);
      if (filtroData.end_date) params.append('end_date', filtroData.end_date);

      if (params.toString()) url += '?' + params.toString();

      const [todosRes, hojeRes, indisponiveisRes] = await Promise.all([
        api.get(url),
        api.get('/appointments/today/'),
        api.get('/unavailable-days/')
      ]);

      setAgendamentos(todosRes.data);
      setAgendamentosHoje(hojeRes.data);
      setDiasIndisponiveis(indisponiveisRes.data);
    } catch (error) {
      setErro('Erro ao carregar agendamentos');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarDiaIndisponivel = async () => {
    setErro('');
    setSucesso('');

    try {
      await api.post('/unavailable-days/', novaIndisponibilidade);
      setSucesso('Dia marcado como indisponível!');
      setNovaIndisponibilidade({ date: '', reason: 'Folga' });
      carregarAgendamentos();
    } catch (error) {
      if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat();
        setErro(errorMessages.join(', '));
      } else {
        setErro('Erro ao marcar dia como indisponível');
      }
    }
  };

  const removerDiaIndisponivel = async (id) => {
    try {
      await api.delete(`/unavailable-days/${id}/`);
      setSucesso('Dia removido da lista de indisponíveis!');
      carregarAgendamentos();
    } catch (error) {
      setErro('Erro ao remover dia indisponível');
    }
  };

  const atualizarStatus = async (agendamentoId, novoStatus) => {
    try {
      await api.patch(`/appointments/${agendamentoId}/`, {
        status: novoStatus
      });
      setSucesso('Status atualizado com sucesso!');
      carregarAgendamentos();
    } catch (error) {
      setErro('Erro ao atualizar status');
    }
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const formatarHora = (dataString) => {
    return new Date(dataString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE':
        return '#FFA500';
      case 'CONFIRMADO':
        return '#00AA00';
      case 'REALIZADO':
        return '#0088CC';
      case 'CANCELADO':
        return '#FF4444';
      default:
        return 'var(--text-muted)';
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
            <div className="logo">Barbearia LasVentura - Dashboard</div>
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
          <h1 className="page-title">Dashboard do Barbeiro</h1>

          {erro && <div className="error">{erro}</div>}
          {sucesso && <div className="success">{sucesso}</div>}

          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ marginBottom: '20px', color: 'var(--gold)' }}>
                Agendamentos de Hoje
              </h2>

              {agendamentosHoje.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  Nenhum agendamento para hoje.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {agendamentosHoje.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      style={{
                        padding: '15px',
                        backgroundColor: 'var(--bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                            {formatarHora(agendamento.start_time)} - {agendamento.nome_servico}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Cliente: {agendamento.nome_cliente}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: getStatusColor(agendamento.status),
                            color: 'white'
                          }}
                        >
                          {agendamento.status}
                        </div>
                      </div>

                      {agendamento.notes && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                          Obs: {agendamento.notes}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {agendamento.status === 'PENDENTE' && (
                          <button
                            onClick={() => atualizarStatus(agendamento.id, 'CONFIRMADO')}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Confirmar
                          </button>
                        )}
                        {agendamento.status === 'CONFIRMADO' && (
                          <button
                            onClick={() => atualizarStatus(agendamento.id, 'REALIZADO')}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Finalizar
                          </button>
                        )}
                        {['PENDENTE', 'CONFIRMADO'].includes(agendamento.status) && (
                          <button
                            onClick={() => atualizarStatus(agendamento.id, 'CANCELADO')}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '20px', color: 'var(--gold)' }}>
                Todos os Agendamentos
              </h2>

              {agendamentos.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  Nenhum agendamento encontrado.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
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
                          <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                            {agendamento.nome_servico}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Cliente: {agendamento.nome_cliente}<br />
                            Data: {formatarData(agendamento.start_time)}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: getStatusColor(agendamento.status),
                            color: 'white'
                          }}
                        >
                          {agendamento.status}
                        </div>
                      </div>

                      {agendamento.notes && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          Obs: {agendamento.notes}
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

export default BarberDashboard;