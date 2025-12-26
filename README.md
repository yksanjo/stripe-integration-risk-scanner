# Stripe Integration Risk Scanner

A CLI tool that scans your Stripe integration for security risks, compliance issues, and best practice violations. Helps identify dangerous API usage patterns, missing idempotency keys, insecure webhook configurations, PCI/SCA misconfigurations, and over-collection of PII.

## Why Stripe Would Care

- **Reduces platform-wide fraud & outages** - Catches integration issues before they cause problems
- **Improves developer quality across ecosystem** - Helps developers build more secure integrations
- **Lowers Stripe support load** - Prevents common issues that lead to support tickets
- **Protects Stripe's brand** - Ensures merchants follow security best practices

## Features

- 🔍 **Comprehensive Scanning**: Checks API usage, webhooks, idempotency, PCI compliance, and PII collection
- 📊 **Risk Scoring**: Calculates a risk score based on issue severity
- 📝 **Multiple Output Formats**: Console, JSON, or HTML reports
- ⚡ **Fast**: Parallel scanning of all security checks
- 🔒 **Safe**: Uses read-only API access (works with restricted keys)

## Installation

```bash
npm install -g stripe-integration-risk-scanner
```

Or use with npx:

```bash
npx stripe-integration-risk-scanner
```

## Usage

### Basic Usage

```bash
stripe-audit --key sk_test_your_key_here
```

Or set the key as an environment variable:

```bash
export STRIPE_SECRET_KEY=sk_test_your_key_here
stripe-audit
```

### Output Formats

**Console (default):**
```bash
stripe-audit --key sk_test_...
```

**JSON:**
```bash
stripe-audit --key sk_test_... --output json --file report.json
```

**HTML:**
```bash
stripe-audit --key sk_test_... --output html --file report.html
```

## What It Scans

### API Usage Scanner
- ✅ Overly broad API keys (should use restricted keys)
- ✅ Missing idempotency keys
- ✅ Test keys in production
- ✅ Dangerous API patterns

### Webhook Scanner
- ✅ Missing webhook signature verification
- ✅ Insecure webhook URLs (HTTP instead of HTTPS)
- ✅ Disabled webhook endpoints
- ✅ Localhost webhooks in production

### Idempotency Scanner
- ✅ Duplicate charge patterns
- ✅ Missing idempotency keys for refunds
- ✅ Best practice recommendations

### PCI Compliance Scanner
- ✅ SCA (3D Secure) compliance for EU
- ✅ Card data handling practices
- ✅ Payment method security
- ✅ CVV storage warnings

### PII Scanner
- ✅ Over-collection of sensitive data
- ✅ Sensitive PII in metadata
- ✅ GDPR compliance recommendations
- ✅ Data retention policies

## Risk Score

The tool calculates a risk score (0-100%) based on:
- **High severity issues**: 10 points each
- **Medium severity issues**: 5 points each
- **Low severity issues**: 1 point each

## Example Output

```
Stripe Integration Risk Scan Report
============================================================

Risk Score: 45%
  Total Issues: 8
  High: 2 | Medium: 4 | Low: 2

🔴 HIGH SEVERITY ISSUES:

1. overly_broad_key
   API key appears to have full account access
   → Use restricted API keys with minimal required permissions

2. signature_verification
   Verify webhook signature verification is implemented
   → Always verify webhook signatures using Stripe webhook secret
```

## Permissions

The tool works best with a restricted API key that has read permissions for:
- `charges:read`
- `payment_intents:read`
- `webhook_endpoints:read`
- `customers:read`
- `refunds:read`
- `payment_methods:read`

However, it will still work with limited permissions and report what it can check.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev -- --key sk_test_...
```

## License

MIT

## Contributing

Contributions welcome! This tool is designed to improve Stripe ecosystem security and help developers build better integrations.

