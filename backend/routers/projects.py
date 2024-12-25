from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
import os
import json
import uuid
from datetime import datetime
from PIL import Image

# エンドポイントの設定
router = APIRouter(
    prefix='/projects',
    tags=["projects"]
)

# プロジェクト作成用のリクエストモデル
class ProjectCreateRequest(BaseModel):
    name: str

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_project(
    name: str = Form(...), 
    default_role: str = Form(...),
    description: str = Form(...),
    files: List[UploadFile] = File(...)
):
    if default_role is None:
        default_role = ""

    # プロジェクトIDの生成
    project_id = str(uuid.uuid4())
    project_root = f"./datas/{project_id}"
    imgs_dir = os.path.join(project_root, "imgs")
    os.makedirs(imgs_dir, exist_ok=True)
    annotations = []

    image_count = 0
    for file in files:
        # フルパス取得とファイル名の抽出
        # print(f"file.filename: {file.filename}")
        # ファイルが画像か確認
        try:
            img = Image.open(file.file)
            img.verify()  # PILで画像として検証
            file.file.seek(0)
        except (IOError, SyntaxError):
            # 画像でない場合はスキップ
            print(f"Skipped non-image file: {file.filename}")
            continue
        file_name = os.path.basename(file.filename.replace("\\", "/"))
        full_file_path = os.path.join(imgs_dir, file_name)

        # ファイル保存
        with open(full_file_path, "wb") as buffer:
            buffer.write(await file.read())
        image_count += 1

        # アノテーション情報の作成
        annotations.append({
            "image": os.path.relpath(full_file_path, imgs_dir),
            "sys": default_role,
            "user": "",
            "label": ""
        })

    project_info = {
        "id": project_id,
        "name": name,
        "image_count": image_count,
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

    project_root = f"./datas/{project_id}"
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
    # プロジェクトのサマリー情報を取得
    datas_dir = os.path.abspath("./datas")
    project_summaries = []

    # datasディレクトリを探索
    if os.path.exists(datas_dir):
        for project_id in os.listdir(datas_dir): # project_idを取得
            project_root = os.path.join(datas_dir, project_id) # プロジェクトのルートディレクトリ
            project_info_path = os.path.join(project_root, "project_info.json") # jsonファイルのパス
            imgs_dir = os.path.join(project_root, "imgs")
            first_image = None

            if os.path.exists(project_info_path):
                with open(project_info_path, "r", encoding="utf-8") as f:
                    info = json.load(f)

                if os.path.exists(imgs_dir):
                    images = [img for img in os.listdir(imgs_dir) if img.lower().endswith(('png', 'jpg', 'jpeg', 'gif'))]
                    if images:
                        first_image = os.path.join(imgs_dir, images[0])

                project_summaries.append({
                    "id": info["id"],
                    "name": info["name"],
                    "created_at": info["created_at"],
                    "first_image": first_image,
                    "dir_path": os.path.abspath(project_root)
                })

    return project_summaries