export interface ParsedQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  correctAnswer: "A" | "B" | "C" | "D";
}

export async function parseQuestionsFromText(
  text: string
): Promise<ParsedQuestion[]> {
  const questions: ParsedQuestion[] = [];

  const normalizedText = text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  /**
   * Split every question by detecting:
   *
   * Question text
   * A.
   * B.
   * C.
   * optional D.
   */
  const questionBlocks = normalizedText.match(
    /([\s\S]*?A[\.\)][\s\S]*?B[\.\)][\s\S]*?C[\.\)][\s\S]*?(?:D[\.\)][\s\S]*?)?)(?=(?:\n[\s\S]*?A[\.\)])|$)/gi
  );

  if (!questionBlocks) {
    return [];
  }

  for (const block of questionBlocks) {
    const cleanBlock = block.trim();

    // Extract question text
    const questionMatch = cleanBlock.match(
      /^(.*?)A[\.\)]/i
    );

    if (!questionMatch) continue;

    const questionText = questionMatch[1]
      .replace(/\n/g, " ")
      .trim();

    // Extract options
    const optionRegex =
      /([A-D])[\.\)]\s*([\s\S]*?)(?=(?:[A-D][\.\)])|$)/gi;

    const options: Record<string, string> = {};

    let match;

    while ((match = optionRegex.exec(cleanBlock)) !== null) {
      const key = match[1].toUpperCase();

      const value = match[2]
        .replace(/\n/g, " ")
        .trim();

      options[key] = value;
    }

    // Must have A B C
    if (
      !questionText ||
      !options["A"] ||
      !options["B"] ||
      !options["C"]
    ) {
      continue;
    }

    questions.push({
      questionText,
      optionA: options["A"],
      optionB: options["B"],
      optionC: options["C"],
      optionD: options["D"] || undefined,
      correctAnswer: "A",
    });
  }

  return questions;
}