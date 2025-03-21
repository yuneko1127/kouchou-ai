.PHONY: build up down client-setup client-dev client-dev-server client-admin-dev-server dummy-server azure-cli azure-login azure-build azure-push azure-deploy azure-info azure-config-update azure-cleanup azure-status azure-logs-client azure-logs-api azure-logs-admin azure-apply-policies

##############################################################################
# ローカル開発環境のコマンド
##############################################################################

build:
	docker compose build

up:
	docker compose up --build

down:
	docker compose down

client-setup:
	cd client && npm install && cp .env-sample .env
	cd client-admin && npm install && cp .env-sample .env
	cd utils/dummy-server && npm install && cp .env-sample .env

client-dev: client-dev-server client-admin-dev-server dummy-server

client-dev-server:
	cd client && npm run dev

client-admin-dev-server:
	cd client-admin && npm run dev

dummy-server:
	cd utils/dummy-server && npm run dev

##############################################################################
# Azure初期デプロイのコマンド
##############################################################################

# Azure関連のコマンドで.envを読み込むヘルパー関数
define read-env
$(eval include .env)
$(eval export)
endef

# Azureコンテナを起動（対話モード）
azure-cli:
	docker run -it --rm -v $(shell pwd):/workspace -w /workspace mcr.microsoft.com/azure-cli bash

# Azureにログイン
azure-login:
	docker run -it --rm -v $(shell pwd):/workspace -v $(HOME)/.azure:/root/.azure -w /workspace mcr.microsoft.com/azure-cli az login

# Azureリソースグループの作成
azure-setup:
	docker run -it --rm -v $(shell pwd):/workspace -v $(HOME)/.azure:/root/.azure -w /workspace mcr.microsoft.com/azure-cli /bin/bash -c "\
	    az group create --name kouchou-ai-rg --location japaneast && \
	    az acr create --resource-group kouchou-ai-rg --name kouchouairegistry --sku Basic"

# ACRにログイン（トークンを表示）
azure-acr-login:
	docker run -it --rm -v $(shell pwd):/workspace -v $(HOME)/.azure:/root/.azure -w /workspace mcr.microsoft.com/azure-cli /bin/bash -c "\
	    echo '以下のトークンでDockerログインしてください:' && \
	    token=\$$(az acr login --name kouchouairegistry --expose-token --query accessToken -o tsv) && \
	    echo \"docker login kouchouairegistry.azurecr.io --username 00000000-0000-0000-0000-000000000000 --password \$$token\""

# ACRに自動ログイン
azure-acr-login-auto:
	@echo ">>> ACRに自動ログイン中..."
	$(eval ACR_TOKEN=$(shell docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli az acr login --name kouchouairegistry --expose-token --query accessToken -o tsv))
	@docker login kouchouairegistry.azurecr.io --username 00000000-0000-0000-0000-000000000000 --password $(ACR_TOKEN)

# Azure用のイメージをビルド（client-admin用にはキャッシュ無効化を追加）
azure-build:
	docker build -t kouchouairegistry.azurecr.io/api:latest ./server
	docker build -t kouchouairegistry.azurecr.io/client:latest ./client
	docker build --no-cache -t kouchouairegistry.azurecr.io/client-admin:latest ./client-admin

# イメージをAzureにプッシュ（ローカルのDockerから）
azure-push:
	docker push kouchouairegistry.azurecr.io/api:latest
	docker push kouchouairegistry.azurecr.io/client:latest
	docker push kouchouairegistry.azurecr.io/client-admin:latest

