import Stripe from 'stripe';

export interface ApiUsageIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  recommendation: string;
}

export class ApiUsageScanner {
  private stripe: Stripe;
  private issues: ApiUsageIssue[] = [];

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async scan(): Promise<ApiUsageIssue[]> {
    this.issues = [];

    // Check for overly broad API key usage
    await this.checkKeyPermissions();
    
    // Check for missing idempotency keys in recent operations
    await this.checkIdempotencyUsage();
    
    // Check for dangerous API patterns
    await this.checkDangerousPatterns();

    return this.issues;
  }

  private async checkKeyPermissions(): Promise<void> {
    try {
      // Try to access account info to check key scope
      const account = await this.stripe.account.retrieve();
      
      // Check if key has overly broad permissions
      // This is a heuristic - restricted keys won't be able to access account
      if (account) {
        // Check if we can access sensitive endpoints
        try {
          await this.stripe.balance.retrieve();
          this.issues.push({
            severity: 'high',
            type: 'overly_broad_key',
            message: 'API key appears to have full account access',
            recommendation: 'Use restricted API keys with minimal required permissions'
          });
        } catch (e) {
          // Restricted key - this is good
        }
      }
    } catch (error: any) {
      if (error.type === 'StripePermissionError') {
        this.issues.push({
          severity: 'low',
          type: 'restricted_key_detected',
          message: 'Using restricted API key (good practice)',
          recommendation: 'Continue using restricted keys for production'
        });
      }
    }
  }

  private async checkIdempotencyUsage(): Promise<void> {
    // Check recent charges for idempotency patterns
    try {
      const charges = await this.stripe.charges.list({ limit: 10 });
      
      // Note: We can't directly see if idempotency keys were used from the API
      // This is a documentation/pattern check
      this.issues.push({
        severity: 'medium',
        type: 'idempotency_check',
        message: 'Verify idempotency keys are used for all charge/payment operations',
        recommendation: 'Always include idempotency_key parameter for idempotent operations (charges, payments, refunds)'
      });
    } catch (error) {
      // Key might not have charges.list permission
    }
  }

  private async checkDangerousPatterns(): Promise<void> {
    // Check for patterns that indicate insecure usage
    try {
      // Check if webhooks are configured
      const webhooks = await this.stripe.webhookEndpoints.list({ limit: 10 });
      
      if (webhooks.data.length === 0) {
        this.issues.push({
          severity: 'medium',
          type: 'no_webhooks',
          message: 'No webhook endpoints configured',
          recommendation: 'Set up webhooks to handle asynchronous events securely'
        });
      }
    } catch (error) {
      // Key might not have webhook permissions
    }

    // Check for test mode usage in production
    const isTestMode = this.stripe.getApiField('apiKey')?.startsWith('sk_test_');
    if (isTestMode) {
      this.issues.push({
        severity: 'high',
        type: 'test_key_in_production',
        message: 'Test API key detected - ensure this is not used in production',
        recommendation: 'Use live keys (sk_live_...) in production environments'
      });
    }
  }

  getIssues(): ApiUsageIssue[] {
    return this.issues;
  }
}

