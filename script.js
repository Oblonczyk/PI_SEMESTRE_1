// Função Corrigida de Autenticação
function efetuarLogin() {
    const loginOverlay = document.getElementById('web-login');
    if (loginOverlay) {
        // Remove a classe active e força o sumiço do elemento de login
        loginOverlay.classList.remove('active');
        loginOverlay.style.display = 'none';
    }
    
    // Força o carregamento do gráfico inicial
    setTimeout(() => { 
        renderWebChart('Lab. de Informática 1', [110, 115, 130, 125, 140, 120]); 
    }, 150);
}

function efetuartLogout() {
    const loginOverlay = document.getElementById('web-login');
    if (loginOverlay) {
        loginOverlay.classList.add('active');
        loginOverlay.style.display = 'flex';
    }
}

// Alternância entre as abas da Sidebar
function switchTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => item.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    if(tabId === 'visao-geral') document.getElementById('menu-visao-geral').classList.add('active');
    if(tabId === 'historico-analytics') document.getElementById('menu-analytics').classList.add('active');
    if(tabId === 'cadastro-dados') document.getElementById('menu-cadastro').classList.add('active');
}

// Simulação de Emergência focada no Lab 3
function toggleEmergencia(isCritical) {
    const banner = document.getElementById('global-emergency-banner');
    const cardLab3 = document.getElementById('card-lab3');
    const badgeLab3 = document.getElementById('badge-lab3');
    const txtFumaca = document.getElementById('txt-fumaca-lab3');

    if (isCritical) {
        banner.classList.add('active');
        cardLab3.classList.add('critical-alert');
        badgeLab3.className = "badge badge-critical";
        badgeLab3.innerText = "Crítico";
        txtFumaca.innerText = "850 PPM (Crítico)";
        txtFumaca.style.color = "#e74c3c";
    } else {
        banner.classList.remove('active');
        cardLab3.classList.remove('critical-alert');
        badgeLab3.className = "badge badge-safe";
        badgeLab3.innerText = "Seguro";
        txtFumaca.innerText = "125 PPM";
        txtFumaca.style.color = "#444";
    }
}

// Inspecionar Laboratório no Gráfico
function focusLab(labName, dataPoints) {
    switchTab('historico-analytics');
    document.getElementById('chart-focused-title').innerText = `Análise de Dados: ${labName}`;
    renderWebChart(labName, dataPoints);
}

let webChartInstance = null;
function renderWebChart(labelName, points) {
    const canvas = document.getElementById('webMq2Chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (webChartInstance) { webChartInstance.destroy(); }

    webChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Fumaça (PPM)',
                data: points,
                borderColor: '#f28131',
                backgroundColor: 'rgba(242, 129, 49, 0.05)',
                borderWidth: 3,
                tension: 0.2,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Adicionar funcionário dinamicamente
function adicionarFuncionario(event) {
    event.preventDefault();
    const nome = document.getElementById('cad-nome').value;
    const local = document.getElementById('cad-setor').value;
    
    const tbody = document.getElementById('table-logs-body');
    const tr = document.createElement('tr');
    
    const agora = new Date();
    const dataFormatada = `${agora.getDate()}/04/2026 - ${agora.getHours()}:${agora.getMinutes()}`;
    
    tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${local}</td>
        <td>Cadastro: ${nome}</td>
        <td><span class="status-pill pill-success">Leitura Normal</span></td>
    `;
    
    tbody.insertBefore(tr, tbody.firstChild);
    alert(`Funcionário ${nome} cadastrado com sucesso na nuvem!`);
    document.getElementById('form-cadastro').reset();
}

function triggerFeedback(type) {
    const modal = document.getElementById('feedback-modal');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    const icon = document.getElementById('modal-icon');
    
    if (type === 'evacuacao') {
        icon.innerText = "📢"; title.innerText = "Evacuação Confirmada!";
        text.innerText = "Notificação enviada com sucesso para a central de monitoramento e brigada.";
    } else {
        icon.innerText = "✅"; title.innerText = "Falso Alarme!";
        text.innerText = "O status de leitura foi normalizado nos registros da nuvem.";
    }
    modal.classList.add('active');
    toggleEmergencia(false);
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal').classList.remove('active');
    switchTab('visao-geral');
}

const CHANNEL_ID = '3382445'; // Coloque o ID do seu canal aqui

async function buscarDadosThingSpeak() {
    try {
        // Busca os últimos 6 resultados para formar o gráfico
        const response = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=6`);
        const data = await response.json();

        if (data.feeds && data.feeds.length > 0) {
            const feeds = data.feeds;
            const ultimoDado = feeds[feeds.length - 1];
            
            const temp = parseFloat(ultimoDado.field4).toFixed(1);
            const gas = parseInt(ultimoDado.field3); // 0 = Fumaça, 1 = Limpo

            // 1. Atualiza os Textos do Card
            document.getElementById('txt-fumaca-lab3').innerText = (gas === 0) ? "FUMAÇA DETECTADA" : "Ar Limpo";
            document.getElementById('txt-temp-lab3').innerText = `${temp}°C`;

            // 2. Regra de Outlier (Gatilho Automático)
            if (gas === 0 || temp > 50.0) {
                toggleEmergencia(true);
                registrarLog("Lab. de Informática 3", "Alarme Disparado", "pill-danger");
            } else {
                toggleEmergencia(false);
            }

            // 3. Atualiza o Gráfico com o Histórico (Temperaturas)
            const valoresGrafico = feeds.map(f => parseFloat(f.field4));
            const labelsGrafico = feeds.map(f => {
                const dataHora = new Date(f.created_at);
                return `${dataHora.getHours()}:${dataHora.getMinutes().toString().padStart(2, '0')}`;
            });
            
            renderWebChartRealTime('Lab. de Informática 3', valoresGrafico, labelsGrafico);
        }
    } catch (error) {
        console.error("Erro na comunicação com ThingSpeak:", error);
    }
}

// Adaptação da função do gráfico para aceitar labels dinâmicas do horário
function renderWebChartRealTime(labelName, points, labels) {
    const canvas = document.getElementById('webMq2Chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (webChartInstance) { webChartInstance.destroy(); }

    webChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Horários reais da API
            datasets: [{
                label: 'Temperatura (°C)',
                data: points,
                borderColor: '#f28131',
                backgroundColor: 'rgba(242, 129, 49, 0.05)',
                borderWidth: 3,
                tension: 0.2,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Função para injetar linhas na tabela de log dinamicamente
function registrarLog(local, status, classeBadge) {
    const tbody = document.getElementById('table-logs-body');
    const agora = new Date();
    const dataFormatada = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth()+1).toString().padStart(2, '0')} - ${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${local}</td>
        <td><span class="status-pill ${classeBadge}">${status}</span></td>
    `;
    // Evita duplicatas excessivas limitando a 5 linhas
    if(tbody.children.length > 4) tbody.removeChild(tbody.lastChild);
    tbody.insertBefore(tr, tbody.firstChild);
}

// Inicia a busca de dados assim que a tela abre
window.addEventListener('DOMContentLoaded', () => {
    buscarDadosThingSpeak();
    // Continua buscando a cada 20 segundos (respeitando limite gratuito do ThingSpeak)
    setInterval(buscarDadosThingSpeak, 20000); 
});