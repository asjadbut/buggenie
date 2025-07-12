import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Google Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    this.isInitialized = true;
  }

  async generateReport(platform, category, vulnerabilityDetails) {
    incrementGeminiUsageCount();
    if (!this.isInitialized || !this.model) {
      throw new Error('Gemini service not initialized. Please provide an API key.');
    }

    const platformTemplates = {
      bugcrowd: {
        systemPrompt: `You are a professional security researcher writing a bug bounty report for Bugcrowd. 
        Create a comprehensive, well-structured report that follows Bugcrowd's format and requirements.
        Include all necessary sections with clear, technical details.`,
        format: `Please structure the report with these sections:
        1. Summary
        2. Business Impact
        3. Steps to Reproduce
        4. Proof of Concept (PoC)
        5. Impact Assessment
        6. Recommendations`
      },
      hackerone: {
        systemPrompt: `You are a professional security researcher writing a bug bounty report for HackerOne. 
        Create a detailed report that follows HackerOne's reporting guidelines and format.
        Focus on clear technical explanations and reproducible steps.`,
        format: `Please structure the report with these sections:
        1. Description
        2. Summary
        3. Steps To Reproduce
        4. Supporting Material/References
        5. Impact Assessment
        6. Recommendations`
      },
      google: {
        systemPrompt: `You are a professional security researcher writing a bug bounty report for Google's Vulnerability Reward Program. 
        Create a concise but comprehensive report that follows Google's specific requirements.
        Include clear technical details and impact assessment.`,
        format: `Please structure the report with these sections:
        1. Summary (200 chars max)
        2. Vulnerability Description
        3. Attack Preconditions
        4. Reproduction Steps / PoC
        5. Attack Scenario
        6. Screenshot/Evidence`
      }
    };

    const template = platformTemplates[platform];
    if (!template) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const prompt = `${template.systemPrompt}

Generate a professional bug bounty report for a ${category} vulnerability.

Vulnerability Details:
${vulnerabilityDetails}

${template.format}

IMPORTANT: Generate ONLY the report content sections. Do NOT include:
- Platform information
- Report IDs or metadata
- Dates or timestamps
- Program names
- Username fields
- Severity ratings
- Burp Suite examples or tool-specific content
- Any form fields or placeholders

FORMATTING: Use clean text without any markdown formatting anywhere in the report:
- Use "Summary" instead of "**Summary**" for headings
- Use "Steps to Reproduce" instead of "**Steps to Reproduce**" for headings
- Do not use asterisks, underscores, or any markdown symbols around headings
- Do not use asterisks for emphasis in content (use "important" instead of "**important**")
- Do not use bold formatting anywhere in the text
- Write all content in plain text without any special formatting

Focus on creating clean, professional content that can be directly used in the report sections.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  async enhanceReport(existingContent, platform, category) {
    incrementGeminiUsageCount();
    if (!this.isInitialized || !this.model) {
      throw new Error('Gemini service not initialized. Please provide an API key.');
    }

    const prompt = `You are a security expert who specializes in improving bug bounty reports. Make the content more professional, detailed, and submission-ready.

Please enhance and improve the following bug bounty report for ${platform} platform, category: ${category}.

Current report:
${existingContent}

Please improve the report by:
1. Adding more technical details where appropriate
2. Enhancing the impact assessment
3. Improving the reproduction steps
4. Adding relevant security references
5. Making the language more professional and precise

IMPORTANT: Return ONLY the enhanced report content. Do NOT include:
- Platform information
- Report IDs or metadata
- Dates or timestamps
- Program names
- Username fields
- Severity ratings
- Burp Suite examples or tool-specific content
- Any form fields or placeholders

FORMATTING: Use clean text without any markdown formatting anywhere in the report:
- Use "Summary" instead of "**Summary**" for headings
- Use "Steps to Reproduce" instead of "**Steps to Reproduce**" for headings
- Do not use asterisks, underscores, or any markdown symbols around headings
- Do not use asterisks for emphasis in content (use "important" instead of "**important**")
- Do not use bold formatting anywhere in the text
- Write all content in plain text without any special formatting

Focus on clean, professional content that can be directly used.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to enhance report: ${error.message}`);
    }
  }

  async getBountyAnalysis(platform, category) {
    incrementGeminiUsageCount();
    if (!this.isInitialized || !this.model) {
      throw new Error('Gemini service not initialized. Please provide an API key.');
    }

    const prompt = `For the ${platform} bug bounty platform, and the vulnerability category "${category}", please provide a comprehensive analysis.

Please return your answer in EXACT JSON format with this structure:
{
  "platform": "${platform}",
  "category": "${category}",
  "severity": "critical|high|medium|low|info",
  "bounty": {
    "min": 100,
    "max": 5000,
    "avg": 1500
  },
  "acceptance": {
    "probability": 85,
    "factors": ["Clear PoC", "Business Impact", "Technical Detail"],
    "recommendations": ["Include clear reproduction steps", "Add business impact analysis"]
  },
  "policies": {
    "requirements": ["Clear reproduction steps", "Proof of concept"],
    "preferences": ["Business context", "Technical depth"],
    "rejections": ["Duplicate reports", "Out of scope"]
  }
}

Base your analysis on real platform data and current bug bounty market rates.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      // Try to extract JSON from the response
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Add platform and category if not present
        if (!parsed.platform) parsed.platform = platform;
        if (!parsed.category) parsed.category = category;
        return parsed;
      } else {
        throw new Error('Gemini did not return valid JSON.');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to get bounty analysis: ${error.message}`);
    }
  }

  async getLearningCard(vulnType, mode = 'concise') {
    incrementGeminiUsageCount();
    if (!this.isInitialized || !this.model) {
      throw new Error('Gemini service not initialized. Please provide an API key.');
    }
    let prompt;
    if (mode === 'detailed') {
      prompt = `Create a DETAILED, practical learning card for the vulnerability type: "${vulnType}". Structure the response as JSON with these keys:
{
  "title": string,
  "summary": string,
  "how_it_works": string,
  "real_world_example": string,
  "how_to_find": string,
  "remediation_tips": string
}
Each section should be thorough, actionable, and suitable for security researchers. Include technical depth, real-world context, and advanced tips. Do not include any extra text outside the JSON.`;
    } else {
      prompt = `Create a concise, practical learning card for the vulnerability type: "${vulnType}". Structure the response as JSON with these keys:
{
  "title": string,
  "summary": string,
  "how_it_works": string,
  "real_world_example": string,
  "how_to_find": string,
  "remediation_tips": string
}
Each section should be clear, actionable, and suitable for security researchers. Do not include any extra text outside the JSON.`;
    }
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Gemini did not return valid JSON.');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to get learning card: ${error.message}`);
    }
  }
}

// Gemini usage counter utilities
function getGeminiUsageKey() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `gemini_usage_${today}`;
}

export function getGeminiUsageCount() {
  const key = getGeminiUsageKey();
  return parseInt(localStorage.getItem(key) || '0', 10);
}

export function incrementGeminiUsageCount() {
  const key = getGeminiUsageKey();
  const current = getGeminiUsageCount();
  localStorage.setItem(key, (current + 1).toString());
}

export default new GeminiService(); 