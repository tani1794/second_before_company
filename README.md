# ONEV ALLEY STATION — 公開手順書

車の電子機器(MCU・ECU・OBD・ジャイロ・ハブ・ワイヤーハーネス)を初心者向けに解説するWebサイトです。
この手順書では、今お使いのGitHubアカウントで、**フルネームや大学名を出さずに** GitHub Pages で公開し、Google検索に載せるまでを説明します。

公開URL:**https://tani1794.github.io/second_before_company/**

---

## 0. フォルダの中身

| ファイル / フォルダ | 役割 |
|---|---|
| `index.html` | トップページ |
| `mcu.html` `ecu.html` `obd.html` `gyro.html` `hub.html` `harness.html` | 各解説ページ |
| `glossary.html` | 用語検索ページ |
| `css/style.css` | 色・文字・レイアウト(一番上の `:root` で色を変えられます) |
| `js/main.js` | 全ページ共通の動き(フェードイン、タブ、用語検索 など) |
| `js/glossary-data.js` | 用語集のデータ(用語を増やしたいときはここに追加) |
| `js/○○.js` | 各ページの動く図 |
| `img/` | アイコン・SNS共有用の画像 |
| `sitemap.xml` `robots.txt` | 検索エンジン向けの案内ファイル |
| `.nojekyll` | GitHub Pages で余計な変換をさせないための空ファイル(消さない) |

---

## 1. まずパソコンで表示を確認する(VS Code)

1. VS Code を開き、「ファイル」→「フォルダーを開く」でこのフォルダ(`onev-alley-station`)を選びます。
2. 左の「拡張機能」(四角が4つのアイコン)で **Live Server** を検索してインストールします。
3. `index.html` を右クリック →「Open with Live Server」。ブラウザでサイトが開きます。

---

## 2. 個人情報を守るための設定(公開前に必ず)

GitHubにサインインした状態で、右上のアイコン →「Settings」から行います。

### 2-1. プロフィールから名前と所属を外す

「Public profile」で、**Name・Bio・Company・Location** を空欄にして「Update profile」。アイコン画像に顔写真を使っている場合は変更します。

> 講義で名前の表示が必要な場合は、講義が終わってから公開する、または担当の先生に確認してから進めてください。

### 2-2. メールアドレスを非公開にする

「Emails」で次の2つにチェックを入れます。

- **Keep my email addresses private**(メールアドレスを非公開にする)
- **Block command line pushes that expose my email**(メールが漏れる送信をブロック)

チェックすると、`12345678+tani1794@users.noreply.github.com` のような**匿名用アドレス**が表示されます。手順4-Bで使うのでメモしておきます。

### 2-3. 大学の組織(Organization)のメンバー表示を隠す

1. 組織のページ(`https://github.com/orgs/KU-XBP/people` など)を開きます。
2. 自分の行の「Public」を **Private** に変更します。

これで、プロフィールに組織のアイコンが表示されなくなります。

> 組織のリポジトリ(`KU-XBP/app2026-tani1794` など)は組織側の設定で管理されています。公開範囲が気になる場合は、担当の先生や管理者に確認してください。

---

## 3. 公開用のリポジトリを作る

1. 右上の「+」→「New repository」。
2. **Repository name** に `second_before_company` と入力します。
3. **Public** を選び、ほかは何も追加せずに「Create repository」。

> 無料プランの GitHub Pages は、Public(公開)リポジトリで使えます。

---

## 4. ファイルをアップロードする(A・B のどちらか)

### A. ブラウザでアップロード(いちばん簡単・おすすめ)

1. 作ったリポジトリの画面で「uploading an existing file」をクリック。
2. このフォルダの**中身すべて**(`index.html` や `css` フォルダなど)をドラッグ&ドロップします。フォルダごと入れると1階層深くなるので、**中身を**選んで入れてください。
   - `.nojekyll` は隠しファイルのため見えないことがあります。その場合は、リポジトリ画面で「Add file」→「Create new file」から、名前を `.nojekyll` にして中身は空のまま保存してください。
3. 下の「Commit changes」を押して完了。

### B. VS Code + Git で送る(慣れてきたら)

VS Code で「ターミナル」→「新しいターミナル」を開き、1行ずつ実行します。

```bash
git init
git config --local user.name "tani1794"
git config --local user.email "ここに2-2でメモした匿名用アドレス"
git add .
git commit -m "first publish"
git branch -M main
git remote add origin https://github.com/tani1794/second_before_company.git
git push -u origin main
```

- `--local` を付けると、**このフォルダだけ**に名前とメールを設定します。講義用のほかのフォルダには影響しません。
- 送信前に `git config user.name` と `git config user.email` を打ち、本名や大学のアドレスが表示されないことを確認してください。

---

## 5. GitHub Pages をオンにする

1. リポジトリの「Settings」→ 左メニュー「Pages」。
2. 「Build and deployment」の Source を **Deploy from a branch**、Branch を **main** / **/(root)** にして「Save」。
3. 1〜数分待つと、`https://tani1794.github.io/second_before_company/` で公開されます。

---

## 6. Google 検索に載せる

1. https://search.google.com/search-console を開き、Googleアカウントでログインします(表示名が本名のアカウントは避けると安心です)。
2. 「URLプレフィックス」に `https://tani1794.github.io/second_before_company/` を入力(最後の `/` まで入れる)。
3. 確認方法で「**HTMLタグ**」を選び、表示された `<meta name="google-site-verification" ...>` の1行をコピー。
4. `index.html` の `<head>` の中(`<meta charset="utf-8">` のすぐ下など)に貼り付けて、手順4の方法でもう一度アップロード。
5. Search Console に戻って「確認」。
6. 左メニュー「サイトマップ」で `sitemap.xml` と入力して送信。

> 検索結果に出るまで、数日〜数週間かかることがあります。検索の順位は保証されません。

---

## 7. 公開前のチェックリスト

- [ ] GitHub プロフィールの Name・Company・Location が空欄
- [ ] メールアドレスの非公開設定がオン
- [ ] 大学の組織のメンバー表示が Private
- [ ] サイト内のファイルに本名・大学名・学籍番号を書いていない
- [ ] 自分で撮った写真を追加する場合、位置情報(Exif)を消してある
- [ ] Search Console や Google アカウントの表示名も本名ではない

---

## 8. 更新のしかた

- **用語を増やす**:`js/glossary-data.js` に、同じ形で1件ずつ追加します。
- **色を変える**:`css/style.css` の一番上、`:root { ... }` の色コードを変えます。
- **文章を直す**:各 `.html` ファイルを直接編集します。
- 直したら、手順4のA(同じファイル名で上書きアップロード)またはBの `git add .` → `git commit -m "更新"` → `git push` で反映されます。

---

## 9. 用語検索のしくみ(補足)

用語検索は、まずサイト内の用語集(`glossary-data.js`)を探し、続けて **Wikipedia 日本語版の公開API** から説明文を取得して表示します。APIキーなどの秘密情報は使っていないので、そのまま公開して問題ありません。インターネットの情報は自動取得のため、内容は必ず複数の情報源で確かめるよう、ページ内でも案内しています。
