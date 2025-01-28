import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BuildInfo from "@/components/BuildInfo";
import React from "react";
import Providers from "@/app/providers";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "EBB n FLOW",
    description: "Ebb n Flow helps you explore the tides",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <link
                rel="preload"
                href="/logo-animated.svg"
                as="image"
                type="image/svg+xml"
            />
            <title>FLOW / ebb</title>
        </head>
        <body className={ `${ geistSans.variable } ${ geistMono.variable } antialiased relative min-h-screen` }>
        <Providers>
            { children }
            <BuildInfo/>
        </Providers>
        </body>
        </html>
    );
}
