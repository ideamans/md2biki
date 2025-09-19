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


