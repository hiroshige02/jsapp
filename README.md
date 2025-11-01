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
![Redis](https://img.shields.io/badge/Redis-8.2-blue?logo=redis)

## infra
![Docker](https://img.shields.io/badge/Docker-28-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-24-blue?logo=node.js)

## デモ
[jsapp.xyz](https://www.jsapp.xyz)  
ECS+S3環境でデプロイ 構成図は[こちら](https://1drv.ms/b/c/9fff7a8edc873969/ERKbtPT0H49GvbYUFGWhQ4YBDDxpOEe_j6OzAu_lzQ6VMA?e=tXrjzb)  
 

 
**※本環境は検証目的のため、コストの都合により**
**予告なくリソースを削除、またはデータベースをリセットする場合があります。**  
**あらかじめご了承ください。**

## 環境構築（ローカルで試す場合）

```
$ cd jsapp
$ docker compose build
$ docker compose up -d
$ docker compose exec api bash
$ prisma migrate dev
$ prisma generate
$ prisma db seed
```

## 使用方法
http://localhost/login で、<br>
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
