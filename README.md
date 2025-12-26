# Stripe Integration Risk Scanner 🔍

[![GitHub stars](https://img.shields.io/github/stars/yksanjo/stripe-integration-risk-scanner?style=social)](https://github.com/yksanjo/stripe-integration-risk-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)

A comprehensive CLI tool that scans your Stripe integration for security risks, compliance issues, and best practice violations. Identifies dangerous API usage patterns, missing idempotency keys, insecure webhook configurations, PCI/SCA misconfigurations, and over-collection of PII.

## 📸 Screenshots

### Console Output
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
```

### HTML Report
![HTML Report Preview](https://via.placeholder.com/800x600/635BFF/FFFFFF?text=Stripe+Risk+Scanner+HTML+Report)

*Note: Add actual screenshot of HTML report after running the tool*

## 🎯 Why Stripe Would Care

- **Reduces platform-wide fraud & outages** - Catches integration issues before they cause problems
- **Improves developer quality across ecosystem** - Helps developers build more secure integrations
- **Lowers Stripe support load** - Prevents common issues that lead to support tickets
- **Protects Stripe's brand** - Ensures merchants follow security best practices
- **Strategic acquisition signal** - Stripe loves tools that improve ecosystem hygiene

## ✨ Features

- 🔍 **Comprehensive Scanning**: Checks API usage, webhooks, idempotency, PCI compliance, and PII collection
- 📊 **Risk Scoring**: Calculates a risk score (0-100%) based on issue severity
- 📝 **Multiple Output Formats**: Console, JSON, or HTML reports
- ⚡ **Fast**: Parallel scanning of all security checks
- 🔒 **Safe**: Uses read-only API access (works with restricted keys)
- 🎨 **Beautiful Reports**: HTML reports with color-coded severity levels

## 📦 Installation

### Global Installation

```bash
npm install -g stripe-integration-risk-scanner
```

### Using npx (No Installation)

```bash
npx stripe-integration-risk-scanner
```

### Local Development

```bash
git clone https://github.com/yksanjo/stripe-integration-risk-scanner.git
cd stripe-integration-risk-scanner
npm install
npm run build
```

## 🚀 Usage

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

## 🔎 What It Scans

### API Usage Scanner
- ✅ Overly broad API keys (should use restricted keys)
- ✅ Missing idempotency keys
- ✅ Test keys in production
- ✅ Dangerous API patterns
- ✅ Account access permissions

### Webhook Scanner
- ✅ Missing webhook signature verification
- ✅ Insecure webhook URLs (HTTP instead of HTTPS)
- ✅ Disabled webhook endpoints
- ✅ Localhost webhooks in production
- ✅ Webhook endpoint configuration

### Idempotency Scanner
- ✅ Duplicate charge patterns
- ✅ Missing idempotency keys for refunds
- ✅ Best practice recommendations
- ✅ Potential duplicate transactions

### PCI Compliance Scanner
- ✅ SCA (3D Secure) compliance for EU
- ✅ Card data handling practices
- ✅ Payment method security
- ✅ CVV storage warnings
- ✅ PCI scope reduction recommendations

### PII Scanner
- ✅ Over-collection of sensitive data
- ✅ Sensitive PII in metadata
- ✅ GDPR compliance recommendations
- ✅ Data retention policies
- ✅ Data minimization principles

## 📊 Risk Score Calculation

The tool calculates a risk score (0-100%) based on:
- **High severity issues**: 10 points each
- **Medium severity issues**: 5 points each
- **Low severity issues**: 1 point each

Score = (Total Points / Max Possible Points) × 100

## 📋 Example Output

```
Stripe Integration Risk Scan Report
============================================================

Risk Score: 45%
  Total Issues: 8
  High: 2 | Medium: 4 | Low: 2

Account ID: acct_1234567890

🔴 HIGH SEVERITY ISSUES:

1. overly_broad_key
   API key appears to have full account access
   → Use restricted API keys with minimal required permissions

2. signature_verification
   Verify webhook signature verification is implemented
   → Always verify webhook signatures using Stripe webhook secret to prevent unauthorized requests

🟡 MEDIUM SEVERITY ISSUES:

1. idempotency_check
   Verify idempotency keys are used for all charge/payment operations
   → Always include idempotency_key parameter for idempotent operations

...
```

## 🔐 Permissions

The tool works best with a restricted API key that has read permissions for:
- `charges:read`
- `payment_intents:read`
- `webhook_endpoints:read`
- `customers:read`
- `refunds:read`
- `payment_methods:read`
- `account:read`

However, it will still work with limited permissions and report what it can check.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev -- --key sk_test_...

# Run tests (if available)
npm test
```

## 📁 Project Structure

```
stripe-integration-risk-scanner/
├── src/
│   ├── scanners/
│   │   ├── apiUsageScanner.ts
│   │   ├── webhookScanner.ts
│   │   ├── idempotencyScanner.ts
│   │   ├── pciScanner.ts
│   │   └── piiScanner.ts
│   ├── analyzer.ts
│   ├── reporter.ts
│   └── cli.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

Contributions welcome! This tool is designed to improve Stripe ecosystem security and help developers build better integrations.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built for the Stripe ecosystem
- Inspired by security best practices
- Designed to reduce fraud and improve developer experience

## 🔗 Related Projects

- [Stripe Revenue Leak Detector](https://github.com/yksanjo/stripe-revenue-leak-detector)
- [Stripe Compliance-as-Code](https://github.com/yksanjo/stripe-compliance-as-code)
- [Stripe Account Health Scoring](https://github.com/yksanjo/stripe-account-health-scoring)

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ for the Stripe ecosystem**
