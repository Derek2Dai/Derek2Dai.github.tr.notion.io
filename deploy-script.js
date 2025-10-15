const fs = require('fs');
const path = require('path');

// Predefined popular tickers
const popularTickers = {
    "RTX": { name: "Raytheon Technologies", exchange: "NYSE", type: "stock" },
    "NOC": { name: "Northrop Grumman", exchange: "NYSE", type: "stock" },
    "RKLB": { name: "Rocket Lab USA", exchange: "NASDAQ", type: "stock" },

    
    // Crypto
    'BTCUSD': { name: 'Bitcoin', exchange: 'COINBASE', type: 'crypto' },
    'ETHUSD': { name: 'Ethereum', exchange: 'COINBASE', type: 'crypto' },
    'SOLUSD': { name: 'Solana', exchange: 'COINBASE', type: 'crypto' },
    'ADAUSD': { name: 'Cardano', exchange: 'COINBASE', type: 'crypto' },
    
    // Forex
    'EURUSD': { name: 'Euro/US Dollar', exchange: 'FX_IDC', type: 'forex' },
    'GBPUSD': { name: 'British Pound/US Dollar', exchange: 'FX_IDC', type: 'forex' },
    'USDJPY': { name: 'US Dollar/Japanese Yen', exchange: 'FX_IDC', type: 'forex' },
    'AUDUSD': { name: 'Australian Dollar/US Dollar', exchange: 'FX_IDC', type: 'forex' },
    
    // Indices
    'SPX': { name: 'S&P 500 Index', exchange: 'SP', type: 'index' },
    'NDX': { name: 'NASDAQ 100 Index', exchange: 'NASDAQ', type: 'index' },
    'DJI': { name: 'Dow Jones Industrial Average', exchange: 'DJ', type: 'index' }
};

// Create docs directory
const docsDir = './docs';
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

// Generate individual pages for each ticker
Object.entries(popularTickers).forEach(([ticker, info]) => {
    const symbol = `${info.exchange}:${ticker}`;
    const config = {
        symbol: symbol,
        title: `${info.name} (${ticker})`,
        ticker: ticker,
        type: info.type,
        interval: getDefaultInterval(info.type)
    };
    
    const htmlContent = generateTickerHTML(config);
    const filename = `${ticker.toLowerCase()}.html`;
    fs.writeFileSync(path.join(docsDir, filename), htmlContent);
    console.log(`✅ Generated ${filename} for ${info.name}`);
});

// Generate dynamic ticker page (accepts URL parameters)
generateDynamicTickerPage();

// Generate index page with all tickers
generateIndexPage();

generateHeatmapPage();

console.log(`🚀 Generated ${Object.keys(popularTickers).length} ticker pages`);
console.log('📝 Ready to deploy to GitHub Pages!');

function getDefaultInterval(type) {
    switch(type) {
        case 'crypto': return '4H';
        case 'forex': return '1H';
        case 'stock': return 'D';
        case 'etf': return 'D';
        case 'index': return 'D';
        default: return 'D';
    }
}

