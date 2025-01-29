'use client';

import { Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { environment } from "@/config/environment";

const BuildInfoContainer = styled(Box)(({ theme }) => ({
    position: 'fixed',
    bottom: 0,
    right: 0,
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopLeftRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const BuildInfo = () => {
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'Development';
    const version = process.env.NEXT_PUBLIC_VERSION || '0.0.1';
    const baseUrl = environment.apiBaseUrl;

    return (
        <BuildInfoContainer>
            <InfoIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">
                Build: {buildTime}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
                |
            </Typography>
            <Typography variant="caption" color="text.secondary">
                v{version}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
                |
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {baseUrl}
            </Typography>

        </BuildInfoContainer>
    );
};

export default BuildInfo;
