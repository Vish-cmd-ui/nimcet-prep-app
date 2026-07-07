export type Topic = {
  id: string;
  subject: string;
  chapter: string;
  subtopic: string;
  weight_hint: number;
};

export type Roadmap = {
  id: string;
  week_number: number;
  start_date: string | null;
  end_date: string | null;
  topic_ids: string[];
  status: 'pending' | 'in_progress' | 'completed';
};
