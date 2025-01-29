'use client';

import { ApolloProvider } from "@apollo/client";
import { client } from "@/apollo/client";
import React from "react";
import BuildInfo from "@/components/BuildInfo";
import { StationProvider } from "@/context/StationContext";

export default function Providers({ children, }: {
    children: React.ReactNode;
}) {
    return (
        <ApolloProvider client={client}>
            <StationProvider>
                {children}
                <BuildInfo/>
            </StationProvider>
        </ApolloProvider>
    );
}
