"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <Link
          href="/mypage/settings"
          aria-label="뒤로 가기"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-bold text-foreground">이용약관</h1>
      </div>

      <div className="px-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="space-y-6 text-[13px] leading-relaxed text-foreground/80">

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제1조 (목적)</h2>
            <p>이 약관은 아재요(이하 &quot;회사&quot;)가 제공하는 모바일 웹 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제2조 (정의)</h2>
            <p>① &quot;서비스&quot;란 회사가 제공하는 커뮤니티, 족보(메시지 템플릿), 일정 관리 등 모든 관련 서비스를 의미합니다.</p>
            <p className="mt-1">② &quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원을 말합니다.</p>
            <p className="mt-1">③ &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</p>
            <p className="mt-1">④ &quot;게시물&quot;이란 회원이 서비스 이용 시 게시한 글, 사진, 댓글, 투표 등 일체의 정보를 말합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제3조 (약관의 효력 및 변경)</h2>
            <p>① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
            <p className="mt-1">② 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 내 공지합니다.</p>
            <p className="mt-1">③ 변경된 약관에 동의하지 않는 회원은 회원 탈퇴(해지)를 요청할 수 있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관의 변경사항에 동의한 것으로 간주합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제4조 (회원가입)</h2>
            <p>① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</p>
            <p className="mt-1">② 회사는 소셜 로그인(카카오, 네이버, 구글)을 통한 회원가입을 지원하며, 소셜 계정 연동 시 해당 플랫폼의 이용약관도 적용됩니다.</p>
            <p className="mt-1">③ 회사는 다음 각 호에 해당하는 경우 회원가입을 거절하거나 사후에 회원자격을 제한 및 상실시킬 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>타인의 명의를 이용한 경우</li>
              <li>허위 정보를 기재한 경우</li>
              <li>기타 회원으로 등록하는 것이 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제5조 (서비스의 제공 및 변경)</h2>
            <p>① 회사는 다음과 같은 서비스를 제공합니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>커뮤니티 서비스 (게시글 작성, 댓글, 투표, 좋아요)</li>
              <li>족보 서비스 (메시지 템플릿 열람 및 복사)</li>
              <li>일정 관리 서비스 (기념일, 일정 등록 및 알림)</li>
              <li>선물/행동 추천 서비스</li>
              <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
            </ul>
            <p className="mt-1">② 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 공지합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제6조 (서비스 이용시간)</h2>
            <p>① 서비스의 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.</p>
            <p className="mt-1">② 회사는 정기점검, 시스템 교체, 장애 등의 사유로 서비스의 전부 또는 일부를 일시적으로 중단할 수 있으며, 사전 공지합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제7조 (회원의 의무)</h2>
            <p>① 회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사 및 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              <li>영리를 목적으로 서비스를 이용하는 행위</li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ul>
            <p className="mt-1">② 회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스 관련 공지사항을 준수하여야 합니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제8조 (게시물의 관리)</h2>
            <p>① 회원이 작성한 게시물에 대한 저작권은 해당 회원에게 귀속됩니다.</p>
            <p className="mt-1">② 회사는 다음 각 호에 해당하는 게시물을 사전 통지 없이 삭제하거나 이동 또는 등록을 거부할 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>다른 회원 또는 제3자를 비방하거나 명예를 훼손하는 내용</li>
              <li>공공질서 및 미풍양속에 위반되는 내용</li>
              <li>범죄적 행위에 결부된다고 인정되는 내용</li>
              <li>회사의 저작권 또는 제3자의 저작권 등 기타 권리를 침해하는 내용</li>
              <li>광고성 정보 또는 스팸에 해당하는 내용</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제9조 (회원 탈퇴 및 자격 상실)</h2>
            <p>① 회원은 언제든지 서비스 내 설정 메뉴를 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.</p>
            <p className="mt-1">② 회원 탈퇴 시 회원이 작성한 게시글, 댓글, 족보 등의 콘텐츠는 삭제되지 않으며, 닉네임은 &quot;탈퇴한 회원&quot;으로 표시됩니다.</p>
            <p className="mt-1">③ 탈퇴 후 동일한 소셜 계정으로 재가입할 수 있으나, 기존 활동 내역 및 포인트는 복구되지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제10조 (면책조항)</h2>
            <p>① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 면합니다.</p>
            <p className="mt-1">② 회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</p>
            <p className="mt-1">③ 회사는 회원이 게시 또는 전송한 자료의 신뢰도, 정확성 등에 대해서는 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-2">제11조 (분쟁 해결)</h2>
            <p>① 회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용하며, 서울중앙지방법원을 전속관할법원으로 합니다.</p>
          </section>

          <section>
            <p className="text-[12px] text-muted-foreground">본 약관은 2025년 1월 1일부터 시행합니다.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
