let balance = 10000;
let portfolio = { bitcoin: 0, ethereum: 0, solana: 0 };
let prices = {};
let charts = {};
let historicalData = {};

const cryptos = ['bitcoin', 'ethereum', 'solana'];
const cryptoNames = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL' };

async function fetchPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        const data = await response.json();
        cryptos.forEach(crypto => {
            prices[crypto] = data[crypto].usd;
        });
        displayPrices();
        updateProfitLoss();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchHistorical() {
    for (let crypto of cryptos) {
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=7`);
            const data = await res.json();
            historicalData[crypto] = data.prices.map(p => ({x: new Date(p[0]), y: p[1]}));
            createChart(crypto);
        } catch (error) {
            console.error('History error:', error);
        }
    }
}

function createChart(crypto) {
    const ctx = document.getElementById(`${crypto.slice(0,3)}Chart`).getContext('2d');
    if (charts[crypto]) charts[crypto].destroy();
    charts[crypto] = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: `${cryptoNames[crypto]} Price (USD)`,
                data: historicalData[crypto],
                borderColor: '#00ffea',
                backgroundColor: 'rgba(0,255,234,0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { type: 'time', time: { unit: 'day' } },
                y: { beginAtZero: false }
            }
        }
    });
}

function displayPrices() {
    const pricesDiv = document.getElementById('prices');
    pricesDiv.innerHTML = cryptos.map(c => `<div>${cryptoNames[c]}: $${prices[c].toFixed(2)}</div>`).join('');
}

function updateBalance() {
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
}

function updatePortfolio() {
    const portfolioDiv = document.getElementById('portfolio');
    let total = balance;
    portfolioDiv.innerHTML = cryptos.map(c => {
        const value = portfolio[c] * prices[c];
        total += value;
        return `<div>${cryptoNames[c]}: ${portfolio[c].toFixed(4)} ($${value.toFixed(2)})</div>`;
    }).join('');
    document.getElementById('total-value').textContent = `Total Portfolio Value: $${total.toFixed(2)}`;
}

function updateProfitLoss() {
    let totalValue = balance;
    cryptos.forEach(c => totalValue += portfolio[c] * prices[c]);
    const pl = totalValue - 10000;
    const percent = (pl / 10000 * 100);
    const plDiv = document.getElementById('profit-loss');
    plDiv.textContent = `${pl >= 0 ? '+' : ''}$${pl.toFixed(2)} (${percent.toFixed(2)}%)`;
    plDiv.className = pl >= 0 ? 'profit' : 'loss';
}

function buyCrypto() {
    const crypto = document.getElementById('crypto').value;
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        showMessage('Invalid amount or insufficient balance');
        return;
    }
    portfolio[crypto] += amount / prices[crypto];
    balance -= amount;
    updateAll();
    showMessage(`Bought $${amount} of ${cryptoNames[crypto]}`);
}

function sellCrypto() {
    const crypto = document.getElementById('crypto').value;
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        showMessage('Invalid amount');
        return;
    }
    const quantity = amount / prices[crypto];
    if (quantity > portfolio[crypto]) {
        showMessage('Insufficient holdings');
        return;
    }
    portfolio[crypto] -= quantity;
    balance += amount;
    updateAll();
    showMessage(`Sold $${amount} of ${cryptoNames[crypto]}`);
}

function updateAll() {
    updateBalance();
    updatePortfolio();
    updateProfitLoss();
}

function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    messageDiv.style.color = '#00ffea';
    setTimeout(() => { messageDiv.textContent = ''; }, 4000);
}

// Init
fetchPrices();
fetchHistorical();
setInterval(fetchPrices, 30000); // Refresh prices every 30s
updatePortfolio();
