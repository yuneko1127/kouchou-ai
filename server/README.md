# kouchou-ai-server
kouchou-aiのAPIサーバーです。
レポートの作成、取得などを行うことができます。

## 開発環境

* rye
* python 3.12
* OpenAI API Key


## セットアップ（開発環境）
以下のコマンドを実行し、.envファイル内の環境変数を記載してください
```bash
cp .env.example .env
```
環境変数は現状以下の2つ
* OPENAI_API_KEY
  * OpenAIのAPIキー。レポート作成時に利用。


## 起動
```bash
rye sync
make run
```

起動後、 `htttp://localhost:8000/docs` 配下でSwagger UIが立ち上がるので、
そちらでAPIの動作を確認できます。
