from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
import os
import json
import uuid
from datetime import datetime
from PIL import Image
import random

# エンドポイントの設定
router = APIRouter(
    prefix='/projects',
    tags=["projects"]
)

# プロジェクト作成用のリクエストモデル
class ProjectCreateRequest(BaseModel):
    name: str # プロジェクト名

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_project(
    name: str = Form(...), # プロジェクト名
    default_role: str = Form(...), # デフォルトのロール情報
    description: str = Form(...), # プロジェクトの説明
    files: List[UploadFile] = File(...), # アップロードされる画像ファイル
    train_ratio: float = Form(0.8) # 学習データの割合
):
    if default_role is None:
        default_role = ""

    # プロジェクトIDの生成とディレクトリの準備
    project_id = str(uuid.uuid4())
    project_root = f"./datas/{project_id}"
    imgs_dir = os.path.join(project_root, "imgs")
    os.makedirs(imgs_dir, exist_ok=True)

    annotations = [] # アノテーション情報を格納するリスト
    image_paths = [] # 画像ファイルパスのリスト

    for file in files:
        # アップロードされたファイルが画像かどうかを確認
        try:
            img = Image.open(file.file)
            img.verify()  # PILを使って画像として検証
            file.file.seek(0)
        except (IOError, SyntaxError):
            # 画像でない場合はスキップ
            print(f"Skipped non-image file: {file.filename}")
            continue

        # ファイル名と保存パスを設定
        file_name = os.path.basename(file.filename.replace("\\", "/"))
        full_file_path = os.path.join(imgs_dir, file_name)

        # ファイル保存
        with open(full_file_path, "wb") as buffer:
            buffer.write(await file.read())
        image_paths.append(full_file_path)

    # データ分割
    random.shuffle(image_paths)
    split_index = int(len(image_paths) * train_ratio)
    train_images = image_paths[:split_index]
    val_images = image_paths[split_index:]

    # アノテーション情報の作成
    for img_path in train_images:
        annotations.append({
            "image": os.path.relpath(img_path, imgs_dir),
            "sys": default_role,
            "user": "",
            "label": "",
            "dataset_split": "train"
        })

    for img_path in val_images:
        annotations.append({
            "image": os.path.relpath(img_path, imgs_dir),
            "sys": default_role,
            "user": "",
            "label": "",
            "dataset_split": "val"
        })

    # プロジェクト情報を作成
    project_info = {
        "id": project_id,
        "name": name,
        "image_count": len(image_paths),
        "created_at": datetime.now().isoformat(),
        "dir_path": os.path.abspath(project_root),
        "description": description,
    }

    # project_info.json 作成
    with open(os.path.join(project_root, "project_info.json"), "w") as f:
        json.dump(project_info, f, indent=4, ensure_ascii=False)

    # annotation.json 作成
    with open(os.path.join(project_root, "annotation.json"), "w") as f:
        json.dump(annotations, f, indent=4, ensure_ascii=False)

    return {"message": "Project created successfully", "project": project_info, "annotations": annotations}

# プロジェクトを削除するエンドポイント
@router.delete("/delete/{project_id}", status_code=status.HTTP_200_OK)
async def delete_project(project_id: str):
    # プロジェクトディレクトリのパス
    project_root = f"./datas/{project_id}"

    # ディレクトリとその内容を削除
    if os.path.exists(project_root):
        for root, dirs, files in os.walk(project_root, topdown=False):
            for file in files:
                os.remove(os.path.join(root, file))
            for dir in dirs:
                os.rmdir(os.path.join(root, dir))
        os.rmdir(project_root)

    return {"message": f"Project '{project_id}' deleted"}

# プロジェクトの一覧を取得するエンドポイント
@router.get("/list", status_code=status.HTTP_200_OK)
async def list_projects():
    # プロジェクトが格納されているディレクトリ
    datas_dir = os.path.abspath("./datas")
    project_summaries = []

    # datasディレクトリを探索
    if os.path.exists(datas_dir):
        for project_id in os.listdir(datas_dir): 
            project_root = os.path.join(datas_dir, project_id)
            project_info_path = os.path.join(project_root, "project_info.json") 
            imgs_dir = os.path.join(project_root, "imgs")
            first_image = None

            # プロジェクト情報を読み込み
            if os.path.exists(project_info_path):
                with open(project_info_path, "r", encoding="utf-8") as f:
                    info = json.load(f)

                # 最初の画像ファイルを取得
                if os.path.exists(imgs_dir):
                    images = [img for img in os.listdir(imgs_dir) if img.lower().endswith(('png', 'jpg', 'jpeg', 'gif'))]
                    if images:
                        first_image = os.path.join(imgs_dir, images[0])

                # サマリー情報を追加
                project_summaries.append({
                    "id": info["id"],
                    "name": info["name"],
                    "created_at": info["created_at"],
                    "first_image": first_image,
                    "dir_path": os.path.abspath(project_root)
                })

    return project_summaries