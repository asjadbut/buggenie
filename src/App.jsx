import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, MenuItem, Select, FormControl, InputLabel, Paper, Stack } from '@mui/material';
import { PLATFORMS } from './platforms';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import jsPDF from 'jspdf';

const PAGES = [
  { label: 'Landing', key: 'landing' },
  { label: 'Why/Benefits', key: 'benefits' },
  { label: 'Main App', key: 'main' },
];

function App() {
  const [page, setPage] = useState('landing');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [vrtOptions, setVrtOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selected = PLATFORMS.find((p) => p.key === platform);
    setVrtOptions(selected ? selected.categories : []);
    setCategory('');
  }, [platform]);

  // TipTap editor setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: !!(platform && category),
  });

  // Placeholder for AI-powered report generation
  const handleGenerateReport = () => {
    if (!editor) return;
    setLoading(true);
    setTimeout(() => {
      let content = {};
      if (platform === 'bugcrowd') {
        content = {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Summary' }] },
            { type: 'paragraph', content: [{ type: 'text', text: `A security vulnerability was discovered in the application under the category: ${category}. This issue could allow an attacker to compromise user data or application integrity.` }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Business Impact' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Exploitation of this vulnerability could result in data leakage, unauthorized access, or service disruption, potentially affecting business reputation and user trust.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Steps to Reproduce' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '1. Go to the login page.' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '2. Enter a crafted payload in the username field.' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '3. Observe the unexpected behavior.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Proof of Concept (PoC)' }] },
            { type: 'codeBlock', content: [{ type: 'text', text: '[Insert PoC code or request here]' }] },
          ],
        };
      } else if (platform === 'google') {
        content = {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Summary (200 chars)' }] },
            { type: 'paragraph', content: [{ type: 'text', text: `${category} vulnerability allows an attacker to bypass security controls and access sensitive data.` }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Vulnerability Description' }] },
            { type: 'paragraph', content: [{ type: 'text', text: `The application fails to properly validate input, leading to a ${category} vulnerability.` }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Attack Preconditions' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '- User must be authenticated.' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '- Attacker must have access to the target endpoint.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Reproduction Steps / PoC' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '1. Navigate to the affected endpoint.' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '2. Submit the following payload: [example].' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '3. Observe the response.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Attack Scenario' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'An attacker could exploit this to gain unauthorized access to user data.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Screenshot' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '[Insert screenshot here]' }] },
          ],
        };
      } else if (platform === 'hackerone') {
        content = {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Description' }] },
            { type: 'paragraph', content: [{ type: 'text', text: `A ${category} vulnerability was found in the application, allowing attackers to compromise security.` }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Summary' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'The vulnerability allows for exploitation by sending a specially crafted request.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Steps To Reproduce' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '1. Go to the affected page.' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '2. Enter the following payload: [example].' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '3. Submit the request and observe the result.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Supporting Material/References' }] },
            { type: 'paragraph', content: [{ type: 'text', text: `- [OWASP ${category} Reference](https://owasp.org/)` }] },
            { type: 'paragraph', content: [{ type: 'text', text: '- [Attach logs, screenshots, or other evidence here]' }] },
          ],
        };
      }
      editor.commands.setContent(content);
      setLoading(false);
    }, 700);
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!editor) return;
    const doc = new jsPDF();
    const json = editor.getJSON();
    const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10 margin on each side
    let y = 10;
    const lineHeight = 8;

    function addLines(text, isBold = false) {
      const lines = doc.splitTextToSize(text, pageWidth);
      if (isBold) doc.setFont(undefined, 'bold');
      else doc.setFont(undefined, 'normal');
      lines.forEach(line => {
        doc.text(line, 10, y);
        y += lineHeight;
      });
      doc.setFont(undefined, 'normal');
    }

    if (json && json.content) {
      json.content.forEach(node => {
        if (node.type === 'heading') {
          const text = node.content?.map(n => n.text).join('') || '';
          addLines(text, true);
          y += 2;
        } else if (node.type === 'paragraph') {
          const text = node.content?.map(n => n.text).join('') || '';
          if (text.trim().length > 0) addLines(text);
          y += 2;
        } else if (node.type === 'codeBlock') {
          doc.setFont('courier', 'normal');
          const text = node.content?.map(n => n.text).join('') || '';
          const lines = doc.splitTextToSize(text, pageWidth);
          lines.forEach(line => {
            doc.text(line, 10, y);
            y += lineHeight;
          });
          doc.setFont(undefined, 'normal');
          y += 2;
        }
      });
    }
    doc.save('bug-bounty-report.pdf');
  };

  return (
    <>
      <AppBar position="static" elevation={2} sx={{ width: '100%', m: 0, borderRadius: 0 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            BugGenie
          </Typography>
          {PAGES.map((p) => (
            <Button
              key={p.key}
              color="inherit"
              onClick={() => setPage(p.key)}
              sx={{ fontWeight: page === p.key ? 'bold' : 'normal' }}
            >
              {p.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Box sx={{ pt: 4, px: { xs: 1, sm: 3 }, width: '100%', minHeight: '100vh', background: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {page === 'landing' && (
          <Box sx={{ width: '100%', maxWidth: 1200, mt: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: 28, sm: 32 } }}>Welcome to BugGenie</Typography>
            <Typography variant="body1" paragraph>
              BugGenie helps security researchers quickly generate high-quality bug bounty reports tailored to the requirements of major platforms.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the navigation above to learn more or start generating your report!
            </Typography>
          </Box>
        )}
        {page === 'benefits' && (
          <Box sx={{ width: '100%', maxWidth: 1200, mt: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: 28, sm: 32 } }}>Why BugGenie?</Typography>
            <Typography variant="body1" paragraph>
              BugGenie was built to save you time and effort by automating the report writing process. Focus on your findings, not on formatting!
            </Typography>
            <ul style={{ marginLeft: 24, marginBottom: 0 }}>
              <li>AI-powered report generation</li>
              <li>Platform-specific templates</li>
              <li>Editable and exportable reports</li>
              <li>Easy to use, no sign-up required</li>
            </ul>
          </Box>
        )}
        {page === 'main' && (
          <Box sx={{ width: '100%', maxWidth: 1200, mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: 22, sm: 26 } }}>Generate Your Bug Bounty Report</Typography>
            <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 6, width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel id="platform-label">Platform</InputLabel>
                  <Select
                    labelId="platform-label"
                    value={platform}
                    label="Platform"
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {platform && (
                  <FormControl fullWidth>
                    <InputLabel id="vrt-label">VRT Category</InputLabel>
                    <Select
                      labelId="vrt-label"
                      value={category}
                      label="VRT Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {vrtOptions.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {platform && category && (
                  <Paper elevation={2} sx={{ p: 2, minHeight: 200, background: '#23272f', mt: 2, width: '100%' }}>
                    <Stack direction="row" spacing={2} mb={2}>
                      <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                      </Button>
                      <Button variant="outlined" onClick={handleExportPDF} disabled={!editor || !editor.getText().trim()}>
                        Export to PDF
                      </Button>
                    </Stack>
                    <Box sx={{ border: '1px solid #333', borderRadius: 2, background: '#181a20', p: 1, width: '100%' }}>
                      <EditorContent editor={editor} />
                    </Box>
                  </Paper>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </>
  );
}

export default App;
