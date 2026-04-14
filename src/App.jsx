// src/App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // ✨ 라우터 부품
import { useTranslation } from 'react-i18next'; // ✨ 다국어 마법사

import Header from './components/Header';
import ChatSection from './components/ChatSection';
import DashboardSection from './components/DashboardSection';
import WarningModal from './components/WarningModal';
import LoginPage from './components/LoginPage'; 
import MyPage from './components/MyPage'; // ✨ 새로 만든 마이페이지

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
// ✨ 라우터(화면 이동) 기능을 쓰기 위해 알맹이를 따로 뺐습니다.
const AppContent = ({ isLoggedIn, setIsLoggedIn }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // ✨ 주소 이동 도구

  const [isModalOpen, setIsModalOpen] = useState(false);

  const triggerLowScore = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    alert(t('logout_alert')); 
    setIsLoggedIn(false); 
    navigate('/'); // 로그아웃하면 기본 주소로 이동
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
        {/* ✨ 헤더를 누르면 메인 화면으로 돌아오게 onClick 추가 */}
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Header />
        </div>
        
        {/* 우측 버튼 그룹 영역 (원우님 기존 스타일 100% 복구!) */}
        <div style={{ display: 'flex', gap: '12px', marginRight: '32px' }}>
          
          <button 
            onClick={toggleLanguage} 
            style={{ padding: '8px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {t('toggle_lang')}
          </button>

          {/* ✨ 마이페이지 이동 버튼 (다국어 버튼과 같은 하얀색 스타일 적용) */}
          <button 
            onClick={() => navigate('/mypage')} 
            style={{ padding: '8px 16px', background: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            👤 {t('mypage_btn')}
          </button>

          {/* 테스트 버튼 (원우님표 예쁜 빨간색 복구!) */}
          <button 
            onClick={triggerLowScore} 
            style={{ padding: '8px 16px', background: '#fce8e6', color: '#ea4335', border: '1px solid #fad2cf', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {t('test_btn')}
          </button>
          
          {/* 로그아웃 버튼 */}
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {t('logout_btn')}
          </button>

        </div>
      </div>

      {/* ✨ 화면이 주소에 따라 휙휙 바뀌는 마법의 공간 */}
      <Routes>
        {/* 기본 주소(/)일 때는 원래 챗봇과 대시보드를 보여줌 */}
        <Route path="/" element={
          <MainContent>
            <ChatSection />
            <DashboardSection />
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
// ✨ Router로 앱 전체를 감싸줍니다.
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
};

export default App;