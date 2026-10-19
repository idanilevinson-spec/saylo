import { splitBidiRuns } from "@/lib/text/bidiRuns";

// Hebrew text that quotes English, with every English run isolated so it
// keeps its order and its quote marks whatever the line breaks do.
export default function MixedText({ children }: { children: string }) {
  return (
    <>
      {splitBidiRuns(children).map((run, i) =>
        run.english ? (
          <bdi key={i} dir="ltr" lang="en">
            {run.text}
          </bdi>
        ) : (
          run.text
        ),
      )}
    </>
  );
}
