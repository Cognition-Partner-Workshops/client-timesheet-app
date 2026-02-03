const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, '../reports');
const jsonReportPath = path.join(reportDir, 'cucumber-report.json');

if (!fs.existsSync(jsonReportPath)) {
  console.error('No cucumber-report.json found. Run tests first.');
  process.exit(1);
}

report.generate({
  jsonDir: reportDir,
  reportPath: path.join(reportDir, 'html-report'),
  metadata: {
    browser: {
      name: 'chromium',
      version: 'latest'
    },
    device: 'Local Machine',
    platform: {
      name: 'linux',
      version: 'Ubuntu'
    }
  },
  customData: {
    title: 'Test Execution Info',
    data: [
      { label: 'Project', value: 'Client Timesheet App' },
      { label: 'Framework', value: 'Playwright + Cucumber BDD' },
      { label: 'Execution Date', value: new Date().toISOString() }
    ]
  },
  reportName: 'Client Timesheet App - E2E Test Report',
  pageTitle: 'Client Timesheet E2E Tests',
  displayDuration: true,
  displayReportTime: true
});

console.log('HTML Report generated successfully!');
