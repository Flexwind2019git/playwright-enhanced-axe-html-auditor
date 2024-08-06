// const { createHtmlReport } = require('contrast-compass-axe-html-reporter');
const { load } = require('cheerio');

function enhanceHtmlReport(html, results, url) {
  // Ensure html is a string
  html = String(html);

  const $ = load(html);

  if (!results || !results.violations) {
    return $.html(); // or throw an error
  }

  results.violations.forEach((violation, violationIndex) => {
    if (violation.id === 'color-contrast' || violation.id === 'color-contrast-enhanced') {
      if (!violation.nodes) {
        return; // or throw an error
      }
      const table = $(".table-sm").eq(violationIndex);
      if (!table.length) {
        return;
      }
      table.attr('id',`${violation.id}-violations-table`);
      violation.nodes.forEach((node, index) => {
        if (!node.any || !node.any[0] || !node.any[0].data) {
          return; // or throw an error
        }

        const { fgColor, bgColor, expectedContrastRatio } = node.any[0].data;
        const fixLink = `https://contrast-compass.vercel.app?fg=${encodeURIComponent(fgColor)}&bg=${encodeURIComponent(bgColor)}&threshold=${expectedContrastRatio}&url=${encodeURIComponent(url)}&selector=${encodeURIComponent(node.target)}`;
        const tableRow = $(`#${violation.id}-violations-table tbody tr`).eq(index);
        if (!tableRow.length) {
          return; // or throw an error
        }

        tableRow.append(`
          <td>
            <a href="${fixLink}" title="fix now" target="contrast-compass"><img src="https://contrast-compass.vercel.app/assets/compass-companion-120x100.webp" height="50" width="60" /></a>
          </td>
        `);
      });
    }
  });

  const colorContrastTables = $(`#color-contrast-violations-table, #color-contrast-enhanced-violations-table`);
  if (colorContrastTables.length) {
    colorContrastTables.find('thead tr').append('<th>Fix Now</th>');
  }

  return $.html();
}

module.exports = enhanceHtmlReport;

// const jsdom = require('jsdom');
// const { JSDOM } = jsdom;

// function enhanceHtmlReport(html, results, url) {
//   const dom = new JSDOM(html);
//   const document = dom.window.document;
//   const body = document.body;

//   results.violations.forEach((violation, index) => {
//     console.log(violation.id, index);
//     if (violation.id === 'color-contrast' || violation.id === 'color-contrast-enhanced') {
//       const table = body.querySelectorAll('table')[index+1];
//       if (table) {
//         console.log(`wiring up contrast-compass for ${violation.id} violations`);
//         const headerRow = table.querySelector('thead tr');
//         const newHeader = document.createElement('th');
//         newHeader.textContent = 'Fix';
//         headerRow.appendChild(newHeader);
//         const tbody = table.querySelector('tbody');
//         violation.nodes.forEach((node, index) => {
//           const { fgColor, bgColor, expectedContrastRatio } = node.any[0].data;
//           const fixLink = `https://contrast-compass.vercel.app?fg=${encodeURIComponent(fgColor)}&bg=${encodeURIComponent(bgColor)}&threshold=${expectedContrastRatio}&url=${encodeURIComponent(url)}&selector=${encodeURIComponent(node.target)}`;
//           const row = tbody.children[index];
//           if (row) {
//             const newCell = document.createElement('td');
//             const link = document.createElement('a');
//             link.href = fixLink;
//             link.title="fix now";
//             link.target="contrast-compass";
//             link.innerHTML=`<img src="https://contrast-compass.vercel.app/assets/compass-companion-120x100.webp" height="50" width="60" /></a>`;
//             newCell.appendChild(link);
//             row.appendChild(newCell);
//           }
//         });
//       }
//     }
//   });

//   return dom.serialize();
// }