# python3.9のイメージをダウンロード
FROM python:3.11-buster
ENV PYTHONUNBUFFERED=1

WORKDIR /4ovisionannotator/backend
COPY . /4ovisionannotator/backend

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

CMD ["uvicorn", "main:app","--reload","--host","0.0.0.0","--port","8080"]