# Container Apps環境の作成とデプロイ
azure-deploy:
	docker run -it --rm -v $(shell pwd):/workspace -v $(HOME)/.azure:/root/.azure -w /workspace mcr.microsoft.com/azure-cli /bin/bash -c "\
	    az extension add --name containerapp --upgrade && \
	    az provider register --namespace Microsoft.App && \
	    az provider register --namespace Microsoft.OperationalInsights --wait && \
	    echo '>>> Log Analytics ワークスペースの作成...' && \
	    az monitor log-analytics workspace create \
	        --resource-group kouchou-ai-rg \
	        --workspace-name kouchou-ai-logs \
	        --location japaneast && \
	    WORKSPACE_ID=\$$(az monitor log-analytics workspace show \
	        --resource-group kouchou-ai-rg \
	        --workspace-name kouchou-ai-logs \
	        --query customerId -o tsv) && \
	    echo '>>> Container Apps環境の作成...' && \
	    az containerapp env create \
	        --name kouchou-ai-env \
	        --resource-group kouchou-ai-rg \
	        --location japaneast \
	        --logs-workspace-id \$$WORKSPACE_ID && \
	    echo '>>> ACRへのアクセス権の設定...' && \
	    az acr update \
	        --name kouchouairegistry \
	        --resource-group kouchou-ai-rg \
	        --admin-enabled true && \
	    ACR_PASSWORD=\$$(az acr credential show \
	        --name kouchouairegistry \
	        --resource-group kouchou-ai-rg \
	        --query passwords[0].value -o tsv) && \
	    echo '>>> APIコンテナのデプロイ...' && \
	    az containerapp create \
	        --name api \
	        --resource-group kouchou-ai-rg \
	        --environment kouchou-ai-env \
	        --image kouchouairegistry.azurecr.io/api:latest \
	        --registry-server kouchouairegistry.azurecr.io \
	        --registry-username kouchouairegistry \
	        --registry-password \$$ACR_PASSWORD \
	        --target-port 8000 \
	        --ingress external \
	        --min-replicas 1 && \
	    echo '>>> APIコンテナにヘルスチェック設定とイメージプルポリシーを適用...' && \
	    az containerapp update --name api --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/policies/api-pull-policy.yaml && \
	    az containerapp update --name api --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/health/api-health-probe.yaml && \
	    echo '>>> クライアントコンテナのデプロイ...' && \
	    az containerapp create \
	        --name client \
	        --resource-group kouchou-ai-rg \
	        --environment kouchou-ai-env \
	        --image kouchouairegistry.azurecr.io/client:latest \
	        --registry-server kouchouairegistry.azurecr.io \
	        --registry-username kouchouairegistry \
	        --registry-password \$$ACR_PASSWORD \
	        --target-port 3000 \
	        --ingress external \
	        --min-replicas 1 && \
	    echo '>>> クライアントコンテナにヘルスチェック設定とイメージプルポリシーを適用...' && \
	    az containerapp update --name client --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/policies/client-pull-policy.yaml && \
	    az containerapp update --name client --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/health/client-health-probe.yaml && \
	    echo '>>> 管理者クライアントコンテナのデプロイ...' && \
	    az containerapp create \
	        --name client-admin \
	        --resource-group kouchou-ai-rg \
	        --environment kouchou-ai-env \
	        --image kouchouairegistry.azurecr.io/client-admin:latest \
	        --registry-server kouchouairegistry.azurecr.io \
	        --registry-username kouchouairegistry \
	        --registry-password \$$ACR_PASSWORD \
	        --target-port 4000 \
	        --ingress external \
	        --min-replicas 1 && \
	    echo '>>> 管理者クライアントコンテナにヘルスチェック設定とイメージプルポリシーを適用...' && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/policies/client-admin-pull-policy.yaml && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/health/client-admin-health-probe.yaml"

# 環境変数の更新
azure-config-update:
	$(call read-env)
	docker run -it --rm -v $(shell pwd):/workspace -v $(HOME)/.azure:/root/.azure -w /workspace mcr.microsoft.com/azure-cli /bin/bash -c "\
	    API_DOMAIN=\$$(az containerapp show --name api --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv) && \
	    CLIENT_DOMAIN=\$$(az containerapp show --name client --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv) && \
	    CLIENT_ADMIN_DOMAIN=\$$(az containerapp show --name client-admin --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv) && \
	    echo '>>> ドメイン情報: API='\$$API_DOMAIN', CLIENT='\$$CLIENT_DOMAIN', ADMIN='\$$CLIENT_ADMIN_DOMAIN && \
	    echo '>>> APIの環境変数を更新...' && \
	    az containerapp update --name api --resource-group kouchou-ai-rg \
	        --set-env-vars 'OPENAI_API_KEY=$(OPENAI_API_KEY)' 'PUBLIC_API_KEY=$(PUBLIC_API_KEY)' 'ADMIN_API_KEY=$(ADMIN_API_KEY)' 'LOG_LEVEL=info' && \
	    echo '>>> クライアントの環境変数を更新...' && \
	    az containerapp update --name client --resource-group kouchou-ai-rg \
	        --set-env-vars 'NEXT_PUBLIC_PUBLIC_API_KEY=$(PUBLIC_API_KEY)' \"NEXT_PUBLIC_API_BASEPATH=https://\$$API_DOMAIN\" \"API_BASEPATH=https://\$$API_DOMAIN\" && \
	    echo '>>> 管理者クライアントの環境変数を更新...' && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg \
	        --set-env-vars 'NEXT_PUBLIC_ADMIN_API_KEY=$(ADMIN_API_KEY)' \"NEXT_PUBLIC_CLIENT_BASEPATH=https://\$$CLIENT_DOMAIN\" \"NEXT_PUBLIC_API_BASEPATH=https://\$$API_DOMAIN\" \"API_BASEPATH=https://\$$API_DOMAIN\" 'BASIC_AUTH_USERNAME=$(BASIC_AUTH_USERNAME)' 'BASIC_AUTH_PASSWORD=$(BASIC_AUTH_PASSWORD)'"

