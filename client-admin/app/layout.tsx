import ClientProvider from './ClientProvider'
import './global.css'
import {Toaster} from '@/components/ui/toaster'

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html suppressHydrationWarning lang={'ja'}>
      <head>
        <link rel={'icon'} href={process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/icon.png'} sizes={'any'} />
      </head>
      <body>
        <ClientProvider>
          {children}
          <Toaster />
        </ClientProvider>
      </body>
    </html>
  )
}
