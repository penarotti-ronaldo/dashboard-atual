// Variáveis globais
let presencaChart = null;
let faltasChart = null;
let dadosAtuais = [];
let playerInterval = null;
let slideIndex = 0;
let turmasParaPlayer = [];
let loopAtivo = true;
let dashboardAberto = false;

console.log('Script carregado!');

// ==================== FUNÇÕES DO PLAYER ====================
function iniciarPlayer(turmas) {
    console.log('Iniciando player com', turmas.length, 'turmas');
    turmasParaPlayer = turmas;
    const container = document.getElementById('playerSlidesContainer');
    const totalSlidesSpan = document.getElementById('totalSlidesPlayer');
    
    totalSlidesSpan.textContent = turmas.length;
    container.innerHTML = '';
    
    turmas.forEach((turma, idx) => {
        const slide = document.createElement('div');
        slide.className = 'turma-slide-player';
        slide.id = `playerSlide_${idx}`;
        slide.innerHTML = `
            <div class="turma-nome-player">🏫 ${turma.turma}</div>
            <div class="presenca-destaque-player" id="presencaNumPlayer_${idx}">0%</div>
            <div class="presenca-bar-player">
                <div id="presencaBarPlayer_${idx}" class="presenca-bar-fill-player" style="width: 0%"></div>
            </div>
            <div class="info-grid-player">
                <div class="info-card-player">
                    <div class="info-label-player">👨‍🎓 ALUNOS ATIVOS</div>
                    <div class="info-value-player">${turma.alunos}</div>
                </div>
                <div class="info-card-player">
                    <div class="info-label-player">⚠️ FALTAS AMPARADAS</div>
                    <div class="info-value-player">${turma.faltasAmparadas.toFixed(1)}%</div>
                </div>
                <div class="info-card-player">
                    <div class="info-label-player">📚 CURSO</div>
                    <div class="info-value-player" style="font-size: 1em;">${turma.curso.substring(0, 40)}${turma.curso.length > 40 ? '...' : ''}</div>
                </div>
            </div>
        `;
        container.appendChild(slide);
    });
    
    slideIndex = 0;
    if (playerInterval) clearInterval(playerInterval);
    mostrarSlidePlayer(0);
    
    playerInterval = setInterval(() => {
        if (!dashboardAberto) {
            slideIndex = (slideIndex + 1) % turmas.length;
            mostrarSlidePlayer(slideIndex);
            const progressFill = document.getElementById('progressoFillPlayer');
            if (progressFill) {
                progressFill.style.width = `${((slideIndex + 1) / turmas.length) * 100}%`;
            }
            document.getElementById('slideAtualPlayer').textContent = slideIndex + 1;
        }
    }, 5000);
    
    document.getElementById('statusTexto').textContent = `${turmas.length} turmas carregadas`;
}

function mostrarSlidePlayer(index) {
    const slides = document.querySelectorAll('.turma-slide-player');
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
    });
    
    if (slides[index]) {
        slides[index].classList.add('active');
        
        const turma = turmasParaPlayer[index];
        const barElement = document.getElementById(`presencaBarPlayer_${index}`);
        const numElement = document.getElementById(`presencaNumPlayer_${index}`);
        
        if (barElement && numElement) {
            let percentual = 0;
            const target = turma.presenca;
            if (window.barraInterval) clearInterval(window.barraInterval);
            
            window.barraInterval = setInterval(() => {
                percentual += target / 40;
                if (percentual >= target) {
                    percentual = target;
                    clearInterval(window.barraInterval);
                }
                barElement.style.width = `${percentual}%`;
                numElement.textContent = `${percentual.toFixed(1)}%`;
            }, 25);
        }
    }
}

function pausarPlayer() {
    if (playerInterval) {
        clearInterval(playerInterval);
        playerInterval = null;
    }
}

function retomarPlayer() {
    if (!playerInterval && turmasParaPlayer.length > 0) {
        playerInterval = setInterval(() => {
            if (!dashboardAberto) {
                slideIndex = (slideIndex + 1) % turmasParaPlayer.length;
                mostrarSlidePlayer(slideIndex);
                const progressFill = document.getElementById('progressoFillPlayer');
                if (progressFill) {
                    progressFill.style.width = `${((slideIndex + 1) / turmasParaPlayer.length) * 100}%`;
                }
                document.getElementById('slideAtualPlayer').textContent = slideIndex + 1;
            }
        }, 5000);
    }
}

