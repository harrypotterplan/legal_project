// src/components/MyPage.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Clock, ChevronRight, User, Edit2, Key } from 'lucide-react';
// ✨ 백엔드와 통신하기 위해 api를 불러옵니다 (경로 확인 필수!)
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

  // ✨ 컴포넌트 마운트 시 실제 유저 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile({
          name: response.data.name || "사용자",
          email: response.data.email
        });
      } catch (error) {
        console.error("유저 정보를 불러오는데 실패했습니다.", error);
      }
    };
    fetchUserProfile();
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

  // 프로필 수정 저장
  const handleSaveProfile = async () => {
    try {
      // 1. 이름 수정 요청
      await api.put('/users/me', { name: editName });

      // 2. 비밀번호 변경 모드일 때만 비밀번호 변경 요청
      if (isChangingPw && currentPassword && newPassword) {
        await api.post('/users/change-password', {
          old_password: currentPassword,
          new_password: newPassword
        });
      }

      setProfile({ ...profile, name: editName });
      alert(t('save_success'));
      setIsEditModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "수정에 실패했습니다.";
      alert(t('alert_fail') + errorMessage);
    }
  };

  // (임시 시뮬레이션 기록 데이터 - 추후 API 연동)
  const mockHistory = [
    { id: 1, date: '2024-04-10', query: '임대차 보증금 반환 문제', score: 85 },
    { id: 2, date: '2024-04-08', query: '근로계약서 미작성 신고', score: 45 },
  ];

  return (
    <Container>
      {/* 👤 프로필 영역 */}
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
          <Edit2 size={16} /> {t('edit_profile_btn')}
        </EditButton>
      </ProfileCard>

      {/* 📜 시뮬레이션 기록 영역 */}
      <HistorySection>
        <HistoryTitle>
          <Clock size={22} /> {t('history_title')}
        </HistoryTitle>
        <HistoryList>
          {mockHistory.map((item) => (
            <HistoryItem key={item.id}>
              <div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>{item.date}</div>
                <div style={{ fontWeight: 600, color: '#1a2533' }}>{item.query}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: item.score >= 80 ? '#34a853' : '#ea4335', fontWeight: 700 }}>
                  {item.score}%
                </span>
                <ChevronRight size={18} color="#d1d5db" />
              </div>
            </HistoryItem>
          ))}
        </HistoryList>
      </HistorySection>

      {/* 🛠️ 프로필 수정 모달창 */}
      {isEditModalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', color: '#1a2533' }}>
              {t('edit_modal_title')}
            </h2>
            
            <InputGroup>
              <Label>{t('edit_name_label')}</Label>
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
                <span style={{ letterSpacing: '2px', color: '#6b7280' }}>{t('dummy_password')}</span>
                <PwChangeBtn onClick={() => setIsChangingPw(true)}>
                  {t('change_pw_btn')}
                </PwChangeBtn>
              </PwDisplayArea>
            ) : (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <Label style={{ fontSize: '13px' }}>{t('current_pw_label')}</Label>
                  <Input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    style={{ padding: '8px', fontSize: '14px' }} 
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '13px' }}>{t('new_pw_label')}</Label>
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
                    {t('cancel_pw_change')}
                  </span>
                </div>
              </div>
            )}

            <ModalButtonGroup>
              <ActionButton onClick={() => setIsEditModalOpen(false)}>
                {t('cancel_btn')}
              </ActionButton>
              <ActionButton $primary onClick={handleSaveProfile}>
                {t('save_btn')}
              </ActionButton>
            </ModalButtonGroup>

          </ModalBox>
        </ModalOverlay>
      )}

    </Container>
  );
};

export default MyPage;