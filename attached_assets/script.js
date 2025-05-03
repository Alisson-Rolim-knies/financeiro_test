// Valores fixos dos serviços
const VALORES = {
  moto: 190,
  carro: 230,
  caminhao: 280
};

// Estado global do sistema
let estado = {
  inspecoes: [],
  depositos: [],
  despesas: []
};

// Carrega dados do servidor
async function carregarDados() {
  // Tentamos carregar do servidor primeiro
  try {
    // Obtém a data atual para carregar apenas dados do dia
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Carrega inspeções
    const resInspecoes = await fetch(`/api/inspections?date=${dataFormatada}`);
    if (resInspecoes.ok) {
      estado.inspecoes = await resInspecoes.json();
      console.log('Inspeções carregadas com sucesso da API');
    }
    
    // Carrega depósitos
    const resDepositos = await fetch(`/api/deposits?date=${dataFormatada}`);
    if (resDepositos.ok) {
      estado.depositos = await resDepositos.json();
      console.log('Depósitos carregados com sucesso da API');
    }
    
    // Carrega despesas
    const resDespesas = await fetch(`/api/expenses?date=${dataFormatada}`);
    if (resDespesas.ok) {
      estado.despesas = await resDespesas.json();
      console.log('Despesas carregadas com sucesso da API');
    }
    
    // Atualiza interface após carregar dados
    atualizarTabelas();
    atualizarDashboard();
  } catch (error) {
    console.error('Erro ao carregar dados do servidor:', error);
    
    // Fallback para localStorage se a API falhar
    const dadosSalvos = localStorage.getItem('estado');
    if (dadosSalvos) {
      estado = JSON.parse(dadosSalvos);
      showToast('Usando dados em cache (modo offline)', 'warning');
    }
  }
}

// Salva dados no servidor e no localStorage como backup
async function salvarDados() {
  // Sempre salvamos no localStorage como backup
  localStorage.setItem('estado', JSON.stringify(estado));
  
  try {
    // Aqui podemos implementar chamadas para salvar no servidor
    // Exemplo (a ser implementado conforme necessário):
    // await fetch('/api/save', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(estado)
    // });
    
    console.log('Dados salvos localmente e prontos para sincronização');
  } catch (error) {
    console.error('Erro ao salvar dados no servidor:', error);
    showToast('Dados salvos localmente (modo offline)', 'warning');
  }
}

// Função auxiliar para exibir notificações
function showToast(message, type = 'info') {
  // Verifica se o elemento toast já existe
  let toastContainer = document.querySelector('.toast-container');
  
  // Se não existir, cria o container
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // Adiciona estilo ao container
    Object.assign(toastContainer.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '1000'
    });
  }
  
  // Cria o toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Estiliza o toast
  Object.assign(toast.style, {
    backgroundColor: type === 'warning' ? '#ffc107' : 
                    type === 'error' ? '#dc3545' : '#0d6efd',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '4px',
    marginTop: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });
  
  // Adiciona o toast ao container
  toastContainer.appendChild(toast);
  
  // Torna o toast visível após um pequeno delay (para o efeito de transição)
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Remove o toast após 5 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    
    // Remove o toast do DOM após a transição de opacidade
    setTimeout(() => {
      toastContainer.removeChild(toast);
      
      // Se não houver mais toasts, remove o container
      if (toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, 5000);
}

// Navegação entre páginas
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = link.dataset.page;

    // Atualiza navegação
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // Mostra página correta
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
  });
});

