"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { apiFetch } from "@/lib/api";

const QUESTIONS = [
  "아이에게 하루에 세 번씩 30분 정도 스킨십을 해준다",
  "일주일에 두 차례 이상 아이를 목욕시킨다",
  "직접 만들 수 있는 이유식이나 간식이 한 가지 이상 있다",
  "기저귀를 갈고 능숙하게 뒷처리를 해줄 수 있다",
  "아내가 하루 종일 외출해도 혼자서 아이를 볼 수 있다",
  "외출 시 아이에게 필요한 물건 다섯 가지를 챙길 수 있다",
  "아이가 제일 좋아하는 장난감이나 놀이가 무엇인지 안다",
  "직장에서 전화를 걸어 아이가 어떻게 지내는지 물어본다",
  "아이가 열이 나거나 아플 때 혼자서 응급처치를 할 수 있다",
  "주말에 아이가 좋아하는 TV 프로를 같이 본다",
  "피곤해도 아내가 집안일을 할 때는 아이와 놀아준다",
  "아이의 잠자리를 봐주고 혼자서 아이를 재울 수 있다",
  "아내와 함께 육아일기를 쓰거나 아이의 사진을 정리한다",
  "자녀와 비슷한 또래의 아이를 보면 몇 개월이냐고 묻는다",
  "아이가 울 때 아파서 우는 게 아니면 5분 이내에 달랜다",
];

interface ResultInfo {
  score: number;
  emoji: string;
  title: string;
  description: string;
  advice: string;
  color: string;
}

function getResult(yesCount: number): ResultInfo {
  if (yesCount >= 15) {
    return {
      score: 100,
      emoji: "👑",
      title: "완벽한 슈퍼 대디",
      description: "당신은 육아의 달인입니다. 아내가 안심하고 아이를 맡길 수 있는 든든한 파트너예요. 아이에게 당신은 세상에서 가장 멋진 아빠입니다.",
      advice: "이미 훌륭한 아빠지만, 가끔은 아내에게 \"당신도 쉬어\"라고 말해주세요. 육아는 함께 하는 거지만, 서로를 챙기는 것도 중요하니까요. 아이는 이런 부모의 모습을 보고 자랍니다.",
      color: "from-yellow-400 to-amber-500",
    };
  }
  if (yesCount >= 13) {
    return {
      score: 90,
      emoji: "🏆",
      title: "거의 완벽한 아빠",
      description: "아이와의 시간을 소중히 여기고, 육아에 적극적으로 참여하고 있어요. 아내가 정말 고마워하고 있을 겁니다. 조금만 더 하면 만점 아빠!",
      advice: "못하는 항목 1~2개를 이번 주에 하나만 실천해보세요. 이유식 하나 배워보거나, 외출 준비물을 직접 챙겨보거나. 작은 도전이 완벽한 아빠를 만듭니다.",
      color: "from-green-400 to-emerald-500",
    };
  }
  if (yesCount >= 9) {
    return {
      score: 80,
      emoji: "💪",
      title: "노력하는 좋은 아빠",
      description: "육아의 기본기가 탄탄합니다. 아이와 잘 놀아주고 돌볼 줄 아는 아빠예요. 다만 아직 아내에게 의존하는 부분이 조금 있네요.",
      advice: "\"아내가 없으면 못하는 것\" 목록을 만들어보세요. 그리고 하나씩 혼자서도 할 수 있게 연습해보세요. 아내가 맘 편히 외출할 수 있는 남편이 진짜 좋은 아빠입니다.",
      color: "from-blue-400 to-cyan-500",
    };
  }
  if (yesCount >= 5) {
    return {
      score: 40,
      emoji: "😅",
      title: "아직은 초보 아빠",
      description: "마음은 있지만 실천이 부족합니다. 아이와 함께하는 시간이 더 필요해요. 아내가 혼자 육아를 감당하고 있을 수 있습니다.",
      advice: "오늘 퇴근 후 딱 한 가지만 해보세요. 아이 목욕시키기, 같이 놀아주기, 재워주기 중 하나. 아내한테 \"오늘은 내가 할게\" 한마디면 됩니다. 매일 하나씩 늘려가면 어느새 달라져 있을 거예요.",
      color: "from-orange-400 to-red-400",
    };
  }
  return {
    score: 20,
    emoji: "🚨",
    title: "아빠 수업이 필요해요",
    description: "솔직히 말하면, 지금은 아이에게 '함께 사는 아저씨'에 가까울 수 있어요. 아이는 빠르게 자랍니다. 지금 이 순간이 다시 오지 않아요.",
    advice: "거창한 것부터 시작하지 않아도 돼요. 오늘 아이 눈을 보고 \"아빠가 사랑해\"라고 말해보세요. 안아주세요. 그게 시작입니다. 아이는 완벽한 아빠가 아니라 '곁에 있는 아빠'를 원합니다.",
    color: "from-red-400 to-rose-500",
  };
}

