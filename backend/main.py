from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles

from routers import (
    annotation,
    playground,
    projects
)

security = HTTPBasic()

# FastAPIドキュメントの認証機能の追加
def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = "admin"
    correct_password = "admin"
    if credentials.username != correct_username or credentials.password != correct_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

app = FastAPI(docs_url=None)
app.mount("/images", StaticFiles(directory="./datas"), name="images")

app.include_router(annotation.router)
app.include_router(playground.router)
app.include_router(projects.router)

# CORSを回避する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# FastAPIドキュメントの認証機能の追加
@app.get("/docs", dependencies=[Depends(get_current_username)], include_in_schema=False)
async def get_documentation():
    return get_swagger_ui_html(openapi_url="/openapi.json", title=app.title)