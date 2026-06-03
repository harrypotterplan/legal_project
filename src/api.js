// src/api.js
import axios from 'axios';

// 1. 기본 API 설정 (백엔드 포트 8000번)
export const api = axios.create({
  baseURL: 'http://98.95.181.135/api/v1',
  timeout: 60000, // 🚨 [중요] AI 연산 대기 시간을 고려하여 60초로 넉넉하게 연장
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 요청(Request) 인터셉터: 백엔드로 데이터를 보내기 직전에 가로채서 토큰을 넣음
api.interceptors.request.use(
  (config) => {
    // localStorage에 저장된 JWT 토큰 가져오기 (로그인 시 저장한 키값)
    const token = localStorage.getItem('access_token');
    
    // 토큰이 존재하면 헤더에 Authorization을 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답(Response) 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러(인증 실패/토큰 만료)가 발생하면 알림을 띄우고 처리
    if (error.response && error.response.status === 401) {
      console.warn("인증이 만료되었습니다. 다시 로그인해주세요.");
      // window.location.href = '/login'; // 필요시 주석 해제
    }
    return Promise.reject(error);
  }
);

export default api;