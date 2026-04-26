@"
import React from 'react';

function FinanceTracker() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>💰 Finance Tracker</h1>
      <p>Your finance tracker will appear here.</p>
    </div>
  );
}

export default FinanceTracker;
"@ | Out-File -FilePath src\modules\FinanceTracker\index.js -Encoding UTF8