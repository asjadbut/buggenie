import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  LinearProgress,
  Alert,
  Grid
} from '@mui/material';
import { 
  AttachMoney, 
  TrendingUp, 
  CheckCircle, 
  Warning, 
  Info, 
  Policy,
  Assessment
} from '@mui/icons-material';

const BountyAnalysis = ({ analysis, showDetails = false }) => {
  if (!analysis) return null;

  // Handle Gemini's response format and add fallbacks
  const safeAnalysis = {
    platform: analysis.platform || 'Unknown Platform',
    category: analysis.category || 'Unknown Category',
    severity: analysis.severity || 'medium',
    bounty: {
      min: analysis.bounty?.min || 0,
      max: analysis.bounty?.max || 0,
      avg: analysis.bounty?.avg || 0
    },
    acceptance: {
      probability: analysis.acceptance?.probability || 50,
      factors: analysis.acceptance?.factors || [],
      recommendations: analysis.acceptance?.recommendations || []
    },
    policies: {
      requirements: analysis.policies?.requirements || [],
      preferences: analysis.policies?.preferences || [],
      rejections: analysis.policies?.rejections || []
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      case 'info': return '#1976d2';
      default: return '#757575';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Warning sx={{ color: '#d32f2f' }} />;
      case 'high': return <Warning sx={{ color: '#f57c00' }} />;
      case 'medium': return <Info sx={{ color: '#fbc02d' }} />;
      case 'low': return <CheckCircle sx={{ color: '#388e3c' }} />;
      case 'info': return <Info sx={{ color: '#1976d2' }} />;
      default: return <Info sx={{ color: '#757575' }} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 'fit-content' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Bounty Analysis
        </Typography>
      </Box>

      {/* Platform and Category Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
          {safeAnalysis.platform} - {safeAnalysis.category}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSeverityIcon(safeAnalysis.severity)}
          <Chip 
            label={safeAnalysis.severity.toUpperCase()} 
            size="small"
            sx={{ 
              backgroundColor: getSeverityColor(safeAnalysis.severity),
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>
      </Box>

      {/* Bounty Estimation - Simple UI */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1, fontSize: '1.3rem', color: '#1976d2' }} />
          Estimated Bounty Range
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(safeAnalysis.bounty.min)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                Minimum
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(safeAnalysis.bounty.avg)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                Average
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(safeAnalysis.bounty.max)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                Maximum
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Acceptance Probability */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
          <Assessment sx={{ mr: 1, fontSize: '1.2rem' }} />
          Acceptance Probability
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {safeAnalysis.acceptance.probability}% chance of acceptance
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={safeAnalysis.acceptance.probability} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: safeAnalysis.acceptance.probability >= 80 ? '#4caf50' : 
                               safeAnalysis.acceptance.probability >= 60 ? '#ff9800' : '#f44336'
              }
            }} 
          />
        </Box>

        {safeAnalysis.acceptance.factors && safeAnalysis.acceptance.factors.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.875rem' }}>
              Strengths:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {safeAnalysis.acceptance.factors.map((factor, index) => (
                <Chip 
                  key={index}
                  label={factor} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  icon={<CheckCircle />}
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Recommendations */}
      {safeAnalysis.acceptance.recommendations && safeAnalysis.acceptance.recommendations.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1, color: '#f57c00', fontSize: '1.2rem' }} />
            Recommendations
          </Typography>
          <List dense sx={{ py: 0 }}>
            {safeAnalysis.acceptance.recommendations.slice(0, 3).map((recommendation, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Info sx={{ color: '#f57c00', fontSize: 14 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={recommendation}
                  primaryTypographyProps={{ variant: 'caption', fontSize: '0.75rem' }}
                />
              </ListItem>
            ))}
            {safeAnalysis.acceptance.recommendations.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 3, fontSize: '0.7rem' }}>
                +{safeAnalysis.acceptance.recommendations.length - 3} more recommendations
              </Typography>
            )}
          </List>
        </Box>
      )}

      {/* Platform Policies - Concise */}
      {showDetails && safeAnalysis.policies && (
        <Paper elevation={0} sx={{ mt: 2, p: 1.5, background: '#f0f4f8', borderRadius: 2, color: '#222', border: '1px solid #e0e4ea' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', color: '#1976d2', fontSize: '0.9rem' }}>
            <Policy sx={{ mr: 0.5, fontSize: '1rem', color: '#1976d2' }} />
            Platform Policies
          </Typography>
          {/* Required */}
          {safeAnalysis.policies.requirements && safeAnalysis.policies.requirements.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600, display: 'flex', alignItems: 'center', mb: 0.25 }}>
                <CheckCircle sx={{ fontSize: 14, mr: 0.5, color: '#d32f2f' }} />
                Required
              </Typography>
              <Typography variant="caption" sx={{ pl: 2, fontSize: '0.8rem' }}>
                {safeAnalysis.policies.requirements.slice(0, 2).join(', ')}
                {safeAnalysis.policies.requirements.length > 2 && '...'}
              </Typography>
            </Box>
          )}
          {/* Preferred */}
          {safeAnalysis.policies.preferences && safeAnalysis.policies.preferences.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', mb: 0.25 }}>
                <Info sx={{ fontSize: 14, mr: 0.5, color: '#1976d2' }} />
                Preferred
              </Typography>
              <Typography variant="caption" sx={{ pl: 2, fontSize: '0.8rem' }}>
                {safeAnalysis.policies.preferences.slice(0, 2).join(', ')}
                {safeAnalysis.policies.preferences.length > 2 && '...'}
              </Typography>
            </Box>
          )}
          {/* Avoid */}
          {safeAnalysis.policies.rejections && safeAnalysis.policies.rejections.length > 0 && (
            <Box sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600, display: 'flex', alignItems: 'center', mb: 0.25 }}>
                <Warning sx={{ fontSize: 14, mr: 0.5, color: '#f57c00' }} />
                Avoid
              </Typography>
              <Typography variant="caption" sx={{ pl: 2, fontSize: '0.8rem' }}>
                {safeAnalysis.policies.rejections.slice(0, 2).join(', ')}
                {safeAnalysis.policies.rejections.length > 2 && '...'}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Disclaimer */}
      <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          <strong>Note:</strong> Analysis provided by Gemini AI. Actual amounts may vary.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default BountyAnalysis; 