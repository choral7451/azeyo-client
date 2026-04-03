"use client";

import { useState, useEffect, useCallback } from "react";
import { BottomSheet } from "@/components/bottom-sheet";
import { apiFetch } from "@/lib/api";

interface ApiTag {
  id: number;
  name: string;
  color: string;
  isSystem: boolean;
}

interface ApiSchedule {
  id: number;
  title: string;
  date: string;
  memo: string | null;
  repeatType: "NONE" | "YEARLY";
  startDate: string | null;
  anniversaryLabel: string | null;
  tags: ApiTag[];
  createdAt: string;
}

interface ApiRecommendationItem {
  rank: number;
  name: string;
  description: string;
  emoji: string;
}

interface ApiRecommendation {
  id: number;
  tagId: number;
  title: string;
  items: ApiRecommendationItem[];
}

function getDday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDday(dateStr: string): string {
  const diff = getDday(dateStr);
  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function SchedulePage() {
  const [scheduleList, setScheduleList] = useState<ApiSchedule[]>([]);
  const [allTags, setAllTags] = useState<ApiTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ApiSchedule | null>(null);
  const [selectedRec, setSelectedRec] = useState<ApiRecommendation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [schedulesData, tagsData] = await Promise.all([
        apiFetch<{ schedules: ApiSchedule[] }>("/azeyo/schedules"),
        apiFetch<{ tags: ApiTag[] }>("/azeyo/schedules/tags"),
      ]);
      setScheduleList(schedulesData.schedules);
      setAllTags(tagsData.tags);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = () => setShowAddDialog(true);
    window.addEventListener("header:create", handler);
    return () => window.removeEventListener("header:create", handler);
  }, []);

  // Fetch recommendation when schedule selected
  useEffect(() => {
    if (!selectedSchedule) { setSelectedRec(null); return; }
    const tagIds = selectedSchedule.tags.map(t => t.id).join(",");
    if (!tagIds) { setSelectedRec(null); return; }
    apiFetch<{ recommendations: ApiRecommendation[] }>(`/azeyo/schedules/recommendations?tagIds=${tagIds}`)
      .then(data => setSelectedRec(data.recommendations[0] ?? null))
      .catch(() => setSelectedRec(null));
  }, [selectedSchedule]);

  const sorted = [...scheduleList].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const upcoming = sorted.filter((s) => getDday(s.date) >= 0);
  const past = sorted.filter((s) => getDday(s.date) < 0);

  async function handleAddSchedule(title: string, date: string, tagIds: number[], repeatType: "NONE" | "YEARLY", startDate: string | null) {
    try {
      await apiFetch("/azeyo/schedules", {
        method: "POST",
        body: JSON.stringify({ title, date, memo: null, tagIds, repeatType, startDate }),
      });
      fetchData();
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <main className="pb-6 px-5">
        <div className="text-center py-16">
          <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="pb-6 px-5">

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-[13px] font-semibold text-muted-foreground mb-3">
            예정된 일정
          </h2>
          <div className="space-y-2.5">
            {upcoming.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onSelect={() => setSelectedSchedule(schedule)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-[13px] font-semibold text-muted-foreground mb-3">
            지난 일정
          </h2>
          <div className="space-y-2.5 opacity-60">
            {past.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16 animate-fade-up">
          <p className="text-[40px] mb-2">📅</p>
          <p className="text-[14px] text-muted-foreground">등록된 일정이 없어요</p>
          <p className="text-[12px] text-muted-foreground mt-1">상단 연필 버튼으로 일정을 등록해보세요!</p>
        </div>
      )}

      {/* Recommendation Detail Sheet */}
      {selectedSchedule && (
        <BottomSheet onClose={() => setSelectedSchedule(null)} className="max-h-[85dvh] overflow-y-auto" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
          <div className="px-6 pb-24">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold text-foreground">
                  {selectedSchedule.title}
                </h3>
                {selectedSchedule.anniversaryLabel && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {selectedSchedule.anniversaryLabel}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-bold text-primary">
                {formatDday(selectedSchedule.date)}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4">
              {selectedSchedule.date}
              {selectedSchedule.memo && ` · ${selectedSchedule.memo}`}
            </p>

            {selectedRec ? (
              <>
                <h4 className="text-[14px] font-bold text-foreground mb-3">
                  {selectedRec.title}
                </h4>
                <ol className="space-y-2.5">
                  {selectedRec.items.map((item) => (
                    <li
                      key={item.rank}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ backgroundColor: "hsl(36 30% 93%)" }}
                    >
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold text-primary"
                        style={{ backgroundColor: "hsl(40 30% 99%)" }}
                      >
                        {item.rank}
                      </span>
                      <span className="text-base">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-[13px] text-muted-foreground">
                  아직 추천 정보가 없어요
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedSchedule(null)}
              className="w-full mt-5 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
              style={{ backgroundColor: "hsl(40 30% 93%)" }}
            >
              닫기
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Add Schedule Dialog */}
      {showAddDialog && (
        <AddScheduleDialog
          allTags={allTags}
          onClose={() => setShowAddDialog(false)}
          onSubmit={(title, date, tagIds, repeatType, startDate) => {
            handleAddSchedule(title, date, tagIds, repeatType, startDate);
            setShowAddDialog(false);
          }}
        />
      )}
      </main>
    </>
  );
}

function ScheduleCard({
  schedule,
  onSelect,
}: {
  schedule: ApiSchedule;
  onSelect?: () => void;
}) {
  const dday = getDday(schedule.date);
  const isUrgent = dday >= 0 && dday <= 7;
  const isPast = dday < 0;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm transition-transform duration-200 active:scale-[0.98]"
      style={{ backgroundColor: "hsl(36 30% 93%)" }}
    >
      <div
        className={`
          flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center
          ${
            isUrgent
              ? "bg-primary text-primary-foreground"
              : isPast
              ? "bg-muted text-muted-foreground"
              : "bg-secondary text-primary"
          }
        `}
      >
        <span className="text-[10px] font-medium leading-none">
          {isPast ? "지남" : new Date(schedule.date).getMonth() + 1 + "월"}
        </span>
        <span className="text-[18px] font-black leading-tight">
          {isPast ? Math.abs(dday) : new Date(schedule.date).getDate()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-[14px] font-semibold text-foreground truncate">
            {schedule.title}
          </h3>
          {schedule.anniversaryLabel && (
            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
              {schedule.anniversaryLabel}
            </span>
          )}
          <span
            className={`flex-shrink-0 text-[11px] font-bold ${
              isUrgent ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {formatDday(schedule.date)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {schedule.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] px-2 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: tag.color + "18", color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        {schedule.memo && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {schedule.memo}
          </p>
        )}
      </div>

      {onSelect && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 text-muted-foreground opacity-40">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

function AddScheduleDialog({ allTags, onClose, onSubmit }: { allTags: ApiTag[]; onClose: () => void; onSubmit: (title: string, date: string, tagIds: number[], repeatType: "NONE" | "YEARLY", startDate: string | null) => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [repeatType, setRepeatType] = useState<"NONE" | "YEARLY">("NONE");
  const [startDate, setStartDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<ApiTag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const filteredTags = allTags.filter(
    (t) => t.name.includes(tagSearch) && !selectedTags.some((st) => st.id === t.id)
  );

  async function handleCreateTag() {
    try {
      const data = await apiFetch<{ id: number }>("/azeyo/schedules/tags", {
        method: "POST",
        body: JSON.stringify({ name: tagSearch, color: "#636e72" }),
      });
      const newTag: ApiTag = { id: data.id, name: tagSearch, color: "#636e72", isSystem: false };
      setSelectedTags((prev) => [...prev, newTag]);
      setTagSearch("");
      setShowTagDropdown(false);
    } catch {
      // silently fail
    }
  }

  return (
    <BottomSheet onClose={onClose} className="max-h-[85dvh] overflow-y-auto" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div className="px-6 pb-24">
        <h3 className="text-[18px] font-bold text-foreground mb-5">일정 등록</h3>

        <label className="block mb-4">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">일정 이름</span>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 아내 생일"
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none transition"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px hsl(22 60% 42% / 0.2)"; e.currentTarget.style.borderColor = "hsl(22 60% 42% / 0.4)"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "hsl(35 20% 90%)"; }}
          />
        </label>

        <label className="block mb-4">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">날짜</span>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition appearance-none min-h-[48px]"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)", WebkitAppearance: "none" }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px hsl(22 60% 42% / 0.2)"; e.currentTarget.style.borderColor = "hsl(22 60% 42% / 0.4)"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "hsl(35 20% 90%)"; }}
          />
        </label>

        {/* Repeat */}
        <div className="mb-4">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">반복 설정</span>
          <div className="flex gap-2">
            {([["NONE", "반복 없음"], ["YEARLY", "매년 반복"]] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setRepeatType(value)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  repeatType === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground active:scale-95"
                }`}
                style={repeatType !== value ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
          {repeatType === "YEARLY" && (
            <label className="block mt-3">
              <span className="text-[11px] text-muted-foreground block mb-1">최초 시작일 (몇 주년 계산용)</span>
              <input
                type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition appearance-none min-h-[48px]"
                style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)", WebkitAppearance: "none" }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px hsl(22 60% 42% / 0.2)"; e.currentTarget.style.borderColor = "hsl(22 60% 42% / 0.4)"; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "hsl(35 20% 90%)"; }}
              />
            </label>
          )}
        </div>

        <div className="mb-5">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">태그</span>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id))}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                  style={{ backgroundColor: tag.color + "20", color: tag.color }}
                >
                  {tag.name}
                  <span className="text-[9px] opacity-60">×</span>
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <input
              type="text" value={tagSearch}
              onChange={(e) => { setTagSearch(e.target.value); setShowTagDropdown(true); }}
              onFocus={(e) => { setShowTagDropdown(true); e.currentTarget.style.boxShadow = "0 0 0 2px hsl(22 60% 42% / 0.2)"; e.currentTarget.style.borderColor = "hsl(22 60% 42% / 0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "hsl(35 20% 90%)"; }}
              placeholder="태그 검색 또는 새로 만들기"
              className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none transition"
              style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)" }}
            />
            {showTagDropdown && (tagSearch || filteredTags.length > 0) && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto"
                style={{ backgroundColor: "hsl(40 30% 99%)", border: "1px solid hsl(35 20% 90%)" }}
              >
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => { setSelectedTags((prev) => [...prev, tag]); setTagSearch(""); setShowTagDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2 transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "hsl(36 30% 93%)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="text-foreground">{tag.name}</span>
                    {tag.isSystem && <span className="text-[9px] text-muted-foreground ml-auto">시스템</span>}
                  </button>
                ))}
                {tagSearch && !allTags.some((t) => t.name === tagSearch) && (
                  <button
                    onClick={handleCreateTag}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-primary font-medium transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "hsl(36 30% 93%)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    &ldquo;{tagSearch}&rdquo; 새 태그 만들기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform" style={{ backgroundColor: "hsl(40 30% 93%)" }}>
            취소
          </button>
          <button
            onClick={() => { if (title && date) onSubmit(title, date, selectedTags.map(t => t.id), repeatType, repeatType === "YEARLY" && startDate ? startDate : null); }}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            등록하기
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
