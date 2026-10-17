import { GoogleGenAI, type Content } from '@google/genai';
import { DRAFT_TOOLS, getTool, TOOLS, type AgentContext } from './tools.ts';

export interface ToolTrace {
  tool: string;
  args: Record<string, string>;
  result: unknown;
}

export interface AgentResult {
  reply: string;
  toolCalls: ToolTrace[];
  mode: 'gemini' | 'fallback' | 'offline';
}

const MAX_STEPS = 5;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

function systemPrompt(ctx: AgentContext) {
  return [
    'You are Solulu Elevate, an academic assistant for UNISA.',
    `The user is a ${ctx.role}. Default module is CS204.`,
    'Always use the tools to look up facts; never invent student data.',
    'Be concise and kind. Use **bold** for key figures. You can write emails automatically (one student, or all at-risk students via draft_emails_for_at_risk) but only into an approval queue; never claim an email was sent, and tell the lecturer to review it in the Approvals screen.',
  ].join(' ');
}

async function runTool(name: string, args: Record<string, string>, ctx: AgentContext) {
  const tool = getTool(name);
  if (!tool) return { error: `Unknown tool ${name}` };
  try {
    return await tool.run(args ?? {}, ctx);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Tool failed' };
  }
}

async function runGemini(message: string, ctx: AgentContext, apiKey: string): Promise<AgentResult> {
  const ai = new GoogleGenAI({ apiKey });
  const contents: Content[] = [{ role: 'user', parts: [{ text: message }] }];
  const toolCalls: ToolTrace[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt(ctx),
        tools: [
          {
            functionDeclarations: TOOLS.filter(
              ({ name }) => ctx.allowDrafts !== false || !DRAFT_TOOLS.has(name),
            ).map(({ name, description, parameters }) => ({
              name,
              description,
              parameters: parameters as never,
            })),
          },
        ],
      },
    });

    const calls = response.functionCalls ?? [];
    if (calls.length === 0) {
      return { reply: response.text ?? 'I could not produce an answer.', toolCalls, mode: 'gemini' };
    }

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const responseParts = [];
    for (const call of calls) {
      const args = (call.args ?? {}) as Record<string, string>;
      const result = await runTool(call.name ?? '', args, ctx);
      toolCalls.push({ tool: call.name ?? '', args, result });
      responseParts.push({ functionResponse: { name: call.name, response: { result } } });
    }
    contents.push({ role: 'user', parts: responseParts });
  }

  return { reply: 'I ran out of steps before finishing. Please try a simpler question.', toolCalls, mode: 'gemini' };
}

// Fallback model via any OpenAI-compatible chat completions API (OpenAI, Groq, OpenRouter, ...).
async function runFallback(message: string, ctx: AgentContext, apiKey: string): Promise<AgentResult> {
  const baseUrl = (process.env.FALLBACK_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.FALLBACK_MODEL || 'gpt-4o-mini';
  const tools = TOOLS.filter(({ name }) => ctx.allowDrafts !== false || !DRAFT_TOOLS.has(name)).map(
    ({ name, description, parameters }) => ({ type: 'function', function: { name, description, parameters } }),
  );
  const messages: any[] = [
    { role: 'system', content: systemPrompt(ctx) },
    { role: 'user', content: message },
  ];
  const toolCalls: ToolTrace[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, tools }),
    });
    if (!res.ok) {
      throw Object.assign(new Error(`Fallback model failed (${res.status})`), { status: res.status });
    }
    const data: any = await res.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) throw new Error('Fallback model returned no message');

    const calls: any[] = msg.tool_calls ?? [];
    if (calls.length === 0) {
      return { reply: msg.content || 'I could not produce an answer.', toolCalls, mode: 'fallback' };
    }

    messages.push(msg);
    for (const call of calls) {
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(call.function?.arguments || '{}');
      } catch {
        // malformed arguments: run the tool with none and let it report the error
      }
      const result = await runTool(call.function?.name ?? '', args, ctx);
      toolCalls.push({ tool: call.function?.name ?? '', args, result });
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  return { reply: 'I ran out of steps before finishing. Please try a simpler question.', toolCalls, mode: 'fallback' };
}

function describeStudent(s: any) {
  const reasons = s.reasons?.length ? ` Reasons: ${s.reasons.join('; ')}.` : '';
  return `**${s.name}** (${s.studentNumber}) is **${s.riskLevel} risk** (score ${s.riskScore}/100), attendance **${s.attendancePct}%**.${reasons}`;
}

