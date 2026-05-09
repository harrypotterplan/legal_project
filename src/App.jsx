// src/App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next'; 

import Header from './components/Header';
import ChatSection from './components/ChatSection';
import DashboardSection from './components/DashboardSection';
import WarningModal from './components/WarningModal';
import LoginPage from './components/LoginPage'; 
import MyPage from './components/MyPage'; 

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

// ==================== App Content (실제 내용물) ====================
const AppContent = ({ isLoggedIn, setIsLoggedIn }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); 

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✨ 1번 추가: AI 서버에서 받아온 결과를 담을 '빈 상자' 만들기
  const [aiResult, setAiResult] = useState(null);

  const triggerLowScore = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    alert(t('logout_alert')); 
    setIsLoggedIn(false); 
    navigate('/'); 
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppContainer>
      {/* 상단 헤더 및 버튼 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Header />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginRight: '32px' }}>
          
          <button 
            onClick={toggleLanguage} 
            style={{ padding: '8px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {t('toggle_lang')}
          </button>

          <button 
            onClick={() => navigate('/mypage')} 
            style={{ padding: '8px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            👤 {t('mypage_btn')}
          </button>

          <button 
            onClick={triggerLowScore} 
            style={{ padding: '8px 16px', background: '#fce8e6', color: '#ea4335', border: '1px solid #fad2cf', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {t('test_btn')}
          </button>
          
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {t('logout_btn')}
          </button>

        </div>
      </div>

      <Routes>
        {/* 기본 주소(/)일 때는 원래 챗봇과 대시보드를 보여줌 */}
        <Route path="/" element={
          <MainContent>
            {/* ✨ 2번 추가: ChatSection이 AI 결과를 빈 상자에 담을 수 있도록 함수(setAiResult)를 넘겨줌 */}
            <ChatSection setAiResult={setAiResult} />
            
            {/* ✨ 3번 추가: 상자에 담긴 결과물(aiResult)을 DashboardSection이 가져가서 화면에 그리도록 넘겨줌 */}
            <DashboardSection resultData={aiResult} />
          </MainContent>
        } />
        
        {/* /mypage 주소일 때는 새로 만든 마이페이지를 보여줌 */}
        <Route path="/mypage" element={<MyPage />} />
      </Routes>

      {isModalOpen && (
        <WarningModal onClose={() => setIsModalOpen(false)} />
      )}
    </AppContainer>
  );
};

// ==================== 최상단 App Component ====================
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
};

export default App;