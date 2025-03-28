# 広聴AI / kouchou-ai
デジタル民主主義2030プロジェクトにおいて、ブロードリスニングを実現するためのソフトウェア「広聴AI」のリポジトリです。

このプロジェクトは、[AI Objectives Institute](https://www.aiobjectivesinstitute.org/) が開発した [Talk to the City](https://github.com/AIObjectives/talk-to-the-city-reports)を参考に、日本の自治体や政治家の実務に合わせた機能改善を進めています。

- 機能例
  - 開発者以外でも扱いやすいような機能 (CSV Upload)
  - 濃いクラスタ抽出機能
  - パブリックコメント用分析機能（予定）
  - 多数派攻撃に対する防御機能（予定）

## 前提条件
* docker, docker-compose
* OpenAI APIキー

## セットアップ・起動
### 前提
* 広聴AIはWebアプリとして構築されており、アプリケーションを立ち上げ、ブラウザを操作することでレポートの出力と閲覧ができます
  * レポートの閲覧は、現在はアプリ起動時のみ可能となっています
    * レポートを静的ファイルとして出力する機能は、現在は開発中です。本機能が開発された際には、静的ファイルをサーバーに配置することで、アプリを起動せずにレポートを閲覧することが可能となります。
* 以下の手順は、ローカル環境でdocker composeを使用してセットアップする際の手順となります
* リモート環境でホスティングする場合は、個別のサービス（client, client-admin, api）について、適切に環境変数を設定した上でそれぞれホスティングしてください
  * サービスごとに設定する環境変数は.env.exampleに記載しています

### 手順
* リポジトリをクローン
* `cp .env.example .env` をコンソールで実行
  * コピー後に各環境変数を設定。各環境変数の意味は.env.exampleに記載。
* `docker-compose up` をコンソールで実行
  * ブラウザで http://localhost:3000 にアクセスすることでレポート一覧画面にアクセス可能
  * ブラウザで http://localhost:4000 にアクセスすることで管理画面にアクセス可能

アプリ起動後の、アプリの操作方法については[広聴AIの使い方](./how_to_use/README.md)を参照

### メタデータファイルのセットアップ
以下の手順は、メタデータや画像をデフォルトのものから差し替える際に実施してください。

* `public/meta/custom` ディレクトリにメタデータファイルや画像ファイルを配置
  * 配置するのは以下の4ファイル
    * `metadata.json`: レポートのメタデータ。記載した情報は、レポート下部で表示される。
    * `reporter.png`: レポート実施者の画像。ページ最上部およびページ下部で表示される。
    * `icon.png`: レポートのアイコン画像。ページ下部に表示される。
    * `ogp.png`: レポートのOGP画像。
  * ファイルを配置しない場合は、`public/meta/default` ディレクトリに配置されているデフォルトの各ファイルが使用される。

### Azure 環境へのセットアップ
Azure環境にセットアップする方法は[Azure環境へのセットアップ方法](./Azure.md)を参照

## アーキテクチャ概要
本システムは以下のサービスで構成されています。

### api (server)
- ポート: 8000
- 役割: バックエンドAPIサービス
- 主要機能:
  - レポートデータの取得・管理
  - レポート生成パイプラインの実行
  - 管理用APIの提供
- 技術スタック:
  - Python (FastAPI)
  - Docker

### client
- ポート: 3000
- 役割: レポート表示用フロントエンド
- 主要機能:
  - レポートの可視化
  - インタラクティブなデータ分析
  - ユーザーフレンドリーなインターフェース
- 技術スタック:
  - Next.js
  - TypeScript
  - Docker

### client-admin
- ポート: 4000
- 役割: 管理用フロントエンド
- 主要機能:
  - レポートの作成・編集
  - パイプライン設定の管理
  - システム設定の管理
- 技術スタック:
  - Next.js
  - TypeScript
  - Docker

### utils/dummy-server
- 役割: 開発用ダミーAPI
- 用途: 開発環境でのAPIモックとして使用

## client の開発環境の構築手順
フロントエンドのアプリケーション(client と client-admin) を開発用のダミーサーバ (dummy-server) をバックエンドとして起動する手順です。

### 1. client, client-admin, dummy-server の環境構築
```sh
make client-setup
```

### 2. 開発サーバーを起動
```sh
make client-dev -j 3
```

## 免責事項
大規模言語モデル（LLM）にはバイアスがあり、信頼性の低い結果を生成することが知られています。私たちはこれらの問題を軽減する方法に積極的に取り組んでいますが、現段階ではいかなる保証も提供することはできません。特に重要な決定を下す際は、本アプリの出力結果のみに依存せず、必ず内容を検証してください。


## 注意事項
本アプリは開発の初期段階であり、今後開発を進めていく過程で前バージョンと互換性のない変更が行われる可能性があります。
アプリをアップデートする際には、重要なデータ（レポート）がある場合はアプリ・データのバックアップを保存した上でアップデートすることを推奨します。


## 開発者向けのガイドライン
広聴AIはOSSとして開発されており、開発者の方からのコントリビュートを募集しています。
詳しくは、[CONTRIBUTING.md](CONTRIBUTING.md)を参照ください。

## クレジット
このプロジェクトは、[AI Objectives Institute](https://www.aiobjectivesinstitute.org/) が開発した [Talk to the City](https://github.com/AIObjectives/talk-to-the-city-reports)を参考に開発されており、ライセンスに基づいてソースコードを一部活用し、機能追加や改善を実施しています。ここに原作者の貢献に感謝の意を表します。
