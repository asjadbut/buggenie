// Bounty estimation and acceptance probability service
// Based on real platform data and policies from Bugcrowd, HackerOne, and Google VRP

import GeminiService from './gemini';

class BountyEstimatorService {
  constructor() {
    this.platformData = {
      bugcrowd: {
        name: 'Bugcrowd',
        baseRanges: {
          critical: { min: 5000, max: 15000, avg: 10000 },
          high: { min: 1000, max: 5000, avg: 3000 },
          medium: { min: 200, max: 1000, avg: 600 },
          low: { min: 50, max: 200, avg: 125 },
          info: { min: 0, max: 50, avg: 25 }
        },
        acceptanceFactors: {
          critical: { base: 0.85, factors: ['clear_poc', 'business_impact', 'technical_detail'] },
          high: { base: 0.80, factors: ['reproducibility', 'impact_scope', 'technical_detail'] },
          medium: { base: 0.75, factors: ['clarity', 'reproducibility', 'impact_scope'] },
          low: { base: 0.70, factors: ['clarity', 'reproducibility'] },
          info: { base: 0.60, factors: ['clarity', 'educational_value'] }
        },
        policies: {
          requires: ['clear_reproduction_steps', 'proof_of_concept', 'impact_assessment'],
          prefers: ['business_context', 'remediation_suggestions', 'technical_depth'],
          rejects: ['duplicate_reports', 'out_of_scope', 'insufficient_detail', 'false_positives']
        }
      },
      hackerone: {
        name: 'HackerOne',
        baseRanges: {
          critical: { min: 3000, max: 20000, avg: 11500 },
          high: { min: 500, max: 3000, avg: 1750 },
          medium: { min: 100, max: 500, avg: 300 },
          low: { min: 25, max: 100, avg: 62 },
          info: { min: 0, max: 25, avg: 12 }
        },
        acceptanceFactors: {
          critical: { base: 0.90, factors: ['clear_poc', 'business_impact', 'technical_detail', 'reproducibility'] },
          high: { base: 0.85, factors: ['reproducibility', 'impact_scope', 'technical_detail'] },
          medium: { base: 0.80, factors: ['clarity', 'reproducibility', 'impact_scope'] },
          low: { base: 0.75, factors: ['clarity', 'reproducibility'] },
          info: { base: 0.65, factors: ['clarity', 'educational_value'] }
        },
        policies: {
          requires: ['clear_reproduction_steps', 'proof_of_concept', 'impact_assessment'],
          prefers: ['supporting_materials', 'technical_depth', 'remediation_suggestions'],
          rejects: ['duplicate_reports', 'out_of_scope', 'insufficient_detail', 'false_positives']
        }
      },
      google: {
        name: 'Google VRP',
        baseRanges: {
          critical: { min: 10000, max: 50000, avg: 30000 },
          high: { min: 1000, max: 10000, avg: 5500 },
          medium: { min: 100, max: 1000, avg: 550 },
          low: { min: 50, max: 100, avg: 75 },
          info: { min: 0, max: 50, avg: 25 }
        },
        acceptanceFactors: {
          critical: { base: 0.95, factors: ['clear_poc', 'business_impact', 'technical_detail', 'reproducibility'] },
          high: { base: 0.90, factors: ['reproducibility', 'impact_scope', 'technical_detail'] },
          medium: { base: 0.85, factors: ['clarity', 'reproducibility', 'impact_scope'] },
          low: { base: 0.80, factors: ['clarity', 'reproducibility'] },
          info: { base: 0.70, factors: ['clarity', 'educational_value'] }
        },
        policies: {
          requires: ['clear_reproduction_steps', 'proof_of_concept', 'impact_assessment', 'attack_scenario'],
          prefers: ['technical_depth', 'remediation_suggestions', 'screenshot_evidence'],
          rejects: ['duplicate_reports', 'out_of_scope', 'insufficient_detail', 'false_positives']
        }
      }
    };

    // Vulnerability severity mapping based on real platform data
    this.vulnerabilitySeverity = {
      // Critical vulnerabilities
      'Remote Code Execution': 'critical',
      'SQL Injection': 'critical',
      'Server-Side Request Forgery (SSRF)': 'critical',
      'Privilege Escalation': 'critical',
      'Account Takeover': 'critical',
      'Authentication Bypass': 'critical',
      'Sandbox Escape': 'critical',
      'Memory Corruption (in a non-sandboxed process)': 'critical',
      'Full System Compromise': 'critical',
      'Signer Account Takeover': 'critical',
      'Unauthorized Asset Transfer': 'critical',
      'Cross-Tenant PII Leakage/Exposure': 'critical',
      'Key Leak': 'critical',
      'Backdoor Injection / Bias Manipulation': 'critical',
      'Command Injection': 'critical',
      'Privileged User': 'critical',

      // High vulnerabilities
      'Cross-Site Scripting (XSS)': 'high',
      'Cross-site Scripting (XSS) - Reflected': 'high',
      'Cross-site Scripting (XSS) - Stored': 'high',
      'Cross-site Scripting (XSS) - DOM': 'high',
      'IDOR (Insecure Direct Object Reference)': 'high',
      'Insecure Direct Object Reference (IDOR)': 'high',
      'Business Logic Errors': 'high',
      'Information Disclosure': 'high',
      'Sensitive data exposure': 'high',
      'Information Leak': 'high',
      'Cryptographic Issues': 'high',
      'Crypto Weakness': 'high',
      'Insecure Deserialization': 'high',
      'Deserialization of Untrusted Data': 'high',
      'XML External Entity (XXE) Injection': 'high',
      'XML eXternal Entity (XXE)': 'high',
      'XML External Entities (XXE)': 'high',
      'File Inclusion': 'high',
      'Local File Inclusion': 'high',
      'Remote File Inclusion': 'high',
      'Directory Traversal': 'high',
      'Path Traversal': 'high',
      'Cross-Site Request Forgery (CSRF)': 'high',
      'Cross-site request forgery (CSRF)': 'high',
      'Cross-Site Request Forgery (CSRF)': 'high',
      'Session Management': 'high',
      'Session Fixation': 'high',
      'Insecure Storage': 'high',
      'Insecure Storage of Sensitive Information': 'high',
      'Cleartext Storage of Sensitive Information': 'high',
      'Cleartext Transmission of Sensitive Information': 'high',
      'Memory Corruption (in a sandboxed process)': 'high',
      'Memory Corruption': 'high',
      'Permissions Bypass': 'high',
      'Auth Bypass': 'high',
      'Site Isolation Bypass': 'high',
      'Security UI Spoofing': 'high',
      'Exploit Mitigation Bypass': 'high',
      'Lockscreen Bypass': 'high',
      'Non-Privileged User': 'high',
      'Tenant-Scoped': 'high',
      'Embedding Exfiltration / Model Extraction': 'high',
      'System Prompt Leakage': 'high',
      'Sandboxed Container Code Execution': 'high',
      'API Query-Based Model Reconstruction': 'high',
      'Price or Fee Manipulation': 'high',
      'Node-level Denial of Service': 'high',
      'Deanonymization of Data': 'high',
      'Improper Proof Validation and Finalization Logic': 'high',

      // Medium vulnerabilities
      'Open Redirect': 'medium',
      'Unvalidated Redirects and Forwards': 'medium',
      'Clickjacking': 'medium',
      'UI Redressing (Clickjacking)': 'medium',
      'Cross-Origin Resource Sharing (CORS) Misconfiguration': 'medium',
      'HTTP Host Header Injection': 'medium',
      'Directory Listing': 'medium',
      'Information Exposure Through Directory Listing': 'medium',
      'Denial of Service': 'medium',
      'Denial of Service (DoS)': 'medium',
      'Uncontrolled Resource Consumption': 'medium',
      'Cache Poisoning': 'medium',
      'Caching': 'medium',
      'Mixed content': 'medium',
      'SSL vulnerability': 'medium',
      'Insufficient Transport Layer Protection': 'medium',
      'Improper Certificate Validation': 'medium',
      'Improper Following of a Certificates Chain of Trust': 'medium',
      'Insufficient Session Expiration': 'medium',
      'Unverified Password Change': 'medium',
      'Weak Password Recovery Mechanism for Forgotten Password': 'medium',
      'Improper Neutralization of HTTP Headers for Scripting Syntax': 'medium',
      'HTTP Response Splitting': 'medium',
      'CRLF Injection': 'medium',
      'LDAP Injection': 'medium',
      'XML Injection': 'medium',
      'Resource Injection': 'medium',
      'OS Command Injection': 'medium',
      'Command Injection - Generic': 'medium',
      'Code Injection': 'medium',
      'Cross Site Script Inclusion (XSSI)': 'medium',
      'Semantic Indexing': 'medium',
      'Application-Wide': 'medium',
      'AI Misclassification Attacks': 'medium',
      'Misinformation / Wrong Factual Data': 'medium',

      // Low vulnerabilities
      'Improper Input Validation': 'low',
      'Insufficient Logging & Monitoring': 'low',
      'Improper Access Control': 'low',
      'Improper Access Control - Generic': 'low',
      'Subdomain Takeover': 'low',
      'Android issue': 'low',
      'Improper Authentication - Generic': 'low',
      'Privacy Violation': 'low',
      'Insufficiently Protected Credentials': 'low',
      'Unprotected Transport of Credentials': 'low',
      'Improper Restriction of Authentication Attempts': 'low',
      'Client-Side Enforcement of Server-Side Security': 'low',
      'Leftover Debug Code (Backdoor)': 'low',
      'Default Folder Privilege Escalation': 'low',
      'Local Administrator on default environment': 'low',
      'Non-Default Folder Privilege Escalation': 'low',
      'No Privilege Escalation': 'low',

      // Info vulnerabilities
      'Information Exposure Through an Error Message': 'info',
      'Information Exposure Through Debug Information': 'info',
      'Missing Encryption of Sensitive Data': 'info',
      'Forced Browsing': 'info',
      'HTTP Request Smuggling': 'info',
      'Security Through Obscurity': 'info',
      'Plaintext Storage of a Password': 'info',
      'Storing Passwords in a Recoverable Format': 'info',
      'Use of Hard-coded Password': 'info',
      'Use of Hard-coded Credentials': 'info',
      'Password in Configuration File': 'info',
      'Use of Hard-coded Cryptographic Key': 'info',
      'Use of a Key Past its Expiration Date': 'info',
      'Use of Cryptographically Weak Pseudo-Random Number Generator (PRNG)': 'info',
      'Use of Insufficiently Random Values': 'info',
      'Weak Cryptography for Passwords': 'info',
      'Inadequate Encryption Strength': 'info',
      'Use of a Broken or Risky Cryptographic Algorithm': 'info',
      'Reversible One-Way Hash': 'info',
      'Reusing a Nonce, Key Pair in Encryption': 'info',
      'Missing Required Cryptographic Step': 'info',
      'Key Exchange without Entity Authentication': 'info',
      'Man-in-the-Middle': 'info',
      'Aggressive Offline Caching': 'info',
      'Autocomplete Enabled': 'info',
      'Autocorrect Enabled': 'info',
      'Plaintext Password Field': 'info',
      'Save Password': 'info',
      'Crowdsourcing': 'info',
      'CSV Injection': 'info',
      'Shared Links': 'info',
      'Non sensitive': 'info',
      'Lack of Exploit Mitigations': 'info',
      'Lack of Jailbreak Detection': 'info',
      'Lack of Obfuscation': 'info',
      'Runtime Instrumentation-Based': 'info',
      'OCR (Optical Character Recognition)': 'info',
      'Outdated Software Version': 'info',
      'Rosetta Flash': 'info'
    };
  }

