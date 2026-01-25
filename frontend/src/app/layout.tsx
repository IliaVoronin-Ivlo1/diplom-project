import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata = {
  title: 'Corstat - Анализ поставщиков автозапчастей',
  description: 'Платформа для анализа и оценки поставщиков автомобильных запчастей',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

