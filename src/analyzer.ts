import Stripe from 'stripe';
import { ApiUsageScanner, ApiUsageIssue } from './scanners/apiUsageScanner';
import { WebhookScanner, WebhookIssue } from './scanners/webhookScanner';
import { IdempotencyScanner, IdempotencyIssue } from './scanners/idempotencyScanner';
import { PCIScanner, PCIssue } from './scanners/pciScanner';
import { PIIScanner, PIIIssue } from './scanners/piiScanner';

export type ScanIssue = ApiUsageIssue | WebhookIssue | IdempotencyIssue | PCIssue | PIIIssue;

export interface RiskScore {
  total: number;
  high: number;
  medium: number;
  low: number;
  percentage: number; // 0-100
}

export interface ScanResult {
  issues: ScanIssue[];
  riskScore: RiskScore;
  timestamp: number;
  accountId?: string;
}

export class RiskAnalyzer {
  private stripe: Stripe;
  private scanners: {
    apiUsage: ApiUsageScanner;
    webhook: WebhookScanner;
    idempotency: IdempotencyScanner;
    pci: PCIScanner;
    pii: PIIScanner;
  };

  constructor(stripe: Stripe) {
    this.stripe = stripe;
    this.scanners = {
      apiUsage: new ApiUsageScanner(stripe),
      webhook: new WebhookScanner(stripe),
      idempotency: new IdempotencyScanner(stripe),
      pci: new PCIScanner(stripe),
      pii: new PIIScanner(stripe),
    };
  }

  async analyze(): Promise<ScanResult> {
    // Run all scanners in parallel
    const [apiIssues, webhookIssues, idempotencyIssues, pciIssues, piiIssues] = await Promise.all([
      this.scanners.apiUsage.scan(),
      this.scanners.webhook.scan(),
      this.scanners.idempotency.scan(),
      this.scanners.pci.scan(),
      this.scanners.pii.scan(),
    ]);

    const allIssues: ScanIssue[] = [
      ...apiIssues,
      ...webhookIssues,
      ...idempotencyIssues,
      ...pciIssues,
      ...piiIssues,
    ];

    const riskScore = this.calculateRiskScore(allIssues);

    // Try to get account ID
    let accountId: string | undefined;
    try {
      const account = await this.stripe.account.retrieve();
      accountId = account.id;
    } catch (error) {
      // Ignore - might not have permission
    }

    return {
      issues: allIssues,
      riskScore,
      timestamp: Date.now(),
      accountId,
    };
  }

  private calculateRiskScore(issues: ScanIssue[]): RiskScore {
    const high = issues.filter(i => i.severity === 'high').length;
    const medium = issues.filter(i => i.severity === 'medium').length;
    const low = issues.filter(i => i.severity === 'low').length;
    const total = issues.length;

    // Calculate percentage: high = 10 points, medium = 5 points, low = 1 point
    // Max score would be if all issues were high (10 * total)
    const score = (high * 10) + (medium * 5) + (low * 1);
    const maxScore = total * 10 || 1;
    const percentage = Math.min(100, Math.round((score / maxScore) * 100));

    return {
      total,
      high,
      medium,
      low,
      percentage,
    };
  }
}

