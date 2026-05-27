// src/components/ChatSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Hash, RotateCcw } from 'lucide-react'; 
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
  white-space: pre-wrap; 
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
  
  const categories = [
    { id: '임대차', label: t('cat_lease') },
    { id: '근로', label: t('cat_labor') },
    { id: '소비자', label: t('cat_consumer') }
  ];

  // 초기 안내 메시지 세팅
  const defaultGreeting = {
    id: 1,
    type: 'juri',
    text: "안녕하세요! '주리'입니다. 법률 고민이 있으신가요?\n분야를 선택하고 상황을 10자 이상 자세히 설명해 주세요! 😊",
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatWindowRef = useRef(null);

  // DB 연동: 채팅방 ID와 메시지 상태
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([defaultGreeting]);

  // 스크롤 자동 이동
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // 마운트 시 (페이지 처음 로드 시) 가장 최근 대화 불러오기
  useEffect(() => {
    const loadPreviousChat = async () => {
      try {
        const sessionRes = await api.get('/chat/sessions');
        if (sessionRes.data && sessionRes.data.length > 0) {
          const latestSession = sessionRes.data[0];
          setSessionId(latestSession.session_id);
          setSelectedCategory(latestSession.category || categories[0].id);

          const msgRes = await api.get(`/chat/sessions/${latestSession.session_id}/messages`);
          if (msgRes.data && msgRes.data.length > 0) {
            const formattedMessages = msgRes.data.map(m => ({
              id: m.message_id,
              type: m.role === 'user' ? 'user' : 'juri',
              text: m.content
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.log("이전 대화가 없거나, 아직 백엔드 라우터가 연결되지 않았습니다.");
      }
    };
    loadPreviousChat();
  }, []);

  // 🚨 [수정됨] 새 시뮬레이션 시작 시, 백엔드에 즉시 "새 방"을 만들어달라고 요청하여 좀비 채팅 방지
  const handleReset = async () => {
    if (window.confirm("현재 대화를 지우고 새로운 시뮬레이션을 시작하시겠습니까?")) {
      try {
        // 프론트 화면만 지우는 게 아니라, 백엔드에 즉시 "새로운 빈 방"을 생성
        const createSessionRes = await api.post('/chat/sessions', {
          category: selectedCategory,
          title: "새 시뮬레이션"
        });
        
        // 만들어진 새 방의 ID로 갈아끼움
        setSessionId(createSessionRes.data.session_id); 
        setMessages([defaultGreeting]);
        setInputValue('');
        if (setAiResult) {
          setAiResult(null); 
        }
      } catch (error) {
        console.error("새 대화방 생성 오류", error);
        alert("새 시뮬레이션을 준비하는 데 실패했습니다.");
      }
    }
  };

  // 메시지 전송 및 DB 저장
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 10) {
      alert("상황을 정확히 파악하기 위해 최소 10자 이상 입력해 주세요.");
      return;
    }

    const currentCategoryLabel = categories.find(c => c.id === selectedCategory)?.label || selectedCategory;
    const uiUserText = `[${currentCategoryLabel}] ${trimmed}`;
    
    // UI에 내 메시지 즉시 띄우기
    setMessages((prev) => [...prev, { id: Date.now(), type: 'user', text: uiUserText }]);
    setInputValue('');
    setIsSimulating(true);

    const loadingId = Date.now() + 1;
    setMessages((prev) => [...prev, {
      id: loadingId, type: 'juri', text: '판례를 검색하고 AI 분석을 진행 중입니다...\n잠시만 기다려 주세요. ⏳'
    }]);

    try {
      let currentSessionId = sessionId;

      // 1) 대화방이 없으면 새로 생성
      if (!currentSessionId) {
        const createSessionRes = await api.post('/chat/sessions', {
          category: selectedCategory,
          title: trimmed.substring(0, 15) + "..."
        });
        currentSessionId = createSessionRes.data.session_id;
        setSessionId(currentSessionId);
      }

      // 2) 내 질문을 DB에 저장
      await api.post(`/chat/sessions/${currentSessionId}/messages`, {
        role: 'user',
        content: uiUserText
      });

      // 3) AI 시뮬레이션 실행
      const response = await api.post('/legal/simulate', {
        query: trimmed,
        category: selectedCategory
      });
      const aiAnswerText = response.data.answer;

      // 4) AI 답변을 DB에 저장
      await api.post(`/chat/sessions/${currentSessionId}/messages`, {
        role: 'assistant',
        content: aiAnswerText
      });

      // 5) UI에 AI 답변 업데이트
      setMessages((prev) => prev.map(msg => 
        msg.id === loadingId ? { ...msg, text: aiAnswerText } : msg
      ));

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
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
              {t('chat_category_label')}
            </span>
            
            {categories.map(cat => (
              <CategoryBtn 
                key={cat.id} 
                $active={selectedCategory === cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                disabled={isSimulating}
              >
                {cat.label}
              </CategoryBtn>
            ))}

            <button 
              onClick={handleReset}
              disabled={isSimulating || messages.length <= 1} 
              style={{
                marginLeft: 'auto', 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#4b5563',
                cursor: (isSimulating || messages.length <= 1) ? 'not-allowed' : 'pointer',
                opacity: (isSimulating || messages.length <= 1) ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              <RotateCcw size={14} />
              새 시뮬레이션
            </button>
            
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