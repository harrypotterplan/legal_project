// src/App.jsx (다국어 완전 적용 버전)
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next'; 

import Header from './components/Header';
import ChatSection from './components/ChatSection';
import DashboardSection from './components/DashboardSection';
import WarningModal from './components/WarningModal';
import LoginPage from './components/LoginPage'; 
import MyPage from './components/MyPage'; 

const AppContainer = styled.div`
  display: flex; flex-direction: column; height: 100vh;
  background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1; display: flex; padding: 24px; gap: 24px; overflow: hidden;
`;

const AppContent = ({ isLoggedIn, setIsLoggedIn }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [forceLowScore, setForceLowScore] = useState(false);

  useEffect(() => {
    if (aiResult && aiResult.reliability_score <= 45) {
      setIsModalOpen(true); 
    }
  }, [aiResult]);

  const toggleForceLowScore = () => {
    if (!forceLowScore) {
      // ✨ 테스트 알림창도 다국어로 처리 (i18n.js에 추가한 키값 사용)
      alert(t('alert_force_low'));
    }
    setForceLowScore(!forceLowScore);
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
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Header />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginRight: '32px' }}>
          
          <button onClick={toggleLanguage} style={{ padding: '8px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            {t('toggle_lang')}
          </button>

          <button onClick={() => navigate('/mypage')} style={{ padding: '8px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            👤 {t('mypage_btn')}
          </button>

          {/* ✨ 버튼 텍스트도 다국어 적용 */}
          <button onClick={toggleForceLowScore} style={{ padding: '8px 16px', background: forceLowScore ? '#ea4335' : '#fce8e6', color: forceLowScore ? '#ffffff' : '#ea4335', border: '1px solid #fad2cf', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            {forceLowScore ? t('force_on') : t('test_btn')}
          </button>
          
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            {t('logout_btn')}
          </button>

        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <MainContent>
            <ChatSection setAiResult={setAiResult} forceLowScore={forceLowScore} setForceLowScore={setForceLowScore} />
            <DashboardSection resultData={aiResult} />
          </MainContent>
        } />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>

      {isModalOpen && (
        <WarningModal onClose={() => setIsModalOpen(false)} />
      )}
    </AppContainer>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  return (
    <Router>
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
};

export default App;