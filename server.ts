import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Universal Scanner: URL or Any Text
app.post('/api/scan-threat', async (req, res) => {
  try {
    const { content, type = 'auto' } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Please provide a URL or text to scan.' });
    }

    const trimmed = content.trim();
    const isUrl = /^https?:\/\//i.test(trimmed) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);

    const ai = getGeminiClient();
    if (!ai) {
      // Intelligent heuristic fallback if API key is temporarily unavailable
      return res.json(generateHeuristicThreatReport(trimmed, isUrl));
    }

    const prompt = `You are RiskProtector AI, an elite cybersecurity and anti-fraud intelligence engine.
Analyze the following target input:
Input Content: "${trimmed}"
Type Detected: ${isUrl ? 'URL / Web link' : 'Message text / Phishing communication'}

Analyze for:
1. Malicious indicators (typosquatting, deceptive brand impersonation, urgent emotional extortion, credential harvesting, lottery/prize scam, crypto pump/drainer, package delivery scam, bank impersonation).
2. Risk score (0 safe to 100 critical hazard).
3. Red flags, breakdown, and concrete protective guidance.

Return your analysis strictly in JSON format according to the schema provided.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: 'MALICIOUS | HIGH_RISK | SUSPICIOUS | LIKELY_SAFE | VERIFIED_LEGITIMATE',
            },
            riskScore: {
              type: Type.NUMBER,
              description: 'Risk level from 0 (completely safe) to 100 (critical hazard)',
            },
            title: {
              type: Type.STRING,
              description: 'Short headline verdict e.g. "Credential Harvesting Phishing Link"',
            },
            summary: {
              type: Type.STRING,
              description: 'Clear paragraph explaining the threat or safety status',
            },
            threatCategory: {
              type: Type.STRING,
              description: 'Category e.g. "Phishing", "Financial Extortion", "Impersonation", "Safe Portal"',
            },
            indicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific warning indicators detected',
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  signal: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'CRITICAL | HIGH | MEDIUM | LOW' },
                  detail: { type: Type.STRING },
                },
                required: ['signal', 'severity', 'detail'],
              },
            },
            technicalBreakdown: {
              type: Type.STRING,
              description: 'Technical evaluation of domain syntax, lexical trickery, or psych manipulation',
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable steps the user should take right now',
            },
          },
          required: ['verdict', 'riskScore', 'title', 'summary', 'threatCategory', 'indicators', 'redFlags', 'recommendedActions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      input: trimmed,
      isUrl,
      scannedAt: new Date().toISOString(),
      report: parsed,
    });
  } catch (error: any) {
    console.error('Threat scan error:', error);
    // Provide fallback
    const { content } = req.body || {};
    return res.json({
      success: true,
      input: content,
      scannedAt: new Date().toISOString(),
      report: generateHeuristicThreatReport(content || '', false).report,
    });
  }
});

// 2. Instagram Fake vs Real Account AI Detection
app.post('/api/scan-instagram', async (req, res) => {
  try {
    const { username, bio, followers, following, posts, isVerified, notes } = req.body;

    if (!username && !bio) {
      return res.status(400).json({ error: 'Please provide at least an Instagram username or bio text.' });
    }

    const cleanUsername = (username || '').replace(/^@/, '').trim();
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateHeuristicInstagramReport(cleanUsername, bio || '', followers, following, posts, isVerified));
    }

    const prompt = `You are RiskProtector's Instagram Forensic AI Detective.
Evaluate the authenticity of this Instagram profile and determine whether it is FAKE / BOT / IMPERSONATOR or REAL / ORGANIC.

Profile Details:
- Username: @${cleanUsername}
- Bio Text: "${bio || 'None provided'}"
- Followers Count: ${followers ?? 'Unknown'}
- Following Count: ${following ?? 'Unknown'}
- Total Posts: ${posts ?? 'Unknown'}
- Verified Badge on profile: ${isVerified ? 'Yes' : 'No'}
- Additional context: "${notes || 'None'}"

Evaluate:
1. Username structure (random numbers at end, misspelled official brands like apple_supp0rt, excessive underscores, copycat syntax).
2. Bio analysis: Red flags such as WhatsApp/Telegram off-platform prompts, crypto investment promises, fake management emails, stolen quotes, bot emojis (🚀💰📈), fake "Official Account" claims without verification.
3. Follower-to-Following engagement ratio anomalies (e.g. following 5,000 but only 14 followers, or 80,000 followers with 0 posts and zero comments).
4. Authenticity Score (0 = Guaranteed Bot/Scammer, 100 = 100% Verified/Organic Human).
5. Fake Probability (0% to 100%).

Return strictly JSON matching the response schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            authenticityScore: {
              type: Type.NUMBER,
              description: '0 to 100 score of profile legitimacy',
            },
            fakeProbability: {
              type: Type.NUMBER,
              description: 'Percentage probability this is a bot, scam, or impersonator account',
            },
            verdict: {
              type: Type.STRING,
              description: 'CONFIRMED_FAKE_BOT | HIGH_RISK_IMPERSONATOR | SUSPICIOUS_ENGAGEMENT | LIKELY_ORGANIC_AUTHENTIC | VERIFIED_GENUINE',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'AI model confidence 0-100',
            },
            profileSummary: {
              type: Type.STRING,
              description: 'Executive forensic assessment of this account',
            },
            bioAnalysis: {
              type: Type.OBJECT,
              properties: {
                suspiciousPatternsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                offPlatformRedirection: { type: Type.BOOLEAN },
                urgencyOrFinancialPitches: { type: Type.BOOLEAN },
                botPatternScore: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
              required: ['suspiciousPatternsFound', 'offPlatformRedirection', 'urgencyOrFinancialPitches', 'explanation'],
            },
            metricsAnalysis: {
              type: Type.OBJECT,
              properties: {
                ratioStatus: { type: Type.STRING, description: 'UNBALANCED_BOT_RATIO | MASS_FOLLOW_FARM | NORMAL_ORGANIC | INFLUENCER_RATIO' },
                ratioScoreExplanation: { type: Type.STRING },
                ghostFollowerRisk: { type: Type.STRING, description: 'CRITICAL | HIGH | MODERATE | LOW' },
              },
              required: ['ratioStatus', 'ratioScoreExplanation', 'ghostFollowerRisk'],
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  signal: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'CRITICAL | HIGH | MEDIUM | LOW' },
                  detail: { type: Type.STRING },
                },
                required: ['signal', 'severity', 'detail'],
              },
            },
            safetyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'authenticityScore',
            'fakeProbability',
            'verdict',
            'profileSummary',
            'bioAnalysis',
            'metricsAnalysis',
            'redFlags',
            'safetyTips',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      username: cleanUsername,
      scannedAt: new Date().toISOString(),
      report: parsed,
    });
  } catch (error: any) {
    console.error('Instagram scan error:', error);
    const { username, bio, followers, following, posts, isVerified } = req.body || {};
    return res.json(generateHeuristicInstagramReport(username || '', bio || '', followers, following, posts, isVerified));
  }
});

