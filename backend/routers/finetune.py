from fastapi import APIRouter, Depends, HTTPException
import openai
import os

# 環境変数からAPIキーを取得
openai.api_key = os.getenv("OPENAI_API_KEY")

# エンドポイントの設定
router = APIRouter(
    prefix='/finetune',
    tags=["finetune"]
)

def fine_tune_gpt4o_with_vision(jsonl_file_path: str):
    """
    GPT-4oモデルを画像付きデータセットでファインチューニングする関数

    :param jsonl_file_path: ファインチューニング用データセットのパス（JSONL形式）
    :return: ファインチューニングジョブのIDとファインチューニングされたモデルのID
    """
    try:
        # データセットのアップロード
        with open(jsonl_file_path, "rb") as f:
            file_response = openai.File.create(file=f, purpose='fine-tune')
        training_file_id = file_response['id']
        print(f"データセットがアップロードされました。ファイルID: {training_file_id}")

        # ファインチューニングの実行
        fine_tune_response = openai.FineTuningJob.create(
            training_file=training_file_id,
            model="gpt-4o-vision"
        )
        fine_tuned_model_id = fine_tune_response['fine_tuned_model']
        job_id = fine_tune_response['id']
        print(f"ファインチューニングが開始されました。ジョブID: {job_id}, モデルID: {fine_tuned_model_id}")

        return job_id, fine_tuned_model_id

    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return None, None

@router.post("/upload/")
async def upload_and_finetune(file: UploadFile = File(...)):
    """
    クライアントからアップロードされたJSONLファイルを受け取り、ファインチューニングを実行するエンドポイント

    :param file: アップロードされたJSONLファイル
    :return: ファインチューニングジョブのIDとファインチューニングされたモデルのID
    """
    try:
        # 一時的なファイルパスの設定
        temp_file_path = f"/tmp/{file.filename}"

        # アップロードされたファイルを保存
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ファインチューニングの実行
        job_id, model_id = fine_tune_gpt4o_with_vision(temp_file_path)

        if job_id and model_id:
            return {"job_id": job_id, "model_id": model_id}
        else:
            raise HTTPException(status_code=500, detail="ファインチューニング中にエラーが発生しました。")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {e}")

def get_fine_tune_job_statuses(job_ids):
    """
    複数のファインチューニングジョブIDのステータスを取得する関数

    :param job_ids: ファインチューニングジョブIDのリスト
    :return: 各ジョブIDに対応するステータスの辞書
    """
    statuses = {}
    for job_id in job_ids:
        try:
            # ジョブの詳細情報を取得
            job_info = openai.FineTuningJob.retrieve(job_id)
            # ステータスを取得して辞書に格納
            statuses[job_id] = job_info['status']
        except Exception as e:
            # エラーが発生した場合はエラーメッセージを格納
            statuses[job_id] = f"エラー: {e}"
    return statuses