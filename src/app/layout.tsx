import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import StoreProviderLayout from "./(common)/layout/store-provider-layout";
import { App } from "antd";
import ReactQueryProvider from "./(common)/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = auth();
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <StoreProviderLayout>
            {userId ? (
              <AntdRegistry>
                <App>
                  <ReactQueryProvider>{children}</ReactQueryProvider>
                </App>
              </AntdRegistry>
            ) : (
              <div
                style={{
                  height: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {children}
              </div>
            )}
          </StoreProviderLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
