// ============================================================
// 아재요 — Mock Data & Types
// ============================================================

// --------------- Types ---------------

export type PostType = "TEXT" | "VOTE";

export interface UserGrade {
  level: number;
  name: string;
  emoji: string;
  minPoints: number;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  gradeLevel: number;
  activityPoints: number;
  monthlyPoints: number; // 이달 활동점수
  stats: { posts: number; likes: number; jokbo: number };
  badges: string[];
}

export type Category =
  | "선물"
  | "부부싸움"
  | "어른들 취미"
  | "육아"
  | "생활꿀팁"
  | "자유게시판"
  | "직장생활"
  | "건강/운동"
  | "시댁/처가";

export interface Post {
  id: string;
  type: PostType;
  category: Category;
  author: string;
  authorBadge?: string;
  title: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  images?: string[];
  imageRatio?: "4:5" | "1:1";
  comments?: Comment[];
  // VOTE specific
  voteOptionA?: string;
  voteOptionB?: string;
  voteCountA?: number;
  voteCountB?: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replies?: Comment[];
}

export interface ScheduleTag {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
}

export interface Schedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  tags: ScheduleTag[];
  memo?: string;
}

export interface Recommendation {
  id: string;
  tagId: string;
  title: string;
  items: { rank: number; name: string; description: string; emoji: string }[];
}

export type TemplateCategory =
  | "아내 생일 편지"
  | "장모님 생신 카톡"
  | "사과 문자"
  | "기념일 메시지"
  | "응원 한마디";

export interface Template {
  id: string;
  category: TemplateCategory;
  title: string;
  content: string;
  likeCount: number;
  copyCount: number;
  author: string;
}

// --------------- System Tags ---------------

export const systemTags: ScheduleTag[] = [
  { id: "t1", name: "아내 생일", color: "#e17055", isSystem: true },
  { id: "t2", name: "장모님 생신", color: "#fdcb6e", isSystem: true },
  { id: "t3", name: "결혼기념일", color: "#e84393", isSystem: true },
  { id: "t4", name: "장인어른 생신", color: "#00b894", isSystem: true },
  { id: "t5", name: "아이 생일", color: "#0984e3", isSystem: true },
  { id: "t6", name: "부모님 생신", color: "#6c5ce7", isSystem: true },
];

export const customTags: ScheduleTag[] = [
  { id: "c1", name: "와이프 꽃 사는 날", color: "#fd79a8", isSystem: false },
  { id: "c2", name: "장인어른 등산", color: "#55a3a4", isSystem: false },
];

export const allTags: ScheduleTag[] = [...systemTags, ...customTags];

// --------------- Mock Posts ---------------

