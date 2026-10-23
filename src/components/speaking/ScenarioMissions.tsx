"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { cleanObjectives, type ScenarioObjective } from "@/lib/ai/conversationGoals";
import { doneFrom } from "@/lib/ai/scenarioObjectives";

// A role-play's missions and which are done. Read again whenever the
// conversation moves on (`turn`), since the teacher ticks them on the server
// as it replies. Before seed 053 the columns don't exist: the queries fail
// and there are simply no missions.
export function useScenarioMissions(conversationId: string, turn: number) {
  const [objectives, setObjectives] = useState<ScenarioObjective[]>([]);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: conv } = await supabase.from("conversations").select("scenario_id").eq("id", conversationId).maybeSingle();
      if (!conv?.scenario_id) return;
      const { data: scenario, error } = await supabase
        .from("conversation_scenarios")
        .select("objectives")
        .eq("id", conv.scenario_id)
        .maybeSingle();
      if (live && !error) setObjectives(cleanObjectives((scenario as { objectives?: unknown } | null)?.objectives));
    })();
    return () => {
      live = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!objectives.length) return;
    let live = true;
    supabase
      .from("conversations")
      .select("objectives_done")
      .eq("id", conversationId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (live && !error) setDone(doneFrom((data as { objectives_done?: unknown } | null)?.objectives_done));
      });
    return () => {
      live = false;
    };
  }, [conversationId, objectives.length, turn]);

  return { objectives, done };
}

export default function ScenarioMissions({ objectives, done }: { objectives: ScenarioObjective[]; done: number[] }) {
  if (!objectives.length) return null;
  const allDone = objectives.every((_, i) => done.includes(i));
  return (
    <section aria-label="המשימות בשיחה" className="mb-3 rounded-lg border border-card-border bg-card px-3 py-2">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {objectives.map((o, i) => {
          const isDone = done.includes(i);
          return (
            <li key={i} className={`flex items-center gap-1.5 ${isDone ? "text-success" : "text-muted"}`}>
              {isDone ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
              <span>{o.he}</span>
              <span className="sr-only">{isDone ? "(בוצע)" : "(עוד לא)"}</span>
            </li>
          );
        })}
      </ul>
      {allDone && (
        <p className="mt-1.5 text-sm text-foreground" aria-live="polite">
          השלמתם את כל המשימות. אפשר להמשיך לדבר או לסיים ולקבל סיכום.
        </p>
      )}
    </section>
  );
}
