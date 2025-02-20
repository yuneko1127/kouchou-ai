# shotokutaishi-client-admin

デジタル民主主義2030 ブロードリスニングの管理者用フロントエンドです

## Usage
```
npm install
npm run build
npm start
```

## Environment variables
- `NEXT_PUBLIC_CLIENT_BASEPATH`
  - shotokutaishi-client が動作するエンドポイント
- `NEXT_PUBLIC_API_BASEPATH`
  - shotokutaishi-server が動作するエンドポイント
- `NEXT_PUBLIC_API_KEY`
  - shotokutaishi-server の管理向けAPIを利用するためのAPIキー
- `BASIC_AUTH_USERNAME`
  - basic 認証のユーザー名 (空欄の場合は認証スキップ)
- `BASIC_AUTH_PASSWORD`
  - basic 認証のパスワード (空欄の場合は認証スキップ)
