import Stripe from 'stripe';

export interface IdempotencyIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  recommendation: string;
}

export class IdempotencyScanner {
  private stripe: Stripe;
  private issues: IdempotencyIssue[] = [];

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async scan(): Promise<IdempotencyIssue[]> {
    this.issues = [];

    await this.checkRecentOperations();
    await this.checkRefundPatterns();

    return this.issues;
  }

  private async checkRecentOperations(): Promise<void> {
    try {
      // Check recent charges for duplicate patterns
      const charges = await this.stripe.charges.list({ limit: 50 });
      
      // Look for charges with same amount and customer within short time window
      const chargeMap = new Map<string, number[]>();
      
      for (const charge of charges.data) {
        if (charge.customer) {
          const key = `${charge.customer}-${charge.amount}`;
          if (!chargeMap.has(key)) {
            chargeMap.set(key, []);
          }
          chargeMap.get(key)!.push(charge.created);
        }
      }

      // Check for potential duplicates (same amount, same customer, within 5 minutes)
      for (const [key, timestamps] of chargeMap.entries()) {
        if (timestamps.length > 1) {
          const sorted = timestamps.sort((a, b) => a - b);
          for (let i = 1; i < sorted.length; i++) {
            const diff = sorted[i] - sorted[i - 1];
            if (diff < 300) { // 5 minutes
              this.issues.push({
                severity: 'medium',
                type: 'potential_duplicate_charge',
                message: `Found charges with same amount within 5 minutes - may indicate missing idempotency`,
                recommendation: 'Use idempotency keys for all charge and payment operations to prevent duplicates'
              });
              break;
            }
          }
        }
      }
    } catch (error: any) {
      if (error.type === 'StripePermissionError') {
        this.issues.push({
          severity: 'low',
          type: 'idempotency_permission_denied',
          message: 'Cannot access charges to check idempotency patterns',
          recommendation: 'Grant charges read permission to audit idempotency usage'
        });
      }
    }

    // General recommendation
    this.issues.push({
      severity: 'high',
      type: 'idempotency_best_practice',
      message: 'Idempotency keys are critical for payment operations',
      recommendation: 'Always include idempotency_key parameter when creating charges, payments, refunds, and other idempotent operations'
    });
  }

  private async checkRefundPatterns(): Promise<void> {
    try {
      const refunds = await this.stripe.refunds.list({ limit: 20 });
      
      // Check for refunds without idempotency
      // Note: We can't directly see if idempotency was used, but we can check patterns
      if (refunds.data.length > 0) {
        this.issues.push({
          severity: 'medium',
          type: 'refund_idempotency',
          message: 'Ensure refunds use idempotency keys',
          recommendation: 'Use idempotency keys for refunds to prevent accidental duplicate refunds'
        });
      }
    } catch (error) {
      // Permission issue or no refunds
    }
  }

  getIssues(): IdempotencyIssue[] {
    return this.issues;
  }
}

