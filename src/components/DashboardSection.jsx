// src/components/DashboardSection.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Info } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';
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

const JuriAvatar = styled.img`
  width: 160px; 
  height: auto; 
  object-fit: contain; 
  flex-shrink: 0;
`;

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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
  text-align: center;
  gap: 12px;
`;

// ==================== Main Component ====================
const DashboardSection = ({ resultData }) => {
  const { t } = useTranslation();
  const [gaugeProgress, setGaugeProgress] = useState(0);
  const [openCaseId, setOpenCaseId] = useState(null); 

  const toggleAccordion = (index) => {
    setOpenCaseId(openCaseId === index ? null : index);
  };

  useEffect(() => {
    if (resultData) {
      const timer = setTimeout(() => { 
        setGaugeProgress(resultData.reliability_score || 0); 
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setGaugeProgress(0);
    }
  }, [resultData]);

  const getGaugeColor = (score) => {
    if (score >= 80) return "#34a853"; 
    if (score >= 50) return "#fbbc05"; 
    return "#ea4335"; 
  };

  return (
    <RightSection>
      {/* 1. 신뢰도 게이지 카드 */}
      <GaugeCard>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#1a2533' }}>
          {t('dash_reliability_title') || '신뢰도 분석 결과'}
        </h3>
        
        <ChartCharacterWrapper>
          <JuriAvatar src={juriAvatar} alt="Juri Avatar" />

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
                stroke={getGaugeColor(gaugeProgress)} 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeDasharray="125.66" 
                strokeDashoffset={125.66 * (1 - gaugeProgress / 100)} 
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} 
              />
            </svg>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '17px', fontWeight: 700 }}>
              {t('dash_score_label') || '신뢰도 점수:'} {" "}
              <span style={{ color: getGaugeColor(gaugeProgress) }}>
                {Math.round(gaugeProgress)}% 
                {gaugeProgress >= 80 ? ` 높음` : gaugeProgress >= 50 ? " 보통" : " 낮음"}
              </span>
            </div>
          </SVGContainer>
        </ChartCharacterWrapper>
      </GaugeCard>

      {/* 2. 유사 판례 검색 결과 카드 */}
      <CasesCard>
        <h3 style={{ margin: '0 0 22px 0', fontSize: '18px', fontWeight: 700, color: '#1a2533' }}>
          {t('dash_cases_title') || '유사 판례 검색 결과'}
        </h3>
        
        <AccordionList>
          {resultData && resultData.reference_cases && resultData.reference_cases.length > 0 ? (
            resultData.reference_cases.map((caseItem, index) => {
              const isOpen = openCaseId === index;
              return (
                <AccordionItem key={index} $isOpen={isOpen}>
                  <AccordionHeader onClick={() => toggleAccordion(index)}>
                    <div style={{ display: 'flex', alignItems: 'center', maxWidth: '85%' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {caseItem}
                      </span>
                    </div>
                    <div>
                      {isOpen ? <ChevronUp size={18} color="#2c3e50" /> : <ChevronDown size={18} color="#999" />}
                    </div>
                  </AccordionHeader>
                  <AccordionContent $isOpen={isOpen}>
                    해당 판례는 좌측 챗봇 주리(Juri)가 분석한 상황과 유사한 법리적 쟁점을 다루고 있습니다. 대법원 종합법률정보 사이트에서 사건 번호를 검색하시면 원문을 확인하실 수 있습니다.
                  </AccordionContent>
                </AccordionItem>
              );
            })
          ) : (
            <EmptyState>
              <Info size={40} color="#cbd5e1" />
              <p>채팅창에 고민을 입력하시면<br/>분석에 사용된 유사 판례가 표시됩니다.</p>
            </EmptyState>
          )}
        </AccordionList>
      </CasesCard>
    </RightSection>
  );
};

export default DashboardSection;