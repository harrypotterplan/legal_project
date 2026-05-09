// src/components/MyPage.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// ✨ 6주차 탭/기능 아이콘 추가 (Star, BarChart2, Settings, Shield, Trash2)
import { Clock, ChevronRight, User, Edit2, Key, Star, BarChart2, Settings, Shield, Trash2 } from 'lucide-react';
// ✨ 백엔드와 통신하기 위해 api를 불러옵니다 (경로 확인 필수!)
import { api } from '../api'; 

// ==================== Styled Components ====================
// (원우님의 Styled Components 원본 100% 유지)
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

// ✨ 원우님의 HistorySection을 탭 콘텐츠들을 담는 공통 박스로 활용합니다!
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

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

  &:hover {
    background: #f9fafb;
    border-color: #2c3e50;
  }
`;

// ✨ 6주차: 탭 메뉴 스타일 추가
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

// ✨ 6주차: 통계 위젯 및 설정 버튼 스타일 추가
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
  width: 420px;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
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

// ==================== Main Component ====================
const MyPage = () => {
  const { t } = useTranslation();

  // 사용자 정보 및 모달 상태
  const [profile, setProfile] = useState({ name: "...", email: "..." });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ✨ 6주차: 활성화된 탭 상태 관리 추가
  const [activeTab, setActiveTab] = useState('history');

  // ✨ 실제 DB에서 가져올 기록 데이터 상태 추가
  const [historyLogs, setHistoryLogs] = useState([]);

  // ✨ 컴포넌트 마운트 시 실제 유저 정보 및 기록 가져오기
  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        // 1. 유저 프로필 조회 (백엔드 스키마: username)
        const userRes = await api.get('/users/me');
        setProfile({
          name: userRes.data.username || "사용자",
          email: userRes.data.email
        });

        // 2. 검색 기록 리스트 조회 
        // (api.js의 baseURL이 '/api/v1'이므로 뒤에 '/history/logs'만 붙임)
        const historyRes = await api.get('/history/logs');
        setHistoryLogs(historyRes.data);

      } catch (error) {
        console.error("데이터 통신에 실패했습니다.", error);
      }
    };
    fetchMyPageData();
  }, []);

  // 이메일 마스킹 함수
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

  // 🚨 [핵심 수정 로직] 백엔드 UserUpdate 스키마에 맞춰 단일 페이로드 구성
  const handleSaveProfile = async () => {
    try {
      // 1. 프론트엔드 자체 검증 (백엔드의 min_length=2, max_length=10 규격 맞춤)
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

      // 2. 백엔드 schemas.py의 UserUpdate 구조와 100% 동일한 Payload 객체 생성
      const payload = {
        username: editName
      };

      // 비밀번호 변경 모드일 때만 필드 추가 (old_password가 아닌 current_password 사용)
      if (isChangingPw) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      // 3. 단일 PUT 요청으로 전송 (기존의 두 번 쪼개 보내던 로직 삭제)
      await api.put('/users/me', payload);

      setProfile({ ...profile, name: editName });
      alert(t('save_success') || "성공적으로 저장되었습니다.");
      
      // 저장 성공 시 모달 닫기 및 상태 초기화
      setIsEditModalOpen(false);
      setIsChangingPw(false);
      setCurrentPassword("");
      setNewPassword("");

    } catch (error) {
      // FastAPI의 RequestValidationError (422) 및 HTTPException 처리
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || "수정에 실패했습니다.";
      alert(`[오류] ${errorMessage}`);
    }
  };

  // ✨ 6주차 기능 함수 추가
  const handleDeleteAccount = () => {
    if (window.confirm(t('confirm_delete') || "정말 탈퇴하시겠습니까? 모든 상담 기록과 스크랩이 영구 삭제됩니다.")) {
      alert(t('alert_delete_success') || "탈퇴 처리가 완료되었습니다.");
    }
  };

  const handleShowDisclaimer = () => {
    alert(t('alert_disclaimer') || "⚖️ 법률 서비스 면책 조항\n\n본 Juri-Sim 서비스가 제공하는 시뮬레이션 결과 및 유사 판례 정보는 법적 효력을 갖지 않으며, 단순 참고용입니다.");
  };

  // ✨ 백엔드의 datetime 문자열을 깔끔하게 보여주기 위한 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <Container>
      {/* 👤 프로필 영역 (원본 유지) */}
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

      {/* ✨ 6주차: 탭 메뉴 영역 추가 */}
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

      {/* 📜 콘텐츠 영역 */}
      <HistorySection>
        
        {/* 탭 1: 실제 DB 시뮬레이션 기록 렌더링 */}
        {activeTab === 'history' && (
          <>
            <HistoryTitle>
              <Clock size={22} /> {t('history_title') || '최근 시뮬레이션 기록'}
            </HistoryTitle>
            <HistoryList>
              {historyLogs.length > 0 ? (
                historyLogs.map((item) => (
                  <HistoryItem key={item.log_id}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
                        {formatDate(item.created_at)}
                      </div>
                      <div style={{ fontWeight: 600, color: '#1a2533' }}>
                        {item.user_query.length > 30 ? item.user_query.substring(0, 30) + "..." : item.user_query}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        color: item.reliability_score >= 80 ? '#34a853' : '#ea4335', 
                        fontWeight: 700 
                      }}>
                        {item.reliability_score ? `${Math.round(item.reliability_score)}%` : '점수 없음'}
                      </span>
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

        {/* 탭 2: 스크랩북 (아직 백엔드 API가 없으므로 원본 유지) */}
        {activeTab === 'scrap' && (
          <>
            <HistoryTitle>
              <Star size={22} color="#f59e0b" /> {t('scrap_title') || '나의 판례 스크랩북'}
            </HistoryTitle>
            <HistoryList>
              <HistoryItem>
                <div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>대법원 2021. 12. 30. 선고</div>
                  <div style={{ fontWeight: 600, color: '#1a2533' }}>계약 해제에 따른 원상회복 의무 관련 판례</div>
                </div>
                <ChevronRight size={18} color="#d1d5db" />
              </HistoryItem>
            </HistoryList>
          </>
        )}

        {/* 탭 3: 통계 (실제 배열 데이터를 기반으로 계산) */}
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

        {/* 탭 4: 설정 (원본 유지) */}
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

      {/* 🛠️ 프로필 수정 모달창 (원본 모달 코드 100% 유지) */}
      {isEditModalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', color: '#1a2533' }}>
              {t('edit_modal_title') || '프로필 수정'}
            </h2>
            
            <InputGroup>
              <Label>{t('edit_name_label') || '이름'}</Label>
              <Input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
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
                  <Input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    style={{ padding: '8px', fontSize: '14px' }} 
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '13px' }}>{t('new_pw_label') || '새 비밀번호'}</Label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    style={{ padding: '8px', fontSize: '14px' }} 
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <span 
                    onClick={() => { setIsChangingPw(false); setCurrentPassword(""); setNewPassword(""); }}
                    style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
                  >
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

    </Container>
  );
};

export default MyPage;