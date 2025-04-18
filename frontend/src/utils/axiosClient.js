import axios from 'axios';

const { hostname, protocol } = window.location;
const isLocalhost = hostname === 'localhost';

// const BASE_URL = isLocalhost
//   ? 'http://localhost:5000'
//   : `${protocol}//${hostname}:5000`;
const BASE_URL = isLocalhost
  ? 'http://localhost:5000/api/v1'
  : `${protocol}//${hostname}:5000/api/v1`;




const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