export const posts: Post[] = [
  {
    id: "p1",
    type: "TEXT",
    category: "선물",
    author: "결혼5년차아빠",
    authorBadge: "선물왕",
    title: "아내 생일에 다이슨 에어랩 선물했더니",
    content:
      "작년엔 가방 사줬는데 반응이 미지근했거든요. 올해는 에어랩 사줬더니 진심으로 좋아하더라구요. 실용적인 선물이 답인 것 같습니다 형님들.",
    createdAt: "2026-03-25",
    likeCount: 142,
    commentCount: 38,
    comments: [
      { id: "c1-1", author: "10년차남편", content: "에어랩 진짜 반응 좋죠 ㅋㅋ 저도 작년에 사줬는데 매일 쓰더라구요", createdAt: "2026-03-25 14:30", likeCount: 24, replies: [
        { id: "c1-1-1", author: "살림왕남편", content: "@10년차남편 에어랩 몇 사셨어요? 저도 사려고 하는데", createdAt: "2026-03-25 14:45", likeCount: 3 },
        { id: "c1-1-2", author: "워킹대디", content: "@10년차남편 매일 쓴다니 가성비 최고네요", createdAt: "2026-03-25 15:00", likeCount: 5 },
      ] },
      { id: "c1-2", author: "워킹대디", content: "실용적인 선물이 답입니다 형님 인정", createdAt: "2026-03-25 15:10", likeCount: 12 },
      { id: "c1-3", author: "딸바보파파", content: "저는 로봇청소기 사줬더니 대박이었어요", createdAt: "2026-03-25 18:22", likeCount: 31, replies: [
        { id: "c1-3-1", author: "결혼5년차아빠", content: "@딸바보파파 어떤 브랜드요? 저도 관심있어요", createdAt: "2026-03-25 19:00", likeCount: 2 },
      ] },
    ],
  },
  {
    id: "p2",
    type: "VOTE",
    category: "선물",
    author: "만년과장",
    title: "장모님 생신 선물 뭐가 나을까요?",
    content: "예산 30만원 정도인데 고민입니다",
    createdAt: "2026-03-24",
    likeCount: 67,
    commentCount: 52,
    voteOptionA: "건강식품 세트",
    voteOptionB: "백화점 상품권",
    voteCountA: 234,
    voteCountB: 189,
    comments: [
      { id: "c2-1", author: "결혼5년차아빠", content: "건강식품이 무난하지 않나요? 상품권은 좀 성의없어 보일수도", createdAt: "2026-03-24 10:00", likeCount: 18, replies: [
        { id: "c2-1-1", author: "만년과장", content: "@결혼5년차아빠 그쵸? 저도 건강식품 쪽으로 기울고 있어요", createdAt: "2026-03-24 10:20", likeCount: 4 },
        { id: "c2-1-2", author: "로맨틱가이", content: "@결혼5년차아빠 홍삼 어떠세요? 어르신들 좋아하시더라구요", createdAt: "2026-03-24 10:35", likeCount: 8 },
      ] },
      { id: "c2-2", author: "모범사위", content: "저는 건강식품+꽃다발 조합으로 갔습니다", createdAt: "2026-03-24 11:30", likeCount: 45 },
    ],
  },
  {
    id: "p3",
    type: "TEXT",
    category: "부부싸움",
    author: "반성중인남편",
    title: "결혼기념일 까먹어서 3일째 냉전 중입니다",
    content:
      "캘린더에 분명 적어놨는데 프로젝트 마감에 치여서 깜빡했습니다. 꽃이랑 케이크 사갔는데도 아직 풀리지 않네요. 어떻게 하면 좋을까요...",
    createdAt: "2026-03-24",
    likeCount: 203,
    commentCount: 89,
    comments: [
      { id: "c3-1", author: "살림왕남편", content: "편지 쓰세요 형님... 진심 담긴 편지 앞에 장사 없습니다", createdAt: "2026-03-24 09:15", likeCount: 67 },
      { id: "c3-2", author: "야근전사", content: "3일이면 좀 심한데... 여행이라도 보내드리는건 어떨까요", createdAt: "2026-03-24 12:40", likeCount: 23 },
      { id: "c3-3", author: "주말골퍼", content: "캘린더 알림 필수입니다 형님 저도 한번 당했어요", createdAt: "2026-03-24 14:55", likeCount: 38 },
      { id: "c3-4", author: "로맨틱가이", content: "꽃+케이크는 기본이고 직접 요리해보세요. 서툴러도 노력하는 모습에 감동받습니다", createdAt: "2026-03-24 20:10", likeCount: 52 },
    ],
  },
  {
    id: "p4",
    type: "VOTE",
    category: "부부싸움",
    author: "워킹대디",
    authorBadge: "조언왕",
    title: "싸우고 나면 먼저 사과하시나요?",
    content: "저는 항상 제가 먼저 하는데...",
    createdAt: "2026-03-23",
    likeCount: 312,
    commentCount: 127,
    voteOptionA: "내가 먼저 사과한다",
    voteOptionB: "상대가 먼저 할 때까지 기다린다",
    voteCountA: 567,
    voteCountB: 234,
    comments: [
      { id: "c4-1", author: "반성중인남편", content: "저도 항상 먼저 합니다... 안하면 일주일 넘게 가요 ㅠ", createdAt: "2026-03-23 08:20", likeCount: 89 },
      { id: "c4-2", author: "살림왕남편", content: "먼저 사과하는 사람이 더 어른입니다 형님들", createdAt: "2026-03-23 10:45", likeCount: 112 },
    ],
  },
  {
    id: "p5",
    type: "TEXT",
    category: "어른들 취미",
    author: "주말골퍼",
    title: "40대에 시작한 골프, 6개월 후기",
    content:
      "처음엔 와이프가 반대했는데 같이 치자고 했더니 오히려 좋아합니다. 부부 공통 취미 생기니까 대화도 많아지고 좋네요.",
    images: [
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=750&fit=crop",
    ],
    imageRatio: "4:5",
    createdAt: "2026-03-23",
    likeCount: 98,
    commentCount: 45,
    comments: [
      { id: "c5-1", author: "만년과장", content: "부부 공통 취미 진짜 중요합니다. 저도 시작해볼까...", createdAt: "2026-03-23 16:00", likeCount: 15 },
      { id: "c5-2", author: "결혼5년차아빠", content: "골프 비용이 좀 부담되지 않나요?", createdAt: "2026-03-23 17:30", likeCount: 8 },
    ],
  },
  {
    id: "p6",
    type: "TEXT",
    category: "육아",
    author: "딸바보파파",
    authorBadge: "육아고수",
    title: "아이 재우고 설거지하면 아내가 감동받는 이유",
    content:
      "당연한 거라고 생각했는데 아내 말로는 '말 안해도 알아서 해주는 게 제일 고맙다'래요. 사소한 것부터 시작해보세요 형님들.",
    createdAt: "2026-03-22",
    likeCount: 445,
    commentCount: 72,
    comments: [
      { id: "c6-1", author: "워킹대디", content: "말 안해도 알아서 하는게 핵심이죠. 시킨거 하는건 감동이 없음", createdAt: "2026-03-22 21:00", likeCount: 78 },
      { id: "c6-2", author: "10년차남편", content: "설거지+빨래 세트로 하면 효과 두배입니다 ㅋㅋ", createdAt: "2026-03-22 22:15", likeCount: 55 },
    ],
  },
  {
    id: "p7",
    type: "TEXT",
    category: "생활꿀팁",
    author: "살림왕남편",
    title: "화장실 청소 이렇게 하면 칭찬 받습니다",
    content:
      "구연산 + 베이킹소다 조합이면 끝입니다. 변기, 세면대, 거울까지 30분이면 반짝반짝. 아내가 '오늘 뭐 잘못한 거 있어?' 할 정도로 놀랍니다. 사실 처음에는 유튜브 보면서 따라했는데 생각보다 쉽고 결과가 확실해서 이제 매주 하고 있습니다. 형님들도 한번 해보세요, 아내 반응이 확 달라집니다.",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop",
    ],
    imageRatio: "1:1",
    createdAt: "2026-03-22",
    likeCount: 521,
    commentCount: 63,
    comments: [
      { id: "c7-1", author: "딸바보파파", content: "구연산 어디서 사요? 다이소에 있나요?", createdAt: "2026-03-22 10:30", likeCount: 5 },
      { id: "c7-2", author: "살림왕남편", content: "다이소, 쿠팡 다 있어요! 1000원이면 충분합니다", createdAt: "2026-03-22 11:00", likeCount: 42 },
      { id: "c7-3", author: "주말골퍼", content: "이거 보고 따라했는데 아내가 놀라서 열 체크했습니다 ㅋㅋㅋ", createdAt: "2026-03-22 15:20", likeCount: 95 },
    ],
  },
  {
    id: "p8",
    type: "VOTE",
    category: "자유게시판",
    author: "야근전사",
    title: "퇴근 후 치맥 vs 바로 귀가",
    content: "금요일 퇴근 후 동료들이 치맥 가자는데...",
    createdAt: "2026-03-21",
    likeCount: 178,
    commentCount: 94,
    voteOptionA: "한 잔만 하고 간다 (현실: 3차)",
    voteOptionB: "칼퇴 후 바로 집으로",
    voteCountA: 342,
    voteCountB: 567,
    comments: [
      { id: "c8-1", author: "반성중인남편", content: "현실: 3차 ㅋㅋㅋㅋ 너무 공감됩니다", createdAt: "2026-03-21 19:00", likeCount: 134 },
      { id: "c8-2", author: "딸바보파파", content: "금요일만큼은... 한 잔만... (결국 3차)", createdAt: "2026-03-21 20:30", likeCount: 67 },
    ],
  },
  {
    id: "p9",
    type: "TEXT",
    category: "선물",
    author: "김아재",
    title: "결혼기념일에 깜짝 여행 예약했습니다",
    content:
      "올해 결혼기념일에 제주도 2박3일 깜짝 여행 예약했습니다. 아내한테 아직 안 말했는데 반응이 기대되네요. 아이들은 장모님께 맡기기로 했습니다.",
    createdAt: "2026-03-20",
    likeCount: 34,
    commentCount: 12,
    comments: [
      { id: "c9-1", author: "로맨틱가이", content: "제주도 어디로 가세요? 추천 좀 해드릴게요", createdAt: "2026-03-20 14:00", likeCount: 8 },
      { id: "c9-2", author: "10년차남편", content: "깜짝 여행 진짜 좋죠. 저도 작년에 했는데 반응 최고였습니다", createdAt: "2026-03-20 16:30", likeCount: 15 },
    ],
  },
  {
    id: "p10",
    type: "TEXT",
    category: "육아",
    author: "김아재",
    title: "주말마다 아이들이랑 공원 가는 아빠입니다",
    content:
      "토요일 오전마다 아이들 데리고 집 근처 공원 가는데, 아내가 그 시간에 좀 쉴 수 있어서 좋다고 하더라구요. 아이들도 좋아하고 일석이조입니다.",
    createdAt: "2026-03-18",
    likeCount: 56,
    commentCount: 18,
    comments: [
      { id: "c10-1", author: "딸바보파파", content: "저도 매주 공원 가요! 아이들 체력 소모에 최고", createdAt: "2026-03-18 11:00", likeCount: 12 },
    ],
  },
  {
    id: "p11",
    type: "VOTE",
    category: "자유게시판",
    author: "김아재",
    title: "아내 잔소리 줄이는 법 있나요?",
    content: "잔소리가 사랑인 건 아는데... 가끔 힘들 때가 있습니다 형님들",
    createdAt: "2026-03-15",
    likeCount: 87,
    commentCount: 31,
    voteOptionA: "미리미리 알아서 한다",
    voteOptionB: "그냥 감수한다",
    voteCountA: 412,
    voteCountB: 198,
    comments: [
      { id: "c11-1", author: "살림왕남편", content: "미리 알아서 하면 진짜 줄어듭니다. 경험담입니다", createdAt: "2026-03-15 20:00", likeCount: 45 },
      { id: "c11-2", author: "워킹대디", content: "감수하는 게 편합니다 형님... 맞서면 더 커져요", createdAt: "2026-03-15 21:30", likeCount: 38 },
    ],
  },
];

