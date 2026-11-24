/**
 * The optional summary box and question-and-answer section of an article
 * (schemas 3.55.0), and the FAQPage JSON-LD node that restates the questions.
 * Both are plain text: every string is escaped, none is read as Markdown.
 */

import { escapeHtml } from './skeleton.js';

/*
 * These blocks add no class: the template styling contract's catalog digest
 * covers every class a page renders, and a new class would invalidate every
 * published theme. The base layer styles them by their accessible-name ids.
 */

/**
 * @typedef {{question: string, answer: string}} FaqItem
 */

/**
 * The summary box: the box under the article's title block.
 *
 * @param {object} options
 * @param {string | undefined} options.summary the article's `summary`
 * @param {string} options.heading the localized "Summary" heading
 * @param {string} options.icon an icon's markup for the heading
 * @returns {string} the markup, or an empty string without a summary
 */
export function renderSummary({ summary, heading, icon }) {
  if (!summary) return '';
  return (
    `<section aria-labelledby="g-summary-title">` +
    `<h2 class="g-label" id="g-summary-title">${icon}${escapeHtml(heading)}</h2>` +
    `<p>${escapeHtml(summary)}</p></section>`
  );
}

/**
 * The questions and answers: one heading and one or more paragraphs for each
 * pair; a line feed in an answer starts a new paragraph.
 *
 * @param {object} options
 * @param {readonly FaqItem[] | undefined} options.faq the article's `faq`
 * @param {string} options.heading the localized section heading
 * @param {string} options.icon an icon's markup for the heading
 * @returns {string} the markup, or an empty string without questions
 */
export function renderFaq({ faq, heading, icon }) {
  if (!faq || faq.length === 0) return '';
  return (
    `<section aria-labelledby="g-faq-title">` +
    `<h2 id="g-faq-title">${icon}${escapeHtml(heading)}</h2>` +
    faq
      .map(
        (item) =>
          `<div><h3>${escapeHtml(item.question)}</h3>` +
          item.answer
            .split(/\r?\n/)
            .filter((line) => line.trim() !== '')
            .map((line) => `<p>${escapeHtml(line)}</p>`)
            .join('') +
          `</div>`,
      )
      .join('') +
    `</section>`
  );
}

/**
 * The FAQPage node of the article's JSON-LD graph.
 *
 * @param {object} options
 * @param {string} options.url the page's URL, as the Article node names it
 * @param {string} options.language the page's language tag
 * @param {readonly FaqItem[] | undefined} options.faq the article's `faq`
 * @returns {object[]} the node, or none without questions
 */
export function faqPage({ url, language, faq }) {
  if (!faq || faq.length === 0) return [];
  return [
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      inLanguage: language,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];
}
