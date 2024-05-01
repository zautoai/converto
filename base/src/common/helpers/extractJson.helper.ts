export function extractJsonFromMarkdown(mdContent: string) {
    // Regular expression to match a JSON block within Markdown
    const jsonRegex = /```json([\s\S]*?)```/;

    // Extract JSON string
    const match = mdContent.match(jsonRegex);
    
    if (match && match[1]) {
        // Clean up whitespace and parse JSON
        try {
            const jsonString = match[1].trim();
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return null;
        }
    } else {
        console.error('No JSON content found');
        return null;
    }
  }