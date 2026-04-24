// src/components/ChatSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✨ 다국어 훅 추가

// ✨ 메인 차트와 동일한 캐릭터 이미지를 불러옵니다!
import juriAvatar from '../assets/jurisimcharN.png'; 

// ==================== Styled Components ====================
const LeftSection = styled.section`
  flex: 6;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ChatCard = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatWindow = styled.div`
  flex: 1;
  padding: 28px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fafafa;
  scrollbar-width: thin;
  scrollbar-color: #c9c9c9 transparent;
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  max-width: 78%;
  align-self: ${(props) => (props.$isUser ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div`
  padding: 15px 20px;
  border-radius: 22px;
  font-size: 15.5px;
  line-height: 1.5;
  white-space: pre-line;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  ${(props) =>
    props.$isUser
      ? `
        background-color: #dcd0c0;
        border-bottom-right-radius: 6px;
      `
      : `
        background-color: #f4f0ea;
        border-bottom-left-radius: 6px;
      `}
`;

const Avatar = styled.img`
  width: 38px; 
  height: 38px;
  border-radius: 50%; 
  object-fit: cover; 
  flex-shrink: 0; 
  margin-top: -2px; 
  background-color: #fce8e6; 
  border: 1px solid #e0e0e0; 
`;

const InputArea = styled.div`
  padding: 18px 24px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
`;

const InputField = styled.input`
  flex: 1;
  padding: 16px 24px;
  border: 1.5px solid #e5e5e5;
  border-radius: 9999px;
  font-size: 15.5px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #2c3e50;
    box-shadow: 0 0 0 4px rgba(44, 62, 80, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  background-color: #2c3e50;
  color: #ffffff;
  border: none;
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: #1f2a3a;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ==================== Main Component ====================
const ChatSection = () => {
  const { t } = useTranslation(); // ✨ 다국어 번역 함수 꺼내기
  
  // (모의 대화 데이터는 백엔드 실시간 데이터로 취급하여 한글로 유지합니다)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'juri',
      text: "안녕하세요! '주리'입니다. 법률 고민이 있으신가요?\n무엇이든 편하게 물어봐 주세요! 😊",
    },
    {
      id: 2,
      type: 'user',
      text: '임대차 보증금 미반환 건으로 고민이 많습니다.\n계약 기간이 끝났는데도 집주인이 돈을 돌려주지 않아요...',
    },
    {
      id: 3,
      type: 'juri',
      text: '네, 임대차 관련 고민이시군요. 유사 판례를 분석하고 있습니다... ⏳',
    },
    {
      id: 4,
      type: 'juri',
      text: '분석 완료! 이 케이스의 신뢰도는 85%로 매우 높음입니다.\n오른쪽에서 상세 정보를 확인해 보세요!',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        type: 'juri',
        text: '추가 분석을 완료했습니다.\n오른쪽 대시보드를 확인해 주세요! 📊',
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <LeftSection>
      <ChatCard>
        <ChatWindow ref={chatWindowRef}>
          {messages.map((msg) => (
            <MessageContainer key={msg.id} $isUser={msg.type === 'user'}>
              {msg.type === 'juri' && (
                <Avatar src={juriAvatar} alt="법률 Owl 주리 캐릭터 아바타" />
              )}
              <Bubble $isUser={msg.type === 'user'}>{msg.text}</Bubble>
              {msg.type === 'user' && (
                <div style={{ fontSize: '26px', flexShrink: 0, marginTop: '2px' }}>👤</div>
              )}
            </MessageContainer>
          ))}
        </ChatWindow>

        <InputArea>
          <InputField
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat_placeholder')} /* ✨ 플레이스홀더에 다국어 적용 */
          />
          <SendButton onClick={handleSend}>
            <Send size={22} />
          </SendButton>
        </InputArea>
      </ChatCard>
    </LeftSection>
  );
};

export default ChatSection;