FROM python:3.11-buster
ENV PYTHONUNBUFFERED=1

WORKDIR /4ovisionannotator/backend

# ソースコードと依存関係をコピー
COPY . /4ovisionannotator/backend

# Pythonの依存パッケージをインストール
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# アプリを起動
CMD ["sh", "-c", "uvicorn main:app --reload --host $BACKEND_HOST --port $BACKEND_PORT"]
