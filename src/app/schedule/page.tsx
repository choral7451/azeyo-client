"use client";

import { useState } from "react";
import { ScrollHeader } from "@/components/scroll-header";
import {
  schedules as initialSchedules,
  allTags,
  formatDday,
  getDday,
  recommendations,
  type Schedule,
  type ScheduleTag,
} from "@/data/mock";

export default function SchedulePage() {
  const [scheduleList] = useState<Schedule[]>(initialSchedules);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const sorted = [...scheduleList].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const upcoming = sorted.filter((s) => getDday(s.date) >= 0);
  const past = sorted.filter((s) => getDday(s.date) < 0);

  const selectedRec = selectedSchedule
    ? recommendations.find((r) =>
        selectedSchedule.tags.some((t) => t.id === r.tagId)
      )
    : null;

  return (
    <>
      <ScrollHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-black tracking-tight text-foreground leading-none">
            일정 관리
          </h1>
          <button
            onClick={() => setShowAddDialog(true)}
            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-light active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </ScrollHeader>
      <main className="pt-4 pb-6 px-5">
        {/* Header */}
        <header className="mb-5 animate-fade-up flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-black tracking-tight text-foreground">
              일정 관리
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              중요한 날을 놓치지 마세요
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="mt-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-light shadow-sm active:scale-90 transition-transform"
          >
            +
          </button>
        </header>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-[13px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">
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
          <h2 className="text-[13px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">
            지난 일정
          </h2>
          <div className="space-y-2.5 opacity-60">
            {past.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendation Detail Sheet */}
      {selectedSchedule && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          onClick={() => setSelectedSchedule(null)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[480px] bg-background rounded-t-3xl p-6 pb-24 animate-fade-up shadow-2xl max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 sticky top-0" />
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[18px] font-bold text-foreground">
                {selectedSchedule.title}
              </h3>
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
                      className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-background flex items-center justify-center text-[12px] font-bold text-primary">
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
              className="w-full mt-5 py-3 rounded-xl bg-secondary text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Add Schedule Dialog */}
      {showAddDialog && (
        <AddScheduleDialog onClose={() => setShowAddDialog(false)} />
      )}
      </main>
    </>
  );
}

function ScheduleCard({
  schedule,
  onSelect,
}: {
  schedule: Schedule;
  onSelect?: () => void;
}) {
  const dday = getDday(schedule.date);
  const isUrgent = dday >= 0 && dday <= 7;
  const isPast = dday < 0;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-card border border-border rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm transition-transform duration-200 active:scale-[0.98]"
    >
      {/* D-day badge */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-[14px] font-semibold text-foreground truncate">
            {schedule.title}
          </h3>
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

      {/* Arrow */}
      {onSelect && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="flex-shrink-0 text-muted-foreground opacity-40"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

function AddScheduleDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<ScheduleTag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const filteredTags = allTags.filter(
    (t) =>
      t.name.includes(tagSearch) &&
      !selectedTags.some((st) => st.id === t.id)
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-background rounded-t-3xl p-6 pb-24 animate-fade-up shadow-2xl max-h-[85dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-[18px] font-bold text-foreground mb-5">
          일정 등록
        </h3>

        {/* Title */}
        <label className="block mb-4">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">
            일정 이름
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 아내 생일"
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </label>

        {/* Date */}
        <label className="block mb-4">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">
            날짜
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </label>

        {/* Tags */}
        <div className="mb-5">
          <span className="text-[12px] font-semibold text-muted-foreground block mb-1.5">
            태그
          </span>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id))
                  }
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
              type="text"
              value={tagSearch}
              onChange={(e) => {
                setTagSearch(e.target.value);
                setShowTagDropdown(true);
              }}
              onFocus={() => setShowTagDropdown(true)}
              placeholder="태그 검색 또는 새로 만들기"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            {showTagDropdown && (tagSearch || filteredTags.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSelectedTags((prev) => [...prev, tag]);
                      setTagSearch("");
                      setShowTagDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2 hover:bg-secondary transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-foreground">{tag.name}</span>
                    {tag.isSystem && (
                      <span className="text-[9px] text-muted-foreground ml-auto">
                        시스템
                      </span>
                    )}
                  </button>
                ))}
                {tagSearch &&
                  !allTags.some((t) => t.name === tagSearch) && (
                    <button
                      onClick={() => {
                        const newTag: ScheduleTag = {
                          id: `custom-${Date.now()}`,
                          name: tagSearch,
                          color: "#636e72",
                          isSystem: false,
                        };
                        setSelectedTags((prev) => [...prev, newTag]);
                        setTagSearch("");
                        setShowTagDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-primary font-medium hover:bg-secondary transition-colors"
                    >
                      &ldquo;{tagSearch}&rdquo; 새 태그 만들기
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
