
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to escape special characters for use in RegExp
export function escapeRegExp(string: string): string {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export const textToHtmlWithPlaceholders = (
  plainTextTemplate: string,
  htmlPlaceholders: Record<string, string>, // e.g., {"{{studentTableHTML}}": "<table>..."}
  textPlaceholders: Record<string, string>  // e.g., {"{{directivo.nombre}}": "Juan Perez"}
): string => {
  let processedText = plainTextTemplate;

  // 1. Temporarily replace HTML block placeholders (like {{studentTableHTML}}) with unique IDs
  //    to protect them from general text processing.
  const tempHtmlPlaceholderMap: Record<string, string> = {};
  let placeholderIndex = 0;
  for (const key in htmlPlaceholders) {
    if (Object.prototype.hasOwnProperty.call(htmlPlaceholders, key)) {
      const tempId = `__HTML_BLOCK_PLACEHOLDER_${placeholderIndex++}__`;
      tempHtmlPlaceholderMap[tempId] = htmlPlaceholders[key];
      processedText = processedText.replace(new RegExp(escapeRegExp(key), 'g'), tempId);
    }
  }

  // 2. Process the template, converting plain text parts to HTML
  //    while preserving already identified HTML blocks and pre-formatted HTML.
  const blocks = processedText.split(/(\n\s*\n+)/); // Split by one or more blank lines, keeping delimiters
  let htmlResult = "";

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];

    // Skip over delimiter blocks (captured blank lines)
    if (i % 2 === 1) {
      // htmlResult += block; // If we wanted to preserve multiple newlines as is in source, but <p> handles paragraph spacing
      continue;
    }

    const trimmedBlock = block.trim();

    if (tempHtmlPlaceholderMap[trimmedBlock]) {
      // This block is one of the special HTML placeholders (e.g., {{studentTableHTML}})
      htmlResult += tempHtmlPlaceholderMap[trimmedBlock];
    } else if (trimmedBlock.startsWith('<') && trimmedBlock.endsWith('>')) {
      // Assume this block is already formatted HTML (e.g., an embedded table)
      // We need to be careful here: internal newlines in this pre-formatted HTML block
      // should NOT be converted to <br />.
      // And it should NOT be wrapped in <p> tags.
      htmlResult += block; // Add the block as is (preserving original newlines within it for source readability)
    } else if (trimmedBlock) {
      // This is a plain text block
      // Convert internal newlines to <br /> and wrap in <p>
      htmlResult += `<p>${block.replace(/\n/g, "<br />")}</p>\n`;
    }
  }
  
  // 3. Replace simple text placeholders (like {{directivo.nombre}}) in the entire HTML accumulated so far.
  for (const key in textPlaceholders) {
    if (Object.prototype.hasOwnProperty.call(textPlaceholders, key)) {
      htmlResult = htmlResult.replace(new RegExp(escapeRegExp(key), 'g'), textPlaceholders[key]);
    }
  }

  // 4. Clean up: Remove any <p><br /></p> that might result from empty lines or multiple <br> sequences.
  // and ensure that paragraphs containing only an HTML block placeholder are not wrapped in <p> tags again.
  // This part can be tricky and might need more sophisticated parsing if issues arise.
  // A simpler approach for now: if an HTML block placeholder was the only content of what would be a <p>,
  // the logic above (tempHtmlPlaceholderMap[trimmedBlock]) should handle it.
  // The main concern is not double-wrapping or misinterpreting newlines within pre-formatted HTML.

  // The current logic of adding `block` directly for pre-formatted HTML
  // and `tempHtmlPlaceholderMap[trimmedBlock]` for placeholders
  // should prevent them from being wrapped in <p> or having internal newlines converted.

  return htmlResult.replace(/<p>\s*<\/p>/g, ''); // Remove empty paragraphs
};
