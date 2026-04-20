"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { apiFetch } from "@/lib/api";

const QUESTIONS = [
  "나는 결혼생활에 대해 근심, 걱정이 많다",
  "나의 결혼생활에 대해 배우자가 나에게 무엇을 기대하고 있는지 잘 모르겠다",
  "만약 내가 다시 결혼한다면 배우자와 같은 사람과 결혼하지 않겠다",
  "현재의 결혼생활은 나를 너무 구속한다",
  "나는 결혼생활이 따분하게 느껴진다",
  "나의 결혼생활은 건강에 나쁜 영향을 미치고 있다",
  "나는 결혼생활 속에서 벌어지는 일들 때문에 화가 나고 짜증이 난다",
  "나는 결혼생활을 잘 할 수 있는 능력이 모자란다고 생각한다",
  "지금의 결혼생활이 영원히 지속되기를 바라지 않는다",
  "배우자는 나를 매우 화나게 만든다",
  "나는 결혼 생활을 잘해보려고 노력하는데 지쳤다",
  "나는 배우자에게 별로 관심을 기울이지 않는다",
  "나는 배우자와 사이가 좋지 못하다",
  "나는 배우자와 의견이 일치하지 않는다",
  "나는 배우자를 신뢰하기 어렵다",
  "나는 성생활에 만족하지 않는다",
  "나는 배우자와 애정과 친밀감에 불만족스럽다",
  "배우자는 나를 매우 화나게 만든다",
  "나는 역할 분담으로 배우자와 자주 싸운다",
  "나는 확실히 결혼생활에 불만족스럽다",
];

const OPTIONS = [
  { label: "전혀 그렇지 않다", score: 1 },
  { label: "그렇지 않다", score: 2 },
  { label: "보통이다", score: 3 },
  { label: "그렇다", score: 4 },
  { label: "정말 그렇다", score: 5 },
];

interface ResultInfo {
  stage: string;
  emoji: string;
  title: string;
  description: string;
  advice: string;
  color: string;
}

function getResult(score: number): ResultInfo {
  if (score <= 40) {
    return {
      stage: "안정",
      emoji: "🌸",
      title: "건강하게 유지되는 결혼 생활",
      description:
        "배우자와 전반적으로 안정적이고 신뢰 있는 관계를 유지하고 있어요. 큰 갈등 없이 서로를 존중하며 살아가는 보기 드문 상태입니다.",
      advice:
        "지금의 평화는 저절로 유지되지 않아요. '익숙함'이 '소홀함'이 되지 않도록, 하루에 한 번 눈 마주치고 대화하기, 주 1회 둘만의 시간 갖기 같은 작은 루틴을 지켜보세요. 건강할 때가 관계 자산을 쌓기 제일 좋은 시기입니다.",
      color: "from-green-400 to-emerald-500",
    };
  }
  if (score <= 60) {
    return {
      stage: "양호",
      emoji: "😊",
      title: "만족도 양호한 결혼 생활",
      description:
        "대체로 만족스럽지만 몇 가지 불편이나 갈등 요소가 있을 수 있어요. '편안함'과 '지루함' 사이 어딘가에 있는 상태입니다. 큰 문제는 없어도 방치하면 금세 내려갈 수 있어요.",
      advice:
        "오늘 저녁 배우자에게 \"요즘 어때? 나한테 서운한 거 있어?\"라고 한 번만 물어봐 주세요. 관계는 문제가 생긴 뒤 고치는 것보다, 작은 불만이 쌓이기 전에 풀어내는 게 훨씬 쉽습니다. 작은 표현과 꾸준한 관심이 답입니다.",
      color: "from-blue-400 to-cyan-500",
    };
  }
  if (score <= 80) {
    return {
      stage: "주의",
      emoji: "⚠️",
      title: "불만족이 쌓이고 있는 상태",
      description:
        "결혼 생활에 대한 불만과 피로가 누적되고 있어요. 배우자에 대한 짜증, 거리감, 체념이 늘어나고 있을 수 있습니다. 지금이 바로 방향을 바꿔야 할 시점이에요.",
      advice:
        "무엇이 불만인지 솔직하게 적어보고, 하나씩 대화로 풀어보세요. \"당신이 문제야\"가 아니라 \"나는 이런 게 힘들어\"로 시작하는 게 핵심입니다. 부부가 함께 하는 활동을 한 가지 복원해보세요 — 산책이든, 영화 한 편이든. 필요하면 부부 상담도 진지하게 고려해보세요. 부끄러운 게 아닙니다.",
      color: "from-orange-400 to-red-400",
    };
  }
  return {
    stage: "위기",
    emoji: "🚨",
    title: "불만족이 매우 높은 위기 상태",
    description:
      "결혼 생활에 대한 불만족도가 매우 높은 상태입니다. 분노, 실망, 회피가 일상이 되어 있을 수 있어요. 이 상태가 오래 지속되면 관계 회복이 점점 어려워집니다.",
    advice:
      "혼자 해결하기 어려운 단계입니다. 전문 부부 상담사의 도움을 받아보세요 — 관계를 지키고 싶다는 신호이자 용기입니다. 동시에 자신의 감정과 건강도 돌보세요. 잠, 운동, 믿을 만한 사람과의 대화부터 챙기세요. 지금의 결정이 앞으로 10년을 바꿉니다.",
    color: "from-red-400 to-rose-500",
  };
}

