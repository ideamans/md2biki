# このプロジェクトは

Markdownドキュメントファイルを、Backlog Wiki形式に変換するためのプログラムです。

## 技術

- TypeScript
- remark

## コマンド

md2biki <ファイル|ディレクトリ>

指定された項目がファイルであれば、そのファイルを変換し、Backlog Wiki形式にします。(例: README.md -> README.md.biki)。
指定された項目がディレクトリであれば、再起的に走査し、すべてのMarkdownファイルを変換します。

## Backlog Wiki

ルール	整形前	整形後
課題リンク、
Wikiページリンク	
BLG-95,[[BLG-98]],[[WikiPageName]]
BLG-95,BLG-98,WikiPageName
太字	
''Bold''
Bold
斜体	
'''Italic'''
Italic
打ち消し線	
%%Strike%%
Strike
色	
&color(#f00) { Color }
&color(red) { Color }
&color(#ffffff, #abd500) { Color }
Color
Color
Color
URL	
http://www.backlog.jp/
[[Backlog>http://www.backlog.jp/]]
[[Backlog:http://www.backlog.jp/]]
http://www.backlog.jp/
Backlog
Backlog
見出し	
* Header1
** Header2
*** Header3
Header1
Header2
Header3
箇条書き	
- Item-A
- Item-B
-- Item-B-1
--- Item-B-2-a
Item-A
Item-B
Item-B-1
Item-B-2-a
箇条書き（数字）	
+ Item-A
+ Item-B
+ Item-C
Item-A
Item-B
Item-C
表	
| A | B | C |
|a|b|c|


|A|B|C|h
|a|b|c|
|d|e|f|


|~No.1|aaa|bbb|
|~No.2|ccc|ddd|
A	B	C
a	b	c

A	B	C
a	b	c
d	e	f

No.1	aaa	bbb
No.2	ccc	ddd
引用文	
>引用した
>文章です。

{quote}
  引用した
  文章です。
{/quote}
引用した

文章です。


引用した

文章です。

コードマクロ	
{code}
package helloworld;
public class Hello {
  public String sayHello {
    return "Hello";
  }
}
{/code}
package helloworld;
public class Hello {
  public String sayHello {
    return "Hello";
  }
}
Subversionリビジョン詳細へのリンク	
#rev(リビジョン番号)
(例)#rev(11)
#rev(プロジェクトキー/リビジョン番号)
(例)#rev(BLG/11)
r11
BLG/r11
Gitリビジョン詳細へのリンク	
#rev(リポジトリ:リビジョン)
(例)#rev(app:abcdeabcde)
#rev(プロジェクトキー/リポジトリ:リビジョン)
(例)#rev(BLG/app:abcdeabcde)
app:abcdeabcde BLG/app:abcdeabcde
目次	
#contents
Header1
Header2
Header3
Header3-1
改行	
aaa&br;bbb
aaa
bbb
Cacoo図 (ビューア形式)
※ツールバーから挿入する記法です。
ツールバーの"Cacoo"ボタンをクリックしてください。
#cacoo([ビューアパス],[幅],[高さ])
#cacoo([ビューアパス],[幅],[高さ],[テーマ])
#cacoo([ビューアパス],[幅],[高さ],[テーマ],[シート番号])	(ヘルプを参照してください)
画像の貼り付け (他サイトのURL)	
#image(https://nulab.com/app/assets/img/common/backlog_logo.svg)

添付ファイル画像の表示
※ツールバーから挿入する記法です。
ツールバーのクリップボタンをクリックしてください。
#image(ファイルID)
(例)#image(11)

添付ファイル画像の表示	
#image(ファイル名)
(例)#image(nulab.png)

縮小画像の貼り付け (他サイトのURL)	
#thumbnail(https://nulab.com/app/assets/img/common/backlog_logo.svg)

画像添付ファイルの縮小表示
※ツールバーから挿入する記法です。
ツールバーのクリップボタンをクリックしてください。
#thumbnail(ファイルID)
(例)#thumbnail(11)

画像添付ファイルの縮小表示	
#thumbnail(ファイル名)
(例)#thumbnail(nulab.png)

添付ファイルへのリンク
※ツールバーから挿入する記法です。
ツールバーのクリップボタンをクリックしてください。
#attach(リンクの表示ラベル:ファイルID)
(例)#attach(sample.zip:11)
sample.zip
特殊な文字をそのまま出力します	
\\%\\%Not struck\\%\\%

|Using bars in table| \\|\\| |
%%Not struck%%

Using bars in table	||

## npm への公開

`v*` のタグを push すると `.github/workflows/publish.yml` がテストとビルドのあと npm に**そのまま公開する**
（承認待ちにしない）。認証は npm の Trusted Publishing（GitHub Actions の OIDC）で、`NPM_TOKEN` などのシークレットは使わない。
provenance は自動で付く。

```bash
# package.json の version を上げてコミット・push してから
git tag vX.Y.Z && git push origin vX.Y.Z
```

- タグと package.json の version が違えば落ちる。npm に同じ版があれば何もしない
- プレリリース（`1.2.0-beta.0`）は `latest` ではなく識別子の dist-tag（`beta`）で出る
- 手元から `npm publish` しない（トークンを置かない）
- タグを打ち直さずに出し直すときは、Actions の「Publish to npm」を workflow_dispatch で起動する（選んだブランチの package.json の版を出す）
- PR で `publish.yml` を変えると、公開せずにビルドと `npm pack --dry-run` までが走る
- package.json の `repository` はこのリポジトリを指すこと。provenance の検証で照合され、違うと公開が `E422` で落ちる（ワークフローが先に検査する）
- 前提: npmjs.com の `md2biki` の設定で、Trusted Publisher に GitHub Actions・`ideamans/md2biki`・`publish.yml`・権限 **publish** を登録してあること。
  stage publish の権限だけだと `npm publish` は `E403 OIDC permission denied` になる

## 依存の脆弱性（2026-11-12）

- `glob` は `^10.5.0` を下限にしている（10.4 以前は High の GHSA）。利用者の install でも修正版になるよう、lock ではなく package.json で上げた
- `glob` 10（moderate、修正は 14.0.2）と、その下の `minimatch` 9（moderate、修正は 11.0.1）が残る。glob 14 は major で Node 18 以上を要求するため、engines（>=16）を変えるときに合わせて上げる
