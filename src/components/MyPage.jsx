// src/components/MyPage.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Clock, ChevronRight, User, Edit2, Key, Star, BarChart2, Settings, Shield, Trash2, X } from 'lucide-react';
import { api } from '../api'; 

// ==================== Styled Components ====================
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ProfileCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const UserInfoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const AvatarCircle = styled.div`
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #4b5563;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #2c3e50;
    color: #2c3e50;
  }
`;

const HistorySection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const HistoryTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a2533;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// 🚨 [수정됨] 내부 스크롤바(드래그 바) 설정
const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* ✨ 박스 높이를 고정하고 넘치면 스크롤바 무조건 생성 */
  max-height: 380px; 
  overflow-y: auto;
  
  padding-right: 12px; /* 스크롤바와 아이템이 안 겹치게 여백 */
  padding-bottom: 4px;

  /* 🎨 예쁜 내부 드래그 바 디자인 */
  &::-webkit-scrollbar { 
    width: 8px; 
  }
  &::-webkit-scrollbar-track { 
    background: #f8fafc; 
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb { 
    background: #cbd5e1; 
    border-radius: 4px; 
  }
  &::-webkit-scrollbar-thumb:hover { 
    background: #94a3b8; 
  }
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  /* 🚨 [핵심 해결책] 스크롤 시 아이템이 찌그러지며 잘리는 현상 완벽 방지! */
  flex-shrink: 0; 

  &:hover {
    background: #f9fafb;
    border-color: #2c3e50;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.$active ? '#2c3e50' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#2c3e50' : '#f9fafb'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatBox = styled.div`
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  text-align: center;
  
  h4 { margin: 0 0 8px 0; color: #6b7280; font-size: 14px; }
  p { margin: 0; font-size: 24px; font-weight: 700; color: #1a2533; }
`;

const SettingButton = styled.button`
  width: 100%;
  padding: 16px;
  background: white;
  border: 1px solid ${props => props.$danger ? '#fee2e2' : '#e5e5e5'};
  color: ${props => props.$danger ? '#ea4335' : '#4b5563'};
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;

  &:hover {
    background: ${props => props.$danger ? '#fef2f2' : '#f9fafb'};
  }
`;

// ==================== Modal Styled Components ====================
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  background: #ffffff;
  width: ${props => props.$large ? '700px' : '420px'};
  max-width: 90%;
  max-height: 85vh;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
`;

const ModalBodyScroll = styled.div`
  overflow-y: auto;
  padding-right: 12px;
  flex: 1;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;

  &:focus { border-color: #2c3e50; }
  &:disabled { background-color: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
`;

const PwDisplayArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
`;

const PwChangeBtn = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  color: #4b5563;

  &:hover { background: #f3f4f6; }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${props => props.$primary ? '#2c3e50' : '#f3f4f6'};
  color: ${props => props.$primary ? '#ffffff' : '#4b5563'};
  
  &:hover {
    background: ${props => props.$primary ? '#1a252f' : '#e5e7eb'};
  }
`;

const DetailLabel = styled.span`
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  margin-right: 8px;
`;

const ItemBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

// ==================== Main Component ====================
const MyPage = () => {
  const { t } = useTranslation();

  const [profile, setProfile] = useState({ name: "...", email: "..." });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [activeTab, setActiveTab] = useState('history');
  const [historyLogs, setHistoryLogs] = useState([]);
  
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        const userRes = await api.get('/users/me');
        setProfile({
          name: userRes.data.username || "사용자",
          email: userRes.data.email
        });

        const historyRes = await api.get('/history/logs');
        setHistoryLogs(historyRes.data.items || historyRes.data);

      } catch (error) {
        console.error("데이터 통신에 실패했습니다.", error);
      }
    };
    fetchMyPageData();
  }, []);

  const maskEmail = (email) => {
    if (!email || email === "...") return email;
    const [id, domain] = email.split('@');
    if (!id || !domain) return email;
    const maskedId = id.length > 2 ? id.substring(0, 2) + '*'.repeat(id.length - 2) : id.substring(0, 1) + '*';
    return `${maskedId}@${domain}`;
  };

  const openEditModal = () => {
    setEditName(profile.name);
    setIsChangingPw(false);
    setCurrentPassword("");
    setNewPassword("");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (editName.length < 2 || editName.length > 10) {
        alert("이름은 2~10자 사이여야 합니다.");
        return;
      }

      if (isChangingPw) {
        if (!currentPassword || !newPassword) {
          alert("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
          return;
        }
      }

      const payload = { username: editName };

      if (isChangingPw) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await api.put('/users/me', payload);

      setProfile({ ...profile, name: editName });
      alert(t('save_success') || "성공적으로 저장되었습니다.");
      
      setIsEditModalOpen(false);
      setIsChangingPw(false);
      setCurrentPassword("");
      setNewPassword("");

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || "수정에 실패했습니다.";
      alert(`[오류] ${errorMessage}`);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('confirm_delete') || "정말 탈퇴하시겠습니까? 모든 상담 기록과 스크랩이 영구 삭제됩니다.")) {
      alert(t('alert_delete_success') || "탈퇴 처리가 완료되었습니다.");
    }
  };

  const handleShowDisclaimer = () => {
    alert(t('alert_disclaimer') || "⚖️ 법률 서비스 면책 조항\n\n본 Juri-Sim 서비스가 제공하는 시뮬레이션 결과 및 유사 판례 정보는 법적 효력을 갖지 않으며, 단순 참고용입니다.");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleOpenDetail = async (logId) => {
    setIsDetailLoading(true);
    try {
      const response = await api.get(`/history/logs/${logId}`);
      setSelectedDetail(response.data);
    } catch (error) {
      alert("상세 기록을 불러오는데 실패했습니다.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteLog = async (e, logId) => {
    e.stopPropagation(); 
    if (window.confirm("이 상담 기록을 삭제하시겠습니까?")) {
      try {
        await api.delete(`/history/logs/${logId}`);
        setHistoryLogs((prev) => prev.filter(log => log.log_id !== logId));
      } catch (error) {
        alert("기록 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Container>
      <ProfileCard>
        <UserInfoArea>
          <AvatarCircle><User size={40} /></AvatarCircle>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px' }}>{profile.name}</h2>
            <p style={{ color: '#6b7280', margin: '6px 0 0', fontSize: '15px' }}>
              {maskEmail(profile.email)}
            </p>
          </div>
        </UserInfoArea>
        <EditButton onClick={openEditModal}>
          <Edit2 size={16} /> {t('edit_profile_btn') || '프로필 수정'}
        </EditButton>
      </ProfileCard>

      <TabContainer>
        <TabButton $active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
          <Clock size={18} /> {t('tab_history') || '기록'}
        </TabButton>
        <TabButton $active={activeTab === 'scrap'} onClick={() => setActiveTab('scrap')}>
          <Star size={18} /> {t('tab_scrap') || '스크랩북'}
        </TabButton>
        <TabButton $active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
          <BarChart2 size={18} /> {t('tab_stats') || '통계'}
        </TabButton>
        <TabButton $active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          <Settings size={18} /> {t('tab_settings') || '설정'}
        </TabButton>
      </TabContainer>

      <HistorySection>
        {activeTab === 'history' && (
          <>
            <HistoryTitle>
              <Clock size={22} /> {t('history_title') || '최근 시뮬레이션 기록'}
            </HistoryTitle>
            <HistoryList>
              {isDetailLoading && <div style={{textAlign: 'center', padding: '20px'}}>상세 데이터를 불러오는 중... ⏳</div>}
              {historyLogs.length > 0 ? (
                historyLogs.map((item) => (
                  <HistoryItem key={item.log_id} onClick={() => handleOpenDetail(item.log_id)}>
                    <div style={{ flex: 1, marginRight: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
                        {formatDate(item.created_at)} | {item.category || '분야 없음'}
                      </div>
                      <div style={{ fontWeight: 600, color: '#1a2533', lineHeight: '1.4' }}>
                        {item.user_query.length > 40 ? item.user_query.substring(0, 40) + "..." : item.user_query}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        color: item.reliability_score >= 80 ? '#34a853' : '#ea4335', 
                        fontWeight: 700 
                      }}>
                        {item.reliability_score ? `${Math.round(item.reliability_score)}%` : '점수 없음'}
                      </span>
                      
                      <button 
                        onClick={(e) => handleDeleteLog(e, item.log_id)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', 
                          color: '#ef4444', padding: '4px', display: 'flex' 
                        }}
                        title="기록 삭제"
                      >
                        <Trash2 size={18} />
                      </button>

                      <ChevronRight size={18} color="#d1d5db" />
                    </div>
                  </HistoryItem>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  아직 상담 기록이 없습니다.
                </div>
              )}
            </HistoryList>
          </>
        )}

        {activeTab === 'scrap' && (
          <>
            <HistoryTitle>
              <Star size={22} color="#f59e0b" /> {t('scrap_title') || '나의 판례 스크랩북'}
            </HistoryTitle>
            <HistoryList>
              <HistoryItem>
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', width: '100%' }}>
                  아직 스크랩한 판례가 없습니다.
                </div>
              </HistoryItem>
            </HistoryList>
          </>
        )}

        {activeTab === 'stats' && (
          <>
            <HistoryTitle>
              <BarChart2 size={22} /> {t('stats_title') || '이용 통계'}
            </HistoryTitle>
            <StatsGrid>
              <StatBox>
                <h4>{t('stat_total_consult') || '총 상담 건수'}</h4>
                <p>{historyLogs.length}</p>
              </StatBox>
              <StatBox>
                <h4>평균 신뢰도</h4>
                <p style={{ fontSize: '18px', marginTop: '6px' }}>
                   {historyLogs.length > 0 
                   ? Math.round(historyLogs.reduce((acc, curr) => acc + (curr.reliability_score || 0), 0) / historyLogs.length) + "%" 
                   : "0%"}
                </p>
              </StatBox>
            </StatsGrid>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <HistoryTitle>
              <Settings size={22} /> {t('settings_title') || '설정'}
            </HistoryTitle>
            <SettingButton onClick={handleShowDisclaimer}>
              <Shield size={20} />
              {t('btn_disclaimer') || '법률 서비스 면책 조항'}
            </SettingButton>
            <SettingButton $danger onClick={handleDeleteAccount}>
              <Trash2 size={20} />
              {t('btn_delete_account') || '회원 탈퇴 및 데이터 삭제'}
            </SettingButton>
          </>
        )}
      </HistorySection>

      {/* 모달창들 (프로필 수정 & 상세 보기) */}
      {isEditModalOpen && (
        <ModalOverlay onClick={() => setIsEditModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', color: '#1a2533' }}>
              {t('edit_modal_title') || '프로필 수정'}
            </h2>
            <InputGroup>
              <Label>{t('edit_name_label') || '이름'}</Label>
              <Input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </InputGroup>
            <InputGroup>
              <Label>이메일</Label>
              <Input type="text" value={profile.email} disabled />
            </InputGroup>
            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '24px 0' }} />
            <Label><Key size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> 비밀번호</Label>
            {!isChangingPw ? (
              <PwDisplayArea>
                <span style={{ letterSpacing: '2px', color: '#6b7280' }}>{t('dummy_password') || '********'}</span>
                <PwChangeBtn onClick={() => setIsChangingPw(true)}>
                  {t('change_pw_btn') || '비밀번호 변경'}
                </PwChangeBtn>
              </PwDisplayArea>
            ) : (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <Label style={{ fontSize: '13px' }}>{t('current_pw_label') || '현재 비밀번호'}</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ padding: '8px', fontSize: '14px' }} />
                </div>
                <div>
                  <Label style={{ fontSize: '13px' }}>{t('new_pw_label') || '새 비밀번호'}</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: '8px', fontSize: '14px' }} />
                </div>
                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <span onClick={() => { setIsChangingPw(false); setCurrentPassword(""); setNewPassword(""); }} style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}>
                    {t('cancel_pw_change') || '변경 취소'}
                  </span>
                </div>
              </div>
            )}
            <ModalButtonGroup>
              <ActionButton onClick={() => setIsEditModalOpen(false)}>
                {t('cancel_btn') || '취소'}
              </ActionButton>
              <ActionButton $primary onClick={handleSaveProfile}>
                {t('save_btn') || '저장하기'}
              </ActionButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}

      {selectedDetail && (
        <ModalOverlay onClick={() => setSelectedDetail(null)}>
          <ModalBox $large onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1a2533', lineHeight: '1.4' }}>
                  상담 내역 상세 보기
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {formatDate(selectedDetail.created_at)} | 분야: {selectedDetail.category} | 신뢰도: {selectedDetail.reliability_score}%
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </ModalHeader>
            <ModalBodyScroll>
              <div style={{ marginBottom: '24px' }}>
                <DetailLabel>나의 질문</DetailLabel>
                <div style={{ marginTop: '8px', padding: '16px', background: '#f1f5f9', borderRadius: '8px', fontSize: '15px', color: '#334155' }}>
                  {selectedDetail.user_query}
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <DetailLabel>AI 요약 답변</DetailLabel>
                <div style={{ marginTop: '8px', padding: '16px', background: '#fdfce8', border: '1px solid #fef08a', borderRadius: '8px', fontSize: '15px', color: '#422006', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedDetail.summary || selectedDetail.ai_response}
                </div>
              </div>
              {selectedDetail.used_cases && selectedDetail.used_cases.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <DetailLabel style={{ background: '#e0e7ff', color: '#4338ca' }}>관련 판례</DetailLabel>
                  <div style={{ marginTop: '12px' }}>
                    {selectedDetail.used_cases.map((caseItem, idx) => (
                      <ItemBox key={idx} style={{ borderLeftColor: '#6366f1' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px', fontSize: '15px' }}>
                          {caseItem.case_name || caseItem.case_number}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {caseItem.court_name} | {caseItem.judgment_date}
                        </div>
                      </ItemBox>
                    ))}
                  </div>
                </div>
              )}
              {selectedDetail.used_laws && selectedDetail.used_laws.length > 0 && (
                <div>
                  <DetailLabel style={{ background: '#dcfce7', color: '#15803d' }}>관련 법령</DetailLabel>
                  <div style={{ marginTop: '12px' }}>
                    {selectedDetail.used_laws.map((lawItem, idx) => (
                      <ItemBox key={idx} style={{ borderLeftColor: '#22c55e' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
                          {lawItem.law_name} {lawItem.article_number}
                        </div>
                      </ItemBox>
                    ))}
                  </div>
                </div>
              )}
            </ModalBodyScroll>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default MyPage;