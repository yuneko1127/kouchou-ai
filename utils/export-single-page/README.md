# utils/export-single-page

単一の html ファイルを生成するためのユーティリティです

## Note
サーバーが用意できる環境であれば、このユーティリティを使う必要はありません  
静的なホスティング環境しか用意できない場合のみこちらを利用してください

## Usage

`/public` に必要なファイルを配置してください

```
/public
  ├ hierarchical_result.json // レポートデータ
  └ /meta
    ├ metadata.json // 発行者情報
    ├ icon.png      // アイコン画像
    ├ reporter.png  // 発行者画像
    └ ogp.png       // OGP画像
```

ファイルを配置したら以下のコマンドを実行してください

```
npm install
npm run export
```

成功すると `/out` ディレクトリに必要なファイルが出力されます
