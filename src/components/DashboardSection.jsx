// src/components/DashboardSection.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Info, X } from 'lucide-react'; 
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

const CaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
`;

const CaseItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #94a3b8;
    background: #f1f5f9;
  }
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

// 모달(팝업)용 스타일 컴포넌트
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  width: 90%;
  max-width: 650px;
  max-height: 85vh;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
`;

const ModalTag = styled.span`
  background: #f0f4f8;
  color: #2c3e50;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
  margin-right: 8px;
  display: inline-block;
`;

const ModalBody = styled.div`
  overflow-y: auto;
  padding-right: 12px;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

// ✨ [신규] 법령 표시를 위한 디자인 컴포넌트
const LawSection = styled.div`
  margin-top: 28px;
  padding-top: 24px;
  border-top: 2px dashed #cbd5e1; /* 판례와 법령을 구분하는 점선 */
`;

const LawTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LawItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #2c3e50; /* 법령 느낌을 주는 좌측 포인트 컬러 */
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

// ==================== Helper Function ====================
const formatLegalText = (text) => {
  if (!text) return "상세 원문 데이터가 제공되지 않았습니다.";
  const spacedText = text.replace(/([다함음됨]\.)\s+/g, '$1\n\n');
  const paragraphs = spacedText.split('\n');

  return paragraphs.map((para, index) => {
    if (!para.trim()) return null;
    return (
      <div
        key={index}
        style={{
          marginBottom: '16px',         
          fontSize: '15px',             
          lineHeight: '1.8',            
          color: '#334155',             
          textAlign: 'justify',         
          wordBreak: 'keep-all',        
        }}
      >
        {para}
      </div>
    );
  });
};

// ==================== Main Component ====================
const DashboardSection = ({ resultData }) => {
  const { t } = useTranslation();
  const [gaugeProgress, setGaugeProgress] = useState(0);
  const [selectedCase, setSelectedCase] = useState(null);

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

      <CasesCard>
        <h3 style={{ margin: '0 0 22px 0', fontSize: '18px', fontWeight: 700, color: '#1a2533' }}>
          {t('dash_cases_title') || '유사 판례 검색 결과'}
        </h3>
        
        <CaseList>
          {resultData && resultData.reference_cases && resultData.reference_cases.length > 0 ? (
            resultData.reference_cases.map((caseItem, index) => (
              <CaseItem 
                key={index} 
                onClick={() => setSelectedCase(caseItem)}
              >
                <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  {caseItem.case_name || caseItem}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  관련 법률: {caseItem.category || '해당 없음'} | {caseItem.court || ''}
                </div>
              </CaseItem>
            ))
          ) : (
            <EmptyState>
              <Info size={40} color="#cbd5e1" />
              <p>채팅창에 고민을 입력하시면<br/>분석에 사용된 유사 판례가 표시됩니다.</p>
            </EmptyState>
          )}
        </CaseList>
      </CasesCard>

      {/* 모달(팝업) 영역 */}
      {selectedCase && (
        <ModalOverlay onClick={() => setSelectedCase(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1a2533', lineHeight: '1.4' }}>
                  {selectedCase.case_name || selectedCase}
                </h2>
                <ModalTag>관련 분야: {selectedCase.category || '정보 없음'}</ModalTag>
                {selectedCase.court && (
                  <ModalTag style={{ background: '#fce8e6', color: '#ea4335' }}>
                    {selectedCase.court}
                  </ModalTag>
                )}
              </div>
              <button 
                onClick={() => setSelectedCase(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={24} />
              </button>
            </ModalHeader>
            <ModalBody>
              
              {/* 1. 기존 판례 원문 출력 */}
              {formatLegalText(selectedCase.text)}

              {/* ✨ 2. [신규] 관련 법령 리스트 출력 */}
              {resultData.reference_laws && resultData.reference_laws.length > 0 && (
                <LawSection>
                  <LawTitle>⚖️ 사건 관련 주요 법령</LawTitle>
                  {resultData.reference_laws.map((law, idx) => (
                    <LawItem key={idx}>
                      <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '8px', fontSize: '15px' }}>
                        {law.law_name} {law.article_number}
                      </div>
                      <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', textAlign: 'justify', wordBreak: 'keep-all' }}>
                        {law.text || "법령 상세 내용이 제공되지 않았습니다."}
                      </div>
                    </LawItem>
                  ))}
                </LawSection>
              )}

            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </RightSection>
  );
};

export default DashboardSection;