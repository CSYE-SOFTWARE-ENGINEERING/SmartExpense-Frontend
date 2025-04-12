import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';

const BASE_URL = isLocalhost
  ? 'http://localhost:5000'   // 本地开发
  : 'http://backend:5000';    // Docker 容器内通信

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
