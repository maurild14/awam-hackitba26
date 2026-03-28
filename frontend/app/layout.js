import "./globals.css";

export const metadata = {
  title: {
    default: "AWAM",
    template: "%s"
  },
  description:
    "Marketplace de agentes IA con catálogo público, metadata de seller y flujo editorial admin."
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