// --------------- Mock Schedules ---------------

export const schedules: Schedule[] = [
  {
    id: "s1",
    title: "아내 생일",
    date: "2026-04-05",
    tags: [systemTags[0]],
    memo: "올해는 깜짝 파티 준비하기",
  },
  {
    id: "s2",
    title: "장모님 생신",
    date: "2026-04-12",
    tags: [systemTags[1]],
    memo: "건강식품 + 용돈 준비",
  },
  {
    id: "s3",
    title: "결혼기념일",
    date: "2026-05-20",
    tags: [systemTags[2]],
    memo: "레스토랑 예약 필수",
  },
  {
    id: "s4",
    title: "아이 생일파티",
    date: "2026-06-15",
    tags: [systemTags[4]],
    memo: "키즈카페 예약",
  },
  {
    id: "s5",
    title: "와이프에게 꽃 사기",
    date: "2026-03-28",
    tags: [customTags[0]],
  },
  {
    id: "s6",
    title: "장인어른 등산 약속",
    date: "2026-04-01",
    tags: [customTags[1], systemTags[3]],
  },
];

// --------------- Mock Recommendations ---------------

export const recommendations: Recommendation[] = [
  {
    id: "r1",
    tagId: "t1",
    title: "아내 생일 선물 TOP 5",
    items: [
      {
        rank: 1,
        name: "다이슨 에어랩",
        description: "실용성 + 감동 둘 다 잡는 선물",
        emoji: "💇‍♀️",
      },
      {
        rank: 2,
        name: "호텔 스파 이용권",
        description: "쉬는 시간이 최고의 선물",
        emoji: "🧖‍♀️",
      },
      {
        rank: 3,
        name: "명품 향수",
        description: "디올 미스 디올 블루밍 부케 추천",
        emoji: "🌸",
      },
      {
        rank: 4,
        name: "레스토랑 디너",
        description: "아이는 부모님께 맡기고 둘이서",
        emoji: "🍽️",
      },
      {
        rank: 5,
        name: "손편지 + 케이크",
        description: "진심이 담긴 편지만큼 강력한 건 없다",
        emoji: "💌",
      },
    ],
  },
  {
    id: "r2",
    tagId: "t2",
    title: "장모님 생신 선물 TOP 5",
    items: [
      {
        rank: 1,
        name: "건강식품 세트",
        description: "홍삼 + 비타민 세트가 정석",
        emoji: "🎁",
      },
      {
        rank: 2,
        name: "안마기",
        description: "어깨/목 안마기 효도 아이템",
        emoji: "💆",
      },
      {
        rank: 3,
        name: "백화점 상품권",
        description: "직접 고르시는 재미를 드리는 센스",
        emoji: "🏬",
      },
      {
        rank: 4,
        name: "외식 초대",
        description: "한정식 코스 + 꽃다발",
        emoji: "🌺",
      },
      {
        rank: 5,
        name: "여행 상품권",
        description: "부모님끼리 여행 보내드리기",
        emoji: "✈️",
      },
    ],
  },
];

