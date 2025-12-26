import Stripe from 'stripe';

export interface PCIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  recommendation: string;
}

export class PCIScanner {
  private stripe: Stripe;
  private issues: PCIssue[] = [];

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async scan(): Promise<PCIssue[]> {
    this.issues = [];

    await this.checkSCACompliance();
    await this.checkCardDataHandling();
    await this.checkPaymentMethodSecurity();

    return this.issues;
  }

  private async checkSCACompliance(): Promise<void> {
    try {
      // Check for 3D Secure usage in EU
      const paymentIntents = await this.stripe.paymentIntents.list({ limit: 20 });
      
      let scaCount = 0;
      let totalCount = 0;

      for (const pi of paymentIntents.data) {
        totalCount++;
        if (pi.payment_method_options?.card?.request_three_d_secure === 'automatic' ||
            pi.payment_method_options?.card?.request_three_d_secure === 'any') {
          scaCount++;
        }
      }

      if (totalCount > 0 && scaCount / totalCount < 0.5) {
        this.issues.push({
          severity: 'high',
          type: 'sca_compliance',
          message: 'Low 3D Secure usage detected - may violate SCA requirements for EU',
          recommendation: 'Enable 3D Secure (SCA) for all EU payments to comply with PSD2 regulations'
        });
      }
    } catch (error: any) {
      if (error.type === 'StripePermissionError') {
        this.issues.push({
          severity: 'low',
          type: 'sca_permission_denied',
          message: 'Cannot access payment intents to check SCA compliance',
          recommendation: 'Grant payment intents read permission to audit SCA usage'
        });
      }
    }

    // General SCA recommendation
    this.issues.push({
      severity: 'medium',
      type: 'sca_best_practice',
      message: 'Ensure SCA (3D Secure) is properly configured for EU customers',
      recommendation: 'Use Stripe\'s automatic SCA handling or explicitly request 3D Secure for EU payments'
    });
  }

  private async checkCardDataHandling(): Promise<void> {
    // Check if payment methods are being stored securely
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({ limit: 10 });
      
      if (paymentMethods.data.length > 0) {
        // Check if payment methods are attached to customers (good practice)
        const unattached = paymentMethods.data.filter(pm => !pm.customer);
        
        if (unattached.length > 0) {
          this.issues.push({
            severity: 'medium',
            type: 'unattached_payment_methods',
            message: 'Found payment methods not attached to customers',
            recommendation: 'Attach payment methods to customers for better security and PCI compliance'
          });
        }
      }
    } catch (error) {
      // Permission issue
    }

    // General PCI recommendation
    this.issues.push({
      severity: 'high',
      type: 'pci_compliance',
      message: 'Never store raw card data - use Stripe Payment Methods or Elements',
      recommendation: 'Use Stripe.js and Payment Intents API to handle card data securely without touching PCI scope'
    });
  }

  private async checkPaymentMethodSecurity(): Promise<void> {
    this.issues.push({
      severity: 'high',
      type: 'card_data_security',
      message: 'Verify card data never touches your servers',
      recommendation: 'Use Stripe Elements or Checkout to collect card data directly from Stripe, never send card numbers to your backend'
    });

    this.issues.push({
      severity: 'medium',
      type: 'cvv_handling',
      message: 'CVV should never be stored',
      recommendation: 'CVV codes should only be collected at payment time and never stored or logged'
    });
  }

  getIssues(): PCIssue[] {
    return this.issues;
  }
}

