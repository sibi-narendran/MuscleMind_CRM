import React, { useEffect } from 'react';

const JotFormEmbed = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://form.jotform.com/jsform/243312543858055';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="jotform-container">
      {/* JotForm will be embedded here */}
    </div>
  );
};

export default JotFormEmbed; 