# client-adminアプリの環境変数を修正してビルド
azure-fix-client-admin:
	$(call read-env)
	@echo ">>> APIとクライアントのドメイン情報を取得しています..."
	$(eval API_DOMAIN=$(shell docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "az containerapp show --name api --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | tail -n 1"))
	$(eval CLIENT_DOMAIN=$(shell docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "az containerapp show --name client --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | tail -n 1"))

	@echo ">>> API_DOMAIN=$(API_DOMAIN)"
	@echo ">>> CLIENT_DOMAIN=$(CLIENT_DOMAIN)"

	@echo ">>> 環境変数を設定し、キャッシュを無効化してclient-adminを再ビルド..."
	docker build --no-cache \
	  --build-arg NEXT_PUBLIC_API_BASEPATH=https://$(API_DOMAIN) \
	  --build-arg NEXT_PUBLIC_ADMIN_API_KEY=$(ADMIN_API_KEY) \
	  --build-arg NEXT_PUBLIC_CLIENT_BASEPATH=https://$(CLIENT_DOMAIN) \
	  -t kouchouairegistry.azurecr.io/client-admin:latest ./client-admin

	@echo ">>> イメージをプッシュ..."
	docker push kouchouairegistry.azurecr.io/client-admin:latest

	@echo ">>> コンテナアプリを更新..."
	docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "\
	  az containerapp update --name client-admin --resource-group kouchou-ai-rg \
	    --image kouchouairegistry.azurecr.io/client-admin:latest"

	@echo ">>> コンテナアプリを再起動（スケールダウン後にスケールアップ）..."
	docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "\
	  echo '>>> 一時的にスケールダウン...' && \
	  az containerapp update --name client-admin --resource-group kouchou-ai-rg --min-replicas 0 && \
	  echo '>>> 再度スケールアップ...' && \
	  sleep 5 && \
	  az containerapp update --name client-admin --resource-group kouchou-ai-rg --min-replicas 1"

# 環境の検証
azure-verify:
	@echo ">>> 環境の検証を開始..."
	@docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "\
	  API_UP=\$$(az containerapp show --name api --resource-group kouchou-ai-rg --query 'properties.latestRevisionName' -o tsv); \
	  CLIENT_UP=\$$(az containerapp show --name client --resource-group kouchou-ai-rg --query 'properties.latestRevisionName' -o tsv); \
	  ADMIN_UP=\$$(az containerapp show --name client-admin --resource-group kouchou-ai-rg --query 'properties.latestRevisionName' -o tsv); \
	  echo '検証結果:'; \
	  echo 'API Status: '\$$API_UP; \
	  echo 'Client Status: '\$$CLIENT_UP; \
	  echo 'Admin Client Status: '\$$ADMIN_UP; \
	  if [ -z \"\$$API_UP\" ] || [ -z \"\$$CLIENT_UP\" ] || [ -z \"\$$ADMIN_UP\" ]; then \
	    echo '警告: いくつかのサービスが正しくデプロイされていません。'; \
	  else \
	    echo 'すべてのサービスが正常にデプロイされています。'; \
	  fi \
	"

# サービスURLの取得
azure-info:
	@echo "----------------------------------------------------------------------------------------"
	$(eval API_DOMAIN=$(shell docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "az containerapp show --name api --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | tail -n 1"))
	$(eval CLIENT_DOMAIN=$(shell docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "az containerapp show --name client --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | tail -n 1"))
	$(eval ADMIN_DOMAIN=$(shell docker run --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "az containerapp show --name client-admin --resource-group kouchou-ai-rg --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | tail -n 1"))
	@echo "client      : https://$(CLIENT_DOMAIN)"
	@echo "client-admin: https://$(ADMIN_DOMAIN)"
	@echo "API         : https://$(API_DOMAIN)"
	@echo "----------------------------------------------------------------------------------------"

