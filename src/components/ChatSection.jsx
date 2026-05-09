// src/components/ChatSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import juriAvatar from '../assets/jurisimcharN.png'; 
import { api } from '../api';

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
  line-height: 1.6;
  white-space: pre-wrap; /* ✨ 줄바꿈 유지 */
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

const InputWrapper = styled.div`
  border-top: 1px solid #f0f0f0;
  background: #ffffff;
  padding: 16px 24px 24px;
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
`;

const CategoryBtn = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$active ? '#2c3e50' : '#e5e7eb')};
  background: ${(props) => (props.$active ? '#2c3e50' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#6b7280')};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? '#2c3e50' : '#f9fafb')};
  }
`;

const InputArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
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

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

// ==================== Main Component ====================
const ChatSection = ({ setAiResult }) => {
  const { t } = useTranslation();
  
  const [selectedCategory, setSelectedCategory] = useState("임대차");
  const [isSimulating, setIsSimulating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatWindowRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'juri',
      text: "안녕하세요! '주리'입니다. 법률 고민이 있으신가요?\n분야를 선택하고 상황을 10자 이상 자세히 설명해 주세요! 😊",
    }
  ]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 10) {
      alert("상황을 정확히 파악하기 위해 최소 10자 이상 입력해 주세요.");
      return;
    }

    // 유저 메시지 렌더링
    const userMessage = { id: Date.now(), type: 'user', text: `[${selectedCategory}] ${trimmed}` };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSimulating(true);

    // AI 로딩 메시지 렌더링
    const loadingId = Date.now() + 1;
    setMessages((prev) => [...prev, {
      id: loadingId, type: 'juri', text: '판례를 검색하고 AI 분석을 진행 중입니다...\n잠시만 기다려 주세요. ⏳'
    }]);

    try {
      // API 통신
      const response = await api.post('/legal/simulate', {
        query: trimmed,
        category: selectedCategory
      });

      // ✨ AI 응답을 챗봇 말풍선에 덮어씌움
      setMessages((prev) => prev.map(msg => 
        msg.id === loadingId 
        ? { ...msg, text: response.data.answer_kr } 
        : msg
      ));

      // 부모로 데이터 전달 (대시보드 업데이트용)
      if(setAiResult) {
        setAiResult(response.data);
      }

    } catch (error) {
      const errorMsg = error.response?.data?.detail || "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setMessages((prev) => prev.map(msg => 
        msg.id === loadingId ? { ...msg, text: `⚠️ 죄송합니다. ${errorMsg}` } : msg
      ));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSimulating) {
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
                <Avatar src={juriAvatar} alt="Juri Avatar" />
              )}
              <Bubble $isUser={msg.type === 'user'}>{msg.text}</Bubble>
              {msg.type === 'user' && (
                <div style={{ fontSize: '26px', flexShrink: 0, marginTop: '2px' }}>👤</div>
              )}
            </MessageContainer>
          ))}
        </ChatWindow>

        <InputWrapper>
          <CategoryRow>
            <Hash size={14} color="#6b7280" />
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>상담 분야:</span>
            {['임대차', '근로', '소비자'].map(cat => (
              <CategoryBtn 
                key={cat} 
                $active={selectedCategory === cat} 
                onClick={() => setSelectedCategory(cat)}
                disabled={isSimulating}
              >
                {cat}
              </CategoryBtn>
            ))}
          </CategoryRow>
          
          <InputArea>
            <InputField
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSimulating ? "AI가 답변을 작성하고 있습니다..." : t('chat_placeholder')}
              disabled={isSimulating}
            />
            <SendButton onClick={handleSend} disabled={isSimulating || inputValue.trim().length === 0}>
              <Send size={22} />
            </SendButton>
          </InputArea>
        </InputWrapper>
      </ChatCard>
    </LeftSection>
  );
};

export default ChatSection;