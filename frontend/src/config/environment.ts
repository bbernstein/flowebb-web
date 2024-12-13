// frontend/src/config/environment.ts
interface Environment {
    apiBaseUrl: string;
    isDevelopment: boolean;
}

export const environment: Environment = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    isDevelopment: process.env.NODE_ENV === 'development'
};