// --------------- Mock Templates ---------------

export const templates: Template[] = [
  {
    id: "tm1",
    category: "아내 생일 편지",
    title: "진심 담은 생일 편지",
    content: `당신이 있어 매일이 감사한 날입니다.

올해도 변함없이 우리 가족을 위해 애써주는 당신에게
생일 축하한다는 말과 함께 고맙다는 말을 전합니다.

앞으로도 함께 나이 들어가는 게 기대되는 사람,
당신이 바로 그 사람입니다.

생일 축하해, 여보. 사랑해.`,
    likeCount: 892,
    copyCount: 2341,
    author: "10년차남편",
  },
  {
    id: "tm2",
    category: "아내 생일 편지",
    title: "유머 섞인 생일 편지",
    content: `여보 생일 축하해!

결혼 전엔 '이 사람이랑 평생 살면 재밌겠다' 했는데
결혼 후엔 '이 사람 덕분에 내가 살아있구나' 합니다.

매일 잔소리하면서도 내 건강 챙겨주고,
투덜대면서도 맛있는 밥 해주는 당신.

세상에서 제일 예쁘고 (이건 진심)
세상에서 제일 무서운 (이것도 진심) 우리 와이프,
올해도 건강하고 행복하자!`,
    likeCount: 1203,
    copyCount: 3567,
    author: "유머아빠",
  },
  {
    id: "tm3",
    category: "장모님 생신 카톡",
    title: "정중하고 따뜻한 카톡",
    content: `어머님, 생신 진심으로 축하드립니다 🎂

항상 저희 가족을 위해 기도해주시고
따뜻하게 챙겨주셔서 감사합니다.

올해도 건강하시고 행복한 일만 가득하시길
사위가 진심으로 기원합니다.

생신 축하드립니다, 어머님 ❤️`,
    likeCount: 567,
    copyCount: 4521,
    author: "모범사위",
  },
  {
    id: "tm4",
    category: "장모님 생신 카톡",
    title: "센스있는 효도 카톡",
    content: `어머님~ 생신 축하드립니다! 🎉

맛있는 거 드시러 모시고 갈게요!
저번에 말씀하신 그 한정식집 예약해놨습니다 😊

건강이 최고니까 올해도 건강하세요!
항상 감사합니다 어머님 🙏`,
    likeCount: 432,
    copyCount: 2890,
    author: "착한사위",
  },
  {
    id: "tm5",
    category: "사과 문자",
    title: "진심 사과 (기념일 깜빡했을 때)",
    content: `여보, 정말 미안해.

중요한 날을 깜빡한 건 변명의 여지가 없어.
당신한테 그 날이 얼마나 소중한지 알면서도
제대로 챙기지 못한 내가 정말 한심해.

앞으로는 절대 이런 일 없도록 할게.
오늘 저녁에 맛있는 거 먹으러 가자.
다시 한번 진심으로 미안해, 사랑해.`,
    likeCount: 1567,
    copyCount: 5234,
    author: "반성맨",
  },
  {
    id: "tm6",
    category: "사과 문자",
    title: "야근 후 늦은 귀가 사과",
    content: `여보 미안... 오늘도 늦었어 😢

일이 갑자기 터져서 빨리 못 왔어.
기다리느라 힘들었지? 내일은 꼭 일찍 갈게.

냉장고에 맥주 있으면 하나 꺼내줄래?
들어가면서 치킨 사갈게 🍗

미안하고 고마워, 항상.`,
    likeCount: 876,
    copyCount: 1678,
    author: "야근전사",
  },
  {
    id: "tm7",
    category: "기념일 메시지",
    title: "결혼기념일 메시지",
    content: `오늘이 우리가 부부가 된 지 OO년 되는 날이야.

돌이켜보면 좋은 날도, 힘든 날도 있었지만
당신과 함께여서 다 견딜 수 있었어.

앞으로 남은 날들도 함께 걸어가자.
당신을 만난 건 내 인생 최고의 행운이야.

OO주년 축하해, 여보. 영원히 사랑해 ❤️`,
    likeCount: 2103,
    copyCount: 6789,
    author: "로맨틱가이",
  },
  {
    id: "tm8",
    category: "기념일 메시지",
    title: "100일 / 발렌타인 메시지",
    content: `같이 밥 먹고, 같이 TV 보고, 같이 잠드는
평범한 일상이 사실은 가장 특별한 거더라.

오늘 하루도 수고했어, 여보.
당신이 있어서 집에 오는 길이 항상 기대돼.

사랑해, 오늘도 내일도 모레도.`,
    likeCount: 987,
    copyCount: 3456,
    author: "일상감성",
  },
  {
    id: "tm9",
    category: "응원 한마디",
    title: "지친 아내에게 보내는 응원",
    content: `여보, 오늘 하루도 고생 많았어.

아이들 챙기고 집안일 하면서
자기 시간도 없이 바쁜 거 알아.

당신은 정말 대단한 사람이야.
가끔 지쳐도 괜찮아, 내가 있잖아.

오늘 저녁은 내가 할게. 좀 쉬어 ❤️`,
    likeCount: 1432,
    copyCount: 2987,
    author: "응원단장",
  },
  {
    id: "tm10",
    category: "사과 문자",
    title: "깜빡한 날의 진심 사과",
    content: `여보, 오늘 진짜 미안해.

바쁘다는 핑계로 중요한 걸 놓쳤어.
당신이 얼마나 서운했을지 생각하면 마음이 아파.

내일부터 캘린더 알림 3개 걸어놓을게.
같은 실수 두 번 안 한다, 약속해.

미안하고 사랑해, 항상.`,
    likeCount: 234,
    copyCount: 876,
    author: "김아재",
  },
  {
    id: "tm11",
    category: "아내 생일 편지",
    title: "아이들 아빠가 쓰는 생일 편지",
    content: `여보 생일 축하해!

우리 아이들의 엄마이자
나의 가장 든든한 동반자인 당신.

올해도 고생 많았어.
아이들 키우면서 자기 시간도 없는데
항상 웃으면서 해내는 당신이 대단해.

오늘은 아이들이랑 준비한 깜짝 선물 있어.
기대해도 좋아 😊

생일 축하해, 세상에서 제일 예쁜 우리 와이프!`,
    likeCount: 156,
    copyCount: 543,
    author: "김아재",
  },
  {
    id: "tm12",
    category: "응원 한마디",
    title: "퇴근 후 보내는 응원 한마디",
    content: `여보, 오늘도 수고했어.

집에 가면 맛있는 거 시켜먹자.
아이들 재우고 나서 둘이 커피 한잔 하자.

매일 고맙고, 매일 사랑해.`,
    likeCount: 98,
    copyCount: 312,
    author: "김아재",
  },
];