function exportarRelatorioCompleto() {
  const hoje = new Date().toLocaleDateString();
  const totalInspecoes = estado.inspecoes.length;
  const totalReceitas = calcularTotalDinheiro() + calcularTotalPIX();
  const totalDespesas = calcularTotalDespesas();
  const lucroLiquido = calcularLucroLiquido();
  const faltaDepositar = calcularFaltaDepositar();
  const totalDepositos = calcularTotalDepositos();

  const content = `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 10px; font-size: 24px;">RELATÓRIO FINANCEIRO - INSPEÇÃO VEICULAR</h1>
        <p style="color: #666;">Data: ${hoje}</p>
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Resumo do Dia</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #ddd;">Total Faturado:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">R$ ${totalReceitas.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Total via PIX:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">R$ ${calcularTotalPIX().toFixed(2)}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #ddd;">Total em Dinheiro:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">R$ ${calcularTotalDinheiro().toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Total Depositado:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">R$ ${totalDepositos.toFixed(2)}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #ddd;">Diferença (Dinheiro - Depósitos):</td>
            <td style="padding: 12px; border: 1px solid #ddd;">R$ ${faltaDepositar.toFixed(2)}</td>
          </tr>
        </table>
        ${Math.abs(faltaDepositar) > 0 ? 
          `<div style="color: ${faltaDepositar > 0 ? '#dc3545' : '#28a745'}; font-weight: bold; margin-top: 10px;">
            ${faltaDepositar > 0 ? 'ATENÇÃO: Falta depositar R$ ' + faltaDepositar.toFixed(2) : 
            'ATENÇÃO: Excesso de R$ ' + Math.abs(faltaDepositar).toFixed(2) + ' em depósitos!'}
          </div>` : ''}
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Inspeções Realizadas</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #007bff; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Tipo</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Valor</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Pagamento</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Data/Hora</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Observações</th>
            </tr>
          </thead>
          <tbody>
            ${estado.inspecoes.map(insp => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${insp.tipo}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">R$ ${insp.valor.toFixed(2)}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">
                  ${insp.pagamento === 'misto' ? 
                    `Misto (PIX: R$ ${insp.valor_pix.toFixed(2)}, Dinheiro: R$ ${insp.valor_dinheiro.toFixed(2)})` : 
                    insp.pagamento}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd;">${insp.data}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${insp.observacoes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div>
        <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Depósitos Realizados</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #28a745; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Valor</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Data/Hora</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Observações</th>
            </tr>
          </thead>
          <tbody>
            ${estado.depositos.map(dep => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">R$ ${dep.valor.toFixed(2)}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${dep.data}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${dep.observacoes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b00; margin-bottom: 10px;">Relatório Financeiro - VisioCar</h1>
        <p style="color: #666;">Gerado em ${hoje}</p>
      </div>

      <div style="margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Resumo Geral</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Total de Inspeções</h3>
            <p style="color: #ff6b00; font-size: 24px; font-weight: bold;">${totalInspecoes}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Receitas Totais</h3>
            <p style="color: #ff6b00; font-size: 24px; font-weight: bold;">R$ ${totalReceitas.toFixed(2)}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Despesas Totais</h3>
            <p style="color: #dc3545; font-size: 24px; font-weight: bold;">R$ ${totalDespesas.toFixed(2)}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Lucro Líquido</h3>
            <p style="color: #28a745; font-size: 24px; font-weight: bold;">R$ ${lucroLiquido.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Últimas Inspeções</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Data</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Placa</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Tipo</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${estado.inspecoes.slice(-5).map(insp => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${insp.data}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${insp.placa}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${insp.tipo}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">R$ ${insp.valor.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const opt = {
    margin: 1,
    filename: `relatorio-visiocar-${hoje.replace(/\//g, '-')}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(content).save();
}

// Controles do Modal
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Funções de cálculo
function calcularTotalDinheiro() {
  return estado.inspecoes.reduce((total, insp) => {
    if (insp.pagamento === 'dinheiro') return total + insp.valor;
    if (insp.pagamento === 'misto') return total + insp.valor_dinheiro;
    return total;
  }, 0);
}

function calcularTotalPIX() {
  return estado.inspecoes.reduce((total, insp) => {
    if (insp.pagamento === 'pix') return total + insp.valor;
    if (insp.pagamento === 'misto') return total + insp.valor_pix;
    return total;
  }, 0);
}

function calcularTotalDepositos() {
  return estado.depositos.reduce((total, dep) => total + dep.valor, 0);
}

function calcularTotalDespesas() {
  return estado.despesas.reduce((total, desp) => total + desp.valor, 0);
}

function calcularFaltaDepositar() {
  return calcularTotalDinheiro() - calcularTotalDespesas() - calcularTotalDepositos();
}

function calcularLucroLiquido() {
  return calcularTotalDinheiro() + calcularTotalPIX() - calcularTotalDespesas();
}

// Atualizar Dashboard
function atualizarDashboard() {
  // Atualizar cards
  const cards = document.querySelectorAll('#dashboard .cards .card .value');
  if (cards.length >= 4) {
    cards[0].textContent = `R$ ${(calcularTotalDinheiro() + calcularTotalPIX()).toFixed(2)}`;
    cards[1].textContent = `R$ ${calcularTotalDespesas().toFixed(2)}`;
    cards[2].textContent = `R$ ${calcularLucroLiquido().toFixed(2)}`;
    cards[3].textContent = estado.inspecoes.length;
  }

  // Atualizar relatório
  const hoje = new Date().toLocaleDateString();
  const dateDisplay = document.querySelector('.date-display');
  if (dateDisplay) dateDisplay.textContent = hoje;

  const dailyInspections = document.getElementById('daily-inspections');
  const dailyPix = document.getElementById('daily-pix');
  const dailyCash = document.getElementById('daily-cash');
  const dailyDeposited = document.getElementById('daily-deposited');
  const dailyPending = document.getElementById('daily-pending');
  const dailyExpenses = document.getElementById('daily-expenses');

  const inspecoesHoje = estado.inspecoes.filter(i => i.data === hoje).length;
  const depositosHoje = calcularTotalDepositos();
  const despesasHoje = estado.despesas.filter(d => d.data === hoje)
    .reduce((total, d) => total + d.valor, 0);
  
  // Calcular falta depositar para notificação
  const faltaDepositar = calcularFaltaDepositar();
  
  if (dailyInspections) dailyInspections.textContent = inspecoesHoje;
  if (dailyPix) dailyPix.textContent = `R$ ${calcularTotalPIX().toFixed(2)}`;
  if (dailyCash) dailyCash.textContent = `R$ ${calcularTotalDinheiro().toFixed(2)}`;
  if (dailyDeposited) dailyDeposited.textContent = `R$ ${depositosHoje.toFixed(2)}`;
  if (dailyPending) dailyPending.textContent = `R$ ${faltaDepositar.toFixed(2)}`;
  if (dailyExpenses) dailyExpenses.textContent = `R$ ${despesasHoje.toFixed(2)}`;
  
  // Adicionar notificação de "Falta depositar" no dashboard
  let notificacaoElement = document.getElementById('notificacao-deposito');
  
  // Se não existir o elemento de notificação, cria-lo
  if (!notificacaoElement) {
    notificacaoElement = document.createElement('div');
    notificacaoElement.id = 'notificacao-deposito';
    notificacaoElement.className = 'alerta-deposito';
    
    // Inserir após os cards no dashboard
    const dashboard = document.getElementById('dashboard');
    const chartContainer = dashboard.querySelector('.chart-container');
    if (chartContainer) {
      dashboard.insertBefore(notificacaoElement, chartContainer);
    } else {
      dashboard.appendChild(notificacaoElement);
    }
    
    // Adicionar estilos CSS inline para o alerta
    const style = document.createElement('style');
    style.textContent = `
      .alerta-deposito {
        margin: 20px 0;
        padding: 15px;
        border-radius: 8px;
        font-weight: bold;
        display: none;
      }
      .alerta-deposito.warning {
        background-color: #fff8f8;
        border-left: 4px solid #dc3545;
        color: #dc3545;
      }
      .alerta-deposito.success {
        background-color: #f8fff8;
        border-left: 4px solid #28a745;
        color: #28a745;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Atualizar conteúdo da notificação baseado no valor
  if (Math.abs(faltaDepositar) > 0) {
    if (faltaDepositar > 0) {
      notificacaoElement.textContent = `ATENÇÃO: Falta depositar R$ ${faltaDepositar.toFixed(2)}`;
      notificacaoElement.className = 'alerta-deposito warning';
    } else {
      notificacaoElement.textContent = `ATENÇÃO: Excesso de R$ ${Math.abs(faltaDepositar).toFixed(2)} em depósitos!`;
      notificacaoElement.className = 'alerta-deposito success';
    }
    notificacaoElement.style.display = 'block';
  } else {
    notificacaoElement.style.display = 'none';
  }
}

// Funções do formulário de inspeção
function atualizarValor() {
  const tipo = document.querySelector('select[name="tipo"]').value;
  const valor = VALORES[tipo];
  document.querySelector('input[name="valor"]').value = valor;
}

function togglePagamentoMisto() {
  const metodo = document.querySelector('select[name="pagamento"]').value;
  const divMisto = document.getElementById('valores-misto');
  divMisto.style.display = metodo === 'misto' ? 'block' : 'none';
}

// Event Listeners dos formulários
document.getElementById('formInspecao').addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const dados = {
    placa: formData.get('placa'),
    tipo: formData.get('tipo'),
    pagamento: formData.get('pagamento'),
    data: new Date().toLocaleDateString(),
    observacoes: formData.get('observacoes')
  };

  if (dados.pagamento === 'misto') {
    dados.valor_pix = parseFloat(formData.get('valor_pix')) || 0;
    dados.valor_dinheiro = parseFloat(formData.get('valor_dinheiro')) || 0;
    dados.valor = dados.valor_pix + dados.valor_dinheiro;
  } else {
    dados.valor = VALORES[dados.tipo];
  }

  estado.inspecoes.push(dados);
  salvarDados();
  const tbody = document.querySelector('#tabelaInspecoes tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${dados.data}</td>
    <td>${dados.placa}</td>
    <td>${dados.tipo}</td>
    <td>R$ ${dados.valor.toFixed(2)}</td>
    <td>${dados.pagamento}</td>
    <td>
      <button class="btn-action" onclick="editarInspecao(${estado.inspecoes.length - 1})">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-action btn-delete" onclick="excluirInspecao(${estado.inspecoes.length - 1})">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  tbody.appendChild(tr);

  atualizarDashboard();
  hideModal('modal-inspecao');
  e.target.reset();
});

document.getElementById('formDeposito').addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const dados = {
    valor: parseFloat(formData.get('valor')),
    data: formData.get('data'),
    observacoes: formData.get('observacoes')
  };

  estado.depositos.push(dados);
  salvarDados();
  const tbody = document.querySelector('#tabelaDepositos tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${dados.data}</td>
    <td>R$ ${dados.valor.toFixed(2)}</td>
    <td>${dados.observacoes}</td>
    <td>
      <button class="btn-action" onclick="editarDeposito(${estado.depositos.length - 1})">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-action btn-delete" onclick="excluirDeposito(${estado.depositos.length - 1})">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  tbody.appendChild(tr);

  atualizarDashboard();
  hideModal('modal-deposito');
  e.target.reset();
});

document.getElementById('formDespesa').addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const dados = {
    valor: parseFloat(formData.get('valor')),
    data: new Date().toLocaleDateString(),
    observacoes: formData.get('observacoes')
  };

  estado.despesas.push(dados);
  salvarDados();
  const tbody = document.querySelector('#tabelaDespesas tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${dados.data}</td>
    <td>R$ ${dados.valor.toFixed(2)}</td>
    <td>${dados.observacoes}</td>
    <td>
      <button class="btn-action" onclick="editarDespesa(${estado.despesas.length - 1})">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-action btn-delete" onclick="excluirDespesa(${estado.despesas.length - 1})">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  tbody.appendChild(tr);

  atualizarDashboard();
  hideModal('modal-despesa');
  e.target.reset();
});

// Função para controle do menu mobile
function toggleMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 767) {
      document.querySelector('.sidebar').classList.remove('active');
    }
  });
});

// Inicialização do gráfico
const ctx = document.getElementById('revenueChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Receitas',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: '#ff6b00',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Receitas Mensais'
      }
    }
  }
});

// Função para obter vistorias do dia atual
function getVistoriasDoDia() {
  const hoje = new Date().toLocaleDateString();
  return estado.inspecoes.filter(insp => insp.data === hoje);
}

// Função para atualizar tabela de vistorias do dia
function atualizarVistoriasDoDia() {
  const tbody = document.querySelector('#tabelaVistoriasDia tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const vistorias = getVistoriasDoDia();

  vistorias.forEach(vistoria => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${vistoria.data}</td>
      <td>${vistoria.placa}</td>
      <td>${vistoria.tipo}</td>
      <td>R$ ${vistoria.valor.toFixed(2)}</td>
      <td>${vistoria.pagamento}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Função para exportar vistorias do dia
function exportarVistoriasDoDia() {
  const vistorias = getVistoriasDoDia();
  const hoje = new Date().toLocaleDateString();

  const totalPix = vistorias.reduce((total, v) => {
    if (v.pagamento === 'pix') return total + v.valor;
    if (v.pagamento === 'misto') return total + v.valor_pix;
    return total;
  }, 0);

  const totalDinheiro = vistorias.reduce((total, v) => {
    if (v.pagamento === 'dinheiro') return total + v.valor;
    if (v.pagamento === 'misto') return total + v.valor_dinheiro;
    return total;
  }, 0);

  const despesasHoje = estado.despesas.filter(d => d.data === hoje);
  const totalDespesasHoje = despesasHoje.reduce((total, d) => total + d.valor, 0);

  const faltaDepositar = calcularFaltaDepositar();
  const totalDepositos = calcularTotalDepositos();

  const content = `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b00; margin-bottom: 10px;">Vistorias do Dia - VisioCar</h1>
        <p style="color: #666;">Gerado em ${hoje}</p>
      </div>

      <div style="margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Resumo do Dia</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Total de Vistorias</h3>
            <p style="color: #ff6b00; font-size: 24px; font-weight: bold;">${vistorias.length}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Total em PIX</h3>
            <p style="color: #ff6b00; font-size: 24px; font-weight: bold;">R$ ${totalPix.toFixed(2)}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Total em Dinheiro</h3>
            <p style="color: #ff6b00; font-size: 24px; font-weight: bold;">R$ ${totalDinheiro.toFixed(2)}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #666; font-size: 14px;">Despesas do Dia</h3>
            <p style="color: #dc3545; font-size: 24px; font-weight: bold;">R$ ${totalDespesasHoje.toFixed(2)}</p>
          </div>
        </div>
        
        <!-- Seção de depósitos e diferença -->
        <div style="margin-top: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #666; font-size: 16px; margin-bottom: 10px;">Controle de Depósitos</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <h4 style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Total em Dinheiro:</h4>
              <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">R$ ${totalDinheiro.toFixed(2)}</p>
            </div>
            <div>
              <h4 style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Total Depositado:</h4>
              <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">R$ ${totalDepositos.toFixed(2)}</p>
            </div>
          </div>
          
          ${Math.abs(faltaDepositar) > 0 ? 
            `<div style="margin-top: 10px; padding: 10px; background-color: ${faltaDepositar > 0 ? '#fff8f8' : '#f8fff8'}; border-left: 4px solid ${faltaDepositar > 0 ? '#dc3545' : '#28a745'}; border-radius: 4px;">
              <p style="margin: 0; color: ${faltaDepositar > 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">
                ${faltaDepositar > 0 ? 'ATENÇÃO: Falta depositar R$ ' + faltaDepositar.toFixed(2) : 
                'ATENÇÃO: Excesso de R$ ' + Math.abs(faltaDepositar).toFixed(2) + ' em depósitos!'}
              </p>
            </div>` : ''}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; border: 1px solid #ddd;">Placa</th>
            <th style="padding: 12px; border: 1px solid #ddd;">Tipo</th>
            <th style="padding: 12px; border: 1px solid #ddd;">Valor</th>
            <th style="padding: 12px; border: 1px solid #ddd;">Pagamento</th>
          </tr>
        </thead>
        <tbody>
          ${vistorias.map(v => `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">${v.placa}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${v.tipo}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">R$ ${v.valor.toFixed(2)}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${v.pagamento}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const opt = {
    margin: 1,
    filename: `vistorias-${hoje.replace(/\//g, '-')}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(content).save();
}

// Função para limpar todos os dados
function limparDados() {
  if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
    estado = {
      inspecoes: [],
      depositos: [],
      despesas: []
    };
    salvarDados();
    atualizarDashboard();
    atualizarVistoriasDoDia();
    document.querySelectorAll('tbody').forEach(tbody => tbody.innerHTML = '');
  }
}

// Atualizar vistorias do dia quando uma nova inspeção é adicionada
const oldSubmitInspecao = document.getElementById('formInspecao').onsubmit;
document.getElementById('formInspecao').onsubmit = function(e) {
  oldSubmitInspecao.call(this, e);
  atualizarVistoriasDoDia();
};

// Funções de edição e exclusão
function editarInspecao(index) {
  const inspecao = estado.inspecoes[index];
  document.querySelector('input[name="placa"]').value = inspecao.placa;
  document.querySelector('select[name="tipo"]').value = inspecao.tipo;
  document.querySelector('select[name="pagamento"]').value = inspecao.pagamento;
  document.querySelector('textarea[name="observacoes"]').value = inspecao.observacoes || '';

  if (inspecao.pagamento === 'misto') {
    document.getElementById('valores-misto').style.display = 'block';
    document.querySelector('input[name="valor_pix"]').value = inspecao.valor_pix;
    document.querySelector('input[name="valor_dinheiro"]').value = inspecao.valor_dinheiro;
  }

  // Armazena o índice para atualização
  document.getElementById('formInspecao').dataset.editIndex = index;
  showModal('modal-inspecao');
}

function excluirInspecao(index) {
  if (confirm('Tem certeza que deseja excluir esta inspeção?')) {
    estado.inspecoes.splice(index, 1);
    salvarDados();
    atualizarDashboard();
    atualizarVistoriasDoDia();
    atualizarTabelas();

    // Atualizar todos os cálculos após exclusão
    const cards = document.querySelectorAll('#dashboard .cards .card .value');
    if (cards.length >= 4) {
      cards[0].textContent = `R$ ${(calcularTotalDinheiro() + calcularTotalPIX()).toFixed(2)}`;
      cards[1].textContent = `R$ ${calcularTotalDespesas().toFixed(2)}`;
      cards[2].textContent = `R$ ${calcularLucroLiquido().toFixed(2)}`;
      cards[3].textContent = estado.inspecoes.length;
    }
  }
}

function editarDeposito(index) {
  const deposito = estado.depositos[index];
  document.querySelector('#formDeposito input[name="valor"]').value = deposito.valor;
  document.querySelector('#formDeposito input[name="data"]').value = deposito.data;
  document.querySelector('#formDeposito textarea[name="observacoes"]').value = deposito.observacoes || '';

  document.getElementById('formDeposito').dataset.editIndex = index;
  showModal('modal-deposito');
}

function excluirDeposito(index) {
  if (confirm('Tem certeza que deseja excluir este depósito?')) {
    estado.depositos.splice(index, 1);
    salvarDados();
    atualizarDashboard();
    atualizarTabelas();
  }
}

function editarDespesa(index) {
  const despesa = estado.despesas[index];
  document.querySelector('#formDespesa input[name="valor"]').value = despesa.valor;
  document.querySelector('#formDespesa textarea[name="observacoes"]').value = despesa.observacoes || '';

  document.getElementById('formDespesa').dataset.editIndex = index;
  showModal('modal-despesa');
}

function excluirDespesa(index) {
  if (confirm('Tem certeza que deseja excluir esta despesa?')) {
    estado.despesas.splice(index, 1);
    salvarDados();
    atualizarDashboard();
    atualizarTabelas();
  }
}

// Função para atualizar todas as tabelas
function atualizarTabelas() {
  // Atualizar tabela de inspeções
  const tabelaInspecoes = document.querySelector('#tabelaInspecoes tbody');
  if (tabelaInspecoes) {
    tabelaInspecoes.innerHTML = '';
    estado.inspecoes.forEach((insp, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${insp.data}</td>
        <td>${insp.placa}</td>
        <td>${insp.tipo}</td>
        <td>R$ ${insp.valor.toFixed(2)}</td>
        <td>${insp.pagamento}</td>
        <td>
          <button class="btn-action" onclick="editarInspecao(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" onclick="excluirInspecao(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaInspecoes.appendChild(tr);
    });
  }

  // Atualizar tabela de depósitos
  const tabelaDepositos = document.querySelector('#tabelaDepositos tbody');
  if (tabelaDepositos) {
    tabelaDepositos.innerHTML = '';
    estado.depositos.forEach((dep, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dep.data}</td>
        <td>R$ ${dep.valor.toFixed(2)}</td>
        <td>${dep.observacoes || ''}</td>
        <td>
          <button class="btn-action" onclick="editarDeposito(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" onclick="excluirDeposito(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaDepositos.appendChild(tr);
    });
  }

  // Atualizar tabela de despesas
  const tabelaDespesas = document.querySelector('#tabelaDespesas tbody');
  if (tabelaDespesas) {
    tabelaDespesas.innerHTML = '';
    estado.despesas.forEach((desp, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${desp.data}</td>
        <td>R$ ${desp.valor.toFixed(2)}</td>
        <td>${desp.observacoes || ''}</td>
        <td>
          <button class="btn-action" onclick="editarDespesa(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" onclick="excluirDespesa(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaDespesas.appendChild(tr);
    });
  }
}

// Função de inicialização do sistema
function inicializarSistema() {
  carregarDados();
  atualizarDashboard();
  atualizarVistoriasDoDia();
  atualizarTabelas();
}

// Inicializa o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarSistema);

// Atualizar vistorias do dia quando mudar de página
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.page === 'vistorias-dia') {
      atualizarVistoriasDoDia();
    }
  });
});