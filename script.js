const { chromium, firefox } = require('playwright');
const AxeBuilder = require('@axe-core/playwright');
const { createHtmlReport } = require('contrast-compass-axe-html-reporter');
const enhanceHtmlReport = require('./enhanceHtmlReport');
const fs = require('fs').promises;

async function runAudit(url) {
  const browserType = process.env.BROWSER || 'chromium';
  const browser = await (browserType === 'chromium' ? chromium : firefox).launch({ headless: true });
  const context = await browser.newContext({});
  const page = await context.newPage();

  await page.goto(url);
  const failingTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
  const feedbackTags = ['wcag2aaa', 'best-practice'];
  const allTags = failingTags.concat(feedbackTags);

  const results = await new AxeBuilder({ page })
    .withTags(allTags)
    .analyze();

  // Generate report and place it in domain-specific folder
  const domain = new URL(url).hostname;
  const route = new URL(url).pathname.replaceAll('/','_');
  const parts = domain.split('.');
  const reportDir = parts[parts.length-2];
  const path = route === '_' ? 'index' : route.slice(1)

  const options = {
    projectKey: domain + '/'+ path,
    outputDir: `reports/${reportDir}`,
    reportFileName: `${path}.html`,
    appendToExisting: false
  };

  // Generate the initial HTML report
  const initialReport = await createHtmlReport({
    results, 
    options
  });

  // Enhance the HTML report
  const enhancedReport = enhanceHtmlReport(initialReport, results, url);

  // Write the enhanced report to file
  const reportPath = `${options.outputDir}/${options.reportFileName}`;
  await fs.writeFile(reportPath, enhancedReport);

  await browser.close();
}

(async () => {
  try {
    const fileContent = await fs.readFile('urls.txt', 'utf-8');
    const urls = fileContent.split('\n');
    console.log(`Processing audits for ${urls.length} URLs`);
    for (const url of urls) {
      // Trim any extra spaces or newline characters
      const trimmedUrl = url.trim();
      if (trimmedUrl.length > 0) {
        await runAudit(trimmedUrl);
      }
    }

    console.log("All audits completed!");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