export default function GoodDadTestPage() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { isLoggedIn } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    apiFetch<{ tests: { slug: string; imageUrl: string | null }[] }>("/azeyo/contents/tests", { noAuth: true })
      .then((data) => {
        const found = data.tests.find((t) => t.slug === "good-dad");
        if (found?.imageUrl) setImageUrl(found.imageUrl);
      })
      .catch(() => {});
  }, []);

  const yesCount = answers.filter((a) => a).length;
  const result = getResult(yesCount);
  const progress = ((currentQuestion) / QUESTIONS.length) * 100;

  function handleStart() {
    if (!isLoggedIn) {
      show("로그인 후 테스트할 수 있어요");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }
    setStarted(true);
  }

  function handleSelect(yes: boolean) {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      const newAnswers = [...answers, yes];
      setAnswers(newAnswers);
      setIsAnimating(false);

      if (currentQuestion + 1 >= QUESTIONS.length) {
        setDone(true);
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 300);
  }

  function handleRetry() {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setDone(false);
  }

  function handleShare() {
    const text = `[아재요] 좋은 아빠 진단 테스트\n\n내 점수: ${result.score}점 (${yesCount}/${QUESTIONS.length}개)\n결과: ${result.emoji} ${result.title}\n\n나도 테스트하기 👉 https://azeyo.co.kr/test/good-dad`;
    if (navigator.share) {
      navigator.share({ title: "좋은 아빠 진단 테스트", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("결과가 복사되었습니다!");
    }
  }

  // --- Intro ---
  if (!started) {
    return (
      <div className="px-5 pt-8 pb-10 animate-fade-up">
        {/* 대표 이미지 */}
        <div className="rounded-2xl overflow-hidden mb-6 aspect-[4/3] bg-secondary flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="좋은 아빠 진단 테스트" className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">👨‍👧</span>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
            좋은 아빠 진단 테스트
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            나는 과연 좋은 아빠일까?<br />O/X로 솔직하게 체크해보세요
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl text-base font-semibold text-primary-foreground active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "hsl(22 60% 42%)" }}
        >
          테스트 시작하기
        </button>
      </div>
    );
  }

  // --- Quiz ---
  if (!done) {
    return (
      <div className="px-5 pt-6 pb-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              {currentQuestion + 1} / {QUESTIONS.length}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(35 25% 93%)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: "hsl(22 60% 42%)" }}
            />
          </div>
        </div>

        {/* Question */}
        <div key={currentQuestion} className="animate-fade-up">
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                style={{ backgroundColor: "hsl(22 60% 42%)" }}
              >
                {currentQuestion + 1}
              </span>
              <p className="text-[15px] font-medium text-foreground leading-relaxed pt-0.5">
                {QUESTIONS[currentQuestion]}
              </p>
            </div>
          </div>

          {/* O / X 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelect(true)}
              disabled={isAnimating}
              className="py-5 rounded-xl text-lg font-bold transition-all duration-200 active:scale-[0.95]"
              style={{ backgroundColor: "hsl(150 20% 55%)", color: "white" }}
            >
              O
            </button>
            <button
              onClick={() => handleSelect(false)}
              disabled={isAnimating}
              className="py-5 rounded-xl text-lg font-bold transition-all duration-200 active:scale-[0.95]"
              style={{ backgroundColor: "hsl(0 84% 60%)", color: "white" }}
            >
              X
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Result ---
  return (
    <div className="px-5 pt-8 pb-10 animate-fade-up">
      {/* Score Card */}
      <div className={`rounded-2xl p-6 text-center text-white bg-gradient-to-br ${result.color} mb-6`}>
        <div className="text-5xl mb-3">{result.emoji}</div>
        <div className="text-sm font-medium opacity-90 mb-1">내 점수</div>
        <div className="text-4xl font-extrabold mb-1">
          {result.score}<span className="text-lg font-normal opacity-80">점</span>
        </div>
        <div className="text-sm opacity-80 mb-2">{yesCount} / {QUESTIONS.length}개 체크</div>
        <div className="text-lg font-bold">{result.title}</div>
      </div>

      {/* Description */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-2">진단 결과</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.description}
        </p>
      </div>

      {/* Advice */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <span>📝</span> 아재요의 한마디
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.advice}
        </p>
      </div>

      {/* 문항별 결과 */}
      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">문항별 체크</h3>
        <div className="space-y-2">
          {answers.map((yes, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: yes ? "hsl(150 20% 55%)" : "hsl(0 84% 60%)" }}
              >
                {yes ? "O" : "X"}
              </span>
              <span className="text-xs text-muted-foreground truncate">{QUESTIONS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl text-base font-semibold text-primary-foreground active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "hsl(22 60% 42%)" }}
        >
          결과 공유하기
        </button>
        <button
          onClick={handleRetry}
          className="w-full py-4 rounded-2xl text-base font-semibold active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "hsl(35 25% 93%)", color: "hsl(30 10% 45%)" }}
        >
          다시 테스트하기
        </button>
      </div>
    </div>
  );
}
