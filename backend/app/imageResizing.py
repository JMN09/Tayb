import cv2
import os
from concurrent.futures import ThreadPoolExecutor

raw_dataset_path = "assets/restaurants"
resized_dataset_path = "assets/restaurants2"
os.makedirs(resized_dataset_path, exist_ok=True)

# Set target dimensions to 128x128 for the autoencoder
target_size = (128, 128)

def process_image(filename):
    """Resize a single image and save it to the output directory."""
    if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".tiff")):
        return
    img_path = os.path.join(raw_dataset_path, filename)
    img = cv2.imread(img_path)
    if img is None:
        return
    img_resized = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)
    out_path = os.path.join(resized_dataset_path, filename)
    cv2.imwrite(out_path, img_resized)

# Get list of files in the raw dataset directory
filenames = os.listdir(raw_dataset_path)

# Calculate max_workers using min(32, os.cpu_count() + 4)
max_workers = min(32, (os.cpu_count() or 1) + 4)
with ThreadPoolExecutor(max_workers=max_workers) as executor:
    executor.map(process_image, filenames)

print("Resizing complete! Check the ResizedDataset folder.")
