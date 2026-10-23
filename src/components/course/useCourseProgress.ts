"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getCourseProgress, type CourseProgress } from "@/lib/content/courseProgress";

// null while loading.
export function useCourseProgress(): CourseProgress | null {
  const { profile } = useAuth();
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    if (!profile) return;
    let live = true;
    getCourseProgress(profile.id).then((p) => {
      if (live) setProgress(p);
    });
    return () => {
      live = false;
    };
  }, [profile]);

  return progress;
}
