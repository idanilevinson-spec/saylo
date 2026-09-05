"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import StatusBadge from "@/components/admin/StatusBadge";
import type { CefrLevel, ContentStatus, Topic, VocabularyItem } from "@/types/database";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const STATUSES: ContentStatus[] = ["draft", "ai_generated_pending_review", "published"];

type TopicForm = Pick<Topic, "slug" | "name_he" | "name_en" | "cefr_level" | "status">;
const emptyTopicForm: TopicForm = { slug: "", name_he: "", name_en: "", cefr_level: "A1", status: "draft" };

type ItemForm = Pick<
  VocabularyItem,
  "headword" | "ipa" | "part_of_speech" | "translation_he" | "example_en" | "cefr_level" | "status"
>;
const emptyItemForm: ItemForm = {
  headword: "",
  ipa: "",
  part_of_speech: "",
  translation_he: "",
  example_en: "",
  cefr_level: "A1",
  status: "draft",
};

export default function AdminVocabularyPage() {
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [items, setItems] = useState<VocabularyItem[] | null>(null);

  const [topicEditingId, setTopicEditingId] = useState<string | null | "new">(null);
  const [topicForm, setTopicForm] = useState<TopicForm>(emptyTopicForm);

  const [itemEditingId, setItemEditingId] = useState<string | null | "new">(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopicId) loadItems(selectedTopicId);
  }, [selectedTopicId]);

  async function loadTopics() {
    const { data } = await supabase.from("topics").select("*").order("sort_order");
    setTopics(data ?? []);
  }

  async function loadItems(topicId: string) {
    const { data } = await supabase
      .from("vocabulary_items")
      .select("*")
      .eq("topic_id", topicId)
      .order("sort_order");
    setItems(data ?? []);
  }

  function startEditTopic(topic: Topic) {
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
      await supabase.from("topics").insert(topicForm);
    } else if (topicEditingId) {
      await supabase.from("topics").update(topicForm).eq("id", topicEditingId);
    }
    setTopicEditingId(null);
    await loadTopics();
  }

  async function deleteTopic(topic: Topic) {
    if (!window.confirm(`למחוק את הנושא "${topic.name_he}"? כל המילים בנושא יימחקו גם הן.`)) return;
    await supabase.from("topics").delete().eq("id", topic.id);
    if (selectedTopicId === topic.id) setSelectedTopicId(null);
    await loadTopics();
  }

  function startEditItem(item: VocabularyItem) {
    setItemForm({
      headword: item.headword,
      ipa: item.ipa ?? "",
      part_of_speech: item.part_of_speech ?? "",
      translation_he: item.translation_he,
      example_en: item.example_en,
      cefr_level: item.cefr_level,
      status: item.status,
    });
    setItemEditingId(item.id);
  }

  function startNewItem() {
    const topic = topics?.find((t) => t.id === selectedTopicId);
    setItemForm({ ...emptyItemForm, cefr_level: topic?.cefr_level ?? "A1" });
    setItemEditingId("new");
  }

  async function saveItem() {
    if (!selectedTopicId) return;
    const payload = { ...itemForm, ipa: itemForm.ipa || null, part_of_speech: itemForm.part_of_speech || null };
    if (itemEditingId === "new") {
      await supabase.from("vocabulary_items").insert({ ...payload, topic_id: selectedTopicId });
    } else if (itemEditingId) {
      await supabase.from("vocabulary_items").update(payload).eq("id", itemEditingId);
    }
    setItemEditingId(null);
    await loadItems(selectedTopicId);
  }

  async function deleteItem(item: VocabularyItem) {
    if (!window.confirm(`למחוק את המילה "${item.headword}"?`)) return;
    await supabase.from("vocabulary_items").delete().eq("id", item.id);
    if (selectedTopicId) await loadItems(selectedTopicId);
  }

  const selectedTopic = topics?.find((t) => t.id === selectedTopicId) ?? null;

  return (
    <div className="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">נושאים</h2>
          <button onClick={startNewTopic} className="text-sm text-primary font-medium hover:underline">
            + נושא חדש
          </button>
        </div>

        {topicEditingId && (
          <TopicFormFields form={topicForm} setForm={setTopicForm} onSave={saveTopic} onCancel={() => setTopicEditingId(null)} />
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
          <p className="text-muted">בחרו נושא מהרשימה כדי לנהל את המילים בו.</p>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">מילים בנושא: {selectedTopic.name_he}</h2>
              <button onClick={startNewItem} className="text-sm text-primary font-medium hover:underline">
                + מילה חדשה
              </button>
            </div>

            {itemEditingId && (
              <ItemFormFields form={itemForm} setForm={setItemForm} onSave={saveItem} onCancel={() => setItemEditingId(null)} />
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-right text-muted border-b border-card-border">
                    <th className="py-2 pe-4 font-medium">מילה</th>
                    <th className="py-2 pe-4 font-medium">תרגום</th>
                    <th className="py-2 pe-4 font-medium">רמה</th>
                    <th className="py-2 pe-4 font-medium">סטטוס</th>
                    <th className="py-2 pe-4 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {(items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-card-border last:border-0">
                      <td className="py-2.5 pe-4 font-medium">{item.headword}</td>
                      <td className="py-2.5 pe-4">{item.translation_he}</td>
                      <td className="py-2.5 pe-4">{item.cefr_level}</td>
                      <td className="py-2.5 pe-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-2.5 pe-4">
                        <div className="flex gap-3 text-xs">
                          <button onClick={() => startEditItem(item)} className="text-primary hover:underline">
                            עריכה
                          </button>
                          <button onClick={() => deleteItem(item)} className="text-danger hover:underline">
                            מחיקה
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items && items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted">
                        אין עדיין מילים בנושא זה.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicFormFields({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: TopicForm;
  setForm: (f: TopicForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 p-3 rounded-lg bg-background-2 space-y-2">
      <input
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        placeholder="slug (למשל: animals)"
        dir="ltr"
        className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
      />
      <input
        value={form.name_he}
        onChange={(e) => setForm({ ...form, name_he: e.target.value })}
        placeholder="שם בעברית"
        className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
      />
      <input
        value={form.name_en}
        onChange={(e) => setForm({ ...form, name_en: e.target.value })}
        placeholder="Name in English"
        dir="ltr"
        className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
      />
      <div className="flex gap-2">
        <select
          aria-label="רמת CEFR"
          value={form.cefr_level}
          onChange={(e) => setForm({ ...form, cefr_level: e.target.value as CefrLevel })}
          className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          aria-label="סטטוס"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}
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
        <button onClick={onSave} className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm font-medium">
          שמירה
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-card-border text-sm">
          ביטול
        </button>
      </div>
    </div>
  );
}

function ItemFormFields({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: ItemForm;
  setForm: (f: ItemForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 p-3 rounded-lg bg-background-2 space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          value={form.headword}
          onChange={(e) => setForm({ ...form, headword: e.target.value })}
          placeholder="Word"
          dir="ltr"
          className="px-2 py-1.5 rounded border border-card-border bg-card text-sm"
        />
        <input
          value={form.ipa ?? ""}
          onChange={(e) => setForm({ ...form, ipa: e.target.value })}
          placeholder="IPA (אופציונלי)"
          dir="ltr"
          className="px-2 py-1.5 rounded border border-card-border bg-card text-sm"
        />
      </div>
      <input
        value={form.translation_he}
        onChange={(e) => setForm({ ...form, translation_he: e.target.value })}
        placeholder="תרגום לעברית"
        className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
      />
      <input
        value={form.example_en}
        onChange={(e) => setForm({ ...form, example_en: e.target.value })}
        placeholder="Example sentence"
        dir="ltr"
        className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
      />
      <input
        value={form.part_of_speech ?? ""}
        onChange={(e) => setForm({ ...form, part_of_speech: e.target.value })}
        placeholder="חלק דיבר (אופציונלי, למשל noun)"
        dir="ltr"
        className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
      />
      <div className="flex gap-2">
        <select
          aria-label="רמת CEFR"
          value={form.cefr_level}
          onChange={(e) => setForm({ ...form, cefr_level: e.target.value as CefrLevel })}
          className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          aria-label="סטטוס"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}
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
        <button onClick={onSave} className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm font-medium">
          שמירה
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-card-border text-sm">
          ביטול
        </button>
      </div>
    </div>
  );
}