// ==================== FUNÇÕES DO DASHBOARD ====================
function toggleDashboard() {
    const adminDashboard = document.getElementById('adminDashboard');
    const fullscreenPlayer = document.getElementById('fullscreenPlayer');
    const btnTexto = document.getElementById('btnVerDashboard');
    
    if (!dashboardAberto) {
        adminDashboard.classList.add('show');
        fullscreenPlayer.classList.add('hidden');
        dashboardAberto = true;
        btnTexto.innerHTML = '🎯 Voltar ao Painel Principal';
        pausarPlayer();
        
        if (dadosAtuais.length > 0) {
            atualizarDashboardAdmin();
        }
    } else {
        adminDashboard.classList.remove('show');
        fullscreenPlayer.classList.remove('hidden');
        dashboardAberto = false;
        btnTexto.innerHTML = '📊 Ver Dashboard Completo';
        retomarPlayer();
    }
}

function fecharAdmin() {
    const adminDashboard = document.getElementById('adminDashboard');
    const fullscreenPlayer = document.getElementById('fullscreenPlayer');
    const btnTexto = document.getElementById('btnVerDashboard');
    
    adminDashboard.classList.remove('show');
    fullscreenPlayer.classList.remove('hidden');
    dashboardAberto = false;
    btnTexto.innerHTML = '📊 Ver Dashboard Completo';
    retomarPlayer();
}

function atualizarDashboardAdmin() {
    console.log('Atualizando dashboard com', dadosAtuais.length, 'turmas');
    
    if (dadosAtuais.length === 0) {
        console.log('Sem dados para exibir');
        return;
    }
    
    const totalTurmas = dadosAtuais.length;
    const totalAlunos = dadosAtuais.reduce((sum, t) => sum + t.alunos, 0);
    const mediaPresenca = dadosAtuais.reduce((sum, t) => sum + t.presenca, 0) / totalTurmas;

    document.getElementById('totalTurmas').textContent = totalTurmas;
    document.getElementById('totalAlunos').textContent = totalAlunos;
    document.getElementById('mediaGeral').textContent = mediaPresenca.toFixed(1) + '%';

    const labels = dadosAtuais.map(t => t.turma);
    const presencas = dadosAtuais.map(t => t.presenca);
    const faltas = dadosAtuais.map(t => t.faltasAmparadas);

    const ctxPresenca = document.getElementById('presencaChart').getContext('2d');
    if (presencaChart) presencaChart.destroy();
    presencaChart = new Chart(ctxPresenca, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Presença (%)',
                data: presencas,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    title: { display: true, text: 'Porcentagem (%)' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(1)}%` } }
            }
        }
    });

    const ctxFaltas = document.getElementById('faltasChart').getContext('2d');
    if (faltasChart) faltasChart.destroy();
    faltasChart = new Chart(ctxFaltas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Faltas Amparadas (%)',
                data: faltas,
                backgroundColor: 'rgba(255, 152, 0, 0.7)',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    title: { display: true, text: 'Porcentagem (%)' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(1)}%` } }
            }
        }
    });

    let html = '<table class="data-table">\n<thead>\n<tr>\n<th>Turma</th>\n<th>Período</th>\n<th>Alunos</th>\n<th>Presença</th>\n<th>Faltas Amparadas</th>\n<th>Curso</th>\n</tr>\n</thead>\n<tbody>';
    
    dadosAtuais.forEach(t => {
        // Determinar o período com base no nome da turma
        let periodo = '';
        if (t.turma.includes('Manhã') || t.turma.includes('Manha')) periodo = '🌅 Manhã';
        else if (t.turma.includes('Tarde')) periodo = '☀️ Tarde';
        else if (t.turma.includes('Noite')) periodo = '🌙 Noite';
        else periodo = '📅 Integral';
        
        html += `\n<tr>
                    <td><strong>${t.turma}</strong></td>
                    <td>${periodo}</td>
                    <td>${t.alunos}</td>
                    <td class="presenca-cell">${t.presenca.toFixed(1)}%</td>
                    <td class="falta-cell">${t.faltasAmparadas.toFixed(1)}%</td>
                    <td>${t.curso}</td>
                </tr>`;
    });
    html += '\n</tbody>\n</table>';
    document.getElementById('tableWrapper').innerHTML = html;
}

