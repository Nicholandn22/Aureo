import axios from 'axios';

const PYTH_API_URL = 'https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2';

let priceCache: { price: any; timestamp: number } | null = null;
const CACHE_DURATION = 60000;

export async function getPythGoldPrice() {
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.price;
  }

  try {
    const response = await axios.get(PYTH_API_URL);
    const priceData = response.data[0]?.price;

    if (!priceData) {
      throw new Error('No price data available');
    }

    const price = Number(priceData.price) * Math.pow(10, priceData.expo);
    const conf = Number(priceData.conf) * Math.pow(10, priceData.expo);

    const emaPrice = priceData.ema_price
      ? Number(priceData.ema_price.price) * Math.pow(10, priceData.ema_price.expo)
      : price;

    const high24h = price * 1.02;
    const low24h = price * 0.98;
    const change24h = ((price - emaPrice) / emaPrice) * 100;
    const volatility = (conf / price) * 100;

    const result = {
      currentPrice: price,
      confidence: conf,
      emaPrice,
      high24h,
      low24h,
      change24h,
      volatility,
      timestamp: new Date(Number(priceData.publish_time) * 1000),
    };

    priceCache = { price: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error('Pyth Price Fetch Error:', error);
    throw error;
  }
}
