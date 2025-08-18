# jsapp

## 概要
パスワード、TOTP、FIDO2によるユーザー認証の実装<br>

## 使用言語、ライブラリ
## front
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)

## api
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-5-blue?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)

## infra
![Docker](https://img.shields.io/badge/Docker-28-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-24-blue?logo=node.js)

## デモ
AWSで公開予定(準備中)

## 環境構築
```
$ cd jsapp
$ docker compose build
$ docker compose up -d
$ docker compose exec api bash
$ npx prisma migrate dev
$ npx prisma generate
$ npx prisma db seed
```

## 使用方法
http://localhost:5173/login で、<br>
①下記テスト用アカウントでパスワードログイン<br>
<img src="README_images/login.png" width="250px"><br><br>

②メニューでAuth Configに画面遷移し、TOTP設定を行う<br>
<img src="README_images/home(menu open).png" width="250px"><br><br>
<img src="README_images/auth_config.png" width="250px"><br><br>
<img src="README_images/totp_setup.png" width="250px"><br><br>
<img src="README_images/input_code.png" width="250px"><br><br>
③TOTP設定が完了したら、FIDO2認証設定が可能になっている<br>
<img src="README_images/auth_config(after TOTP setting).png" width="250px"><br><br>
④FIDO2設定後、アプリからログアウトすると<br>
パスワード＋TOTP、またはFIDO2認証が可能<br>

## テスト用アカウント
email: momo@example.com<br>
password: password<br>
<br>
新規アカウントを使う場合は、ログイン画面からリンク先の<br>
アカウント登録画面でアカウント登録を行う<br>
<img src="README_images/login(to register).png" width="250px"><br><br>
<img src="README_images/register.png" width="250px">
