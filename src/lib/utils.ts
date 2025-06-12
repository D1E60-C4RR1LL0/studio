
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
  const tempHtmlIdToOriginalHtmlMap: Record<string, string> = {}; // Maps temp ID to original HTML
  // originalPlaceholderToTempIdMap is not strictly needed if we replace directly in processedText
  let placeholderIndex = 0;

  // 1. Temporarily replace HTML block placeholders (e.g., {{studentTableHTML}}) with unique IDs (e.g., __HTML_BLOCK_PLACEHOLDER_0__) in the processedText.
  //    Store the mapping from the unique ID back to the original HTML content.
  for (const originalPlaceholderKey in htmlPlaceholders) {
    if (Object.prototype.hasOwnProperty.call(htmlPlaceholders, originalPlaceholderKey)) {
      const tempId = `__HTML_BLOCK_PLACEHOLDER_${placeholderIndex++}__`;
      tempHtmlIdToOriginalHtmlMap[tempId] = htmlPlaceholders[originalPlaceholderKey];
      processedText = processedText.replace(new RegExp(escapeRegExp(originalPlaceholderKey), 'g'), tempId);
    }
  }

  // 2. Process the template (which now contains temporary IDs for HTML blocks), converting plain text parts to HTML.
  //    Blocks are separated by one or more blank lines.
  const blocks = processedText.split(/(\n\s*\n+)/); // Split by one or more blank lines, keeping delimiters
  let htmlResult = "";

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];

    // Skip over delimiter blocks (captured blank lines themselves)
    if (i % 2 === 1) {
      // htmlResult += block; // Preserve newlines if needed, but <p> handles paragraph spacing.
      continue;
    }

    const trimmedBlock = block.trim();

    if (tempHtmlIdToOriginalHtmlMap[trimmedBlock]) {
      // This block is one of the special HTML temporary IDs (e.g., __HTML_BLOCK_PLACEHOLDER_0__).
      // Add THE ID ITSELF (trimmedBlock) to htmlResult. It will be replaced by actual HTML content later.
      // This ensures it's not wrapped in <p> tags and maintains its block-level nature.
      htmlResult += trimmedBlock; 
    } else if (trimmedBlock.startsWith('<') && trimmedBlock.endsWith('>')) {
      // Assume this block is already pre-formatted HTML directly in the template string. Add as is.
      htmlResult += block; // Use `block` to preserve original spacing if any, within the HTML.
    } else if (trimmedBlock) {
      // This is a plain text block. Convert internal newlines to <br /> and wrap in <p>.
      htmlResult += `<p>${block.replace(/\n/g, "<br />")}</p>\n`;
    }
    // If block is empty or only whitespace (and not a delimiter), it's skipped by trimmedBlock check.
  }

  // 3. Replace the temporary HTML block IDs (e.g., __HTML_BLOCK_PLACEHOLDER_0__) in htmlResult with their actual HTML content.
  for (const tempIdKey in tempHtmlIdToOriginalHtmlMap) {
    if (Object.prototype.hasOwnProperty.call(tempHtmlIdToOriginalHtmlMap, tempIdKey)) {
      htmlResult = htmlResult.replace(new RegExp(escapeRegExp(tempIdKey), 'g'), tempHtmlIdToOriginalHtmlMap[tempIdKey]);
    }
  }

  // 4. Replace simple text placeholders (like {{directivo.nombre}}) in the entire HTML accumulated so far.
  for (const key in textPlaceholders) {
    if (Object.prototype.hasOwnProperty.call(textPlaceholders, key)) {
      htmlResult = htmlResult.replace(new RegExp(escapeRegExp(key), 'g'), textPlaceholders[key]);
    }
  }

  return htmlResult.replace(/<p>\s*<\/p>/g, ''); // Remove empty paragraphs
};
