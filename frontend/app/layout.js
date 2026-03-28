import "./globals.css";

export const metadata = {
  title: "AWAM Workspace",
  description: "Milestone 1 scaffold for the AWAM marketplace."
};

/**
 * @param {{ children: import("react").ReactNode }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
