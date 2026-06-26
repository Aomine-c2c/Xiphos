const fs = require('fs');

const categories = {
  Forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD', 'EURGBP', 'EURJPY', 'GBPJPY'],
  Crypto: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOTUSD', 'AVAXUSD', 'LINKUSD', 'MATICUSD', 'DOGEUSD'],
  Indices: ['US30', 'SPX500', 'NAS100', 'GER40', 'UK100', 'JPN225', 'FRA40', 'AUS200', 'HK50', 'EU50'],
  Stocks: ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'COIN'],
  Commodities: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NGAS', 'COPPER', 'CORN', 'WHEAT', 'SOYBEAN', 'COFFEE'],
  Synthetics: ['VIX75', 'VIX100', 'BOOM500', 'CRASH500', 'STEP', 'JUMP10', 'JUMP25', 'JUMP50', 'JUMP75', 'JUMP100']
};

const sparkline = (base, len = 20, drift = 0.001) => {
  return `[${Array.from({ length: len }, (_, i) => parseFloat((base + (Math.random() - 0.5) * drift * i).toFixed(5))).join(', ')}]`;
};

const trends = ['BULLISH', 'BEARISH', 'RANGING'];
const volatilities = ['HIGH', 'MED', 'LOW'];
const structures = ['HH', 'HL', 'LH', 'LL', 'CONSOLIDATION'];

let output = `export const MOCK_MARKET_WATCH: MarketWatchItem[] = [\n`;

Object.entries(categories).forEach(([category, symbols]) => {
  symbols.forEach(symbol => {
    let priceBase = 100;
    let drift = 1;
    if (category === 'Forex') { priceBase = 1.1; drift = 0.01; }
    if (category === 'Crypto') { priceBase = 50000; drift = 1000; }
    if (category === 'Stocks') { priceBase = 200; drift = 5; }
    if (category === 'Indices') { priceBase = 15000; drift = 50; }
    if (category === 'Commodities' && symbol.startsWith('XAU')) { priceBase = 2400; drift = 10; }
    if (category === 'Synthetics') { priceBase = 5000; drift = 100; }

    const price = parseFloat((priceBase + (Math.random() - 0.5) * drift).toFixed(5));
    const e13 = parseFloat((Math.random() * drift).toFixed(5));
    const e50 = parseFloat((Math.random() * drift * 2).toFixed(5));
    const s200 = parseFloat((Math.random() * drift * 5).toFixed(5));
    
    const isUp = Math.random() > 0.5;
    const signal = isUp ? 'BUY' : Math.random() > 0.5 ? 'SELL' : 'NONE';
    const change = (isUp ? '+' : '-') + (Math.random() * 2).toFixed(2) + '%';
    const history = sparkline(price, 20, drift * 0.1);
    
    const spread = parseFloat((Math.random() * 2).toFixed(1));
    const atr = parseFloat((drift * 0.5).toFixed(2));
    const trend = trends[Math.floor(Math.random() * trends.length)];
    const volatility = volatilities[Math.floor(Math.random() * volatilities.length)];
    const aiBias = Math.floor(Math.random() * 201) - 100; // -100 to 100
    const probability = Math.floor(Math.random() * 40) + 60; // 60 to 100
    const support = parseFloat((price * 0.95).toFixed(5));
    const resistance = parseFloat((price * 1.05).toFixed(5));
    const liquidity = Math.floor(Math.random() * 50) + 10 + "M";
    const volume = Math.floor(Math.random() * 900) + 100 + "K";
    const smz = `[${parseFloat((price * 0.98).toFixed(5))}, ${parseFloat((price * 1.02).toFixed(5))}]`;
    const fvg = Math.random() > 0.5;
    const orderBlocks = `[${parseFloat((price * 0.96).toFixed(5))}]`;
    const marketStruct = structures[Math.floor(Math.random() * structures.length)];
    const isFav = Math.random() > 0.8;

    output += `  { symbol: "${symbol}", category: "${category}", price: ${price}, e13_dist: ${e13}, e50_dist: ${e50}, s200_dist: ${s200}, signal: "${signal}", change: "${change}", history: ${history}, spread: ${spread}, atr: ${atr}, trend: "${trend}", volatility: "${volatility}", ai_bias: ${aiBias}, probability: ${probability}, support: ${support}, resistance: ${resistance}, liquidity: "${liquidity}", volume: "${volume}", smart_money_zones: ${smz}, fair_value_gaps: ${fvg}, order_blocks: ${orderBlocks}, market_structure: "${marketStruct}", is_favorite: ${isFav} },\n`;
  });
});

output += `];\n`;

fs.writeFileSync('mock_output.ts', output);
console.log('Done');
