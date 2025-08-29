import React, { memo } from 'react';
import { TreinosManager } from './TreinosManager';

export const TreinosPage: React.FC = memo(() => {
  return <TreinosManager />;
});

TreinosPage.displayName = 'TreinosPage';