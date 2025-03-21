# Azure設定ファイル

このディレクトリには、Azureデプロイに関連する設定ファイルが含まれています。

## 構成

- `health/` - コンテナのヘルスチェック設定
  - `api-health-probe.yaml` - APIコンテナのヘルスチェック設定
  - `client-health-probe.yaml` - クライアントコンテナのヘルスチェック設定
  - `client-admin-health-probe.yaml` - 管理者クライアントコンテナのヘルスチェック設定
  
- `policies/` - コンテナのポリシー設定
  - `api-pull-policy.yaml` - APIコンテナのイメージプルポリシー
  - `client-pull-policy.yaml` - クライアントコンテナのイメージプルポリシー
  - `client-admin-pull-policy.yaml` - 管理者クライアントコンテナのイメージプルポリシー
