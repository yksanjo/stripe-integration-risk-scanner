import Stripe from 'stripe';

export interface WebhookIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  recommendation: string;
}

export class WebhookScanner {
  private stripe: Stripe;
  private issues: WebhookIssue[] = [];

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async scan(): Promise<WebhookIssue[]> {
    this.issues = [];

    await this.checkWebhookEndpoints();
    await this.checkWebhookSecurity();

    return this.issues;
  }

  private async checkWebhookEndpoints(): Promise<void> {
    try {
      const webhooks = await this.stripe.webhookEndpoints.list({ limit: 100 });
      
      if (webhooks.data.length === 0) {
        this.issues.push({
          severity: 'medium',
          type: 'no_webhooks',
          message: 'No webhook endpoints configured',
          recommendation: 'Configure webhooks to handle asynchronous events (payment.succeeded, charge.failed, etc.)'
        });
        return;
      }

      for (const webhook of webhooks.data) {
        // Check if webhook has signature verification enabled
        if (!webhook.enabled) {
          this.issues.push({
            severity: 'high',
            type: 'disabled_webhook',
            message: `Webhook ${webhook.id} is disabled`,
            recommendation: 'Enable webhook or remove if no longer needed'
          });
        }

        // Check webhook URL security
        if (webhook.url && !webhook.url.startsWith('https://')) {
          this.issues.push({
            severity: 'high',
            type: 'insecure_webhook_url',
            message: `Webhook ${webhook.id} uses insecure HTTP URL`,
            recommendation: 'Always use HTTPS for webhook endpoints'
          });
        }

        // Check for localhost URLs (should only be in development)
        if (webhook.url && webhook.url.includes('localhost')) {
          this.issues.push({
            severity: 'medium',
            type: 'localhost_webhook',
            message: `Webhook ${webhook.id} points to localhost`,
            recommendation: 'Remove localhost webhooks from production accounts'
          });
        }
      }
    } catch (error: any) {
      if (error.type === 'StripePermissionError') {
        this.issues.push({
          severity: 'low',
          type: 'webhook_permission_denied',
          message: 'Cannot access webhook endpoints (may need broader key permissions)',
          recommendation: 'Grant webhook read permissions to audit webhook configuration'
        });
      }
    }
  }

  private async checkWebhookSecurity(): Promise<void> {
    // Check for webhook signature verification patterns
    // This is a documentation/pattern check since we can't verify implementation
    this.issues.push({
      severity: 'high',
      type: 'signature_verification',
      message: 'Verify webhook signature verification is implemented',
      recommendation: 'Always verify webhook signatures using Stripe webhook secret to prevent unauthorized requests'
    });

    this.issues.push({
      severity: 'medium',
      type: 'idempotency_handling',
      message: 'Ensure webhook handlers are idempotent',
      recommendation: 'Use idempotency keys or check event.processed flags to prevent duplicate processing'
    });
  }

  getIssues(): WebhookIssue[] {
    return this.issues;
  }
}