// Rule-based stand-in used when no GEMINI_API_KEY is configured.
async function runOffline(message: string, ctx: AgentContext): Promise<AgentResult> {
  const lower = message.toLowerCase();
  const moduleCode = (message.match(/\b[A-Za-z]{2,5}\d{3}\b/)?.[0] ?? 'CS204').toUpperCase();
  const toolCalls: ToolTrace[] = [];

  const all = await ctx.repo.listStudents(moduleCode);
  const named = all.find((s) => lower.includes(s.name.toLowerCase().split(' ')[0]) || lower.includes(s.studentNumber));

  if (
    ctx.allowDrafts !== false &&
    !named &&
    ctx.role === 'lecturer' &&
    /\b(draft|email|write)\b/.test(lower) &&
    /\b(all|every|each|at-risk|at risk)\b/.test(lower)
  ) {
    const args = { moduleCode };
    const result: any = await runTool('draft_emails_for_at_risk', args, ctx);
    toolCalls.push({ tool: 'draft_emails_for_at_risk', args, result });
    return {
      reply: result.error
        ? result.error
        : `I wrote **${result.created}** new email(s) for at-risk students in ${moduleCode}` +
          `${result.skippedExisting ? ` (${result.skippedExisting} already pending)` : ''}. ` +
          'Nothing has been sent; open **Approvals** to review and send them.',
      toolCalls,
      mode: 'offline',
    };
  }
  if (ctx.allowDrafts !== false && named && ctx.role === 'lecturer' && /\b(draft|email|write|check-in)\b/.test(lower)) {
    const args = {
      moduleCode,
      student: named.studentNumber,
      subject: `Checking in on you in ${moduleCode}`,
      body:
        `Dear ${named.name.split(' ')[0]},\n\nI noticed you have been less present in ${moduleCode} recently ` +
        `(attendance is at ${named.attendancePct}%). I want to make sure you have the support you need.\n\n` +
        `Please reply to this email or book a consultation with me so we can work out a plan together.\n\nKind regards,\nDr. Elena Vasquez`,
    };
    const result: any = await runTool('draft_student_email', args, ctx);
    toolCalls.push({ tool: 'draft_student_email', args: { moduleCode, student: named.studentNumber }, result });
    return {
      reply: result.error
        ? result.error
        : `I drafted a check-in email to **${named.name}**. ${result.note} Open **Approvals** to review it.`,
      toolCalls,
      mode: 'offline',
    };
  }
  if (named || ctx.role === 'student') {
    const target = named?.studentNumber ?? ctx.studentNumber;
    const args = { moduleCode, student: target };
    const result: any = await runTool('get_student_risk', args, ctx);
    toolCalls.push({ tool: 'get_student_risk', args, result });
    return { reply: result.error ? result.error : describeStudent(result), toolCalls, mode: 'offline' };
  }

  const args = { moduleCode };
  const result: any = await runTool('list_at_risk_students', args, ctx);
  toolCalls.push({ tool: 'list_at_risk_students', args, result });
  if (!Array.isArray(result)) return { reply: result.error ?? 'No data.', toolCalls, mode: 'offline' };
  if (result.length === 0) return { reply: `No at-risk students found in ${moduleCode}.`, toolCalls, mode: 'offline' };
  return {
    reply: `**${result.length} student(s)** in ${moduleCode} need attention:\n\n${result.map((s: any) => `• ${describeStudent(s)}`).join('\n')}`,
    toolCalls,
    mode: 'offline',
  };
}

export async function runAgent(message: string, ctx: AgentContext): Promise<AgentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackKey = process.env.FALLBACK_API_KEY;

  if (apiKey) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await runGemini(message, ctx, apiKey);
      } catch (err) {
        const status = (err as { status?: number }).status;
        const retryable = status === 429 || status === 503;
        console.warn(`Gemini attempt ${attempt + 1} failed (${status ?? 'unknown'})`);
        if (!retryable) break;
        // Quota exhausted: switch to the fallback model right away if one is configured.
        if (fallbackKey && status === 429) break;
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
  }

  if (fallbackKey) {
    try {
      return await runFallback(message, ctx, fallbackKey);
    } catch (err) {
      console.warn(`Fallback model failed: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }
  return runOffline(message, ctx);
}
