from fastapi import FastAPI
#로컬로 구동 테스트 완
app = FastAPI()

@app.get("/")
def read_root():
    return {
        "message": "Legal AI Server is Running!",
        "status": "Success",
        "developer": "LSB"
    }