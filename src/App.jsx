import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, MenuItem, Select, FormControl, InputLabel, Paper, Stack, TextField, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Link } from '@mui/material';
import { PLATFORMS } from './platforms';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import jsPDF from 'jspdf';
import GeminiService from './services/gemini';
import BountyAnalysis from './components/BountyAnalysis';
import { textToTipTapJson, tipTapJsonToText } from './utils/textToTipTap';
import buggenieLogo from './assets/buggenie-logo.png';
import { getGeminiUsageCount } from './services/gemini';
import { InfoOutlined } from '@mui/icons-material';
import LearningPage from './LearningPage';

function App() {
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [vrtOptions, setVrtOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vulnerabilityDetails, setVulnerabilityDetails] = useState('');
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage on component mount
    return localStorage.getItem('buggenie_api_key') || '';
  });
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bugcrowdCategories, setBugcrowdCategories] = useState([]);
  const [bugcrowdCategory, setBugcrowdCategory] = useState('');
  const [bugcrowdSubcategories, setBugcrowdSubcategories] = useState([]);
  const [bugcrowdSubcategory, setBugcrowdSubcategory] = useState('');
  const [bugcrowdVariants, setBugcrowdVariants] = useState([]);
  const [bugcrowdVariant, setBugcrowdVariant] = useState('');
  const [bountyAnalysis, setBountyAnalysis] = useState(null);
  const [bountyLoading, setBountyLoading] = useState(false);
  const [bountyError, setBountyError] = useState('');
  const [showBountyAnalysis, setShowBountyAnalysis] = useState(true);
  const [showDetailedPolicies, setShowDetailedPolicies] = useState(false);
  const [showGeminiInfo, setShowGeminiInfo] = useState(() => {
    return localStorage.getItem('hide_gemini_info') !== '1';
  });
  const [geminiUsage, setGeminiUsage] = useState(getGeminiUsageCount());
  const [page, setPage] = useState('main');

  useEffect(() => {
    const selected = PLATFORMS.find((p) => p.key === platform);
    setVrtOptions(selected ? selected.categories : []);
    setCategory('');
    // Clear the editor content when platform changes
    if (editor) {
      editor.commands.clearContent();
    }
  }, [platform]);

  // Load Bugcrowd VRT JSON dynamically when platform is bugcrowd
  useEffect(() => {
    if (platform === 'bugcrowd') {
      fetch('/bugcrowd-vrt.json')
        .then(res => res.json())
        .then(data => {
          setBugcrowdCategories(data.content || []);
        });
      setBugcrowdCategory('');
      setBugcrowdSubcategory('');
      setBugcrowdVariant('');
      setBugcrowdSubcategories([]);
      setBugcrowdVariants([]);
    } else {
      setBugcrowdCategories([]);
      setBugcrowdCategory('');
      setBugcrowdSubcategory('');
      setBugcrowdVariant('');
      setBugcrowdSubcategories([]);
      setBugcrowdVariants([]);
    }
    if (editor) {
      editor.commands.clearContent();
    }
  }, [platform]);

  // When Bugcrowd category changes, update subcategories
  useEffect(() => {
    if (platform === 'bugcrowd' && bugcrowdCategory) {
      const cat = bugcrowdCategories.find(c => c.name === bugcrowdCategory);
      setBugcrowdSubcategories(cat?.children || []);
      setBugcrowdSubcategory('');
      setBugcrowdVariant('');
      setBugcrowdVariants([]);
      setVulnerabilityDetails('');
    }
  }, [platform, bugcrowdCategory, bugcrowdCategories]);

  // When Bugcrowd subcategory changes, update variants and handle 2-tier case
  useEffect(() => {
    if (platform === 'bugcrowd' && bugcrowdSubcategory) {
      const cat = bugcrowdCategories.find(c => c.name === bugcrowdCategory);
      const subcat = cat?.children?.find(s => s.name === bugcrowdSubcategory);
      setBugcrowdVariants(subcat?.children || []);
      setBugcrowdVariant('');
      setVulnerabilityDetails('');
      if (!subcat?.children || subcat.children.length === 0) {
        setCategory(`${bugcrowdCategory} > ${bugcrowdSubcategory}`);
      }
    }
  }, [platform, bugcrowdCategory, bugcrowdSubcategory, bugcrowdCategories]);

  // When Bugcrowd variant changes, set the main category state to the full path
  useEffect(() => {
    if (
      platform === 'bugcrowd' &&
      bugcrowdCategory &&
      bugcrowdSubcategory &&
      bugcrowdVariant
    ) {
      setCategory(`${bugcrowdCategory} > ${bugcrowdSubcategory} > ${bugcrowdVariant}`);
    }
  }, [platform, bugcrowdCategory, bugcrowdSubcategory, bugcrowdVariant]);

  // Fetch bounty analysis from Gemini when platform or category changes
  useEffect(() => {
    let cancelled = false;
    async function fetchAnalysis() {
      setBountyAnalysis(null);
      setBountyError('');
      if (platform && category && apiKey) {
        setBountyLoading(true);
        try {
          GeminiService.initialize(apiKey);
          const analysis = await GeminiService.getBountyAnalysis(platform, category);
          if (!cancelled) setBountyAnalysis(analysis);
        } catch (err) {
          if (!cancelled) setBountyError(err.message);
        } finally {
          if (!cancelled) setBountyLoading(false);
        }
      } else {
        setBountyAnalysis(null);
      }
    }
    fetchAnalysis();
    return () => { cancelled = true; };
  }, [platform, category, apiKey]);

  // Update Gemini usage counter reactively
  useEffect(() => {
    const interval = setInterval(() => {
      setGeminiUsage(getGeminiUsageCount());
    }, 2000); // update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // TipTap editor setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: !!(platform && category),
  });

  // AI-powered report generation
  const handleGenerateReport = async () => {
    if (!editor) return;
    
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    // Vulnerability details are optional - if not provided, use a generic template
    const fullBugcrowdCategory = platform === 'bugcrowd' && bugcrowdCategory && bugcrowdSubcategory && bugcrowdVariant ? `${bugcrowdCategory} > ${bugcrowdSubcategory} > ${bugcrowdVariant}` : '';
    const details = vulnerabilityDetails.trim() || `Generic ${fullBugcrowdCategory || category} vulnerability found in the application.`;

    setLoading(true);
    setError('');

    try {
      // Initialize Gemini service
      GeminiService.initialize(apiKey);
      
      // Generate report using AI
      const aiReport = await GeminiService.generateReport(platform, fullBugcrowdCategory || category, details);
      
      // Convert AI response to TipTap format
      const tipTapContent = textToTipTapJson(aiReport);
      editor.commands.setContent(tipTapContent);
      

      
      setSuccess('Report generated successfully using AI!');
    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Enhance existing report with AI
  const handleEnhanceReport = async () => {
    if (!editor || !apiKey) return;
    
    const currentContent = tipTapJsonToText(editor.getJSON());
    if (!currentContent.trim()) {
      setError('No content to enhance. Please generate a report first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      GeminiService.initialize(apiKey);
      const enhancedReport = await GeminiService.enhanceReport(currentContent, platform, category);
      const tipTapContent = textToTipTapJson(enhancedReport);
      editor.commands.setContent(tipTapContent);
      

      
      setSuccess('Report enhanced successfully!');
    } catch (error) {
      console.error('Error enhancing report:', error);
      setError(`Failed to enhance report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid Google Gemini API key.');
      return;
    }
    // Save API key to localStorage
    localStorage.setItem('buggenie_api_key', apiKey.trim());
    setShowApiKeyDialog(false);
    setError('');
    setSuccess('API key saved successfully! It will be remembered for future sessions.');
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!editor) return;
    const doc = new jsPDF();
    const json = editor.getJSON();
    const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10 margin on each side
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 10;
    const lineHeight = 8;

    function addLines(text, isBold = false) {
      const lines = doc.splitTextToSize(text, pageWidth);
      if (isBold) doc.setFont(undefined, 'bold');
      else doc.setFont(undefined, 'normal');
      
      lines.forEach(line => {
        // Check if we need a new page
        if (y + lineHeight > pageHeight - 20) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += lineHeight;
      });
      doc.setFont(undefined, 'normal');
    }

    if (json && json.content) {
      json.content.forEach(node => {
        if (node.type === 'heading') {
          const text = node.content?.map(n => n.text).join('') || '';
          // Check if we need a new page for heading
          if (y + lineHeight > pageHeight - 20) {
            doc.addPage();
            y = 10;
          }
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
            // Check if we need a new page
            if (y + lineHeight > pageHeight - 20) {
              doc.addPage();
              y = 10;
            }
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

  const handleCopyReport = () => {
    if (!editor) return;
    const text = tipTapJsonToText(editor.getJSON());
    navigator.clipboard.writeText(text);
    setSuccess('Report copied to clipboard!');
  };

  return (
    <>
      {page === 'learning' ? (
        <LearningPage onBack={() => setPage('main')} />
      ) : (
        <>
          <Box sx={{ pt: 4, px: { xs: 1, sm: 3 }, width: '100%', minHeight: '100vh', background: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 1200, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img src={buggenieLogo} alt="BugGenie Logo" style={{ width: 96, marginRight: 16 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: 28, sm: 32 } }}>BugGenie</Typography>
                </Box>
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                    onClick={() => setPage('learning')}
                  >
                    Learning
                  </Button>
                </Box>
              </Box>
              {showGeminiInfo && (
                <Alert
                  severity={geminiUsage > 1200 ? 'warning' : 'info'}
                  sx={{ mb: 2, fontSize: '0.97em', alignItems: 'center' }}
                  onClose={() => {
                    setShowGeminiInfo(false);
                    localStorage.setItem('hide_gemini_info', '1');
                  }}
                >
                  <strong>Gemini 2.0 Flash Free Tier:</strong>
                  <Box component="span" sx={{ fontWeight: 600, color: geminiUsage > 1200 ? '#d32f2f' : '#1976d2', ml: 1 }}>
                    {geminiUsage} / 1,500 requests used today
                  </Box>
                  <span style={{ marginLeft: 8, color: '#555' }}>
                    (15 requests/minute limit)
                  </span>
                  <Link href="https://ai.google.dev/pricing" target="_blank" rel="noopener" underline="hover" sx={{ ml: 1 }}>
                    See details
                  </Link>
                  {geminiUsage > 1200 && (
                    <Box component="span" sx={{ color: '#d32f2f', fontWeight: 600, ml: 2 }}>
                      Warning: You are approaching your daily quota!
                    </Box>
                  )}
                </Alert>
              )}
              <Typography variant="body1" paragraph>
                Generate, analyze, and track bug bounty reports with AI—complete with platform-specific templates, bounty estimation, and Gemini usage tracking.
              </Typography>
              
              {/* Bounty Analysis Toggle */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showBountyAnalysis}
                        onChange={(e) => setShowBountyAnalysis(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show Bounty Analysis"
                  />
                  {showBountyAnalysis && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDetailedPolicies}
                          onChange={(e) => setShowDetailedPolicies(e.target.checked)}
                          color="secondary"
                        />
                      }
                      label="Show Detailed Policies"
                    />
                  )}
                </Box>
                {!showGeminiInfo && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<InfoOutlined />}
                    onClick={() => {
                      setShowGeminiInfo(true);
                      localStorage.setItem('hide_gemini_info', '0');
                    }}
                  >
                    Show Gemini Info
                  </Button>
                )}
              </Box>

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
                {platform === 'bugcrowd' && (
                  <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="bugcrowd-category-label">Category</InputLabel>
                      <Select
                        labelId="bugcrowd-category-label"
                        value={bugcrowdCategory}
                        label="Category"
                        onChange={e => setBugcrowdCategory(e.target.value)}
                      >
                        {bugcrowdCategories.map(cat => (
                          <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {bugcrowdSubcategories.length > 0 && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="bugcrowd-subcategory-label">Subcategory</InputLabel>
                        <Select
                          labelId="bugcrowd-subcategory-label"
                          value={bugcrowdSubcategory}
                          label="Subcategory"
                          onChange={e => setBugcrowdSubcategory(e.target.value)}
                        >
                          {bugcrowdSubcategories.map(subcat => (
                            <MenuItem key={subcat.id} value={subcat.name}>{subcat.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {bugcrowdVariants.length > 0 && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="bugcrowd-variant-label">Variant / Affected Function</InputLabel>
                        <Select
                          labelId="bugcrowd-variant-label"
                          value={bugcrowdVariant}
                          label="Variant / Affected Function"
                          onChange={e => setBugcrowdVariant(e.target.value)}
                        >
                          {bugcrowdVariants.map(variant => (
                            <MenuItem key={variant.id} value={variant.name}>{variant.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
                {(platform === 'hackerone' || platform === 'google') && (
                  <FormControl fullWidth>
                    <InputLabel id="vrt-label">VRT Category</InputLabel>
                    <Select
                      labelId="vrt-label"
                      value={category}
                      label="VRT Category"
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setVulnerabilityDetails('');
                        if (editor) {
                          editor.commands.clearContent();
                        }
                      }}
                    >
                      {vrtOptions.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {(
                  (platform === 'bugcrowd' && bugcrowdCategory && bugcrowdSubcategory && (
                    (bugcrowdVariants.length === 0) || bugcrowdVariant
                  )) ||
                  ((platform === 'hackerone' || platform === 'google') && category)
                ) && (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Vulnerability Details (Optional)"
                      placeholder="Describe the vulnerability you found. Include details like: affected endpoint, payload used, expected vs actual behavior, impact, etc. Leave empty for a generic template."
                      value={vulnerabilityDetails}
                      onChange={(e) => setVulnerabilityDetails(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                    
                    {/* Side-by-side layout for analysis and report */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', lg: 'row' }, 
                      gap: 3, 
                      mt: 2,
                      alignItems: 'flex-start'
                    }}>
                      {/* Bounty Analysis Panel */}
                      {showBountyAnalysis && (
                        <Box sx={{ 
                          width: { xs: '100%', lg: '35%' }, 
                          minWidth: { lg: 400 },
                          position: { lg: 'sticky' },
                          top: { lg: 20 }
                        }}>
                          {bountyLoading && <Alert severity="info">Loading bounty analysis from Gemini...</Alert>}
                          {bountyError && <Alert severity="error">{bountyError}</Alert>}
                          {bountyAnalysis && (
                            <BountyAnalysis analysis={bountyAnalysis} showDetails={showDetailedPolicies} />
                          )}
                        </Box>
                      )}
                      
                      {/* Report Editor Panel */}
                      <Box sx={{ 
                        flex: 1, 
                        width: { xs: '100%', lg: showBountyAnalysis ? '65%' : '100%' }
                      }}>
                        <Paper elevation={2} sx={{ p: 2, minHeight: 200, background: '#23272f', width: '100%' }}>
                          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" useFlexGap>
                            <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
                              {loading ? 'Generating...' : 'Generate AI Report'}
                            </Button>
                            <Button variant="outlined" onClick={handleEnhanceReport} disabled={loading || !editor || !editor.getText().trim()}>
                              {loading ? 'Enhancing...' : 'Enhance with AI'}
                            </Button>
                            <Button variant="outlined" onClick={handleCopyReport} disabled={!editor || !editor.getText().trim()}>
                              Copy Report
                            </Button>
                            <Button variant="outlined" onClick={handleExportPDF} disabled={!editor || !editor.getText().trim()}>
                              Export to PDF
                            </Button>
                          </Stack>
                          <Box sx={{ border: '1px solid #333', borderRadius: 2, background: '#181a20', p: 3, width: '100%' }}>
                            <EditorContent editor={editor} />
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Box>
          </Box> {/* Close maxWidth: 1200 Box */}
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
            <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
          <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
            <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          </Snackbar>
        </>
      )}

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onClose={() => setShowApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Google Gemini API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Google Gemini API Key"
            type="password"
            fullWidth
            variant="outlined"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            helperText="Your API key is stored locally and never sent to our servers."
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="text" 
              onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
              sx={{ textTransform: 'none' }}
            >
              🔑 How to get your Google Gemini API key?
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApiKeyDialog(false)}>Cancel</Button>
          <Button onClick={handleApiKeySubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
