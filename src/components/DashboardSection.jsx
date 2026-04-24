// src/components/DashboardSection.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react'; 
import { useTranslation } from 'react-i18next'; // ✨ 다국어 훅 추가

// ✨ 완성된 캐릭터 이미지를 불러옵니다!
import juriAvatar from '../assets/jurisimcharH.png'; 

// ==================== Styled Components ====================

const RightSection = styled.section`
  flex: 4;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;
const Card = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const GaugeCard = styled(Card)`
  padding: 28px 28px 20px;
`;
const CasesCard = styled(Card)`
  flex: 1;
  padding: 28px;
`;

// --- ✨ 캐릭터와 차트를 배치하는 Wrapper ---
const ChartCharacterWrapper = styled.div`
  display: flex;
  align-items: center; 
  justify-content: space-between; 
  gap: 1px; 
  margin: 10px 0; 
`;

const SVGContainer = styled.div`
  flex: 1; 
  min-width: 0;
`;

// ✨ 캐릭터 이미지 전용 스타일 
const JuriAvatar = styled.img`
  width: 160px; 
  height: auto; 
  object-fit: contain; 
  flex-shrink: 0 
`;

// --- 아코디언 전용 스타일 ---
const AccordionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
`;

const AccordionItem = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.$isOpen ? '#2c3e50' : '#f0f0f0')};
  overflow: hidden;
  transition: border-color 0.2s ease;
`;

const AccordionHeader = styled.div`
  padding: 16px 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background: #f1f3f5;
  }
`;

const CourtBadge = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: normal;
  margin-right: 12px;
`;

const AccordionContent = styled.div`
  max-height: ${(props) => (props.$isOpen ? '200px' : '0')};
  padding: ${(props) => (props.$isOpen ? '0 18px 18px 18px' : '0 18px')};
  opacity: ${(props) => (props.$isOpen ? '1' : '0')};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
`;

// ==================== 데이터 및 메인 컴포넌트 ====================

// (모의 데이터는 실제 AI가 답변하는 부분이라 가정하고 한글로 유지합니다)
const mockCases = [
  {
    id: 1,
    title: '2024가합51234 - 임대차보증금 반환 청구',
    court: '서울중앙지방법원',
    summary: '계약 종료 후 30일 이내 반환 의무 위반 판결.\n원고 승소 (보증금 전액 + 지연이자 5%)',
  },
  {
    id: 2,
    title: '2023가합78421 - 보증금 미반환 손해배상',
    court: '대전지방법원',
    summary: '집주인 과실 인정, 강제집행 가능 판결.\n유사 사안 신뢰도 92%',
  },
  {
    id: 3,
    title: '대법원 2022다123456 - 임대차분쟁 판례',
    court: '대법원',
    summary: '보증금 반환 청구권의 소멸시효 10년 적용 확인 및 임차권 등기명령의 정당성 인정.',
  },
];

const DashboardSection = () => {
  const { t } = useTranslation(); // ✨ 다국어 번역 함수 꺼내기
  const [gaugeProgress, setGaugeProgress] = useState(0);
  const [openCaseId, setOpenCaseId] = useState(1); 

  const toggleAccordion = (id) => {
    setOpenCaseId(openCaseId === id ? null : id);
  };

  useEffect(() => {
    const timer = setTimeout(() => { setGaugeProgress(85); }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <RightSection>
      {/* 1. 신뢰도 게이지 카드 */}
      <GaugeCard>
        {/* ✨ 제목에 다국어 적용 */}
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#1a2533' }}>
          {t('dash_reliability_title')}
        </h3>
        
        <ChartCharacterWrapper>
          <JuriAvatar src={juriAvatar} alt="법률 Owl 주리 캐릭터 아바타" />

          <SVGContainer>
            <svg 
              width="100%" 
              height="auto" 
              style={{ maxHeight: '160px', overflow: 'visible' }} 
              viewBox="0 0 100 55"
            >
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#e2e8f0" 
                strokeWidth="10" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#34a853" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeDasharray="125.66" 
                strokeDashoffset={125.66 * (1 - gaugeProgress / 100)} 
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} 
              />
            </svg>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '17px', fontWeight: 700 }}>
              {/* ✨ 점수 라벨에 다국어 적용 */}
              {t('dash_score_label')} <span style={{ color: '#34a853' }}>85% {t('dash_score_high')}</span>
            </div>
          </SVGContainer>

        </ChartCharacterWrapper>
      </GaugeCard>

      {/* 2. 유사 판례 검색 결과 카드 */}
      <CasesCard>
        {/* ✨ 제목에 다국어 적용 */}
        <h3 style={{ margin: '0 0 22px 0', fontSize: '18px', fontWeight: 700, color: '#1a2533' }}>
          {t('dash_cases_title')}
        </h3>
        
        <AccordionList>
          {mockCases.map((caseItem) => {
            const isOpen = openCaseId === caseItem.id;
            return (
              <AccordionItem key={caseItem.id} $isOpen={isOpen}>
                <AccordionHeader onClick={() => toggleAccordion(caseItem.id)}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{caseItem.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CourtBadge>{caseItem.court}</CourtBadge>
                    {isOpen ? <ChevronUp size={18} color="#2c3e50" /> : <ChevronDown size={18} color="#999" />}
                  </div>
                </AccordionHeader>
                <AccordionContent $isOpen={isOpen}>
                  {caseItem.summary}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </AccordionList>
      </CasesCard>
    </RightSection>
  );
};

export default DashboardSection;