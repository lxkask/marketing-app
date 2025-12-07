import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import iconv from 'iconv-lite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const { decode } = iconv;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read HTML file with Windows-1250 encoding
const htmlBuffer = readFileSync(join(__dirname, '../../insis-tahak/index.htm'));
const html = decode(htmlBuffer, 'windows-1250');

// Find all h1 positions (lesson starts)
const h1Regex = /<h1[^>]*>/gi;
const h1Positions = [];
let match;
while ((match = h1Regex.exec(html)) !== null) {
  h1Positions.push(match.index);
}

console.log(`Found ${h1Positions.length} lessons`);

const lessons = [];

for (let i = 0; i < h1Positions.length; i++) {
  const startPos = h1Positions[i];
  const endPos = i < h1Positions.length - 1 ? h1Positions[i + 1] : html.length;
  const sectionHtml = html.substring(startPos, endPos);

  // Extract title
  const titleMatch = sectionHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let title = titleMatch
    ? cleanText(titleMatch[1])
    : `Lekce ${i + 1}`;

  // Find OTÁZKY section - first try h2, then fallback to finding the text directly
  let questionsMatch = sectionHtml.match(/<h2[^>]*>[\s\S]*?OTÁZKY[\s\S]*?<\/h2>/i);
  let notesHtml = sectionHtml;
  let questionsHtml = '';

  if (questionsMatch) {
    const qIndex = sectionHtml.indexOf(questionsMatch[0]);
    notesHtml = sectionHtml.substring(0, qIndex);
    questionsHtml = sectionHtml.substring(qIndex);
  } else {
    // Fallback: find position of OTÁZKY text, then find the containing paragraph
    const otazkyTextIndex = sectionHtml.toUpperCase().indexOf('OTÁZKY');
    if (otazkyTextIndex !== -1) {
      // Find the start of the containing <p> tag (search backwards from OTÁZKY)
      const beforeOtazky = sectionHtml.substring(0, otazkyTextIndex);
      const lastPTagIndex = beforeOtazky.lastIndexOf('<p');
      if (lastPTagIndex !== -1) {
        notesHtml = sectionHtml.substring(0, lastPTagIndex);
        questionsHtml = sectionHtml.substring(lastPTagIndex);
      }
    }
  }

  // Extract notes
  const notes = extractNotes(notesHtml);

  // Extract questions
  const questions = extractQuestions(questionsHtml);

  lessons.push({
    id: i + 1,
    title,
    notes,
    questions
  });

  console.log(`Lesson ${i + 1}: "${title.substring(0, 40)}..." - ${questions.length} questions`);
}

function extractNotes(html) {
  // Remove h1
  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '');

  const notes = [];
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];

  for (const p of paragraphs) {
    let text = cleanText(p);
    if (text.length > 2 && !/^[\s•○●□◊→§]+$/.test(text)) {
      const marginMatch = p.match(/margin-left:(\d+)/);
      const indent = marginMatch ? Math.floor(parseInt(marginMatch[1]) / 25) : 0;
      notes.push({ text, indent: Math.min(indent, 4) });
    }
  }

  // Table content
  const cells = html.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
  for (const cell of cells) {
    let text = cleanText(cell);
    if (text.length > 2) {
      notes.push({ text, indent: 2 });
    }
  }

  return notes;
}

