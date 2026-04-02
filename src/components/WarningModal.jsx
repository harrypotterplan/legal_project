// src/components/WarningModal.jsx
import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

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

// ✨ 닫기 버튼을 하나만 남기고, 눈에 띄는 남색(Primary)으로 변경했습니다.
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

const WarningModal = ({ onClose }) => {
  return (
    <Overlay>
      <ModalBox>
        <WarningIcon>
          <AlertTriangle size={32} />
        </WarningIcon>
        <Title>중요: 전문적인 법률 상담이 필요합니다</Title>
        <Description>
          시뮬레이션 신뢰도 점수가 낮아 사안이 복잡할 수 있습니다.<br />
          정확한 법률 상담을 위해 법률 전문가와 상담할 것을 권장합니다.
        </Description>
        
        {/* 버튼이 하나뿐이므로, 이 버튼이 모달을 닫는 역할을 확실히 수행합니다 */}
        <CloseButton onClick={onClose}>결과 확인</CloseButton>
      </ModalBox>
    </Overlay>
  );
};

export default WarningModal;