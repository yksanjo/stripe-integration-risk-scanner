#!/usr/bin/env node

import { Command } from 'commander';
import Stripe from 'stripe';
import { RiskAnalyzer } from './analyzer';
import { Reporter } from './reporter';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';

const program = new Command();

program
  .name('stripe-audit')
  .description('Scan your Stripe integration for security risks and best practice violations')
  .version('1.0.0')
  .option('-k, --key <key>', 'Stripe secret key (or set STRIPE_SECRET_KEY env var)')
  .option('-o, --output <format>', 'Output format: console, json, html', 'console')
  .option('-f, --file <path>', 'Output file path (for json/html formats)')
  .action(async (options) => {
    const apiKey = options.key || process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      console.error('Error: Stripe secret key required. Use --key or set STRIPE_SECRET_KEY environment variable.');
      process.exit(1);
    }

    if (!apiKey.startsWith('sk_')) {
      console.error('Error: Invalid Stripe secret key format. Must start with sk_test_ or sk_live_');
      process.exit(1);
    }

    const spinner = ora('Scanning Stripe integration...').start();

    try {
      const stripe = new Stripe(apiKey, {
        apiVersion: '2024-11-20.acacia',
      });

      const analyzer = new RiskAnalyzer(stripe);
      const result = await analyzer.analyze();

      spinner.succeed('Scan complete!');

      // Generate report based on format
      switch (options.output.toLowerCase()) {
        case 'json':
          const jsonReport = Reporter.generateJSONReport(result);
          if (options.file) {
            fs.writeFileSync(options.file, jsonReport);
            console.log(`\nReport saved to: ${options.file}`);
          } else {
            console.log(jsonReport);
          }
          break;

        case 'html':
          const htmlReport = Reporter.generateHTMLReport(result);
          const htmlPath = options.file || 'stripe-audit-report.html';
          fs.writeFileSync(htmlPath, htmlReport);
          console.log(`\nReport saved to: ${htmlPath}`);
          break;

        case 'console':
        default:
          Reporter.printConsoleReport(result);
          break;
      }

      // Exit with error code if high severity issues found
      if (result.riskScore.high > 0) {
        process.exit(1);
      }
    } catch (error: any) {
      spinner.fail('Scan failed');
      console.error('\nError:', error.message);
      
      if (error.type === 'StripeAuthenticationError') {
        console.error('Invalid API key. Please check your Stripe secret key.');
      } else if (error.type === 'StripePermissionError') {
        console.error('API key does not have required permissions. Some checks may be incomplete.');
      }
      
      process.exit(1);
    }
  });

program.parse();

