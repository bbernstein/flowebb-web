import { Button, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import React from 'react';

interface LocationButtonProps {
    onClick: () => void;
    loading: boolean;
}

const LocationButton = ({ onClick, loading }: LocationButtonProps) => {
    return (
        <Button
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
            onClick={onClick}
            variant="outlined"
            size="small"
            disabled={loading}
            sx={{
                minWidth: '160px', // Prevent button width from changing during loading
                '& .MuiCircularProgress-root': {
                    marginRight: '8px' // Match the icon spacing
                }
            }}
        >
            {loading ? 'Getting Location...' : 'Use My Location'}
        </Button>
    );
};

export default LocationButton;
