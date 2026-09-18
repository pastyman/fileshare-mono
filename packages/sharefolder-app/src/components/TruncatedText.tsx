import React from 'react';
import { Box, Typography, TypographyProps } from '@mui/material';

interface TruncatedTextProps extends Omit<TypographyProps, 'component'> {
  text: string;
  maxWidth?: string | number;
  showTooltip?: boolean;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({ 
  text, 
  maxWidth = '100%', 
  showTooltip = true,
  ...typographyProps 
}) => {
  return (
    <div
      style={{
        width: "calc(100%)",
        maxHeight: "20px",

      }}
    >
      <Typography
        {...typographyProps}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          //whiteSpace: 'nowrap',
          //width: 'calc(100%)',

          display: 'flex',
          ...typographyProps.sx
        }}
        title={showTooltip ? text : undefined}
      >
        {text}
      </Typography>
    </div>
  );
};

export default TruncatedText;
