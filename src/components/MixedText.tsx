import { splitBidiRuns } from "@/lib/text/bidiRuns";

// An English run this long is a whole quoted sentence, not a word or two.
const SENTENCE_WORDS = 6;

// Hebrew text that quotes English, with every English run isolated so it
// keeps its order and its quote marks whatever the line breaks do.
// `sentencesOnOwnLine`: a quoted English sentence that wraps inside a
// Hebrew line still reads out of order (each line of it is placed right to
// left), so it gets a line of its own, like a quoted example in a textbook.
export default function MixedText({ children, sentencesOnOwnLine = false }: { children: string; sentencesOnOwnLine?: boolean }) {
  return (
    <>
      {splitBidiRuns(children).map((run, i) => {
        if (!run.english) return run.text;
        const long = sentencesOnOwnLine && run.text.trim().split(/\s+/).length >= SENTENCE_WORDS;
        return (
          <bdi key={i} dir="ltr" lang="en" className={long ? "my-1 block font-content" : undefined}>
            {run.text}
          </bdi>
        );
      })}
    </>
  );
}