// --------------- Grades ---------------

export const grades: UserGrade[] = [
  { level: 1, name: "새내기 남편", emoji: "🐣", minPoints: 0 },
  { level: 2, name: "초보 유부남", emoji: "👔", minPoints: 50 },
  { level: 3, name: "동네 아재", emoji: "🧢", minPoints: 200 },
  { level: 4, name: "베테랑 남편", emoji: "🏆", minPoints: 500 },
  { level: 5, name: "아재 마스터", emoji: "👑", minPoints: 1500 },
];

export const gradeRules = [
  { action: "게시글 작성", points: 10 },
  { action: "댓글 작성", points: 3 },
  { action: "족보 등록", points: 15 },
  { action: "족보 복사됨 (내 글)", points: 5 },
  { action: "좋아요 받음", points: 2 },
  { action: "좋아요 누름", points: 1 },
  { action: "투표 참여", points: 2 },
  { action: "일정 등록", points: 3 },
  { action: "출석 (일 1회)", points: 2 },
];

export function getGrade(points: number): UserGrade {
  return [...grades].reverse().find((g) => points >= g.minPoints) ?? grades[0];
}

// --------------- Mock Users ---------------

export const users: User[] = [
  {
    id: "u1",
    name: "김아재",
    initials: "김",
    subtitle: "결혼 7년차 · 아이 2명",
    gradeLevel: 4,
    activityPoints: 720,
    monthlyPoints: 185,
    stats: { posts: 12, likes: 89, jokbo: 5 },
    badges: ["선물왕", "족보 기여자"],
  },
  {
    id: "u2",
    name: "살림왕남편",
    initials: "살",
    subtitle: "결혼 10년차 · 아이 1명",
    gradeLevel: 5,
    activityPoints: 1820,
    monthlyPoints: 312,
    stats: { posts: 45, likes: 521, jokbo: 12 },
    badges: ["생활달인", "인기왕"],
  },
  {
    id: "u3",
    name: "딸바보파파",
    initials: "딸",
    subtitle: "결혼 8년차 · 딸 2명",
    gradeLevel: 4,
    activityPoints: 680,
    monthlyPoints: 245,
    stats: { posts: 28, likes: 445, jokbo: 3 },
    badges: ["육아고수"],
  },
  {
    id: "u4",
    name: "워킹대디",
    initials: "워",
    subtitle: "결혼 6년차 · 아이 1명",
    gradeLevel: 3,
    activityPoints: 350,
    monthlyPoints: 198,
    stats: { posts: 15, likes: 312, jokbo: 1 },
    badges: ["조언왕"],
  },
  {
    id: "u5",
    name: "결혼5년차아빠",
    initials: "결",
    subtitle: "결혼 5년차 · 아이 1명",
    gradeLevel: 3,
    activityPoints: 290,
    monthlyPoints: 156,
    stats: { posts: 10, likes: 142, jokbo: 2 },
    badges: ["선물왕"],
  },
  {
    id: "u6",
    name: "로맨틱가이",
    initials: "로",
    subtitle: "결혼 12년차",
    gradeLevel: 5,
    activityPoints: 2100,
    monthlyPoints: 278,
    stats: { posts: 52, likes: 2103, jokbo: 8 },
    badges: ["족보장인", "로맨티스트"],
  },
];

// 현재 로그인 유저 (김아재)
export const currentUser = users[0];

export function getTopMonthlyUsers(count: number = 3): User[] {
  return [...users].sort((a, b) => b.monthlyPoints - a.monthlyPoints).slice(0, count);
}

// --------------- Helper Functions ---------------

export function getDday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDday(dateStr: string): string {
  const diff = getDday(dateStr);
  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export function getUpcomingSchedules(): Schedule[] {
  return schedules
    .filter((s) => getDday(s.date) >= 0)
    .sort((a, b) => getDday(a.date) - getDday(b.date));
}

export function getRecommendationsForSchedule(
  schedule: Schedule
): Recommendation | undefined {
  const tagIds = schedule.tags.map((t) => t.id);
  return recommendations.find((r) => tagIds.includes(r.tagId));
}
