from pathlib import Path
import sys


def get_base_path():

    if getattr(sys, "frozen", False):
        return Path(sys.executable).parent

    return Path(__file__).resolve().parents[2]


BASE_PATH = get_base_path()

MODEL_DIR = BASE_PATH / "models"

DATA_DIR = BASE_PATH / "app" / "data"

CHROMA_DIR = DATA_DIR / "chroma"