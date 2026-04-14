// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      // --- 로그인/회원가입 페이지 ---
      logo_sub: "인공지능 법률 시뮬레이션 서비스",
      name_placeholder: "이름 (홍길동)",
      email_placeholder: "이메일 주소",
      password_placeholder: "비밀번호",
      login_btn: "로그인",
      signup_btn: "회원가입 완료",
      no_account: "아직 계정이 없으신가요?",
      have_account: "이미 계정이 있으신가요?",
      go_signup: "회원가입하기",
      go_login: "로그인하기",
      alert_signup_success: "🎉 회원가입이 성공적으로 완료되었습니다!\n방금 가입하신 정보로 로그인해 주세요.",
      alert_fail: "요청에 실패했습니다: ",
      alert_error_default: "서버/DB 오류",

      // --- 상단 헤더 및 앱 공통 ---
      logout_btn: "로그아웃",
      logout_alert: "안전하게 로그아웃 되었습니다.",
      test_btn: "🚨 신뢰도 45% 테스트",
      mypage_btn: "마이페이지",
      toggle_lang: "🇺🇸 English",

      // --- 신뢰도 경고 모달 (WarningModal) ---
      warning_title: "중요: 전문적인 법률 상담이 필요합니다",
      warning_desc_1: "시뮬레이션 신뢰도 점수가 낮아 사안이 복잡할 수 있습니다.",
      warning_desc_2: "정확한 법률 상담을 위해 법률 전문가와 상담할 것을 권장합니다.",
      warning_btn: "결과 확인",

      // --- 대시보드 섹션 (DashboardSection) ---
      dash_reliability_title: "📈 신뢰도 분석 결과",
      dash_score_label: "신뢰도 점수:",
      dash_score_high: "(매우 높음)",
      dash_cases_title: "📄 유사 판례 검색 결과",

      // --- 채팅 섹션 (ChatSection) ---
      chat_placeholder: "법률 고민을 자유롭게 말씀해 주세요...",
      send_btn: "전송",

      // --- 마이페이지 (MyPage) ---
      history_title: "최근 시뮬레이션 기록",
      user_name_label: "사용자 이름",
      edit_profile_btn: "프로필 수정",
      
      // --- 프로필 수정 모달 ---
      edit_modal_title: "프로필 수정",
      edit_name_label: "사용자 이름",
      edit_pw_label: "새 비밀번호",
      edit_pw_placeholder: "변경할 비밀번호를 입력하세요",
      current_pw_label: "현재 비밀번호",
      new_pw_label: "새 비밀번호",
      change_pw_btn: "비밀번호 변경",
      cancel_pw_change: "변경 취소",
      dummy_password: "********",
      save_btn: "저장하기",
      cancel_btn: "취소",
      save_success: "프로필이 성공적으로 변경되었습니다."
    }
  },
  en: {
    translation: {
      // --- Login/Signup Page ---
      logo_sub: "AI Legal Simulation Service",
      name_placeholder: "Name (John Doe)",
      email_placeholder: "Email Address",
      password_placeholder: "Password",
      login_btn: "Login",
      signup_btn: "Complete Sign Up",
      no_account: "Don't have an account?",
      have_account: "Already have an account?",
      go_signup: "Sign up here",
      go_login: "Login here",
      alert_signup_success: "🎉 Sign up successful!\nPlease login with your new account.",
      alert_fail: "Request failed: ",
      alert_error_default: "Server/DB Error",

      // --- Header & App Common ---
      logout_btn: "Logout",
      logout_alert: "Successfully logged out.",
      test_btn: "🚨 45% Reliability Test",
      mypage_btn: "My Page",
      toggle_lang: "🇰🇷 한국어",

      // --- Warning Modal ---
      warning_title: "Important: Professional Legal Counsel Required",
      warning_desc_1: "The simulation reliability score is low, indicating a potentially complex issue.",
      warning_desc_2: "We recommend consulting a legal professional for accurate advice.",
      warning_btn: "View Results",

      // --- Dashboard Section ---
      dash_reliability_title: "📈 Reliability Analysis",
      dash_score_label: "Reliability Score:",
      dash_score_high: "(Very High)",
      dash_cases_title: "📄 Similar Precedent Search Results",

      // --- Chat Section ---
      chat_placeholder: "Please feel free to tell us your legal concerns...",
      send_btn: "Send",

      // --- My Page ---
      history_title: "Recent Simulation History",
      user_name_label: "Username",
      edit_profile_btn: "Edit Profile",

      // --- Profile Edit Modal ---
      edit_modal_title: "Edit Profile",
      edit_name_label: "Username",
      edit_pw_label: "New Password",
      edit_pw_placeholder: "Enter new password",
      current_pw_label: "Current Password",
      new_pw_label: "New Password",
      change_pw_btn: "Change Password",
      cancel_pw_change: "Cancel Change",
      dummy_password: "********",
      save_btn: "Save",
      cancel_btn: "Cancel",
      save_success: "Profile successfully updated."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko", 
    fallbackLng: "en", 
    interpolation: { escapeValue: false }
  });

export default i18n;