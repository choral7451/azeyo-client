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
  calendarType: "SOLAR" | "LUNAR";
  startDate: string | null;
  alarmTimes: string[] | null;
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

function formatAlarmLabel(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}시${m !== "00" ? ` ${m}분` : ""}`;
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
  const [editingSchedule, setEditingSchedule] = useState<ApiSchedule | null>(null);

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

  async function handleAddSchedule(title: string, date: string, tagIds: number[], repeatType: "NONE" | "YEARLY", calendarType: "SOLAR" | "LUNAR", startDate: string | null, alarmTimes: string[] | null) {
    try {
      await apiFetch("/azeyo/schedules", {
        method: "POST",
        body: JSON.stringify({ title, date, memo: null, tagIds, repeatType, calendarType, startDate, alarmTimes }),
      });
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleDeleteSchedule(scheduleId: number) {
    try {
      await apiFetch(`/azeyo/schedules/${scheduleId}`, { method: "DELETE" });
      setSelectedSchedule(null);
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleUpdateSchedule(scheduleId: number, title: string, date: string, tagIds: number[], repeatType: "NONE" | "YEARLY", calendarType: "SOLAR" | "LUNAR", startDate: string | null, alarmTimes: string[] | null) {
    try {
      await apiFetch(`/azeyo/schedules/${scheduleId}`, {
        method: "PUT",
        body: JSON.stringify({ title, date, memo: null, tagIds, repeatType, calendarType, startDate, alarmTimes }),
      });
      setEditingSchedule(null);
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
              <ScheduleCard key={schedule.id} schedule={schedule} onSelect={() => setSelectedSchedule(schedule)} />
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
        <BottomSheet onClose={() => setSelectedSchedule(null)} className="" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
          <div className="flex-1 overflow-y-auto px-6 pb-24">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold text-foreground">
                  {selectedSchedule.title}
                </h3>
                {selectedSchedule.calendarType === "LUNAR" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "hsl(260 40% 95%)", color: "hsl(260 40% 50%)" }}>
                    음력
                  </span>
                )}
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
              {selectedSchedule.repeatType === "YEARLY" && selectedSchedule.startDate
                ? `시작일 ${selectedSchedule.startDate} · 매년 반복`
                : selectedSchedule.date}
              {selectedSchedule.memo && ` · ${selectedSchedule.memo}`}
            </p>

            {selectedSchedule.alarmTimes && selectedSchedule.alarmTimes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedSchedule.alarmTimes.map((alarm, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: "hsl(22 60% 42% / 0.1)", color: "hsl(22 60% 42%)" }}>
                    {formatAlarmLabel(alarm)}
                  </span>
                ))}
              </div>
            )}

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

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  if (confirm("이 일정을 삭제할까요?")) {
                    handleDeleteSchedule(selectedSchedule.id);
                  }
                }}
                className="flex-1 py-3 rounded-xl text-red-500 text-[14px] font-semibold active:scale-[0.98] transition-transform"
                style={{ backgroundColor: "hsl(0 80% 95%)" }}
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setEditingSchedule(selectedSchedule);
                  setSelectedSchedule(null);
                }}
                className="flex-1 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
                style={{ backgroundColor: "hsl(40 30% 93%)" }}
              >
                수정
              </button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Add Schedule Dialog */}
      {showAddDialog && (
        <AddScheduleDialog
          allTags={allTags}
          onClose={() => setShowAddDialog(false)}
          onSubmit={(title, date, tagIds, repeatType, calendarType, startDate, alarmTimes) => {
            handleAddSchedule(title, date, tagIds, repeatType, calendarType, startDate, alarmTimes);
            setShowAddDialog(false);
          }}
        />
      )}

      {/* Edit Schedule Dialog */}
      {editingSchedule && (
        <AddScheduleDialog
          allTags={allTags}
          initialData={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSubmit={(title, date, tagIds, repeatType, calendarType, startDate, alarmTimes) => {
            handleUpdateSchedule(editingSchedule.id, title, date, tagIds, repeatType, calendarType, startDate, alarmTimes);
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
          {schedule.alarmTimes && schedule.alarmTimes.length > 0 && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(22 60% 42%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          )}
          {schedule.calendarType === "LUNAR" && (
            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "hsl(260 40% 95%)", color: "hsl(260 40% 50%)" }}>
              음력
            </span>
          )}
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

function AddScheduleDialog({ allTags, initialData, onClose, onSubmit }: { allTags: ApiTag[]; initialData?: ApiSchedule; onClose: () => void; onSubmit: (title: string, date: string, tagIds: number[], repeatType: "NONE" | "YEARLY", calendarType: "SOLAR" | "LUNAR", startDate: string | null, alarmTimes: string[] | null) => void }) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [repeatType, setRepeatType] = useState<"NONE" | "YEARLY">(initialData?.repeatType ?? "NONE");
  const [calendarType, setCalendarType] = useState<"SOLAR" | "LUNAR">(initialData?.calendarType ?? "SOLAR");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set(initialData?.tags.map(t => t.id) ?? []));
  const [alarmTimes, setAlarmTimes] = useState<string[]>(initialData?.alarmTimes ?? []);

  function toggleTag(tagId: number) {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  return (
    <BottomSheet onClose={onClose} className="" style={{ backgroundColor: "hsl(40 30% 99%)" }}>
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <h3 className="text-[18px] font-bold text-foreground mb-5">{isEdit ? "일정 수정" : "일정 등록"}</h3>

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
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">
            {repeatType === "YEARLY" ? "최초 날짜 (매년 이 날짜에 반복)" : "날짜"}
          </span>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-foreground outline-none transition appearance-none min-h-[48px]"
            style={{ backgroundColor: "hsl(36 30% 93%)", border: "1px solid hsl(35 20% 90%)", WebkitAppearance: "none" }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px hsl(22 60% 42% / 0.2)"; e.currentTarget.style.borderColor = "hsl(22 60% 42% / 0.4)"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "hsl(35 20% 90%)"; }}
          />
          {repeatType === "YEARLY" && date && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              매년 {new Date(date + "T00:00:00").getMonth() + 1}월 {new Date(date + "T00:00:00").getDate()}일에 반복됩니다
            </p>
          )}
        </label>

        {/* Calendar Type */}
        <div className="mb-4">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">달력 유형</span>
          <div className="flex gap-2">
            {([["SOLAR", "양력"], ["LUNAR", "음력"]] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setCalendarType(value)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  calendarType === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground active:scale-95"
                }`}
                style={calendarType !== value ? { backgroundColor: "hsl(36 30% 93%)" } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

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
        </div>

        <div className="mb-5">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">태그</span>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTagIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`text-[12px] px-3 py-1.5 rounded-full font-medium transition-all active:scale-95 ${
                    isSelected ? "text-white" : ""
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: tag.color, color: "white" }
                      : { backgroundColor: tag.color + "18", color: tag.color }
                  }
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alarm Times */}
        <div className="mb-5">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">알람 (최대 2개)</span>
          <div className="space-y-2">
            {alarmTimes.map((time, idx) => {
              const [h, m] = time.split(":");
              const hour = parseInt(h);
              const isPM = hour >= 12;
              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              return (
                <div key={idx} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: "hsl(36 30% 93%)" }}>
                  <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid hsl(35 20% 88%)" }}>
                    <button
                      onClick={() => { const next = [...alarmTimes]; const nh = isPM ? hour - 12 : hour; next[idx] = `${String(nh < 0 ? 0 : nh).padStart(2, "0")}:${m}`; setAlarmTimes(next); }}
                      className="px-2.5 py-1 text-[11px] font-semibold transition-all"
                      style={!isPM ? { backgroundColor: "hsl(22 60% 42%)", color: "white" } : { color: "hsl(30 10% 45%)" }}
                    >오전</button>
                    <button
                      onClick={() => { const next = [...alarmTimes]; const nh = isPM ? hour : hour + 12; next[idx] = `${String(nh >= 24 ? 12 : nh).padStart(2, "0")}:${m}`; setAlarmTimes(next); }}
                      className="px-2.5 py-1 text-[11px] font-semibold transition-all"
                      style={isPM ? { backgroundColor: "hsl(22 60% 42%)", color: "white" } : { color: "hsl(30 10% 45%)" }}
                    >오후</button>
                  </div>
                  <select
                    value={displayHour}
                    onChange={(e) => { const next = [...alarmTimes]; let nh = parseInt(e.target.value); if (isPM) nh = nh === 12 ? 12 : nh + 12; else nh = nh === 12 ? 0 : nh; next[idx] = `${String(nh).padStart(2, "0")}:${m}`; setAlarmTimes(next); }}
                    className="w-14 text-center text-[15px] font-bold text-foreground bg-transparent outline-none appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(v => (<option key={v} value={v}>{v}</option>))}
                  </select>
                  <span className="text-[15px] font-bold text-muted-foreground">:</span>
                  <select
                    value={parseInt(m)}
                    onChange={(e) => { const next = [...alarmTimes]; next[idx] = `${h}:${String(e.target.value).padStart(2, "0")}`; setAlarmTimes(next); }}
                    className="w-14 text-center text-[15px] font-bold text-foreground bg-transparent outline-none appearance-none"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(v => (<option key={v} value={v}>{String(v).padStart(2, "0")}</option>))}
                  </select>
                  <div className="flex-1" />
                  <button
                    onClick={() => setAlarmTimes(alarmTimes.filter((_, i) => i !== idx))}
                    className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-all"
                    style={{ color: "hsl(0 40% 55%)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              );
            })}
            {alarmTimes.length < 2 && (
              <button
                onClick={() => setAlarmTimes([...alarmTimes, "09:00"])}
                className="w-full py-2.5 rounded-xl text-[13px] font-medium text-primary active:scale-[0.98] transition-all"
                style={{ backgroundColor: "hsl(22 60% 42% / 0.08)" }}
              >
                + 알람 추가
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform" style={{ backgroundColor: "hsl(40 30% 93%)" }}>
            취소
          </button>
          <button
            onClick={() => { if (title && date) onSubmit(title, date, Array.from(selectedTagIds), repeatType, calendarType, repeatType === "YEARLY" ? date : null, alarmTimes.length > 0 ? alarmTimes : null); }}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            {isEdit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
