from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import FileResponse
import os
import json
import unicodedata
import base64

# エンドポイントの設定
router = APIRouter(
    prefix='/annotation',
    tags=["annotation"]
)

@router.get("/get_annotations")
async def get_annotations(pid: str):
    project_root = f"./datas/{pid}"
    annotation_file = os.path.join(project_root, "annotation.json")

    if not os.path.exists(annotation_file):
        raise HTTPException(status_code=404, detail="Annotation file not found")

    try:
        with open(annotation_file, "r") as f:
            annotations = json.load(f)
        return {"project_id": pid, "annotations": annotations}
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading annotation file")

# 画像ファイルをエンコードする関数
def encode_image(image_file):
    return base64.b64encode(image_file).decode('utf-8')

def annojson2dataset(pid):
    project_root = f"./datas/{pid}"
    annotation_file = os.path.join(project_root, "annotation.json")
    with open(annotation_file, "r") as f:
        annotations = json.load(f)
    # データセットファイルの作成
    dataset_path = os.path.join(project_root, "dataset.jsonl")
    with open(dataset_path, "w", encoding="utf-8") as f:
        for anno in annotations: # anno->{'image':, 'sys':, 'user':, 'label':}
            if (anno["sys"] != "") and (anno["user"] != "") and (anno["label"] != ""):
                # 画像パスの取得
                image_path = os.path.join(project_root, "imgs", anno["image"])
                # 画像の読み込み
                with open(image_path, "rb") as i:
                    image_data = i.read()
                # 画像のエンコード
                base64_image = encode_image(image_data)
                # エンコードした画像からURLを生成
                url = f"data:image/jpeg;base64,{base64_image}"
                # データの作成
                item = {
                    "messages": [
                        {"role": "system", "content": anno["sys"]},
                        {"role": "user", "content": anno["user"]},
                        {"role": "user", "content": [
                            {"type": "image_url", "image_url": {"url": url}}
                        ]},
                        {"role": "assistant", "content": anno["label"]}
                    ]
                }
                f.write(json.dumps(item, ensure_ascii=False) + '\n')

    return dataset_path


@router.post("/generate-jsonl")
async def generate_jsonl(pid: str):
    try:
        dataset_path = annojson2dataset(pid)
        output_file = os.path.abspath(dataset_path)
        if not os.path.exists(output_file):
            raise HTTPException(status_code=500, detail="JSONL file creation failed")
        return FileResponse(output_file, media_type='application/json', filename=f"{pid}.jsonl")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# pidを受け取り，そのプロジェクトのannotation.jsonを返すエンドポイント
@router.get("/get_annotations")
async def get_annotations(pid: str):
    project_root = f"./datas/{pid}"
    annotation_file = os.path.join(project_root, "annotation.json")
    project_info_file = os.path.join(project_root, "project_info.json")
    with open(annotation_file, "r") as f:
        annotations = json.load(f)
    with open(project_info_file, "r") as f:
        project_info = json.load(f)

    return {"project_id": pid, "annotations": annotations, "project_info": project_info}

# annotation情報の定義
class AnnotationInfo(BaseModel):
    pid: str
    image: str
    sys: str
    user: str
    label: str

# Unicode正規化を行う関数
def normalize_string(s: str) -> str:
    return unicodedata.normalize('NFC', s.strip())

# annotation情報を受け取り，annotation.jsonに追加または更新するエンドポイント
@router.post("/add_annotation")
async def add_annotation(anno_info: AnnotationInfo):
    project_root = f"./datas/{anno_info.pid}"
    annotation_file = os.path.join(project_root, "annotation.json")

    # ファイルの存在確認
    if not os.path.exists(annotation_file):
        raise HTTPException(status_code=404, detail="Annotation file not found")

    # JSONファイルの読み込み
    try:
        with open(annotation_file, "r", encoding="utf-8") as f:
            annotations = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading annotation file")

    # 対応する画像のアノテーション情報を更新
    updated = False
    for annotation in annotations:
        # JSONから取得した画像名とリクエストデータの画像名を標準化して比較
        json_image = normalize_string(annotation.get("image", ""))
        request_image = normalize_string(anno_info.image)

        if json_image == request_image:
            annotation["sys"] = anno_info.sys
            annotation["user"] = anno_info.user
            annotation["label"] = anno_info.label
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Image not found in annotations")

    # JSONファイルの書き込み
    try:
        with open(annotation_file, "w", encoding="utf-8") as f:
            json.dump(annotations, f, indent=4, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing to annotation file: {str(e)}")

    return {"message": "Annotation updated successfully", "annotations": annotations}