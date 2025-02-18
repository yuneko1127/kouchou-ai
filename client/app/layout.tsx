import ClientProvider from './ClientProvider'
import './global.css'

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html suppressHydrationWarning lang={'ja'}>
      <head>
        <link rel={'icon'} href={process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/icon.png'} sizes={'any'} />
      </head>
      <body>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}
