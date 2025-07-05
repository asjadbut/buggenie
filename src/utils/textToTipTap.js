// Convert plain text from OpenAI to TipTap JSON format
export function textToTipTapJson(text) {
  if (!text) return { type: 'doc', content: [] };

  const lines = text.split('\n').filter(line => line.trim() !== '');
  const content = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for headings (lines that end with numbers or are short and followed by content)
    if (line.match(/^[A-Z][A-Za-z\s]+$/) && line.length < 50) {
      // Check if next line is content (not another heading)
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && !nextLine.match(/^[A-Z][A-Za-z\s]+$/) && nextLine.length > 20) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: line }]
        });
        continue;
      }
    }

    // Check for numbered lists
    if (line.match(/^\d+\.\s/)) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      });
      continue;
    }

    // Check for bullet points
    if (line.match(/^[-*]\s/)) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      });
      continue;
    }

    // Check for code blocks (lines that look like code)
    if (line.includes('http') || line.includes('GET') || line.includes('POST') || 
        line.includes('curl') || line.includes('{') || line.includes('}') ||
        line.includes('<') || line.includes('>') || line.includes('=')) {
      content.push({
        type: 'codeBlock',
        content: [{ type: 'text', text: line }]
      });
      continue;
    }

    // Regular paragraphs
    if (line.length > 0) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      });
    }
  }

  return {
    type: 'doc',
    content: content
  };
}

// Convert TipTap JSON back to plain text
export function tipTapJsonToText(json) {
  if (!json || !json.content) return '';

  return json.content.map(node => {
    if (node.type === 'heading') {
      return node.content?.map(n => n.text).join('') || '';
    } else if (node.type === 'paragraph') {
      return node.content?.map(n => n.text).join('') || '';
    } else if (node.type === 'codeBlock') {
      return node.content?.map(n => n.text).join('') || '';
    }
    return '';
  }).join('\n\n');
} 