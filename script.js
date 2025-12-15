let balance = 10000;
let portfolio = { bitcoin: 0, ethereum: 0, solana: 0 };
let prices = {};

async function fetchPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        const data = await response.json();
        prices = {
            bitcoin: data.bitcoin.usd,
            ethereum: data.ethereum.usd,
            solana: data.solana.usd
        };
        displayPrices();
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

function displayPrices() {
    const pricesDiv = document.getElementById('prices');
    pricesDiv.innerHTML = `
        BTC: $${prices.bitcoin.toFixed(2)}<br>
        ETH: $${prices.ethereum.toFixed(2)}<br>
        SOL: $${prices.solana.toFixed(2)}
    `;
}

function updateBalance() {
    document.getElementById('balance').textContent = `Virtual Balance: $${balance.toFixed(2)}`;
}

function updatePortfolio() {
    const portfolioDiv = document.getElementById('portfolio');
    portfolioDiv.innerHTML = `
        Portfolio:<br>
        BTC: ${portfolio.bitcoin.toFixed(4)}<br>
        ETH: ${portfolio.ethereum.toFixed(4)}<br>
        SOL: ${portfolio.solana.toFixed(4)}
    `;
}

function buyCrypto() {
    const crypto = document.getElementById('crypto').value;
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        showMessage('Invalid amount');
        return;
    }
    const cost = amount;
    if (cost > balance) {
        showMessage('Insufficient balance');
        return;
    }
    const quantity = amount / prices[crypto];
    portfolio[crypto] += quantity;
    balance -= cost;
    updateBalance();
    updatePortfolio();
    showMessage(`Bought ${quantity.toFixed(4)} ${crypto.toUpperCase()} for $${amount}`);
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
    const value = amount;
    portfolio[crypto] -= quantity;
    balance += value;
    updateBalance();
    updatePortfolio();
    showMessage(`Sold ${quantity.toFixed(4)} ${crypto.toUpperCase()} for $${amount}`);
}

function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    setTimeout(() => { messageDiv.textContent = ''; }, 3000);
}

// Initial fetch
fetchPrices();
updatePortfolio();
