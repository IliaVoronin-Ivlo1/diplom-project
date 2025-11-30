import './globals.css';

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
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}

