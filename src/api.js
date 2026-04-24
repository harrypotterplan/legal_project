// src/api.js
import axios from 'axios';

// 백엔드 서버 주소 (로컬 8000번 포트)
const BASE_URL = 'http://127.0.0.1:8000/api/v1';

// 공통 통신 객체 생성
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✨ 인터셉터: 요청을 보내기 전에 가로채서 토큰을 무조건 붙여줍니다
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);