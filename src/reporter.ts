import { ScanResult, ScanIssue } from './analyzer';
import chalk from 'chalk';

export class Reporter {
  static printConsoleReport(result: ScanResult): void {
    console.log('\n' + chalk.bold.underline('Stripe Integration Risk Scan Report'));
    console.log('=' .repeat(60) + '\n');

    // Risk Score
    const scoreColor = result.riskScore.percentage >= 70 ? chalk.red :
                      result.riskScore.percentage >= 40 ? chalk.yellow :
                      chalk.green;

    console.log(chalk.bold('Risk Score: ') + scoreColor(`${result.riskScore.percentage}%`));
    console.log(`  Total Issues: ${result.riskScore.total}`);
    console.log(`  High: ${chalk.red(result.riskScore.high)} | Medium: ${chalk.yellow(result.riskScore.medium)} | Low: ${chalk.blue(result.riskScore.low)}\n`);

    if (result.accountId) {
      console.log(`Account ID: ${result.accountId}\n`);
    }

    // Group issues by severity
    const highIssues = result.issues.filter(i => i.severity === 'high');
    const mediumIssues = result.issues.filter(i => i.severity === 'medium');
    const lowIssues = result.issues.filter(i => i.severity === 'low');

    if (highIssues.length > 0) {
      console.log(chalk.bold.red('\n🔴 HIGH SEVERITY ISSUES:'));
      highIssues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${chalk.red(issue.type)}`);
        console.log(`   ${issue.message}`);
        console.log(`   ${chalk.gray('→ ' + issue.recommendation)}`);
      });
    }

    if (mediumIssues.length > 0) {
      console.log(chalk.bold.yellow('\n🟡 MEDIUM SEVERITY ISSUES:'));
      mediumIssues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${chalk.yellow(issue.type)}`);
        console.log(`   ${issue.message}`);
        console.log(`   ${chalk.gray('→ ' + issue.recommendation)}`);
      });
    }

    if (lowIssues.length > 0) {
      console.log(chalk.bold.blue('\n🔵 LOW SEVERITY / INFORMATIONAL:'));
      lowIssues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${chalk.blue(issue.type)}`);
        console.log(`   ${issue.message}`);
        console.log(`   ${chalk.gray('→ ' + issue.recommendation)}`);
      });
    }

    if (result.issues.length === 0) {
      console.log(chalk.green('\n✅ No issues found! Your Stripe integration looks secure.'));
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  static generateJSONReport(result: ScanResult): string {
    return JSON.stringify(result, null, 2);
  }

  static generateHTMLReport(result: ScanResult): string {
    const scoreColor = result.riskScore.percentage >= 70 ? '#dc2626' :
                      result.riskScore.percentage >= 40 ? '#d97706' :
                      '#16a34a';

    const highIssues = result.issues.filter(i => i.severity === 'high');
    const mediumIssues = result.issues.filter(i => i.severity === 'medium');
    const lowIssues = result.issues.filter(i => i.severity === 'low');

    return `<!DOCTYPE html>
<html>
<head>
  <title>Stripe Integration Risk Scan Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; border-bottom: 3px solid #635bff; padding-bottom: 10px; }
    .risk-score { font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 20px 0; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { padding: 15px; background: #f9f9f9; border-radius: 6px; flex: 1; }
    .stat-label { color: #666; font-size: 14px; }
    .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
    .high { color: #dc2626; }
    .medium { color: #d97706; }
    .low { color: #2563eb; }
    .issue { margin: 20px 0; padding: 15px; border-left: 4px solid; border-radius: 4px; background: #f9f9f9; }
    .issue.high { border-color: #dc2626; }
    .issue.medium { border-color: #d97706; }
    .issue.low { border-color: #2563eb; }
    .issue-type { font-weight: bold; font-size: 18px; margin-bottom: 8px; }
    .issue-message { margin: 8px 0; }
    .issue-recommendation { color: #666; font-style: italic; margin-top: 8px; }
    .section { margin: 40px 0; }
    .section-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e5e5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Stripe Integration Risk Scan Report</h1>
    <div class="risk-score">${result.riskScore.percentage}%</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Total Issues</div>
        <div class="stat-value">${result.riskScore.total}</div>
      </div>
      <div class="stat">
        <div class="stat-label">High Severity</div>
        <div class="stat-value high">${result.riskScore.high}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Medium Severity</div>
        <div class="stat-value medium">${result.riskScore.medium}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Low Severity</div>
        <div class="stat-value low">${result.riskScore.low}</div>
      </div>
    </div>
    ${result.accountId ? `<p><strong>Account ID:</strong> ${result.accountId}</p>` : ''}
    <p><strong>Scan Date:</strong> ${new Date(result.timestamp).toLocaleString()}</p>

    ${highIssues.length > 0 ? `
    <div class="section">
      <div class="section-title high">🔴 High Severity Issues</div>
      ${highIssues.map(issue => `
        <div class="issue high">
          <div class="issue-type">${this.escapeHtml(issue.type)}</div>
          <div class="issue-message">${this.escapeHtml(issue.message)}</div>
          <div class="issue-recommendation">→ ${this.escapeHtml(issue.recommendation)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${mediumIssues.length > 0 ? `
    <div class="section">
      <div class="section-title medium">🟡 Medium Severity Issues</div>
      ${mediumIssues.map(issue => `
        <div class="issue medium">
          <div class="issue-type">${this.escapeHtml(issue.type)}</div>
          <div class="issue-message">${this.escapeHtml(issue.message)}</div>
          <div class="issue-recommendation">→ ${this.escapeHtml(issue.recommendation)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${lowIssues.length > 0 ? `
    <div class="section">
      <div class="section-title low">🔵 Low Severity / Informational</div>
      ${lowIssues.map(issue => `
        <div class="issue low">
          <div class="issue-type">${this.escapeHtml(issue.type)}</div>
          <div class="issue-message">${this.escapeHtml(issue.message)}</div>
          <div class="issue-recommendation">→ ${this.escapeHtml(issue.recommendation)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${result.issues.length === 0 ? '<div class="issue" style="border-color: #16a34a;"><div class="issue-type">✅ No issues found! Your Stripe integration looks secure.</div></div>' : ''}
  </div>
</body>
</html>`;
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

