export const metadata = {
  title: 'Diplom Project',
  description: 'Дипломный проект с микросервисной архитектурой',
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

