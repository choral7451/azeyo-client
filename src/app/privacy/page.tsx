"use client";

export default function PublicPrivacyPage() {
  return (
    <main className="pb-6">
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <button
          onClick={() => history.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[17px] font-bold text-foreground">개인정보 처리방침</h1>
      </div>

      <div className="px-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="space-y-6 text-[13px] leading-relaxed text-foreground/80">

          <section>
            <p>아재요(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다. 본 개인정보 처리방침을 통해 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제1조 (수집하는 개인정보 항목)</h2>
            <p>회사는 회원가입, 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>

            <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <p className="font-semibold text-foreground mb-1">필수 수집 항목</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>소셜 로그인 식별자 (카카오/네이버/구글 고유 ID)</li>
                <li>이름</li>
                <li>이메일 주소</li>
                <li>닉네임</li>
                <li>성별</li>
                <li>연령대</li>
                <li>생일</li>
                <li>출생연도</li>
                <li>연락처 (휴대전화번호)</li>
                <li>결혼 연도</li>
                <li>자녀 수</li>
              </ul>
            </div>

            <div className="mt-2 rounded-xl p-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <p className="font-semibold text-foreground mb-1">자동 수집 항목</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>서비스 이용 기록 (접속 일시, 이용 기록)</li>
                <li>기기 정보 (브라우저 종류, OS 정보)</li>
                <li>IP 주소</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제2조 (개인정보의 수집 및 이용 목적)</h2>
            <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 가입 의사 확인, 불량회원의 부정 이용 방지</li>
              <li><strong>서비스 제공:</strong> 커뮤니티, 족보, 일정 관리 등 서비스 제공, 맞춤형 콘텐츠 추천</li>
              <li><strong>서비스 개선:</strong> 신규 서비스 개발, 통계 분석, 서비스 품질 향상</li>
              <li><strong>알림 서비스:</strong> 일정 알림, 커뮤니티 활동 알림 등 서비스 관련 정보 전달</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제3조 (개인정보의 보유 및 이용 기간)</h2>
            <p>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
            <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <p className="font-semibold text-foreground mb-1">보유 기간</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
                <li><strong>서비스 이용 기록:</strong> 3년 (전자상거래법)</li>
                <li><strong>접속 로그:</strong> 3개월 (통신비밀보호법)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제4조 (개인정보의 제3자 제공)</h2>
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제5조 (개인정보의 파기 절차 및 방법)</h2>
            <p>① 파기 절차: 회원 탈퇴 또는 보유 기간 만료 시 개인정보를 지체 없이 파기합니다.</p>
            <p className="mt-1">② 파기 방법: 전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법을 사용하여 삭제하고, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제6조 (이용자의 권리와 행사 방법)</h2>
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-1">위 권리는 서비스 내 프로필 수정, 회원 탈퇴 기능을 통해 행사하거나, 개인정보 보호 담당자에게 서면, 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제7조 (개인정보의 안전성 확보 조치)</h2>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>개인정보 암호화 (전송 시 SSL/TLS 적용)</li>
              <li>접근 제한 (개인정보 처리 시스템에 대한 접근 권한 관리)</li>
              <li>보안 프로그램 설치 및 주기적 갱신</li>
              <li>개인정보 취급 직원 최소화 및 교육 실시</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제8조 (쿠키의 사용)</h2>
            <p>회사는 이용자의 로그인 상태 유지를 위해 쿠키(Cookie)를 사용합니다. 쿠키는 인증 토큰 저장 목적으로만 사용되며, 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 쿠키를 거부할 경우 로그인이 필요한 서비스 이용이 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제9조 (개인정보 보호 책임자)</h2>
            <div className="mt-2 rounded-xl p-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
              <p>담당자: 아트인포 운영팀</p>
              <p className="mt-0.5">이메일: azeyokorea@gmail.com</p>
            </div>
            <p className="mt-2">기타 개인정보 침해에 대한 신고 및 상담은 아래 기관에 문의하실 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>개인정보침해신고센터 (privacy.kisa.or.kr / 118)</li>
              <li>대검찰청 사이버수사과 (spo.go.kr / 1301)</li>
              <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 182)</li>
            </ul>
          </section>

          <section>
            <p className="text-[12px] text-muted-foreground">본 개인정보 처리방침은 2025년 1월 1일부터 시행합니다.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
