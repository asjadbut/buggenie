import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Divider } from '@mui/material';

const LearningCard = ({ card, loading, error }) => {
  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!card) return null;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, maxWidth: 700, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{card.title}</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>{card.summary}</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>How it works</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>{card.how_it_works}</Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Real-world Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>{card.real_world_example}</Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>How to Find</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>{card.how_to_find}</Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Remediation Tips</Typography>
      <Typography variant="body2">{card.remediation_tips}</Typography>
    </Paper>
  );
};

export default LearningCard; 