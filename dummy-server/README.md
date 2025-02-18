# dummy-server
- これはダミーサーバーです

## endpoints
- GET /
  - (ヘルスチェック用)
- GET /meta/metadata.json
  - レポート発行者情報
- GET /meta/reporter.png
  - レポート発行者画像
- GET meta/icon.png
  - レポートアイコン
- GET /reports
  - レポート出力ステータス一覧
- GET /reports/:slug
  - レポート本体
