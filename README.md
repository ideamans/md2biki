# md2biki

Markdownドキュメントを[Backlog Wiki形式](https://support-ja.backlog.com/hc/ja/articles/360035644274)に変換するためのコマンドラインツールです。

## インストール

### ローカルインストール

```bash
# プロジェクトをクローン
git clone https://github.com/yourname/md2biki.git
cd md2biki

# 依存関係のインストール
npm install
# または
yarn install

# ローカルにインストール
npm run install-local
# または
yarn install-local
```

ローカルインストール後は、どこからでも`md2biki`コマンドが使用できます。

### アンインストール

```bash
npm run uninstall-local
# または
yarn uninstall-local
```

## 使い方

### 単一ファイルの変換

```bash
md2biki README.md
```

これにより、`README.md.biki`ファイルが生成されます。

### ディレクトリ内のすべてのMarkdownファイルを変換

```bash
md2biki ./docs
```

指定されたディレクトリ内のすべての`.md`ファイルが再帰的に変換されます。

### オプション

```bash
# 出力ディレクトリを指定
md2biki input.md -o ./output

# 出力ファイルの拡張子を変更（デフォルト: .biki）
md2biki input.md -e .wiki

# 静かなモード（出力メッセージを抑制）
md2biki input.md -q
```

## 変換対応表

| Markdown | Backlog Wiki |
|----------|--------------|
| `# Header1` | `* Header1` |
| `## Header2` | `** Header2` |
| `### Header3` | `*** Header3` |
| `**Bold**` | `''Bold''` |
| `*Italic*` | `'''Italic'''` |
| `~~Strike~~` | `%%Strike%%` |
| `` `code` `` | `{code}code{/code}` |
| `[Link](url)` | `[[Link>url]]` |
| `![Image](url)` | `#image(url)` |
| `- Item` | `- Item` |
| `1. Item` | `+ Item` |
| `> Quote` | `>Quote` または `{quote}...{/quote}` |
| Tables | Backlog形式のテーブル |
| Code blocks | `{code}...{/code}` |

## 開発

### ビルド

```bash
npm run build
```

### テスト

```bash
npm test
```

### 開発モード（ファイル監視）

```bash
npm run dev
```

## ライセンス

MIT