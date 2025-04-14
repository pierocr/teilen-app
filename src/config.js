const ENV = 'dev'; // 'dev' o 'prod'

const API_URL = ENV === 'prod'
  ? 'https://teilen-backend.onrender.com'
  : 'http://192.168.100.9:5001';

console.log("🌎 Modo actual:", ENV);
console.log("🔗 API_URL usado:", API_URL);

export default API_URL;
