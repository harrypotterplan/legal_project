// src/components/WarningModal.jsx
import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✨ 1. 다국어 마법사 불러오기

// ==================== Styled Components ====================
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  background-color: #ffffff;
  width: 400px;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-top: 6px solid #ea4335;
`;

const WarningIcon = styled.div`
  background-color: #fce8e6;
  color: #ea4335;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #ea4335;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 14px 0;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a252f;
  }
`;

// ==================== Main Component ====================
const WarningModal = ({ onClose }) => {
  const { t } = useTranslation(); // ✨ 2. 번역 함수(t) 꺼내기

  return (
    <Overlay>
      <ModalBox>
        <WarningIcon>
          <AlertTriangle size={32} />
        </WarningIcon>
        
        {/* ✨ 3. 한글 생글씨들을 t('단어키') 로 교체! */}
        <Title>{t('warning_title')}</Title>
        <Description>
          {t('warning_desc_1')}<br />
          {t('warning_desc_2')}
        </Description>
        
        <CloseButton onClick={onClose}>
          {t('warning_btn')}
        </CloseButton>
      </ModalBox>
    </Overlay>
  );
};

export default WarningModal;