# 完全セットアップを一括実行
azure-setup-all:
	$(call read-env)
	@echo ">>> 1. リソースグループとACRのセットアップ..."
	@$(MAKE) azure-setup

	@echo ">>> 2. ACRへのログイン..."
	@$(MAKE) azure-acr-login-auto

	@echo ">>> 3. コンテナイメージのビルド..."
	@$(MAKE) azure-build

	@echo ">>> 4. イメージのプッシュ..."
	@$(MAKE) azure-push

	@echo ">>> 5. Container Appsへのデプロイ..."
	@$(MAKE) azure-deploy

	@echo ">>> コンテナアプリ作成を待機中（20秒）..."
	@sleep 20

	@echo ">>> 5a. ポリシーとヘルスチェックの適用..."
	@$(MAKE) azure-apply-policies

	@echo ">>> 6. 環境変数の設定..."
	@$(MAKE) azure-config-update

	@echo ">>> 環境変数の反映を待機中（30秒）..."
	@sleep 30

	@echo ">>> 7. 管理画面の環境変数を修正してビルド..."
	@$(MAKE) azure-fix-client-admin

	@echo ">>> 8. 環境の検証..."
	@$(MAKE) azure-verify

	@echo ">>> 9. サービスURLの確認..."
	@$(MAKE) azure-info

	@echo ">>> セットアップが完了しました。上記のURLでサービスにアクセスできます。"

##############################################################################
# Azure運用時コマンド
##############################################################################

# コンテナをスケールダウン（料金発生を抑制）
azure-stop:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "\
	    echo '>>> APIコンテナをスケールダウン中...' && \
	    az containerapp update --name api --resource-group kouchou-ai-rg --min-replicas 0 && \
	    echo '>>> クライアントコンテナをスケールダウン中...' && \
	    az containerapp update --name client --resource-group kouchou-ai-rg --min-replicas 0 && \
	    echo '>>> 管理者クライアントコンテナをスケールダウン中...' && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg --min-replicas 0 && \
	    echo '>>> すべてのコンテナのスケールダウンが完了しました。'"

# コンテナを再起動（使用時）
azure-start:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "\
	    echo '>>> APIコンテナを起動中...' && \
	    az containerapp update --name api --resource-group kouchou-ai-rg --min-replicas 1 && \
	    echo '>>> クライアントコンテナを起動中...' && \
	    az containerapp update --name client --resource-group kouchou-ai-rg --min-replicas 1 && \
	    echo '>>> 管理者クライアントコンテナを起動中...' && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg --min-replicas 1 && \
	    echo '>>> すべてのコンテナの起動が完了しました。'"

# コンテナのステータス確認
azure-status:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli /bin/bash -c "\
	    echo '>>> APIコンテナのステータス:' && \
	    az containerapp revision list --name api --resource-group kouchou-ai-rg -o table && \
	    echo '>>> クライアントコンテナのステータス:' && \
	    az containerapp revision list --name client --resource-group kouchou-ai-rg -o table && \
	    echo '>>> 管理者クライアントコンテナのステータス:' && \
	    az containerapp revision list --name client-admin --resource-group kouchou-ai-rg -o table"

# コンテナのログ確認
azure-logs-client:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli az containerapp logs show --name client --resource-group kouchou-ai-rg --follow

azure-logs-api:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli az containerapp logs show --name api --resource-group kouchou-ai-rg --follow

azure-logs-admin:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli az containerapp logs show --name client-admin --resource-group kouchou-ai-rg --follow

# リソースの完全削除
azure-cleanup:
	docker run -it --rm -v $(HOME)/.azure:/root/.azure mcr.microsoft.com/azure-cli az group delete --name kouchou-ai-rg --yes

# ヘルスチェック設定とイメージプルポリシーの適用
azure-apply-policies:
	@echo ">>> すべてのコンテナにポリシーを適用します..."
	@docker run --rm -v $(shell pwd):/workspace -v $(HOME)/.azure:/root/.azure -w /workspace mcr.microsoft.com/azure-cli /bin/bash -c "\
	    echo '>>> APIコンテナにヘルスチェック設定とイメージプルポリシーを適用...' && \
	    az containerapp update --name api --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/policies/api-pull-policy.yaml || echo '警告: APIポリシー適用に失敗しました' && \
	    az containerapp update --name api --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/health/api-health-probe.yaml || echo '警告: APIヘルスプローブ適用に失敗しました' && \
	    echo '>>> クライアントコンテナにヘルスチェック設定とイメージプルポリシーを適用...' && \
	    az containerapp update --name client --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/policies/client-pull-policy.yaml || echo '警告: クライアントポリシー適用に失敗しました' && \
	    az containerapp update --name client --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/health/client-health-probe.yaml || echo '警告: クライアントヘルスプローブ適用に失敗しました' && \
	    echo '>>> 管理者クライアントコンテナにヘルスチェック設定とイメージプルポリシーを適用...' && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/policies/client-admin-pull-policy.yaml || echo '警告: 管理者クライアントポリシー適用に失敗しました' && \
	    az containerapp update --name client-admin --resource-group kouchou-ai-rg \
	        --yaml /workspace/.azure/health/client-admin-health-probe.yaml || echo '警告: 管理者クライアントヘルスプローブ適用に失敗しました'"