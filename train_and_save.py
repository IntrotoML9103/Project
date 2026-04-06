"""
Standalone training script for the Artist ML project.

Reads paintings from ./imgs (filenames: "<Artist_Name>_<number>.jpg"),
fine-tunes a ResNet34 to classify the painter, and saves:

  backend/model/artist_resnet.pth   - trained weights
  backend/model/labels.json         - ordered list of artist names + metrics

Run once:
    python train_and_save.py
"""

import json
import os
import random
import re
from collections import Counter, defaultdict

import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision.models import resnet34, ResNet34_Weights
from torchvision.transforms import v2

IMG_DIR = "imgs"
OUT_DIR = os.path.join("backend", "model")
WEIGHTS_PATH = os.path.join(OUT_DIR, "artist_resnet.pth")
LABELS_PATH = os.path.join(OUT_DIR, "labels.json")

MIN_PAINTINGS_PER_ARTIST = 100
IMAGE_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10
LR = 1e-4
TEST_PCT = 0.2
SEED = 101010

device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using device: {device}")


def parse_artist(filename: str) -> str:
    # "Albrecht_Dürer_10.jpg" -> "Albrecht_Dürer"
    name = os.path.splitext(filename)[0]
    return re.sub(r"_\d+$", "", name)


def collect_files():
    files = [f for f in os.listdir(IMG_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    by_artist = defaultdict(list)
    for f in files:
        by_artist[parse_artist(f)].append(f)
    # Keep only artists with enough paintings
    kept = {a: fs for a, fs in by_artist.items() if len(fs) >= MIN_PAINTINGS_PER_ARTIST}
    print(f"Found {len(by_artist)} artists total; kept {len(kept)} with >= {MIN_PAINTINGS_PER_ARTIST} paintings.")
    return kept


def split(kept):
    random.seed(SEED)
    train, test = [], []
    for artist, files in kept.items():
        files = list(files)
        random.shuffle(files)
        cut = int(len(files) * TEST_PCT)
        test += [(f, artist) for f in files[:cut]]
        train += [(f, artist) for f in files[cut:]]
    return train, test


class PaintingDataset(Dataset):
    def __init__(self, samples, label_to_idx, transform):
        self.samples = samples
        self.label_to_idx = label_to_idx
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        fname, artist = self.samples[idx]
        img = Image.open(os.path.join(IMG_DIR, fname)).convert("RGB")
        return self.transform(img), self.label_to_idx[artist]


def build_transforms():
    train_tf = v2.Compose([
        v2.ToImage(),
        v2.ToDtype(torch.float32, scale=True),
        v2.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        v2.RandomHorizontalFlip(),
        v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    eval_tf = v2.Compose([
        v2.ToImage(),
        v2.ToDtype(torch.float32, scale=True),
        v2.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return train_tf, eval_tf


def build_model(num_classes: int) -> nn.Module:
    model = resnet34(weights=ResNet34_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model.to(device)


@torch.no_grad()
def evaluate(model, loader):
    model.eval()
    correct = total = 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        preds = model(x).argmax(dim=1)
        correct += (preds == y).sum().item()
        total += y.size(0)
    return correct / total if total else 0.0


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    kept = collect_files()
    if not kept:
        raise SystemExit("No artists met the minimum painting threshold.")

    artist_names = sorted(kept.keys())
    label_to_idx = {a: i for i, a in enumerate(artist_names)}

    train_samples, test_samples = split(kept)
    print(f"Train: {len(train_samples)}  Test: {len(test_samples)}")

    train_tf, eval_tf = build_transforms()
    train_loader = DataLoader(PaintingDataset(train_samples, label_to_idx, train_tf),
                              batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    test_loader = DataLoader(PaintingDataset(test_samples, label_to_idx, eval_tf),
                             batch_size=BATCH_SIZE, shuffle=False, num_workers=2)

    model = build_model(len(artist_names))

    # class weights to deal with imbalance
    counts = Counter(a for _, a in train_samples)
    weights = torch.tensor(
        [1.0 / counts[a] for a in artist_names], dtype=torch.float32, device=device
    )
    weights = weights / weights.sum() * len(artist_names)
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    best_acc = 0.0
    for epoch in range(1, EPOCHS + 1):
        model.train()
        running = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            loss = criterion(model(x), y)
            loss.backward()
            optimizer.step()
            running += loss.item() * x.size(0)
        train_loss = running / len(train_loader.dataset)
        acc = evaluate(model, test_loader)
        print(f"Epoch {epoch:02d}  train_loss={train_loss:.4f}  test_acc={acc:.4f}")
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), WEIGHTS_PATH)

    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "labels": artist_names,
            "image_size": IMAGE_SIZE,
            "architecture": "resnet34",
            "test_accuracy": round(best_acc, 4),
            "num_train": len(train_samples),
            "num_test": len(test_samples),
        }, f, indent=2, ensure_ascii=False)

    print(f"\nSaved weights -> {WEIGHTS_PATH}")
    print(f"Saved labels  -> {LABELS_PATH}")
    print(f"Best test accuracy: {best_acc:.4f}")


if __name__ == "__main__":
    main()
