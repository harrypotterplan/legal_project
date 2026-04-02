// src/components/LoginPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Mail, Lock, User } from 'lucide-react';

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
  const [isLoginMode, setIsLoginMode] = useState(true); 

  // ✨ 제출 버튼을 눌렀을 때의 동작을 분리했습니다!
  const handleSubmit = (e) => {
    e.preventDefault(); 

    if (!isLoginMode) {
      // 1. 회원가입 모드일 때
      // 가짜로 가입 성공 메시지를 띄우고, 로그인 모드로 화면을 전환합니다.
      alert("🎉 회원가입이 성공적으로 완료되었습니다!\n방금 가입하신 정보로 로그인해 주세요.");
      setIsLoginMode(true); // 다시 로그인 화면으로 State 변경
    } else {
      // 2. 로그인 모드일 때
      // 메인 대시보드로 넘어가는 함수를 실행합니다.
      onLogin(); 
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LogoArea>
          <LogoTitle>⚖️ Juri-Sim</LogoTitle>
          <LogoSub>인공지능 법률 시뮬레이션 서비스</LogoSub>
        </LogoArea>

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <InputGroup>
              <IconWrapper><User size={20} /></IconWrapper>
              <Input type="text" placeholder="이름 (홍길동)" required />
            </InputGroup>
          )}

          <InputGroup>
            <IconWrapper><Mail size={20} /></IconWrapper>
            <Input type="email" placeholder="이메일 주소" required />
          </InputGroup>

          <InputGroup>
            <IconWrapper><Lock size={20} /></IconWrapper>
            <Input type="password" placeholder="비밀번호" required />
          </InputGroup>

          <SubmitButton type="submit">
            {isLoginMode ? '로그인' : '회원가입 완료'}
          </SubmitButton>
        </form>

        <ToggleText>
          {isLoginMode ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          <span onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? '회원가입하기' : '로그인하기'}
          </span>
        </ToggleText>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;