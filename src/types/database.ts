export type AgeBand = "child" | "teen" | "adult";

export type ParentalConsentStatus = "not_required" | "pending" | "granted" | "denied";

export interface Profile {
  id: string;
  display_name: string;
  age: number;
  age_band: AgeBand;
  native_language: string;
  parental_consent_status: ParentalConsentStatus;
  is_admin: boolean;
  email_reminders_enabled: boolean;
  push_reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuardianLink {
  id: string;
  minor_profile_id: string;
  guardian_email: string;
  consent_token: string | null;
  status: ParentalConsentStatus;
  resolved_at: string | null;
  created_at: string;
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ContentStatus = "draft" | "ai_generated_pending_review" | "published";

export type ConversationTopicCategory =
  | "daily_life"
  | "social"
  | "travel"
  | "work_professional"
  | "academic"
  | "health_wellbeing"
  | "serious_topics"
  | "entertainment_culture";

export type SkillArea = "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking";

export type LearningPathNodeType = "vocabulary_topic" | "grammar_topic";

export interface Topic {
  id: string;
  slug: string;
  name_he: string;
  name_en: string;
  cefr_level: CefrLevel;
  sort_order: number;
  status: ContentStatus;
  created_at: string;
}

export interface VocabularyItem {
  id: string;
  topic_id: string;
  headword: string;
  ipa: string | null;
  part_of_speech: string | null;
  translation_he: string;
  example_en: string;
  cefr_level: CefrLevel;
  sort_order: number;
  status: ContentStatus;
  created_at: string;
  definition_en: string | null;
}

export interface GrammarTopic {
  id: string;
  slug: string;
  name_he: string;
  name_en: string;
  cefr_level: CefrLevel;
  sort_order: number;
  status: ContentStatus;
  created_at: string;
}

export interface GrammarLesson {
  id: string;
  grammar_topic_id: string;
  title_he: string;
  body_md: string;
  cefr_level: CefrLevel;
  sort_order: number;
  status: ContentStatus;
  created_at: string;
}

export interface LearningPathNode {
  id: string;
  node_type: LearningPathNodeType;
  ref_id: string;
  cefr_level: CefrLevel;
  sort_order: number;
  created_at: string;
}

export interface UserLearningPathProgress {
  profile_id: string;
  node_id: string;
  status: "not_started" | "in_progress" | "completed";
  updated_at: string;
}

export interface SkillLevel {
  profile_id: string;
  skill: SkillArea;
  cefr_level: CefrLevel;
  updated_at: string;
}

export type ExerciseType = "mcq" | "fill_blank" | "match" | "reorder" | "dictation";

export interface Exercise {
  id: string;
  type: ExerciseType;
  skill_area: SkillArea;
  topic_id: string | null;
  grammar_topic_id: string | null;
  vocabulary_item_id: string | null;
  reading_text_id: string | null;
  listening_clip_id: string | null;
  cefr_level: CefrLevel;
  content: Record<string, unknown>;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
}

export interface ExerciseAttempt {
  id: string;
  profile_id: string;
  exercise_id: string;
  response: Record<string, unknown>;
  is_correct: boolean;
  created_at: string;
}

export type VocabularyGameType = "speed_round" | "spelling" | "daily_challenge" | "definition";

export interface VocabularyGameSession {
  id: string;
  profile_id: string;
  game_type: VocabularyGameType;
  total_questions: number;
  correct_count: number;
  xp_awarded: number;
  created_at: string;
}

export interface SrsItem {
  id: string;
  profile_id: string;
  vocabulary_item_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  updated_at: string;
}

export interface SrsReviewLog {
  id: string;
  srs_item_id: string;
  grade: number;
  reviewed_at: string;
}

export interface UserXp {
  profile_id: string;
  total_xp: number;
  current_level: number;
  updated_at: string;
}

export interface XpEvent {
  id: string;
  profile_id: string;
  source: string;
  amount: number;
  created_at: string;
}

export interface Streak {
  profile_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  last_reminder_sent_at: string | null;
  updated_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name_he: string;
  description_he: string;
  icon: string;
  criteria: Record<string, unknown>;
  created_at: string;
}

export interface UserBadge {
  profile_id: string;
  badge_id: string;
  earned_at: string;
}

export interface ReadingText {
  id: string;
  title_he: string;
  title_en: string;
  body_en: string;
  cefr_level: CefrLevel;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  open_question_en: string | null;
}

export interface ListeningClip {
  id: string;
  title_he: string;
  title_en: string;
  transcript_en: string;
  cefr_level: CefrLevel;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
}

export type IdiomType = "idiom" | "phrasal_verb";

export interface IdiomPhrasalVerb {
  id: string;
  phrase: string;
  type: IdiomType;
  meaning_he: string;
  example_en: string;
  cefr_level: CefrLevel;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
}

export interface PlacementQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  skill_area: SkillArea;
  cefr_level: CefrLevel;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  audio_text: string | null;
}

export interface PlacementTest {
  id: string;
  profile_id: string;
  status: "in_progress" | "completed";
  result_cefr_overall: CefrLevel | null;
  result_summary_he: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PlacementTestResponse {
  id: string;
  placement_test_id: string;
  question_id: string;
  selected_index: number;
  is_correct: boolean;
  created_at: string;
}

export interface WritingPrompt {
  id: string;
  title_he: string;
  prompt_en: string;
  cefr_level: CefrLevel;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
}

export interface WritingSubmission {
  id: string;
  profile_id: string;
  writing_prompt_id: string;
  submitted_text: string;
  created_at: string;
}

export interface WritingFeedback {
  id: string;
  submission_id: string;
  overall_score: number;
  feedback_he: string;
  improved_version: string;
  created_at: string;
}

export interface AiUsageLog {
  id: string;
  profile_id: string;
  feature: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface ConversationScenario {
  id: string;
  slug: string;
  title_he: string;
  title_en: string;
  system_prompt: string;
  cefr_level: CefrLevel;
  category: ConversationTopicCategory;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  profile_id: string;
  scenario_id: string | null;
  status: "active" | "completed";
  created_at: string;
  completed_at: string | null;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationFeedback {
  grammarMistakes: string[];
  overusedWords: string[];
  suggestedVocabulary: string[];
  generalSuggestionsHe: string;
}

export interface ConversationScore {
  id: string;
  conversation_id: string;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  overall_score: number;
  feedback: ConversationFeedback;
  created_at: string;
}

export interface PronunciationAttempt {
  id: string;
  profile_id: string;
  target_phrase: string;
  audio_url: string | null;
  provider: string | null;
  score: Record<string, unknown> | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  months: number;
  price_ils: number;
  stripe_price_id: string | null;
  sort_order: number;
  created_at: string;
}

export type SubscriptionStatus = "trialing" | "active" | "canceled" | "past_due" | "expired";

export interface Subscription {
  profile_id: string;
  plan_id: string | null;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  profile_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Hearts {
  profile_id: string;
  current_hearts: number;
  max_hearts: number;
  last_regen_at: string;
}

export type ContentReportStatus = "open" | "resolved" | "dismissed";

export interface ContentReport {
  id: string;
  reporter_profile_id: string | null;
  target_type: string;
  target_id: string;
  reason: string;
  status: ContentReportStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_profile_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Minimal Supabase Database type (table Row/Insert/Update shapes).
// Insert/Update are relaxed versions of Row with optional generated/defaulted columns.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "display_name" | "age" | "age_band">;
        Update: Partial<Profile>;
      };
      guardian_links: {
        Row: GuardianLink;
        Insert: Partial<GuardianLink> & Pick<GuardianLink, "minor_profile_id" | "guardian_email">;
        Update: Partial<GuardianLink>;
      };
      topics: {
        Row: Topic;
        Insert: Partial<Topic> & Pick<Topic, "slug" | "name_he" | "name_en" | "cefr_level">;
        Update: Partial<Topic>;
      };
      vocabulary_items: {
        Row: VocabularyItem;
        Insert: Partial<VocabularyItem> &
          Pick<VocabularyItem, "topic_id" | "headword" | "translation_he" | "example_en" | "cefr_level">;
        Update: Partial<VocabularyItem>;
      };
      grammar_topics: {
        Row: GrammarTopic;
        Insert: Partial<GrammarTopic> & Pick<GrammarTopic, "slug" | "name_he" | "name_en" | "cefr_level">;
        Update: Partial<GrammarTopic>;
      };
      grammar_lessons: {
        Row: GrammarLesson;
        Insert: Partial<GrammarLesson> &
          Pick<GrammarLesson, "grammar_topic_id" | "title_he" | "body_md" | "cefr_level">;
        Update: Partial<GrammarLesson>;
      };
      learning_path_nodes: {
        Row: LearningPathNode;
        Insert: Partial<LearningPathNode> & Pick<LearningPathNode, "node_type" | "ref_id" | "cefr_level">;
        Update: Partial<LearningPathNode>;
      };
      user_learning_path_progress: {
        Row: UserLearningPathProgress;
        Insert: Partial<UserLearningPathProgress> &
          Pick<UserLearningPathProgress, "profile_id" | "node_id">;
        Update: Partial<UserLearningPathProgress>;
      };
      skill_levels: {
        Row: SkillLevel;
        Insert: Partial<SkillLevel> & Pick<SkillLevel, "profile_id" | "skill">;
        Update: Partial<SkillLevel>;
      };
      exercises: {
        Row: Exercise;
        Insert: Partial<Exercise> & Pick<Exercise, "type" | "skill_area" | "cefr_level" | "content">;
        Update: Partial<Exercise>;
      };
      exercise_attempts: {
        Row: ExerciseAttempt;
        Insert: Partial<ExerciseAttempt> &
          Pick<ExerciseAttempt, "profile_id" | "exercise_id" | "response" | "is_correct">;
        Update: Partial<ExerciseAttempt>;
      };
      srs_items: {
        Row: SrsItem;
        Insert: Partial<SrsItem> & Pick<SrsItem, "profile_id" | "vocabulary_item_id">;
        Update: Partial<SrsItem>;
      };
      srs_review_log: {
        Row: SrsReviewLog;
        Insert: Partial<SrsReviewLog> & Pick<SrsReviewLog, "srs_item_id" | "grade">;
        Update: Partial<SrsReviewLog>;
      };
      user_xp: {
        Row: UserXp;
        Insert: Partial<UserXp> & Pick<UserXp, "profile_id">;
        Update: Partial<UserXp>;
      };
      xp_events: {
        Row: XpEvent;
        Insert: Partial<XpEvent> & Pick<XpEvent, "profile_id" | "source" | "amount">;
        Update: Partial<XpEvent>;
      };
      streaks: {
        Row: Streak;
        Insert: Partial<Streak> & Pick<Streak, "profile_id">;
        Update: Partial<Streak>;
      };
      badges: {
        Row: Badge;
        Insert: Partial<Badge> & Pick<Badge, "slug" | "name_he" | "description_he" | "icon" | "criteria">;
        Update: Partial<Badge>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Partial<UserBadge> & Pick<UserBadge, "profile_id" | "badge_id">;
        Update: Partial<UserBadge>;
      };
      reading_texts: {
        Row: ReadingText;
        Insert: Partial<ReadingText> & Pick<ReadingText, "title_he" | "title_en" | "body_en" | "cefr_level">;
        Update: Partial<ReadingText>;
      };
      listening_clips: {
        Row: ListeningClip;
        Insert: Partial<ListeningClip> &
          Pick<ListeningClip, "title_he" | "title_en" | "transcript_en" | "cefr_level">;
        Update: Partial<ListeningClip>;
      };
      idioms_phrasal_verbs: {
        Row: IdiomPhrasalVerb;
        Insert: Partial<IdiomPhrasalVerb> &
          Pick<IdiomPhrasalVerb, "phrase" | "type" | "meaning_he" | "example_en" | "cefr_level">;
        Update: Partial<IdiomPhrasalVerb>;
      };
      placement_questions: {
        Row: PlacementQuestion;
        Insert: Partial<PlacementQuestion> &
          Pick<PlacementQuestion, "prompt" | "options" | "correct_index" | "skill_area" | "cefr_level">;
        Update: Partial<PlacementQuestion>;
      };
      placement_tests: {
        Row: PlacementTest;
        Insert: Partial<PlacementTest> & Pick<PlacementTest, "profile_id">;
        Update: Partial<PlacementTest>;
      };
      placement_test_responses: {
        Row: PlacementTestResponse;
        Insert: Partial<PlacementTestResponse> &
          Pick<PlacementTestResponse, "placement_test_id" | "question_id" | "selected_index" | "is_correct">;
        Update: Partial<PlacementTestResponse>;
      };
      writing_prompts: {
        Row: WritingPrompt;
        Insert: Partial<WritingPrompt> & Pick<WritingPrompt, "title_he" | "prompt_en" | "cefr_level">;
        Update: Partial<WritingPrompt>;
      };
      writing_submissions: {
        Row: WritingSubmission;
        Insert: Partial<WritingSubmission> &
          Pick<WritingSubmission, "profile_id" | "writing_prompt_id" | "submitted_text">;
        Update: Partial<WritingSubmission>;
      };
      writing_feedback: {
        Row: WritingFeedback;
        Insert: Partial<WritingFeedback> &
          Pick<WritingFeedback, "submission_id" | "overall_score" | "feedback_he" | "improved_version">;
        Update: Partial<WritingFeedback>;
      };
      ai_usage_log: {
        Row: AiUsageLog;
        Insert: Partial<AiUsageLog> & Pick<AiUsageLog, "profile_id" | "feature">;
        Update: Partial<AiUsageLog>;
      };
      conversation_scenarios: {
        Row: ConversationScenario;
        Insert: Partial<ConversationScenario> &
          Pick<ConversationScenario, "slug" | "title_he" | "title_en" | "system_prompt" | "cefr_level">;
        Update: Partial<ConversationScenario>;
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & Pick<Conversation, "profile_id">;
        Update: Partial<Conversation>;
      };
      conversation_messages: {
        Row: ConversationMessage;
        Insert: Partial<ConversationMessage> &
          Pick<ConversationMessage, "conversation_id" | "role" | "content">;
        Update: Partial<ConversationMessage>;
      };
      conversation_scores: {
        Row: ConversationScore;
        Insert: Partial<ConversationScore> &
          Pick<
            ConversationScore,
            "conversation_id" | "fluency_score" | "grammar_score" | "vocabulary_score" | "overall_score" | "feedback"
          >;
        Update: Partial<ConversationScore>;
      };
      pronunciation_attempts: {
        Row: PronunciationAttempt;
        Insert: Partial<PronunciationAttempt> & Pick<PronunciationAttempt, "profile_id" | "target_phrase">;
        Update: Partial<PronunciationAttempt>;
      };
      content_reports: {
        Row: ContentReport;
        Insert: Partial<ContentReport> & Pick<ContentReport, "target_type" | "target_id" | "reason">;
        Update: Partial<ContentReport>;
      };
      admin_audit_log: {
        Row: AdminAuditLog;
        Insert: Partial<AdminAuditLog> & Pick<AdminAuditLog, "admin_profile_id" | "action" | "target_type">;
        Update: Partial<AdminAuditLog>;
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Partial<PushSubscriptionRow> & Pick<PushSubscriptionRow, "profile_id" | "endpoint" | "p256dh" | "auth">;
        Update: Partial<PushSubscriptionRow>;
      };
    };
  };
}
