// src/components/LoginPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Mail, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✨ 다국어 훅 추가
import { api } from '../api';

// ==================== Styled Components ====================
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LoginBox = styled.div`
  background-color: #ffffff;
  width: 100%;
  max-width: 400px;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative; /* ✨ 버튼 위치를 잡기 위해 추가 */
`;

// ✨ 예쁜 언어 스위치 버튼 스타일 추가
const LangButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f4f6f8;
    color: #2c3e50;
  }
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LogoTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #1a2533;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
`;

const LogoSub = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1.5px solid #e5e5e5;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #2c3e50;
    box-shadow: 0 0 0 4px rgba(44, 62, 80, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 0;
  margin-top: 12px;
  background-color: #2c3e50;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1a252f;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToggleText = styled.div`
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;

  span {
    color: #2c3e50;
    font-weight: 700;
    cursor: pointer;
    margin-left: 6px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

// ==================== Main Component ====================
const LoginPage = ({ onLogin }) => {
  const { t, i18n } = useTranslation(); // ✨ 다국어 객체 꺼내기
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // ✨ 언어 변경 함수
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      if (!isLoginMode) {
        await api.post('/auth/signup', {
          email: email,
          password: password
        });

        alert(t('alert_signup_success')); // ✨ 알림창도 다국어 적용
        setIsLoginMode(true); 
      } else {
        const response = await api.post('/auth/login', {
          email: email,
          password: password
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        onLogin(); 
      }
    } catch (error) {
      // ✨ [object Object] 에러 방지용 상세 처리 로직
      const detail = error.response?.data?.detail;
      const errorMessage = Array.isArray(detail) ? detail[0].msg : (detail || t('alert_error_default'));
      alert(t('alert_fail') + errorMessage);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        {/* ✨ 다국어 스위치 버튼 추가 */}
        <LangButton type="button" onClick={toggleLanguage}>
          {t('toggle_lang')}
        </LangButton>

        <LogoArea>
          <LogoTitle>⚖️ Juri-Sim</LogoTitle>
          <LogoSub>{t('logo_sub')}</LogoSub>
        </LogoArea>

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <InputGroup>
              <IconWrapper><User size={20} /></IconWrapper>
              <Input 
                type="text" 
                placeholder={t('name_placeholder')} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </InputGroup>
          )}

          <InputGroup>
            <IconWrapper><Mail size={20} /></IconWrapper>
            <Input 
              type="email" 
              placeholder={t('email_placeholder')} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </InputGroup>

          <InputGroup>
            <IconWrapper><Lock size={20} /></IconWrapper>
            <Input 
              type="password" 
              placeholder={t('password_placeholder')} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </InputGroup>

          <SubmitButton type="submit">
            {isLoginMode ? t('login_btn') : t('signup_btn')}
          </SubmitButton>
        </form>

        <ToggleText>
          {isLoginMode ? t('no_account') : t('have_account')}
          <span onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? t('go_signup') : t('go_login')}
          </span>
        </ToggleText>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;