function processarDados(dados) {
    console.log('Processando dados...', dados.length, 'registros encontrados');
    
    const turmasValidas = dados.filter(row => {
        return row['Turma'] && 
               row['Alunos Ativos'] && 
               row['(%) Presença'] !== undefined;
    });

    if (turmasValidas.length === 0) {
        alert('Nenhum dado válido encontrado. Verifique as colunas: Turma, Alunos Ativos, (%) Presença');
        return false;
    }

    dadosAtuais = turmasValidas.map(row => ({
        turma: row['Turma'],
        alunos: parseInt(row['Alunos Ativos']) || 0,
        presenca: parseFloat(row['(%) Presença']) * 100 || 0,
        faltasAmparadas: (parseFloat(row['% Faltas Amparadas']) || 0) * 100,
        curso: row['Curso'] || 'N/A'
    }));
    
    // Ordenar por turma (manhã, tarde, noite)
    dadosAtuais.sort((a, b) => {
        const ordem = { 'Manhã': 1, 'Manha': 1, 'Tarde': 2, 'Noite': 3 };
        let periodoA = a.turma.includes('Manhã') || a.turma.includes('Manha') ? 1 : a.turma.includes('Tarde') ? 2 : 3;
        let periodoB = b.turma.includes('Manhã') || b.turma.includes('Manha') ? 1 : b.turma.includes('Tarde') ? 2 : 3;
        return periodoA - periodoB;
    });
    
    console.log('Dados processados:', dadosAtuais.length, 'turmas');
    return true;
}

