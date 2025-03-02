import type { NextConfig } from 'next'

// APIサーバーのURLを環境変数から取得
const apiServer = process.env.API_SERVER || process.env.NEXT_PUBLIC_API_BASEPATH || 'http://api:8000';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  
  // リライトルールを追加
  async rewrites() {
    return [
      {
        source: '/meta/:path*',
        destination: `${apiServer}/meta/:path*`,
      },
    ]
  },
}

export default nextConfig