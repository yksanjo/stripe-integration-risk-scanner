import Stripe from 'stripe';

export interface PIIIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  recommendation: string;
}

export class PIIScanner {
  private stripe: Stripe;
  private issues: PIIIssue[] = [];

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async scan(): Promise<PIIIssue[]> {
    this.issues = [];

    await this.checkCustomerDataCollection();
    await this.checkMetadataUsage();
    await this.checkDataRetention();

    return this.issues;
  }

  private async checkCustomerDataCollection(): Promise<void> {
    try {
      const customers = await this.stripe.customers.list({ limit: 10 });
      
      // Check for excessive PII collection
      for (const customer of customers.data) {
        // Check if unnecessary PII is being collected
        if (customer.phone && customer.phone.length > 0) {
          // Phone is fine, but check if it's necessary
        }

        // Check metadata for sensitive data
        if (customer.metadata) {
          const sensitiveKeys = ['ssn', 'social_security', 'passport', 'drivers_license', 'credit_score'];
          for (const key of Object.keys(customer.metadata)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
              this.issues.push({
                severity: 'high',
                type: 'sensitive_pii_in_metadata',
                message: `Customer metadata contains potentially sensitive PII: ${key}`,
                recommendation: 'Avoid storing sensitive PII in Stripe metadata. Use secure storage solutions for SSN, passport numbers, etc.'
              });
            }
          }
        }
      }
    } catch (error: any) {
      if (error.type === 'StripePermissionError') {
        this.issues.push({
          severity: 'low',
          type: 'pii_permission_denied',
          message: 'Cannot access customer data to check PII collection',
          recommendation: 'Grant customers read permission to audit PII collection practices'
        });
      }
    }
  }

  private async checkMetadataUsage(): Promise<void> {
    this.issues.push({
      severity: 'medium',
      type: 'metadata_best_practice',
      message: 'Review metadata usage for unnecessary PII collection',
      recommendation: 'Only collect PII that is necessary for payment processing. Avoid storing SSN, passport numbers, or other sensitive identifiers in Stripe metadata'
    });

    this.issues.push({
      severity: 'low',
      type: 'gdpr_compliance',
      message: 'Ensure GDPR compliance for EU customers',
      recommendation: 'Implement data minimization principles - only collect PII that is necessary and has a legal basis'
    });
  }

  private async checkDataRetention(): Promise<void> {
    this.issues.push({
      severity: 'medium',
      type: 'data_retention',
      message: 'Implement data retention policies',
      recommendation: 'Define and enforce data retention policies for customer PII. Delete data that is no longer needed'
    });

    this.issues.push({
      severity: 'low',
      type: 'data_portability',
      message: 'Ensure customers can access and export their data',
      recommendation: 'Implement GDPR right to data portability - allow customers to export their data in machine-readable format'
    });
  }

  getIssues(): PIIIssue[] {
    return this.issues;
  }
}

