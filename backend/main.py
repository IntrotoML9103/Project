"""
FastAPI server for the Artist ML classifier.

Run:
    uvicorn backend.main:app --reload --port 8000
"""

import io
import json
import os

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision.models import resnet34
from torchvision.transforms import v2

HERE = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(HERE, "model", "artist_resnet.pth")
LABELS_PATH = os.path.join(HERE, "model", "labels.json")

device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

if not os.path.exists(WEIGHTS_PATH) or not os.path.exists(LABELS_PATH):
    raise RuntimeError(
        f"Missing model files. Run `python train_and_save.py` first.\n"
        f"Expected: {WEIGHTS_PATH} and {LABELS_PATH}"
    )

with open(LABELS_PATH, "r", encoding="utf-8") as f:
    META = json.load(f)

LABELS = META["labels"]
IMAGE_SIZE = META.get("image_size", 224)

model = resnet34(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(LABELS))
model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
model.to(device).eval()

eval_tf = v2.Compose([
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

app = FastAPI(title="Artist ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def pretty(name: str) -> str:
    return name.replace("_", " ")


@app.get("/")
def root():
    return {"status": "ok", "service": "Artist ML API"}


@app.get("/info")
def info():
    return {
        "architecture": META.get("architecture", "resnet34"),
        "num_artists": len(LABELS),
        "artists": [pretty(a) for a in LABELS],
        "image_size": IMAGE_SIZE,
        "test_accuracy": META.get("test_accuracy"),
        "num_train": META.get("num_train"),
        "num_test": META.get("num_test"),
        "device": device,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...), top_k: int = 5):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image.")

    x = eval_tf(img).unsqueeze(0).to(device)
    with torch.no_grad():
        probs = torch.softmax(model(x), dim=1)[0]

    k = max(1, min(top_k, len(LABELS)))
    top_probs, top_idx = torch.topk(probs, k)

    return {
        "predictions": [
            {"artist": pretty(LABELS[i]), "confidence": float(p)}
            for p, i in zip(top_probs.tolist(), top_idx.tolist())
        ]
    }
