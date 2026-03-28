import "./globals.css";

export const metadata = {
  title: "AWAM",
  description: "Milestone 2 scaffold with auth and persistence foundations."
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
