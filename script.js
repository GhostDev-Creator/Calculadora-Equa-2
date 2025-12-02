let canvas = null;
let ctx = null;
let lastParams = { a: 0, b: 0, c: 0, roots: [] };
let resizeTimeout = null;

function initGraph() {
    canvas = document.getElementById('graph');
    if (!canvas) {
        console.error('Canvas não encontrado!');
        return false;
    }
    ctx = canvas.getContext('2d');
    resizeCanvas();
    console.log('✅ Canvas inicializado:', canvas.width, 'x', canvas.height);
    return true;
}

function resizeCanvas() {
    if (!canvas) return;
    
    const params = { ...lastParams };
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 400 * window.devicePixelRatio;
    
    const scale = window.devicePixelRatio;
    ctx.scale(scale, scale);
    
    if (params.a !== undefined) {
        drawGraph(params.a, params.b, params.c, params.roots);
    }
}

function drawGraph(a, b, c, roots) {
    if (!ctx || !canvas) {
        console.error('❌ Contexto do canvas não inicializado!');
        return;
    }

    lastParams = { a, b, c, roots };

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scaleX = width / 24;
    const scaleY = height / 24;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#424242');
    gradient.addColorStop(1, '#333333');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -12; i <= 12; i++) {
        ctx.moveTo(centerX + i * scaleX, 0);
        ctx.lineTo(centerX + i * scaleX, height);
        ctx.moveTo(0, centerY - i * scaleY);
        ctx.lineTo(width, centerY - i * scaleY);
    }
    ctx.stroke();

    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = -12; i <= 12; i++) {
        if (i !== 0) {
            ctx.fillText(i.toString(), centerX + i * scaleX, centerY + 25);
            ctx.fillText(i.toString(), centerX - 40, centerY - i * scaleY);
        }
    }

    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(76,175,80,0.6)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    const step = 0.1;
    let firstPoint = true;

    for (let x = -12; x <= 12; x += step) {
        const y = a * x * x + b * x + c;
        const px = centerX + x * scaleX;
        const py = centerY - y * scaleY;

        if (Math.abs(y) > 30) {
            if (!firstPoint) {
                ctx.stroke();
                ctx.beginPath();
                firstPoint = true;
            }
            continue;
        }

        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (roots && roots.length > 0 && roots.every(r => typeof r === 'number')) {
        roots.forEach((root) => {
            const px = centerX + root * scaleX;
            const py = centerY;

            const rootGradient = ctx.createRadialGradient(px, py, 0, px, py, 15);
            rootGradient.addColorStop(0, '#ff9800');
            rootGradient.addColorStop(1, '#e68a00');
            ctx.fillStyle = rootGradient;
            ctx.beginPath();
            ctx.arc(px, py, 15, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.font = 'bold 18px Roboto, Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(root.toFixed(2), px, py);
            ctx.shadowBlur = 0;
        });
    }

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 22px Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)} = 0`, width / 2, 25);
    ctx.shadowBlur = 0;

    console.log('✅ Gráfico desenhado com a=', a, 'b=', b, 'c=', c, 'raízes=', roots);
}

function calcularBhaskara() {
    console.log('🔄 Iniciando cálculo Bhaskara...');
    
    const a = parseFloat(document.getElementById('inputA').value) || 0;
    const b = parseFloat(document.getElementById('inputB').value) || 0;
    const c = parseFloat(document.getElementById('inputC').value) || 0;

    const calcDiv = document.getElementById('como-calculado');
    const resultadoDiv = document.getElementById('resultado');

    calcDiv.innerHTML = '<h3>Passo a Passo:</h3>';
    resultadoDiv.innerHTML = '<h3>Resultado Final:</h3>';

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        resultadoDiv.innerHTML += '<p class="error">🚨 Erro: Insira valores numéricos válidos!</p>';
        drawGraph(0, 0, 0, []);
        return;
    }

    if (a === 0) {
        if (b === 0) {
            calcDiv.innerHTML += '<p>Não é equação (constante).</p>';
            resultadoDiv.innerHTML += '<p class="error">❌ a e b não podem ser zero!</p>';
        } else {
            const x = -c / b;
            calcDiv.innerHTML += `<p>Linear: ${b}x + ${c} = 0 → x = ${x.toFixed(4)}</p>`;
            resultadoDiv.innerHTML += `<p class="success">✅ x = <b>${x.toFixed(4)}</b></p>`;
            drawGraph(0, b, c, [x]);
        }
        return;
    }

    const delta = b * b - 4 * a * c;
    let roots = [];

    calcDiv.innerHTML += `<p><strong>Δ = ${b}² - 4×${a}×${c} = ${delta.toFixed(4)}</strong></p>`;

    if (delta > 0) {
        const sqrtDelta = Math.sqrt(delta);
        const x1 = (-b + sqrtDelta) / (2 * a);
        const x2 = (-b - sqrtDelta) / (2 * a);
        roots = [x1, x2];
        
        calcDiv.innerHTML += `<p>x₁ = (-${b} + √${delta.toFixed(2)}) / ${2*a} = ${x1.toFixed(4)}</p>`;
        calcDiv.innerHTML += `<p>x₂ = (-${b} - √${delta.toFixed(2)}) / ${2*a} = ${x2.toFixed(4)}</p>`;
        resultadoDiv.innerHTML += `<p class="success">✅ 2 raízes reais: x₁=${x1.toFixed(4)}, x₂=${x2.toFixed(4)}</p>`;
        
    } else if (delta === 0) {
        const x = -b / (2 * a);
        roots = [x];
        calcDiv.innerHTML += `<p>x = -${b} / ${2*a} = ${x.toFixed(4)}</p>`;
        resultadoDiv.innerHTML += `<p class="success">✅ Raiz dupla: x=${x.toFixed(4)}</p>`;
        
    } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-delta) / (2 * a);
        calcDiv.innerHTML += `<p>Raízes complexas: ${real.toFixed(4)} ± ${imag.toFixed(4)}i</p>`;
        resultadoDiv.innerHTML += `<p class="error">⚠️ Raízes complexas (sem pontos reais)</p>`;
    }

    setTimeout(() => {
        console.log('📊 Desenhando gráfico com raízes:', roots);
        drawGraph(a, b, c, roots);
    }, 100);
}

function debounceResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 250);
}

window.addEventListener('load', function() {
    console.log('🚀 Página carregada');
    if (initGraph()) {
        console.log('✅ Tudo pronto! Clique CALCULAR para ver o gráfico.');
    }
});

window.addEventListener('resize', debounceResize);
