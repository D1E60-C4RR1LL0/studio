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
  htmlPlaceholders: Record<string, string>,
  textPlaceholders: Record<string, string>
): string => {
  let processedText = plainTextTemplate;

  const tempHtmlPlaceholderMap: Record<string, string> = {};
  let placeholderIndex = 0;

  // Temporarily replace HTML block placeholders with unique IDs
  for (const key in htmlPlaceholders) {
    const tempId = `__HTML_PLACEHOLDER_${placeholderIndex++}__`;
    tempHtmlPlaceholderMap[tempId] = htmlPlaceholders[key];
    // Ensure the key is properly escaped for RegExp
    processedText = processedText.replace(new RegExp(escapeRegExp(key), 'g'), tempId);
  }
  
  let htmlResult = processedText
    .split(/\n\s*\n/) // Split by one or more empty lines (paragraph breaks)
    .map(paragraph => {
      if (paragraph.trim() === "") return ""; 
      
      let currentBlock = paragraph.trim(); // Trim paragraph here for checks
      let isEntirelyHtmlBlock = false;

      // Check if this paragraph (after trimming) corresponds *exactly* to one of the temp IDs
      for (const tempId in tempHtmlPlaceholderMap) {
        if (currentBlock === tempId) {
          currentBlock = tempHtmlPlaceholderMap[tempId]; // Replace with actual HTML content
          isEntirelyHtmlBlock = true;
          break; 
        }
      }
      
      if (isEntirelyHtmlBlock) {
        return currentBlock; // This is one of the pre-defined HTML blocks, return as-is
      }

      // If not an entire HTML block, this paragraph is user text.
      // We still need to replace any tempIDs that might be *within* user text
      // if they weren't caught above (e.g., if user typed __HTML_PLACEHOLDER_0__ by mistake or complex case).
      // This is less likely given the current placeholder format but good for robustness.
      let userTextParagraph = paragraph; // Use original paragraph with its leading/trailing spaces for this step.
      for (const tempId in tempHtmlPlaceholderMap) {
         if (userTextParagraph.includes(tempId)) {
            userTextParagraph = userTextParagraph.replace(new RegExp(escapeRegExp(tempId), 'g'), tempHtmlPlaceholderMap[tempId]);
         }
      }
      
      // Convert newlines within the user text paragraph to <br /> and wrap in <p>
      // Note: If paragraph was only whitespace, it was handled by the trim() === "" check earlier.
      // Leading/trailing whitespace on non-empty paragraphs will be preserved inside the <p> tag.
      return `<p>${userTextParagraph.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n"); // Join paragraphs with newlines, which is fine for HTML source

  // Replace simple text placeholders in the final HTML
  for (const key in textPlaceholders) {
    // Ensure the key is properly escaped for RegExp
    htmlResult = htmlResult.replace(new RegExp(escapeRegExp(key), 'g'), textPlaceholders[key]);
  }

  return htmlResult;
};
