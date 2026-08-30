"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import StatusBadge from "@/components/admin/StatusBadge";
import type { CefrLevel, ContentStatus, GrammarLesson, GrammarTopic } from "@/types/database";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const STATUSES: ContentStatus[] = ["draft", "ai_generated_pending_review", "published"];

type TopicForm = Pick<GrammarTopic, "slug" | "name_he" | "name_en" | "cefr_level" | "status">;
const emptyTopicForm: TopicForm = { slug: "", name_he: "", name_en: "", cefr_level: "A1", status: "draft" };

type LessonForm = Pick<GrammarLesson, "title_he" | "body_md" | "cefr_level" | "status">;
const emptyLessonForm: LessonForm = { title_he: "", body_md: "", cefr_level: "A1", status: "draft" };

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopic[] | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<GrammarLesson[] | null>(null);

  const [topicEditingId, setTopicEditingId] = useState<string | null | "new">(null);
  const [topicForm, setTopicForm] = useState<TopicForm>(emptyTopicForm);

  const [lessonEditingId, setLessonEditingId] = useState<string | null | "new">(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopicId) loadLessons(selectedTopicId);
  }, [selectedTopicId]);

  async function loadTopics() {
    const { data } = await supabase.from("grammar_topics").select("*").order("sort_order");
    setTopics(data ?? []);
  }

  async function loadLessons(topicId: string) {
    const { data } = await supabase
      .from("grammar_lessons")
      .select("*")
      .eq("grammar_topic_id", topicId)
      .order("sort_order");
    setLessons(data ?? []);
  }

  function startEditTopic(topic: GrammarTopic) {
    setTopicForm({
      slug: topic.slug,
      name_he: topic.name_he,
      name_en: topic.name_en,
      cefr_level: topic.cefr_level,
      status: topic.status,
    });
    setTopicEditingId(topic.id);
  }

  function startNewTopic() {
    setTopicForm(emptyTopicForm);
    setTopicEditingId("new");
  }

  async function saveTopic() {
    if (topicEditingId === "new") {
      await supabase.from("grammar_topics").insert(topicForm);
    } else if (topicEditingId) {
      await supabase.from("grammar_topics").update(topicForm).eq("id", topicEditingId);
    }
    setTopicEditingId(null);
    await loadTopics();
  }

  async function deleteTopic(topic: GrammarTopic) {
    if (!window.confirm(`למחוק את הנושא "${topic.name_he}"? כל השיעורים בנושא יימחקו גם הם.`)) return;
    await supabase.from("grammar_topics").delete().eq("id", topic.id);
    if (selectedTopicId === topic.id) setSelectedTopicId(null);
    await loadTopics();
  }

  function startEditLesson(lesson: GrammarLesson) {
    setLessonForm({
      title_he: lesson.title_he,
      body_md: lesson.body_md,
      cefr_level: lesson.cefr_level,
      status: lesson.status,
    });
    setLessonEditingId(lesson.id);
  }

  function startNewLesson() {
    const topic = topics?.find((t) => t.id === selectedTopicId);
    setLessonForm({ ...emptyLessonForm, cefr_level: topic?.cefr_level ?? "A1" });
    setLessonEditingId("new");
  }

  async function saveLesson() {
    if (!selectedTopicId) return;
    if (lessonEditingId === "new") {
      await supabase.from("grammar_lessons").insert({ ...lessonForm, grammar_topic_id: selectedTopicId });
    } else if (lessonEditingId) {
      await supabase.from("grammar_lessons").update(lessonForm).eq("id", lessonEditingId);
    }
    setLessonEditingId(null);
    await loadLessons(selectedTopicId);
  }

  async function deleteLesson(lesson: GrammarLesson) {
    if (!window.confirm(`למחוק את השיעור "${lesson.title_he}"?`)) return;
    await supabase.from("grammar_lessons").delete().eq("id", lesson.id);
    if (selectedTopicId) await loadLessons(selectedTopicId);
  }

  const selectedTopic = topics?.find((t) => t.id === selectedTopicId) ?? null;

  return (
    <div className="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">נושאי דקדוק</h2>
          <button onClick={startNewTopic} className="text-sm text-primary font-medium hover:underline">
            + נושא חדש
          </button>
        </div>

        {topicEditingId && (
          <div className="mt-3 p-3 rounded-lg bg-background-2 space-y-2">
            <input
              value={topicForm.slug}
              onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })}
              placeholder="slug (למשל: present-simple)"
              dir="ltr"
              className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            />
            <input
              value={topicForm.name_he}
              onChange={(e) => setTopicForm({ ...topicForm, name_he: e.target.value })}
              placeholder="שם בעברית"
              className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            />
            <input
              value={topicForm.name_en}
              onChange={(e) => setTopicForm({ ...topicForm, name_en: e.target.value })}
              placeholder="Name in English"
              dir="ltr"
              className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            />
            <div className="flex gap-2">
              <select
                value={topicForm.cefr_level}
                onChange={(e) => setTopicForm({ ...topicForm, cefr_level: e.target.value as CefrLevel })}
                className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
              >
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                value={topicForm.status}
                onChange={(e) => setTopicForm({ ...topicForm, status: e.target.value as ContentStatus })}
                className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={saveTopic} className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm font-medium">
                שמירה
              </button>
              <button onClick={() => setTopicEditingId(null)} className="px-3 py-1.5 rounded-lg border border-card-border text-sm">
                ביטול
              </button>
            </div>
          </div>
        )}

        <ul className="mt-3 space-y-1">
          {(topics ?? []).map((topic) => (
            <li key={topic.id}>
              <button
                onClick={() => setSelectedTopicId(topic.id)}
                className={`w-full text-right px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 transition-colors ${
                  selectedTopicId === topic.id ? "bg-primary text-primary-ink" : "hover:bg-background-2"
                }`}
              >
                <span>{topic.name_he}</span>
                <span className="text-xs opacity-80">{topic.cefr_level}</span>
              </button>
              {selectedTopicId === topic.id && (
                <div className="flex gap-3 px-3 py-1 text-xs">
                  <button onClick={() => startEditTopic(topic)} className="text-primary hover:underline">
                    עריכה
                  </button>
                  <button onClick={() => deleteTopic(topic)} className="text-danger hover:underline">
                    מחיקה
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {!selectedTopic ? (
          <p className="text-muted">בחרו נושא מהרשימה כדי לנהל את השיעורים בו.</p>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">שיעורים בנושא: {selectedTopic.name_he}</h2>
              <button onClick={startNewLesson} className="text-sm text-primary font-medium hover:underline">
                + שיעור חדש
              </button>
            </div>

            {lessonEditingId && (
              <div className="mt-3 p-3 rounded-lg bg-background-2 space-y-2">
                <input
                  value={lessonForm.title_he}
                  onChange={(e) => setLessonForm({ ...lessonForm, title_he: e.target.value })}
                  placeholder="כותרת השיעור"
                  className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
                />
                <textarea
                  value={lessonForm.body_md}
                  onChange={(e) => setLessonForm({ ...lessonForm, body_md: e.target.value })}
                  placeholder="תוכן השיעור (Markdown)"
                  rows={6}
                  className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm font-mono"
                />
                <div className="flex gap-2">
                  <select
                    value={lessonForm.cefr_level}
                    onChange={(e) => setLessonForm({ ...lessonForm, cefr_level: e.target.value as CefrLevel })}
                    className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
                  >
                    {CEFR_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <select
                    value={lessonForm.status}
                    onChange={(e) => setLessonForm({ ...lessonForm, status: e.target.value as ContentStatus })}
                    className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveLesson} className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm font-medium">
                    שמירה
                  </button>
                  <button onClick={() => setLessonEditingId(null)} className="px-3 py-1.5 rounded-lg border border-card-border text-sm">
                    ביטול
                  </button>
                </div>
              </div>
            )}

            <ul className="mt-4 space-y-2">
              {(lessons ?? []).map((lesson) => (
                <li
                  key={lesson.id}
                  className="p-3 rounded-lg border border-card-border flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">{lesson.title_he}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted">{lesson.cefr_level}</span>
                      <StatusBadge status={lesson.status} />
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs shrink-0">
                    <button onClick={() => startEditLesson(lesson)} className="text-primary hover:underline">
                      עריכה
                    </button>
                    <button onClick={() => deleteLesson(lesson)} className="text-danger hover:underline">
                      מחיקה
                    </button>
                  </div>
                </li>
              ))}
              {lessons && lessons.length === 0 && <p className="text-muted text-sm">אין עדיין שיעורים בנושא זה.</p>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
