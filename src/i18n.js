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
      password_condition: "* 영문, 숫자, 특수문자 포함 8자 이상 입력해 주세요.", // ✨ 추가
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
      alert_force_low: "🚨 다음 1회 질문에 대해 신뢰도가 45%로 강제 고정됩니다!", // ✨ 추가
      force_on: "🚨 45% 고정 ON", // ✨ 추가
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
      dash_score_medium: "(보통)", // ✨ 추가
      dash_score_low: "(낮음)", // ✨ 추가
      dash_cases_title: "📄 유사 판례 검색 결과",
      empty_case_msg: "채팅창에 고민을 입력하시면\n분석에 사용된 유사 판례가 표시됩니다.", // ✨ 추가
      law_section_title: "⚖️ 사건 관련 주요 법령", // ✨ 추가
      empty_law_msg: "법령 상세 내용이 제공되지 않았습니다.", // ✨ 추가

      // --- 채팅 섹션 (ChatSection) ---
      chat_placeholder: "법률 고민을 자유롭게 말씀해 주세요...",
      send_btn: "전송",
      chat_category_label: "상담 분야:",
      cat_labor: "근로",
      cat_consumer: "소비자",
      cat_lease: "임대차",
      new_sim_btn: "새 시뮬레이션", // ✨ 추가

      // --- 마이페이지 (MyPage) 공통 ---
      user_name_label: "사용자 이름",
      edit_profile_btn: "프로필 수정",
      
      // ✨ 6주차: 탭 메뉴 
      tab_history: "기록",
      tab_scrap: "스크랩북",
      tab_stats: "통계",
      tab_settings: "설정",
      
      // ✨ 6주차: 탭 콘텐츠 제목
      history_title: " 최근 시뮬레이션 기록",
      scrap_title: " 나의 판례 스크랩북",
      stats_title: " 나의 Juri-Sim 이용 통계",
      settings_title: " 계정 및 서비스 설정",
      
      // ✨ 6주차: 통계 위젯
      stat_total_consult: "총 상담 건수",
      stat_top_category: "가장 많이 찾은 분야",
      stat_scrap_count: "스크랩한 판례",
      stat_solved: "해결된 고민",
      
      // ✨ 6주차: 설정 및 알림
      btn_disclaimer: "법률 서비스 면책 조항 (Legal Disclaimer)",
      btn_delete_account: "회원 탈퇴 및 모든 데이터 삭제",
      confirm_delete: "정말 탈퇴하시겠습니까? 모든 상담 기록과 스크랩이 영구 삭제됩니다.",
      alert_delete_success: "탈퇴 처리가 완료되었습니다. (추후 백엔드 API 연동 필요)",
      alert_disclaimer: "⚖️ 법률 서비스 면책 조항\n\n본 Juri-Sim 서비스가 제공하는 시뮬레이션 결과 및 유사 판례 정보는 법적 효력을 갖지 않으며, 단순 참고용입니다. 실제 법적 분쟁 시 반드시 전문 변호사와 상담하시기 바랍니다.",
      
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
      password_condition: "* 8+ chars (letters, numbers, special symbols).", // ✨ 추가
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
      alert_force_low: "🚨 The reliability score will be fixed at 45% for the next question!", // ✨ 추가
      force_on: "🚨 45% Fixed ON", // ✨ 추가
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
      dash_score_medium: "(Medium)", // ✨ 추가
      dash_score_low: "(Low)", // ✨ 추가
      dash_cases_title: "📄 Similar Precedent Search Results",
      empty_case_msg: "Enter your legal concerns in the chat to see related precedents.", // ✨ 추가
      law_section_title: "⚖️ Key Related Laws", // ✨ 추가
      empty_law_msg: "Detailed law text is not provided.", // ✨ 추가

      // --- Chat Section ---
      chat_placeholder: "Please feel free to tell us your legal concerns...",
      send_btn: "Send",
      chat_category_label: "Category:",
      cat_labor: "Labor",
      cat_consumer: "Consumer",
      cat_lease: "Lease",
      new_sim_btn: "New Simulation", // ✨ 추가

      // --- My Page Common ---
      user_name_label: "Username",
      edit_profile_btn: "Edit Profile",
      
      // ✨ Week 6: Tab Menu
      tab_history: "History",
      tab_scrap: "Scrapbook",
      tab_stats: "Statistics",
      tab_settings: "Settings",
      
      // ✨ Week 6: Tab Content Titles
      history_title: " Recent Simulation History",
      scrap_title: " My Case Scrapbook",
      stats_title: " My Juri-Sim Statistics",
      settings_title: " Account & Service Settings",
      
      // ✨ Week 6: Stats Widget
      stat_total_consult: "Total Consultations",
      stat_top_category: "Top Category",
      stat_scrap_count: "Scrapped Cases",
      stat_solved: "Solved Issues",
      
      // ✨ Week 6: Settings & Alerts
      btn_disclaimer: "Legal Disclaimer",
      btn_delete_account: "Delete Account & All Data",
      confirm_delete: "Are you sure you want to delete your account? All history and scraps will be permanently deleted.",
      alert_delete_success: "Account deletion completed. (Backend API integration needed later)",
      alert_disclaimer: "⚖️ Legal Disclaimer\n\nThe simulation results and case information provided by Juri-Sim do not have legal effect and are for reference only. Please consult a professional lawyer for actual legal disputes.",

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