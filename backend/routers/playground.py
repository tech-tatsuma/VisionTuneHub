from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from openai import OpenAI
import os
import base64

# エンドポイントの設定
router = APIRouter(
    prefix='/playground',
    tags=["playground"]
)

def encode_image(file):
	return base64.b64encode(file.read()).decode('utf-8')

def image2txt(client, encoded_image, model, role, instruction):
    base64_image = encoded_image
    url = f"data:image/jpeg;base64,{base64_image}"

    messages = [
        {"role": "system", "content": role},
        {"role": "user", "content": instruction},
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": url},
                }
            ],
        },
    ]

    completion = client.chat.completions.create(
        model=model,
        messages=messages
    )

    response = completion.choices[0].message.content
    print(response)

    return {"model": model, "role": role, "instruction": instruction, "response": response}

@router.post("/process_image", status_code=200)
async def process_image(
    model: str = Form(...),
    role: str = Form(...),
    instruction: str = Form(...),
    file: UploadFile = File(...),
    api_key: str = Form(...)
):
    try:
        # OpenAIクライアントの初期化
        client = OpenAI(api_key=api_key)

        # ファイルをBase64エンコード
        encoded_image = encode_image(file.file)

        # image2txtを呼び出し
        result = image2txt(client, encoded_image, model, role, instruction)

        return {"message": "Success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")