  // Get severity for a vulnerability category
  getSeverity(category) {
    // Handle Bugcrowd's hierarchical categories
    if (category.includes(' > ')) {
      const parts = category.split(' > ');
      const lastPart = parts[parts.length - 1];
      return this.vulnerabilitySeverity[lastPart] || this.vulnerabilitySeverity[parts[0]] || 'medium';
    }
    
    return this.vulnerabilitySeverity[category] || 'medium';
  }

  // Estimate bounty range for a vulnerability
  async estimateBounty(platform, category) {
    try {
      const geminiResult = await GeminiService.getBountyAnalysis(platform, category);
      // Return only the bounty field for compatibility
      return geminiResult.bounty || { min: 0, max: 0, avg: 0, severity: 'unknown' };
    } catch (e) {
      // Fallback to hardcoded if Gemini fails
      const platformInfo = this.platformData[platform];
      if (!platformInfo) {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      const severity = this.getSeverity(category);
      const range = platformInfo.baseRanges[severity];
      if (!range) {
        return { min: 0, max: 0, avg: 0, severity: 'unknown' };
      }
      return {
        min: range.min,
        max: range.max,
        avg: range.avg,
        severity: severity
      };
    }
  }

  // Calculate acceptance probability based on platform policies
  calculateAcceptanceProbability(platform, category, reportQuality = {}) {
    const platformInfo = this.platformData[platform];
    if (!platformInfo) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const severity = this.getSeverity(category);
    const acceptanceInfo = platformInfo.acceptanceFactors[severity];
    
    if (!acceptanceInfo) {
      return { probability: 0.5, factors: [], recommendations: [] };
    }

    let probability = acceptanceInfo.base;
    const factors = [];
    const recommendations = [];

    // Adjust probability based on report quality factors
    if (reportQuality.clearPoc) {
      probability += 0.05;
      factors.push('Clear Proof of Concept');
    } else {
      recommendations.push('Include a clear, reproducible proof of concept');
    }

    if (reportQuality.businessImpact) {
      probability += 0.05;
      factors.push('Business Impact Explained');
    } else {
      recommendations.push('Explain the business impact of the vulnerability');
    }

    if (reportQuality.technicalDetail) {
      probability += 0.05;
      factors.push('Technical Details Provided');
    } else {
      recommendations.push('Provide detailed technical information');
    }

    if (reportQuality.reproducibility) {
      probability += 0.05;
      factors.push('Highly Reproducible');
    } else {
      recommendations.push('Ensure steps are easily reproducible');
    }

    if (reportQuality.clarity) {
      probability += 0.03;
      factors.push('Clear and Well-Written');
    } else {
      recommendations.push('Write clearly and professionally');
    }

    // Platform-specific adjustments
    if (platform === 'google' && reportQuality.attackScenario) {
      probability += 0.03;
      factors.push('Attack Scenario Included');
    } else if (platform === 'google') {
      recommendations.push('Include a detailed attack scenario');
    }

    if (platform === 'hackerone' && reportQuality.supportingMaterials) {
      probability += 0.03;
      factors.push('Supporting Materials Provided');
    } else if (platform === 'hackerone') {
      recommendations.push('Include supporting materials and references');
    }

    if (platform === 'bugcrowd' && reportQuality.businessContext) {
      probability += 0.03;
      factors.push('Business Context Provided');
    } else if (platform === 'bugcrowd') {
      recommendations.push('Provide business context and impact');
    }

    // Cap probability at 0.95
    probability = Math.min(probability, 0.95);

    return {
      probability: Math.round(probability * 100),
      factors: factors,
      recommendations: recommendations,
      severity: severity
    };
  }

  // Get platform-specific policy information
  getPlatformPolicies(platform) {
    const platformInfo = this.platformData[platform];
    if (!platformInfo) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return {
      name: platformInfo.name,
      requirements: platformInfo.policies.requires,
      preferences: platformInfo.policies.prefers,
      rejections: platformInfo.policies.rejects
    };
  }

  // Analyze report quality based on content
  analyzeReportQuality(reportContent) {
    const analysis = {
      clearPoc: false,
      businessImpact: false,
      technicalDetail: false,
      reproducibility: false,
      clarity: false,
      attackScenario: false,
      supportingMaterials: false,
      businessContext: false
    };

    const content = reportContent.toLowerCase();

    // Check for clear PoC
    if (content.includes('proof of concept') || content.includes('poc') || content.includes('reproduction steps')) {
      analysis.clearPoc = true;
    }

    // Check for business impact
    if (content.includes('business impact') || content.includes('impact assessment') || content.includes('financial impact')) {
      analysis.businessImpact = true;
    }

    // Check for technical details
    if (content.includes('technical') || content.includes('vulnerability description') || content.includes('attack vector')) {
      analysis.technicalDetail = true;
    }

    // Check for reproducibility
    if (content.includes('steps to reproduce') || content.includes('reproduction steps') || content.includes('how to reproduce')) {
      analysis.reproducibility = true;
    }

    // Check for clarity
    if (content.includes('summary') && content.includes('description')) {
      analysis.clarity = true;
    }

    // Check for attack scenario (Google specific)
    if (content.includes('attack scenario') || content.includes('attack preconditions')) {
      analysis.attackScenario = true;
    }

    // Check for supporting materials (HackerOne specific)
    if (content.includes('supporting material') || content.includes('references') || content.includes('evidence')) {
      analysis.supportingMaterials = true;
    }

    // Check for business context (Bugcrowd specific)
    if (content.includes('business context') || content.includes('business impact') || content.includes('recommendations')) {
      analysis.businessContext = true;
    }

    return analysis;
  }

  // Get comprehensive analysis for a vulnerability
  async getComprehensiveAnalysis(platform, category, reportContent = '') {
    const bounty = await this.estimateBounty(platform, category);
    const quality = this.analyzeReportQuality(reportContent);
    const acceptance = this.calculateAcceptanceProbability(platform, category, quality);
    const policies = this.getPlatformPolicies(platform);

    return {
      platform: policies.name,
      category: category,
      severity: bounty.severity,
      bounty: bounty,
      acceptance: acceptance,
      policies: policies,
      quality: quality,
      recommendations: acceptance.recommendations
    };
  }
}

export default new BountyEstimatorService(); 