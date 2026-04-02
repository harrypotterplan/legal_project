// src/components/ChatSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send } from 'lucide-react';

// ✨ 메인 차트와 동일한 캐릭터 이미지를 불러옵니다!
// 이미지 파일이 src/assets/jurisimcharN.png 에 있어야 합니다.
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

// ✨ 아바타 스타일 수정 (텍스트 div -> 이미지 img)
// 이번에는 요청하신 대로 원안에 쏙 들어가도록 동그랗게 처리했습니다.
const Avatar = styled.img`
  width: 38px; /* 챗봇용 아바타 크기 */
  height: 38px;
  border-radius: 50%; /* ✨ 이미지를 동그랗게 만듭니다! */
  object-fit: cover; /* 이미지가 찌그러지지 않게 비율 유지하며 꽉 채움 */
  flex-shrink: 0; /* 크기가 줄어들지 않게 고정 */
  margin-top: -2px; /* 말풍선 세로 위치와 살짝 맞추기 */
  background-color: #fce8e6; /* 임시 배경색 (원형 프레임 포인트) */
  border: 1px solid #e0e0e0; /* 아바타 테두리 추가 */
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
  // 초기 대화 메시지
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

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // 전송 핸들러
  const handleSend = () => {
    const trimmed = inputValue.trim();
    
    // 아무것도 입력하지 않았을 때만 전송 무시
    if (trimmed.length === 0) {
      return;
    }

    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // 1.2초 후 봇 답변 시뮬레이션
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        type: 'juri',
        text: '추가 분석을 완료했습니다.\n오른쪽 대시보드를 확인해 주세요! 📊',
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1200);
  };

  // Enter 키 입력 지원
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <LeftSection>
      <ChatCard>
        {/* 대화창 */}
        <ChatWindow ref={chatWindowRef}>
          {messages.map((msg) => (
            <MessageContainer key={msg.id} $isUser={msg.type === 'user'}>
              
              {/* ✨ 봇 아이콘 수정: 이모지 대신 이미지 소스를 사용 */}
              {msg.type === 'juri' && (
                <Avatar src={juriAvatar} alt="법률 Owl 주리 캐릭터 아바타" />
              )}
              
              {/* 말풍선 */}
              <Bubble $isUser={msg.type === 'user'}>{msg.text}</Bubble>

              {/* 사용자 아이콘 (오른쪽) */}
              {msg.type === 'user' && (
                <div style={{ font_size: '26px', flex_shrink: 0, margin_top: '2px' }}>👤</div>
              )}
            </MessageContainer>
          ))}
        </ChatWindow>

        {/* 입력창 */}
        <InputArea>
          <InputField
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="법률 고민을 자유롭게 말씀해 주세요..."
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