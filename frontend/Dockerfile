FROM node:20.1.0-alpine3.16

WORKDIR /4ovisionannotator/frontend

# ソースコードと依存関係をコピー
COPY . /4ovisionannotator/frontend
COPY package.json package-lock.json ./

# 依存パッケージをインストール
RUN npm install

# 環境変数をビルド時に適用
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# アプリを起動
CMD ["npm", "start"]
