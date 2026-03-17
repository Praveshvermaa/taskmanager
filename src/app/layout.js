import './globals.css';

export const metadata = {
  title: 'TaskFlow | Modern Task Management',
  description: 'Production-ready task management application built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