function extractQuestions(html) {
  if (!html) return [];

  const questions = [];

  // Find all paragraphs
  const allParagraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];

  let currentQuestion = null;
  let questionId = 0;

  for (const p of allParagraphs) {
    const text = cleanText(p);
    if (!text || text.length < 2) continue;

    // Check if this is a new question (starts with number followed by dot)
    const questionNumMatch = text.match(/^(\d+)\.\s*(.+)/);

    if (questionNumMatch) {
      // Save previous question
      if (currentQuestion && currentQuestion.answers.length > 0) {
        currentQuestion.explanation = generateExplanation(currentQuestion);
        questions.push(currentQuestion);
      }

      questionId++;
      currentQuestion = {
        id: questionId,
        text: questionNumMatch[2].trim(),
        answers: []
      };
    } else if (currentQuestion) {
      // This is an answer option
      // Skip if it looks like section header
      if (text.startsWith('OTÁZKY') || text.length > 200) continue;

      // IMPROVED: Check if the ANSWER TEXT (not bullet) has green color
      // Look for Verdana spans with green color - that's the actual answer text
      const isCorrect = isAnswerCorrect(p);

      // Clean the answer text - remove bullet symbols
      let answerText = text.replace(/^[•○●□◊→§\s]+/, '').trim();

      if (answerText.length > 1) {
        currentQuestion.answers.push({
          text: answerText,
          isCorrect
        });
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.answers.length > 0) {
    currentQuestion.explanation = generateExplanation(currentQuestion);
    questions.push(currentQuestion);
  }

  return questions;
}

// Check if answer is correct by looking at the TEXT span, not bullet span
function isAnswerCorrect(paragraphHtml) {
  // Find all spans with Verdana font (those contain the actual answer text)
  const verdanaSpans = paragraphHtml.match(/<span[^>]*font-family:[^>]*Verdana[^>]*>[^<]*<\/span>/gi) || [];

  for (const span of verdanaSpans) {
    // Check if this Verdana span has green color
    if (span.includes('#00B050') || span.includes('color:green')) {
      // Make sure this span contains actual text, not just whitespace
      const textContent = span.replace(/<[^>]+>/g, '').trim();
      if (textContent.length > 0) {
        return true;
      }
    }
  }

  return false;
}

// Improved text cleaning - joins spans without adding spaces
function cleanText(html) {
  // First, handle spans - join their content without adding extra spaces
  // Replace </span><span with </span><span (no space)
  let result = html;

  // Remove newlines and extra whitespace between tags
  result = result.replace(/>\s+</g, '><');

  // Remove all HTML tags without adding spaces
  result = result.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  result = result
    .replace(/&nbsp;/g, ' ')
    .replace(/&#9675;/g, '○')
    .replace(/&#9633;/g, '□')
    .replace(/&#9674;/g, '◊')
    .replace(/&#61614;/g, '→')
    .replace(/&#61607;/g, '•')
    .replace(/&#\d+;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

function generateExplanation(question) {
  const correctAnswers = question.answers.filter(a => a.isCorrect);
  const q = question.text.toLowerCase();

  let explanation = "";

  if (correctAnswers.length === 0) {
    return "U této otázky není označena žádná správná odpověď.";
  } else if (correctAnswers.length === 1) {
    explanation = `Správná odpověď je „${correctAnswers[0].text}".`;
  } else {
    explanation = `Správné odpovědi jsou: ${correctAnswers.map(a => `„${a.text}"`).join(", ")}.`;
  }

  // Add contextual explanations based on keywords
  if (q.includes('4p') || q.includes('4 p')) {
    explanation += " 4P marketingového mixu zahrnuje: Product (produkt), Price (cena), Place (distribuce), Promotion (komunikace/propagace).";
  } else if (q.includes('4c') || q.includes('4 c')) {
    explanation += " Model 4C představuje zákaznicky orientovaný pohled: Customer value (hodnota), Cost (náklady), Convenience (dostupnost), Communication (komunikace).";
  } else if (q.includes('b2b')) {
    explanation += " B2B (Business-to-Business) označuje obchodování mezi firmami navzájem.";
  } else if (q.includes('b2c')) {
    explanation += " B2C (Business-to-Consumer) označuje prodej přímo koncovým spotřebitelům.";
  } else if (q.includes('swot')) {
    explanation += " SWOT analýza hodnotí: Strengths (silné stránky), Weaknesses (slabé stránky), Opportunities (příležitosti), Threats (hrozby).";
  } else if (q.includes('pest') || q.includes('step')) {
    explanation += " PEST/STEP analýza zkoumá makroprostředí: Political, Economic, Social, Technological faktory.";
  } else if (q.includes('segmentac')) {
    explanation += " Segmentace je proces rozdělení trhu na menší skupiny zákazníků s podobnými potřebami.";
  } else if (q.includes('targeting')) {
    explanation += " Targeting je výběr cílových segmentů, na které se firma zaměří.";
  } else if (q.includes('positioning')) {
    explanation += " Positioning je vytváření jedinečné pozice produktu/značky v mysli zákazníka.";
  } else if (q.includes('značk') || q.includes('brand')) {
    explanation += " Značka je soubor asociací, které zákazník spojuje s produktem nebo firmou.";
  }

  return explanation;
}

// Write output
const dataDir = join(__dirname, '../src/data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}
const outputPath = join(dataDir, 'lessons.json');
writeFileSync(outputPath, JSON.stringify(lessons, null, 2), 'utf-8');

console.log(`\nData saved to ${outputPath}`);
console.log(`Total: ${lessons.length} lessons, ${lessons.reduce((sum, l) => sum + l.questions.length, 0)} questions`);