export default function MarriageSatisfactionTestClient() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { isLoggedIn } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    apiFetch<{ tests: { slug: string; imageUrl: string | null }[] }>("/azeyo/contents/tests", { noAuth: true })
      .then((data) => {
        const found = data.tests.find((t) => t.slug === "marriage-satisfaction");
        if (found?.imageUrl) setImageUrl(found.imageUrl);
      })
      .catch(() => {});
  }, []);

  const totalScore = answers.reduce((sum, a) => sum + a, 0);
  const result = getResult(totalScore);
  const progress = (currentQuestion / QUESTIONS.length) * 100;

  function handleStart() {
    if (!isLoggedIn) {
      show("로그인 후 테스트할 수 있어요");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }
    setStarted(true);
  }

  function handleSelect(score: number) {
    if (isAnimating) return;
    setSelectedOption(score);
    setIsAnimating(true);

    setTimeout(() => {
      const newAnswers = [...answers, score];
      setAnswers(newAnswers);
      setSelectedOption(null);
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
    setSelectedOption(null);
    setDone(false);
  }

  function handleShare() {
    const text = `[아재요] 결혼 생활 만족도 테스트\n\n내 점수: ${totalScore}점 / 100점\n상태: ${result.emoji} ${result.title}\n\n나도 테스트하기 👉 https://azeyo.co.kr/test/marriage-satisfaction`;
    if (navigator.share) {
      navigator.share({ title: "결혼 생활 만족도 테스트", text });
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
            <img
              src={imageUrl}
              alt="결혼 생활 만족도 테스트"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">💑</span>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
            결혼 생활 만족도 테스트
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            지금 우리 결혼 생활, 정말 괜찮은 걸까?<br />20개 문항으로 솔직하게 진단해보세요
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
              style={{
                width: `${progress}%`,
                backgroundColor: "hsl(22 60% 42%)",
              }}
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

          {/* Options */}
          <div className="space-y-2.5">
            {OPTIONS.map((opt) => (
              <button
                key={opt.score}
                onClick={() => handleSelect(opt.score)}
                disabled={isAnimating}
                className={`
                  w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium
                  transition-all duration-200 active:scale-[0.97]
                  ${
                    selectedOption === opt.score
                      ? "text-primary-foreground"
                      : "text-foreground hover:opacity-80"
                  }
                `}
                style={{
                  backgroundColor:
                    selectedOption === opt.score
                      ? "hsl(22 60% 42%)"
                      : "hsl(35 25% 93%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  <span className="text-xs opacity-60">{opt.score}점</span>
                </div>
              </button>
            ))}
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
          {totalScore}<span className="text-lg font-normal opacity-80"> / 100점</span>
        </div>
        <div className="text-lg font-bold mt-3">{result.title}</div>
      </div>

      {/* Stage Badge */}
      <div className="flex justify-center mb-6">
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ backgroundColor: "hsl(35 25% 93%)", color: "hsl(22 60% 42%)" }}
        >
          현재 상태: {result.stage}
        </div>
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

      {/* Score Breakdown */}
      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">문항별 점수</h3>
        <div className="space-y-2">
          {answers.map((score, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(35 25% 90%)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(score / 5) * 100}%`,
                    backgroundColor: score <= 2 ? "hsl(150 20% 55%)" : score === 3 ? "hsl(40 80% 60%)" : "hsl(0 84% 60%)",
                  }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-5 flex-shrink-0">{score}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          ※ 이 테스트는 부정 문항 기반으로, 점수가 낮을수록 결혼 생활 만족도가 높음을 의미합니다.
        </p>
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
