// TODO: 실제 연락처 이메일로 변경하세요 (MAIL_FROM 환경변수 값)
export const CONTACT_EMAIL = "prolog.noreply@gmail.com";

export const TERMS_URLS = {
  terms: "https://prolog.jooky.site/terms",
  privacy: "https://prolog.jooky.site/privacy",
} as const;

export const MARKETING_CONSENT = `서비스의 새로운 기능, 업데이트, 이벤트 등에 관한 소식을 이메일로 받아보실 수 있습니다.

- 발송 내용: 신규 기능 안내, 서비스 업데이트 소식, 이벤트 정보
- 발송 주체: ProLog (${CONTACT_EMAIL})
- 수신 거부: 언제든지 서비스 설정에서 철회 가능

본 동의는 선택사항이며, 동의하지 않아도 서비스 이용에 불이익이 없습니다.`;
