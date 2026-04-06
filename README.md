# Artist ML

**Who painted *that*?** A deep learning model that identifies the artist behind a painting, wrapped in a FastAPI backend and a React frontend.

Upload any painting and a fine-tuned ResNet34 will guess the painter — trained on thousands of works from dozens of famous artists, from Van Gogh to Vermeer.

---

## Background

This project started as a senior seminar paper in my undergrad, where I explored whether a machine learning model could learn the visual signatures that distinguish one painter from another. Back then I was limited to small datasets and classical algorithms, so I only scratched the surface of what was possible.

I came back to the idea in my Intro to ML course with the goal of doing it properly:

- **Milestone 1 — The idea.** Predict an artist's style from a painting using CNNs instead of the classifiers I'd used before.
- **Milestone 2 — The data.** Found the [Collections of Paintings from 50 Artists](https://www.kaggle.com/code/paultimothymooney/collections-of-paintings-from-50-artists) dataset on Kaggle. With my professor's guidance, we decided to only keep painters with 100+ works so the model had enough examples of each style.
- **Milestone 3 — The approach.** Settled on transfer learning with ResNet34 — use a CNN already trained on ImageNet and fine-tune it to recognize painters.
- **Milestone 4 — Preprocessing pain.** The raw images were enormous and kept crashing the kernel. Resizing them fixed training.
- **Milestone 5 — Evaluation.** Trained the model, visualized the convolutional feature maps, and analyzed which artists it confused most often.

This repo takes that notebook project and turns it into a real end-to-end application: a standalone training script, a Python API that serves predictions, and a React frontend where you can actually drop in a painting and see the top guesses.

My long-term goal is a tool that helps artists, students, and curators recognize stylistic influence — not just *who* painted something, but *whose style* a new work is emulating.

---

## Architecture

```
Artist_ML/
├── imgs/                    # Painting dataset (filename: Artist_Name_###.jpg)
├── train_and_save.py        # Standalone training script (run once)
├── backend/
│   ├── main.py              # FastAPI server (/info, /predict)
│   ├── requirements.txt
│   └── model/               # Generated: artist_resnet.pth + labels.json
├── frontend/                # Vite + React + Tailwind
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       └── components/      # Hero, Demo, HowItWorks, Metrics, About, ...
└── final.ipynb              # Original exploration notebook
```

**Tech stack:** PyTorch · torchvision · ResNet34 · FastAPI · React · Vite · Tailwind CSS

---

## Getting started

You'll need **Python 3.10+** and **Node.js 18+**.

### 1. Train the model (one time)

The trained weights aren't committed to the repo (too large), so you have to produce them once from the dataset in `imgs/`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install torch torchvision pillow
python train_and_save.py
```

This fine-tunes a pretrained ResNet34 on the paintings and writes:

- `backend/model/artist_resnet.pth` — trained weights
- `backend/model/labels.json` — artist list, test accuracy, and metadata

Training takes a while (10 epochs by default). You can tweak `EPOCHS`, `BATCH_SIZE`, and `MIN_PAINTINGS_PER_ARTIST` at the top of `train_and_save.py`.

### 2. Run the backend

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Sanity check: open http://localhost:8000/info — you should see a JSON response listing the artists and the model's test accuracy.

Endpoints:

- `GET  /info` — model metadata and list of artists
- `POST /predict` — multipart upload (`file` field), returns top-k predictions

### 3. Run the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Drag in a painting, hit **Identify the artist**, and watch the top-5 predictions come back with confidence bars.

---

## How it works

1. **Dataset curation** — Paintings are loaded from `imgs/`, and artists with fewer than 100 works are dropped so the model isn't starved on rare classes.
2. **Preprocessing** — Each image is resized to 224×224 and normalized with ImageNet statistics so the pretrained ResNet sees inputs in its expected distribution.
3. **Transfer learning** — `torchvision.models.resnet34` is loaded with ImageNet weights, and its final fully-connected layer is replaced with one sized to the number of kept artists.
4. **Training** — Cross-entropy with class-balanced weights (to handle imbalance) + Adam, with the best checkpoint saved by test accuracy.
5. **Serving** — The FastAPI app loads the weights once at startup and applies the same eval-time transforms to incoming uploads before running them through the model.

---

## Acknowledgements

- Dataset: [Collections of Paintings from 50 Artists](https://www.kaggle.com/code/paultimothymooney/collections-of-paintings-from-50-artists) by Paul Mooney on Kaggle
- Thanks to Professor Thiago Hersan for guidance through every milestone of this project
- Inspired by my undergrad senior seminar paper on computational analysis of painting styles
