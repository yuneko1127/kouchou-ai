import ClientProvider from './ClientProvider'
import './global.css'
import {getApiBaseUrl} from './utils/api'

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang={'ja'}>
      <head>
        <link rel={'icon'} href={getApiBaseUrl() + '/meta/icon.png'} sizes={'any'}/>
      </head>
      <body>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}
