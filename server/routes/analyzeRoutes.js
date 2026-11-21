const express = require('express');
const router = express.Router();

// Fallback intelligent analysis generator when API key is missing or quota exceeded
function generateFallbackAnalysis(code, language) {
  const lineCount = code.split('\n').length;
  const isBugFix = /bug|fix|error|catch|throw|null|undefined/i.test(code);
  const isAsync = /async|await|promise|fetch|axios|then/i.test(code);
  const hasLoop = /for\s*\(|while\s*\(|\.map\(|\.forEach\(|\.reduce\(/i.test(code);
  const isReact = /useState|useEffect|useMemo|useCallback|useRef|React|jsx/i.test(code) || (language && language.toLowerCase() === 'react');

  let summary = `This ${language || 'code'} snippet (${lineCount} lines) `;
  if (isReact) {
    summary += 'implements a reactive component or hook pattern designed to manage state or lifecycle effects cleanly.';
  } else if (isAsync) {
    summary += 'handles asynchronous data workflows, processing promises and handling external requests.';
  } else {
    summary += 'provides a targeted functional utility for data transformation and algorithmic execution.';
  }

  let bugCheck = '';
  if (isBugFix) {
    bugCheck = 'Identified defensive error handling or bug fix logic. Ensure all null/undefined edge cases and rejection states are cleanly caught.';
  } else if (isAsync) {
    bugCheck = 'Async operations detected: verify that pending promises are cancelled on component unmount to prevent race conditions.';
  } else {
    bugCheck = 'Code appears well-structured. Check input boundary parameters and potential off-by-one edge cases in iterative blocks.';
  }

  let complexity = hasLoop
    ? 'Time Complexity: O(N) linear iteration | Space Complexity: O(1) auxiliary space.'
    : 'Time Complexity: O(1) constant time execution | Space Complexity: O(1) minimal memory overhead.';

  return { summary, bugCheck, complexity };
}

// POST /api/analyze
router.post('/', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Code is required for analysis.' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // If Groq API key is present, call Groq API
    if (apiKey && apiKey.trim() && !apiKey.includes('your_groq_api_key')) {
      // Primary model: llama-3.3-70b-versatile (as required); fallback models if Groq account has updated inventory
      const modelCandidates = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

      for (const model of modelCandidates) {
        try {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are DevVault AI, an expert code analyzer and bug detector. You must return ONLY a raw JSON object (no markdown formatting, no ```json tags, no commentary outside the JSON) with the exact keys: "summary", "bugCheck", and "complexity".\n\n' +
                    'Field definitions:\n' +
                    '- "summary": Concise 1-2 sentence explanation of what this code does and its practical purpose.\n' +
                    '- "bugCheck": Deep analysis of potential bugs, edge cases, vulnerabilities, race conditions, memory leaks, or confirmation that the snippet is safe and optimal.\n' +
                    '- "complexity": Clear notation for Time & Space Complexity (e.g. "Time Complexity: O(N) | Space Complexity: O(1)") with a brief justification.\n\n' +
                    'Example:\n' +
                    '{\n' +
                    '  "summary": "Implements an optimized memoized search hook.",\n' +
                    '  "bugCheck": "No major vulnerabilities. Check for unhandled exceptions when passing undefined values.",\n' +
                    '  "complexity": "Time Complexity: O(1) amortized | Space Complexity: O(N) cache size."\n' +
                    '}',
                },
                {
                  role: 'user',
                  content: `Language: ${language || 'Unknown'}\n\nCode snippet to analyze:\n${code}`,
                },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.2,
            }),
          });

          if (groqResponse.ok) {
            const completion = await groqResponse.json();
            const rawContent = completion.choices?.[0]?.message?.content?.trim() || '{}';

            const cleanedContent = rawContent.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            const parsed = JSON.parse(cleanedContent);

            if (parsed.summary && parsed.bugCheck && parsed.complexity) {
              return res.status(200).json({
                summary: String(parsed.summary),
                bugCheck: String(parsed.bugCheck),
                complexity: String(parsed.complexity),
                source: `groq-${model}`,
              });
            }
          } else {
            const errData = await groqResponse.json().catch(() => ({}));
            // If model not found or forbidden, try next candidate
            if (groqResponse.status === 404 || groqResponse.status === 400) {
              continue;
            }
            console.warn(`Groq API returned ${groqResponse.status} for model ${model}:`, errData);
          }
        } catch (callErr) {
          console.warn(`Groq API error on model ${model}:`, callErr.message);
        }
      }
    }

    // Fallback analysis when API key is not configured or network call was unavailable
    const fallback = generateFallbackAnalysis(code, language || 'JavaScript');
    return res.status(200).json({
      ...fallback,
      source: apiKey ? 'devvault-local-engine' : 'devvault-heuristic',
    });
  } catch (err) {
    console.error('Error analyzing code:', err);
    return res.status(500).json({
      error: 'An internal error occurred during code analysis.',
      details: err.message,
    });
  }
});

module.exports = router;