// ==================== DADOS COMPLETOS (TODAS AS TURMAS) ====================
const dadosCompletos = [
    // Turmas da Manhã
    { "Turma": "1º Série A Manhã", "Alunos Ativos": 41, "(%) Presença": 0.9076, "% Faltas Amparadas": 0.0341, "Curso": "ENSINO MEDIO IFA" },
    { "Turma": "1º Série B Manhã", "Alunos Ativos": 38, "(%) Presença": 0.9150, "% Faltas Amparadas": 0.0280, "Curso": "ENSINO MEDIO IFA" },
    { "Turma": "1º Série C Manhã", "Alunos Ativos": 35, "(%) Presença": 0.8980, "% Faltas Amparadas": 0.0410, "Curso": "ENSINO MEDIO FGB" },
    { "Turma": "2º Série A Manhã", "Alunos Ativos": 23, "(%) Presença": 0.9093, "% Faltas Amparadas": 0.0519, "Curso": "TEC EM ENFERMAGEM" },
    { "Turma": "2º Série B Manhã", "Alunos Ativos": 29, "(%) Presença": 0.8920, "% Faltas Amparadas": 0.0380, "Curso": "TEC EM ENFERMAGEM" },
    { "Turma": "2º Série C Manhã", "Alunos Ativos": 31, "(%) Presença": 0.8850, "% Faltas Amparadas": 0.0450, "Curso": "ENSINO MEDIO FGB" },
    { "Turma": "3º Série A Manhã", "Alunos Ativos": 34, "(%) Presença": 0.8970, "% Faltas Amparadas": 0.0294, "Curso": "ENSINO MEDIO FGB" },
    { "Turma": "3º Série B Manhã", "Alunos Ativos": 28, "(%) Presença": 0.9120, "% Faltas Amparadas": 0.0220, "Curso": "TEC EM ENFERMAGEM" },
    
    // Turmas da Tarde
    { "Turma": "1º Série A Tarde", "Alunos Ativos": 36, "(%) Presença": 0.8880, "% Faltas Amparadas": 0.0520, "Curso": "ENSINO MEDIO IFA" },
    { "Turma": "1º Série B Tarde", "Alunos Ativos": 32, "(%) Presença": 0.8760, "% Faltas Amparadas": 0.0480, "Curso": "ENSINO MEDIO FGB" },
    { "Turma": "2º Série A Tarde", "Alunos Ativos": 27, "(%) Presença": 0.8840, "% Faltas Amparadas": 0.0560, "Curso": "TEC EM ENFERMAGEM" },
    { "Turma": "2º Série B Tarde", "Alunos Ativos": 25, "(%) Presença": 0.8710, "% Faltas Amparadas": 0.0620, "Curso": "ENSINO MEDIO IFA" },
    { "Turma": "3º Série C Tarde", "Alunos Ativos": 18, "(%) Presença": 0.9012, "% Faltas Amparadas": 0.0679, "Curso": "NEM EPT IF TEC AGRONEG" },
    { "Turma": "3º Série D Tarde", "Alunos Ativos": 22, "(%) Presença": 0.8930, "% Faltas Amparadas": 0.0590, "Curso": "TEC EM ENFERMAGEM" },
    
    // Turmas da Noite
    { "Turma": "1º Série A Noite", "Alunos Ativos": 33, "(%) Presença": 0.9250, "% Faltas Amparadas": 0.0180, "Curso": "ENSINO MEDIO FGB" },
    { "Turma": "1º Série B Noite", "Alunos Ativos": 30, "(%) Presença": 0.9180, "% Faltas Amparadas": 0.0220, "Curso": "TEC EM ENFERMAGEM" },
    { "Turma": "2º Série A Noite", "Alunos Ativos": 28, "(%) Presença": 0.9310, "% Faltas Amparadas": 0.0160, "Curso": "ENSINO MEDIO IFA" },
    { "Turma": "2º Série B Noite", "Alunos Ativos": 26, "(%) Presença": 0.9240, "% Faltas Amparadas": 0.0190, "Curso": "TEC EM ENFERMAGEM" },
    { "Turma": "3º Série A Noite", "Alunos Ativos": 13, "(%) Presença": 0.9497, "% Faltas Amparadas": 0.0147, "Curso": "TEC EM ENFERMAGEM" },
    { "Turma": "3º Série B Noite", "Alunos Ativos": 35, "(%) Presença": 0.9370, "% Faltas Amparadas": 0.0120, "Curso": "ENSINO MEDIO FGB" },
    { "Turma": "3º Série E Noite", "Alunos Ativos": 40, "(%) Presença": 0.9186, "% Faltas Amparadas": 0.0243, "Curso": "ENSINO MEDIO FGB" }
];

// ==================== CONFIGURAÇÃO DOS BOTÕES ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado!');
    
    const btnVer = document.getElementById('btnVerDashboard');
    const btnFechar = document.getElementById('btnFecharAdmin');
    
    if (btnVer) {
        btnVer.onclick = toggleDashboard;
        console.log('Evento toggle adicionado ao botão');
    }
    
    if (btnFechar) {
        btnFechar.onclick = fecharAdmin;
        console.log('Evento fechar adicionado');
    }
    
    // Carregar dados completos
    processarDados(dadosCompletos);
    iniciarPlayer(dadosAtuais);
    atualizarDashboardAdmin();
    document.getElementById('statusTexto').textContent = `${dadosAtuais.length} turmas carregadas (Manhã, Tarde e Noite)`;
});

// Upload de arquivo
document.getElementById('fileInputPrincipal').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    document.getElementById('statusTexto').textContent = 'Carregando...';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        if (processarDados(jsonData)) {
            iniciarPlayer(dadosAtuais);
            atualizarDashboardAdmin();
            alert(`✅ Planilha carregada!\n${dadosAtuais.length} turmas importadas.`);
            document.getElementById('statusTexto').textContent = `${dadosAtuais.length} turmas carregadas`;
        }
    };
    reader.readAsArrayBuffer(file);
});

// Tela cheia
const playerElement = document.getElementById('fullscreenPlayer');
playerElement.addEventListener('click', () => {
    if (!dashboardAberto && !document.fullscreenElement) {
        playerElement.requestFullscreen();
    } else if (!dashboardAberto && document.fullscreenElement) {
        document.exitFullscreen();
    }
});