function generateDynamicTickerPage() {
    const dynamicHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Ticker Chart</title>
    <style>
        body { margin: 0; padding: 8px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .chart-container { border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .chart-header { background: #f8f9fa; padding: 12px 16px; border-bottom: 1px solid #e1e5e9; 
                       font-weight: 600; color: #37352f; font-size: 14px; }
        .error { padding: 20px; text-align: center; color: #e74c3c; }
    </style>
</head>
<body>
    <div class="chart-container">
        <div class="chart-header" id="chart-title">Loading Chart...</div>
        <div id="tradingview-chart" style="height: 400px;"></div>
        <div id="error-message" class="error" style="display: none;">
            Invalid ticker symbol. Please check the URL parameters.
        </div>
    </div>

    <script src="https://s3.tradingview.com/tv.js"></script>
    <script>
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const ticker = urlParams.get('ticker') || 'AAPL';
        const exchange = urlParams.get('exchange') || 'NASDAQ';
        const interval = urlParams.get('interval') || 'D';
        const theme = urlParams.get('theme') || 'light';
        
        const symbol = exchange + ':' + ticker;
        const title = ticker + ' Chart';
        
        // Update title
        document.getElementById('chart-title').textContent = title;
        document.title = title;
        
        try {
            new TradingView.widget({
                container_id: "tradingview-chart",
                width: "100%",
                height: 400,
                symbol: symbol,
                interval: interval,
                timezone: "Etc/UTC",
                theme: theme,
                style: "1",
                locale: "en",
                toolbar_bg: "#f8f9fa",
                enable_publishing: false,
                withdateranges: true,
                allow_symbol_change: true,
                hide_side_toolbar: false,
                studies_overrides: {},
                overrides: {
                    "paneProperties.background": theme === 'dark' ? "#1e1e1e" : "#ffffff",
                    "paneProperties.vertGridProperties.color": theme === 'dark' ? "#333" : "#f0f0f0",
                    "paneProperties.horzGridProperties.color": theme === 'dark' ? "#333" : "#f0f0f0"
                }
            });
        } catch (error) {
            document.getElementById('tradingview-chart').style.display = 'none';
            document.getElementById('error-message').style.display = 'block';
        }
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(docsDir, 'chart.html'), dynamicHTML);
    console.log('✅ Generated dynamic chart.html');
}

function generateIndexPage() {
    const groupedTickers = {};
    Object.entries(popularTickers).forEach(([ticker, info]) => {
        if (!groupedTickers[info.type]) {
            groupedTickers[info.type] = [];
        }
        groupedTickers[info.type].push({ ticker, ...info });
    });

    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TradingView Charts for Notion - All Tickers</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; background: #fafafa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
        .ticker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin: 20px 0; }
        .ticker-card { padding: 15px; background: #f8f9fa; border-radius: 8px; text-decoration: none; 
                      color: #333; border: 1px solid #e1e5e9; transition: all 0.2s; }
        .ticker-card:hover { background: #e9ecef; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .ticker-symbol { font-weight: bold; font-size: 16px; color: #2c3e50; }
        .ticker-name { font-size: 14px; color: #666; margin-top: 4px; }
        .section-title { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin: 30px 0 20px 0; }
        .custom-chart { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 30px; }
        .copy-url { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .url-example { font-family: monospace; background: #f1f1f1; padding: 8px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📈 TradingView Charts for Notion</h1>
        
        <div class="copy-url">
            <h3>🎯 How to Use:</h3>
            <p>1. Click any ticker below to get the direct URL</p>
            <p>2. Copy the URL and use <code>/embed</code> in Notion</p>
            <p>3. For custom tickers, use: <span class="url-example">chart.html?ticker=SYMBOL&exchange=EXCHANGE</span></p>
        </div>

        <div class="ticker-card custom-chart">
            <div class="ticker-symbol">🛠️ Custom Chart Builder</div>
            <div class="ticker-name">chart.html?ticker=YOUR_SYMBOL&exchange=EXCHANGE&interval=D&theme=light</div>
        </div>

        ${Object.entries(groupedTickers).map(([type, tickers]) => `
            <h2 class="section-title">${type.charAt(0).toUpperCase() + type.slice(1)}s</h2>
            <div class="ticker-grid">
                ${tickers.map(ticker => `
                    <a href="${ticker.ticker.toLowerCase()}.html" class="ticker-card" target="_blank">
                        <div class="ticker-symbol">${ticker.ticker}</div>
                        <div class="ticker-name">${ticker.name}</div>
                    </a>
                `).join('')}
            </div>
        `).join('')}
        
        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>🔗 URL Examples:</h3>
            <p><strong>Apple:</strong> <code>aapl.html</code></p>
            <p><strong>Bitcoin:</strong> <code>btcusd.html</code></p>
            <p><strong>Custom Tesla:</strong> <code>chart.html?ticker=TSLA&exchange=NASDAQ&interval=1H</code></p>
            <p><strong>Dark theme:</strong> <code>chart.html?ticker=AAPL&exchange=NASDAQ&theme=dark</code></p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(docsDir, 'index.html'), indexHTML);
    console.log('✅ Generated index.html with all tickers');
}

function generateTickerHTML(config) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body { margin: 0; padding: 8px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .chart-container { border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .chart-header { background: #f8f9fa; padding: 12px 16px; border-bottom: 1px solid #e1e5e9; 
                       font-weight: 600; color: #37352f; font-size: 14px; display: flex; justify-content: space-between; }
        .ticker-badge { background: #3498db; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="chart-container">
        <div class="chart-header">
            <span>${config.title}</span>
            <span class="ticker-badge">${config.type.toUpperCase()}</span>
        </div>
        <div id="tradingview-chart" style="height: 400px;"></div>
    </div>

    <script src="https://s3.tradingview.com/tv.js"></script>
    <script>
        new TradingView.widget({
            container_id: "tradingview-chart",
            width: "100%",
            height: 400,
            symbol: "${config.symbol}",
            interval: "${config.interval}",
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            toolbar_bg: "#f8f9fa",
            enable_publishing: false,
            withdateranges: true,
            allow_symbol_change: true,
            hide_side_toolbar: false,
            studies_overrides: {},
            overrides: {
                "paneProperties.background": "#ffffff",
                "paneProperties.vertGridProperties.color": "#f0f0f0",
                "paneProperties.horzGridProperties.color": "#f0f0f0"
            }
        });
    </script>
</body>
</html>`;
}

// ...existing code...
function generateHeatmapPage() {
  const heatmapHTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Stock Heatmap</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;padding:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#fff}
.chart-container{border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.chart-header{background:#f8f9fa;padding:12px 16px;border:1px solid #e1e5e9;border-bottom:none;font-size:14px;font-weight:600;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.controls{display:flex;gap:6px;flex-wrap:wrap}
.controls select,.controls button{font-size:12px;padding:4px 8px;border:1px solid #d0d4d9;border-radius:4px;background:#fff;cursor:pointer}
.controls button.active{background:#3498db;color:#fff;border-color:#3498db}
#heatmap-wrapper{border:1px solid #e1e5e9}
.footer-note{margin:10px 4px;font-size:11px;color:#888;text-align:center}
</style></head>
<body>
<div class="chart-container">
  <div class="chart-header">
    <span>TradingView Stock Heatmap</span>
    <div class="controls">
      <select id="market">
        <option value="america">US (All)</option>
        <option value="us">US (Major)</option>
        <option value="europe">Europe</option>
        <option value="asia">Asia</option>
        <option value="world">World</option>
        <option value="crypto">Crypto</option>
      </select>
      <select id="metric">
        <option value="change">Change %</option>
        <option value="volume">Volume</option>
        <option value="price_earnings_ttm">P/E (TTM)</option>
        <option value="market_cap_basic">Market Cap</option>
        <option value="dividends_yield_current">Dividend Yield</option>
      </select>
      <select id="theme">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <select id="sector">
        <option value="">All Sectors</option>
        <option value="Technology">Technology</option>
        <option value="Financial">Financial</option>
        <option value="Healthcare">Healthcare</option>
        <option value="ConsumerDiscretionary">Consumer Discretionary</option>
        <option value="Energy">Energy</option>
        <option value="Utilities">Utilities</option>
        <option value="Industrials">Industrials</option>
        <option value="RealEstate">Real Estate</option>
        <option value="Materials">Materials</option>
        <option value="ConsumerStaples">Consumer Staples</option>
        <option value="CommunicationServices">Communication Services</option>
      </select>
      <button id="refreshBtn">Refresh</button>
    </div>
  </div>
  <div id="heatmap-wrapper">
    <div id="heatmap-container" style="width:100%;height:520px;"></div>
  </div>
</div>
<div class="footer-note">Data and widget © TradingView</div>
<script>
function buildConfig(){
  const market=document.getElementById('market').value;
  const metric=document.getElementById('metric').value;
  const theme=document.getElementById('theme').value;
  const sector=document.getElementById('sector').value;
  return {
    dateRange:"1D",
    exchange:"",
    showSymbolTooltip:true,
    colorTheme:theme,
    dataSource:market,
    blockSize:"market_cap_basic",
    blockColor:metric,
    locale:"en",
    symbolUrl:"https://www.tradingview.com/symbol/{symbol}/",
    width:"100%",
    height:520,
    showToolbar:true,
    isDataSetEnabled:false,
    children: sector ? [{type:"sector",value:sector}] : []
  };
}
function loadHeatmap(){
  const container=document.getElementById('heatmap-container');
  container.innerHTML="";
  const script=document.createElement('script');
  script.type='text/javascript';
  script.src='https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
  script.async=true;
  script.innerHTML=JSON.stringify(buildConfig());
  container.appendChild(script);
}
document.getElementById('refreshBtn').addEventListener('click',loadHeatmap);
['market','metric','theme','sector'].forEach(id=>{
  document.getElementById(id).addEventListener('change',loadHeatmap);
});
(function initFromQuery(){
  const p=new URLSearchParams(location.search);
  if(p.has('market')) document.getElementById('market').value=p.get('market');
  if(p.has('metric')) document.getElementById('metric').value=p.get('metric');
  if(p.has('theme')) document.getElementById('theme').value=p.get('theme');
  if(p.has('sector')) document.getElementById('sector').value=p.get('sector');
  loadHeatmap();
})();
</script>
</body></html>`;
  fs.writeFileSync(path.join(docsDir, 'heatmap.html'), heatmapHTML);
  console.log('✅ Generated heatmap.html');
}