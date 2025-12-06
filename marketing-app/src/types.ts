export type Answer = {
  text: string;
  isCorrect: boolean;
}

export type Question = {
  id: number;
  text: string;
  answers: Answer[];
  explanation: string;
}

export type Note = {
  text: string;
  indent: number;
}

export type Lesson = {
  id: number;
  title: string;
  notes: Note[];
  questions: Question[];
}