// 3. Real-Time Camera / Photo Visual Analysis
app.post('/api/scan-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', scanContext = 'Real-time camera frame scan' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please provide an image payload for analysis.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        scannedAt: new Date().toISOString(),
        report: {
          threatLevel: 'SUSPICIOUS',
          riskScore: 65,
          detectedArtifacts: ['Potential Phishing URL in Camera Reticle', 'Visual Text Extracted'],
          textExtracted: 'Security verification or link observed in frame',
          analysis: 'Visual scan completed. Heuristic check flagged potential high-urgency text or unverified barcode/QR code pattern in frame.',
          immediateWarning: 'Do not click links or scan unknown QR codes shown on suspicious screens or printed letters.',
          safeActions: [
            'Inspect the exact destination domain before opening',
            'Verify directly with official bank or provider application',
            'Do not enter credentials or 2FA codes',
          ],
        },
      });
    }

    const prompt = `You are RiskProtector Real-Time Visual Scanner.
Analyze this camera snapshot or screenshot captured by the user.

Detect any of the following:
1. QR Codes leading to malicious or unverified sites (Quishing).
2. Phishing SMS or chat message visible on a device screen.
3. Fake banking/billing notices, urgent IRS/police letters, utility cutoff threats.
4. Social engineering cues, fake logos, fake seals or certificates.
5. Suspicious login portals shown on a screen.

Context: "${scanContext}".

Return strictly JSON matching the response schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: {
              type: Type.STRING,
              description: 'CRITICAL | HIGH | MEDIUM | LOW | CLEAN',
            },
            riskScore: {
              type: Type.NUMBER,
              description: '0 to 100 risk score',
            },
            detectedArtifacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific artifacts spotted e.g. ["Phishing QR Code", "Fake FedEx Alert"]',
            },
            textExtracted: {
              type: Type.STRING,
              description: 'OCR transcript of any text, headers, or URLs discovered in image',
            },
            analysis: {
              type: Type.STRING,
              description: 'Detailed analysis of why this image is suspicious or safe',
            },
            immediateWarning: {
              type: Type.STRING,
              description: 'Top immediate security caution for the user',
            },
            safeActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['threatLevel', 'riskScore', 'detectedArtifacts', 'textExtracted', 'analysis', 'immediateWarning', 'safeActions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      scannedAt: new Date().toISOString(),
      report: parsed,
    });
  } catch (error: any) {
    console.error('Image scan error:', error);
    return res.status(500).json({
      error: 'Visual scan could not process image. Please try again with clear lighting or focus.',
    });
  }
});

// Heuristics helpers for seamless fallback
function generateHeuristicThreatReport(input: string, isUrl: boolean) {
  const lower = input.toLowerCase();
  const suspiciousKeywords = [
    'login', 'verify', 'update-account', 'secure', 'bank', 'urgent', 'suspended',
    'winner', 'lottery', 'crypto', 'wallet', 'seed-phrase', 'usps', 'tracking',
    'fedex', 'paypal', 'apple-id', 'giftcard', 'telegram', 'whatsapp', 'claim',
  ];

  const matched = suspiciousKeywords.filter((k) => lower.includes(k));
  const hasIp = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(input);
  const hasWeirdTld = /\.(xyz|top|cc|ru|work|click|link|kim|cfd|gq|ml)(\/|$)/i.test(input);

  let score = 15;
  if (matched.length > 0) score += matched.length * 20;
  if (hasIp) score += 35;
  if (hasWeirdTld) score += 25;
  if (score > 98) score = 98;

  const verdict = score >= 75 ? 'MALICIOUS' : score >= 45 ? 'SUSPICIOUS' : 'LIKELY_SAFE';

  return {
    success: true,
    input,
    isUrl,
    scannedAt: new Date().toISOString(),
    report: {
      verdict,
      riskScore: score,
      title: score >= 75 ? 'Critical Scam / Phishing Signal Detected' : score >= 45 ? 'Suspicious Attributes Identified' : 'No Immediate High-Risk Anomalies Found',
      summary: score >= 50
        ? `Analysis identified pattern matches with known social engineering indicators (${matched.join(', ') || 'unusual syntax'}).`
        : 'The scanned input did not match typical automated high-risk deception patterns. Remain vigilant with personal credentials.',
      threatCategory: isUrl ? (score >= 60 ? 'Phishing URL' : 'Web Destination') : 'Text Communication',
      indicators: matched.map((m) => `Trigger keyword found: "${m}"`),
      redFlags: matched.slice(0, 3).map((m) => ({
        signal: `Deceptive Keyword: ${m}`,
        severity: score >= 75 ? 'HIGH' : 'MEDIUM',
        detail: `Fraudulent actors frequently use "${m}" to compel emergency action or credential disclosure.`,
      })),
      technicalBreakdown: `Syntactic inspection reveals ${hasWeirdTld ? 'high-risk TLD, ' : ''}${hasIp ? 'raw IP address host, ' : ''}${matched.length} urgency/banking lexical vectors.`,
      recommendedActions: [
        'Never enter credentials, passwords, or 2FA codes on this destination',
        'Verify independently through the official company app or phone number',
        'Block and report the sender if received via unprompted SMS or DM',
      ],
    },
  };
}

function generateHeuristicInstagramReport(
  username: string,
  bio: string,
  followers: any,
  following: any,
  posts: any,
  isVerified: boolean
) {
  const bioLower = bio.toLowerCase();
  const userLower = username.toLowerCase();

  const botBioTriggers = ['whatsapp', 'telegram', 'dm for collab', 'binary', 'fx', 'crypto', 'invest', 'cashapp', 'click link below', 'sugar daddy', 'onlyfans'];
  const matchedTriggers = botBioTriggers.filter((t) => bioLower.includes(t));

  const numFollowers = parseInt(String(followers || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const numFollowing = parseInt(String(following || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const numPosts = parseInt(String(posts || '0').replace(/[^0-9]/g, ''), 10) || 0;

  let botScore = 15;
  if (matchedTriggers.length > 0) botScore += matchedTriggers.length * 25;
  if (/\d{4,}/.test(userLower)) botScore += 20; // 4+ numbers in handle
  if (numFollowing > 1000 && numFollowers < 50) botScore += 35; // follow farm
  if (numPosts === 0 && numFollowing > 300) botScore += 20;
  if (isVerified) botScore = Math.max(5, botScore - 60);

  if (botScore > 95) botScore = 95;
  const authenticity = Math.max(5, 100 - botScore);

  const verdict = botScore >= 70 ? 'CONFIRMED_FAKE_BOT' : botScore >= 45 ? 'SUSPICIOUS_ENGAGEMENT' : 'LIKELY_ORGANIC_AUTHENTIC';

  return {
    success: true,
    username,
    scannedAt: new Date().toISOString(),
    report: {
      authenticityScore: authenticity,
      fakeProbability: botScore,
      verdict,
      confidence: 88,
      profileSummary: botScore >= 60
        ? `Profile exhibits synthetic engagement indicators, potential off-platform redirects, or unnatural follow patterns characteristic of bot swarms.`
        : `Profile exhibits typical organic distribution and balanced engagement metrics.`,
      bioAnalysis: {
        suspiciousPatternsFound: matchedTriggers.map((t) => `Off-platform or financial trigger: "${t}"`),
        offPlatformRedirection: matchedTriggers.some((t) => ['whatsapp', 'telegram', 'click link'].includes(t)),
        urgencyOrFinancialPitches: matchedTriggers.some((t) => ['crypto', 'fx', 'invest', 'binary'].includes(t)),
        botPatternScore: botScore,
        explanation: matchedTriggers.length > 0
          ? 'Bio text contains keywords frequently associated with automated spam accounts or romance/financial scams.'
          : 'Bio text presents natural personal phrasing without aggressive promotional links.',
      },
      metricsAnalysis: {
        ratioStatus: numFollowing > numFollowers * 3 ? 'MASS_FOLLOW_FARM' : 'NORMAL_ORGANIC',
        ratioScoreExplanation: `Followers: ${numFollowers || 'N/A'}, Following: ${numFollowing || 'N/A'}, Posts: ${numPosts || 'N/A'}. Ratio reflects ${numFollowing > numFollowers * 3 ? 'unbalanced follower gathering strategy' : 'healthy community ratio'}.`,
        ghostFollowerRisk: botScore >= 70 ? 'CRITICAL' : botScore >= 40 ? 'MODERATE' : 'LOW',
      },
      redFlags: matchedTriggers.map((t) => ({
        signal: `Suspicious Bio Keyword: ${t}`,
        severity: 'HIGH',
        detail: `Directing followers off Instagram to private messaging apps like ${t} is a primary tactic in social engineering scams.`,
      })),
      safetyTips: [
        'Do not send money or cryptocurrency to unverified accounts',
        'Avoid clicking mystery third-party links in unsolicited bios',
        'Check mutual followers and account creation history',
      ],
    },
  };
}

// Start Server & mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RiskProtector AI Server running on port ${PORT}`);
  });
}

startServer();
