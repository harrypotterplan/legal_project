// src/App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

import Header from './components/Header';
import ChatSection from './components/ChatSection';
import DashboardSection from './components/DashboardSection';
import WarningModal from './components/WarningModal';
import LoginPage from './components/LoginPage'; 

// ==================== Styled Components ====================
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  overflow: hidden;
`;

// ==================== Main Component ====================
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const triggerLowScore = () => {
    setIsModalOpen(true);
  };

  // ✨ 로그아웃 처리 함수: 상태를 false로 되돌립니다.
  const handleLogout = () => {
    // 실제 서비스라면 여기서 로컬 스토리지의 토큰(Token)을 지우는 작업 등이 들어갑니다.
    alert("안전하게 로그아웃 되었습니다.");
    setIsLoggedIn(false); 
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppContainer>
      {/* 상단 헤더 및 버튼 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ flex: 1 }}><Header /></div>
        
        {/* ✨ 버튼들을 나란히 묶어주는 영역 */}
        <div style={{ display: 'flex', gap: '12px', marginRight: '32px' }}>
          
          {/* 테스트 버튼 */}
          <button 
            onClick={triggerLowScore} 
            style={{ padding: '8px 16px', background: '#fce8e6', color: '#ea4335', border: '1px solid #fad2cf', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            🚨 신뢰도 45% 테스트
          </button>
          
          {/* ✨ 새로 추가된 로그아웃 버튼 */}
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            로그아웃
          </button>

        </div>
      </div>

      <MainContent>
        <ChatSection />
        <DashboardSection />
      </MainContent>

      {isModalOpen && (
        <WarningModal onClose={() => setIsModalOpen(false)} />
      )}
    </AppContainer>
  );
};

export default App;