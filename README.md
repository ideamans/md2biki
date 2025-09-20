# md2biki

Markdownドキュメントを[Backlog Wiki形式](https://support-ja.backlog.com/hc/ja/articles/360035641594-%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E6%95%B4%E5%BD%A2%E3%81%AE%E3%83%AB%E3%83%BC%E3%83%AB-Backlog%E8%A8%98%E6%B3%95)に変換するコマンドラインツールです。

## 特徴

- 📝 Markdown → Backlog Wiki形式への完全な変換
- 📁 ファイル単体・ディレクトリ一括変換対応
- 🔄 標準入出力対応（パイプライン処理可能）
- 📋 クリップボード入出力対応
- 🎨 カラフルなコンソール出力
- ⚡ 高速な変換処理

## インストール

### ローカルインストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/md2biki.git
cd md2biki

# 依存関係のインストール
npm install
# または
yarn install

# ローカルにインストール（グローバルコマンドとして使用可能）
npm run install-local
# または
yarn install-local
```

インストール後、どこからでも`md2biki`コマンドが使用できます。

### アンインストール

```bash
npm run uninstall-local
# または
yarn uninstall-local
```

## 使い方

### 基本的な使い方

#### 単一ファイルの変換

```bash
md2biki README.md
# → README.md.biki が生成されます
```

#### ディレクトリ内のすべてのMarkdownファイルを変換

```bash
md2biki ./docs
# → docs内のすべての.mdファイルが再帰的に変換されます
```

#### 標準入出力を使用

```bash
# 標準入力から読み込み、標準出力へ出力
md2biki -

# パイプラインでの使用例
echo "# Title" | md2biki -
cat document.md | md2biki - > output.biki
```

#### クリップボードを使用

```bash
# クリップボードから読み込み、クリップボードへ出力
md2biki =
```

### オプション

| オプション | 説明 | デフォルト |
|-----------|------|----------|
| `-o, --output <path>` | 出力先ディレクトリを指定 | 入力ファイルと同じ場所 |
| `-e, --ext <extension>` | 出力ファイルの拡張子 | `.biki` |
| `-r, --readable` | 空行を保持（読みやすさ重視） | 空行を削除 |
| `-q, --quiet` | 進捗メッセージを非表示 | メッセージを表示 |
| `-h, --help` | ヘルプを表示 | - |
| `-V, --version` | バージョンを表示 | - |

### 使用例

```bash
# 出力ディレクトリを指定して変換
md2biki input.md -o ./output

# 拡張子を変更して出力
md2biki input.md -e .wiki

# 空行を保持して読みやすく変換
md2biki input.md -r

# 静かなモード（メッセージ非表示）
md2biki input.md -q

# 複数のオプションを組み合わせ
md2biki ./docs -o ./wiki -r -q
```

## 変換対応表

| Markdown | Backlog Wiki | 説明 |
|----------|--------------|------|
| `# Header` | `* Header` | 見出し（H1〜H6対応） |
| `**Bold**` | `''Bold''` | 太字 |
| `*Italic*` または `_Italic_` | `'''Italic'''` | 斜体 |
| `~~Strike~~` | `%%Strike%%` | 取り消し線 |
| `` `code` `` | `{code}code{/code}` | インラインコード |
| ` ```code block``` ` | `{code}`<br>`code block`<br>`{/code}` | コードブロック |
| `[Link](url)` | `[[Link>url]]` | リンク |
| `![Image](url)` | `#image(url)` | 画像 |
| `- Item` または `* Item` | `- Item` | 箇条書き |
| `1. Item` | `+ Item` | 番号付きリスト |
| `> Quote` | `>Quote` または `{quote}...{/quote}` | 引用（複数行対応） |
| `\| A \| B \|` | `\|A\|B\|h` | テーブル |
| `---` | `----` | 水平線 |
| 改行 | `&br;` | 段落内改行 |

### サポートされている機能

✅ **完全対応**
- 見出し（H1〜H6）
- テキスト装飾（太字、斜体、取り消し線）
- リンク・画像
- リスト（箇条書き、番号付き、ネスト対応）
- テーブル（GFM形式）
- 引用（単一行・複数行）
- コードブロック・インラインコード
- 水平線
- 特殊文字のエスケープ

## 開発

### ビルド

```bash
npm run build
# または
yarn build
```

### テスト

```bash
npm test
# または
yarn test
```

### 開発モード（ファイル監視）

```bash
npm run dev
# または
yarn dev
```

## 技術スタック

- **TypeScript** - 型安全な開発
- **unified/remark** - Markdownパース処理
- **remark-gfm** - GitHub Flavored Markdown対応
- **Commander.js** - CLIフレームワーク
- **AVA** - テストフレームワーク
- **chalk** - カラフルなコンソール出力
- **clipboardy** - クリップボード操作

## ライセンス

MIT

---

**注記**: このツールはBacklog Wikiの公式ツールではありません。[Nulab Inc.](https://nulab.com/)が提供する[Backlog](https://backlog.com/)のWiki記法に変換するサードパーティ製のツールです。