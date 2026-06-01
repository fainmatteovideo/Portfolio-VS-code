import os
import sys
import subprocess
import re

def get_image_info(path):
    try:
        res = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', path], capture_output=True, text=True, check=True)
        w_match = re.search(r'pixelWidth:\s*(\d+)', res.stdout)
        h_match = re.search(r'pixelHeight:\s*(\d+)', res.stdout)
        if w_match and h_match:
            return int(w_match.group(1)), int(h_match.group(1))
    except Exception as e:
        print(f"Error getting info for {path}: {e}")
    return None, None

def optimize_image(path):
    size_mb = os.path.getsize(path) / (1024 * 1024)
    print(f"\nProcessing: {path} ({size_mb:.2f} MB)")
    
    width, height = get_image_info(path)
    if not width or not height:
        print(f"Skipping {path}: Could not read dimensions.")
        return False
        
    print(f"Original dimensions: {width}x{height}")
    
    # Calculate target dimensions (max 1920x1080 while preserving aspect ratio)
    target_w, target_h = width, height
    if width > 1920 or height > 1080:
        scale = min(1920.0 / width, 1080.0 / height)
        target_w = int(width * scale)
        target_h = int(height * scale)
        # Ensure even numbers
        if target_w % 2 != 0: target_w -= 1
        if target_h % 2 != 0: target_h -= 1
        print(f"Resizing to: {target_w}x{target_h}")
    else:
        print("No resizing needed (dimensions are within 1920x1080).")

    # Determine temporary and final paths
    base, ext = os.path.splitext(path)
    temp_resized = base + "_temp_resized" + ext
    webp_path = base + ".webp"
    
    success = False
    temp_created = False
    
    try:
        # Step 1: Resize if target size is different
        if target_w != width or target_h != height:
            print(f"Running sips resample on {path}...")
            subprocess.run([
                'sips',
                '--resampleHeightWidth', str(target_h), str(target_w),
                path,
                '--out', temp_resized
            ], check=True, capture_output=True)
            input_for_cwebp = temp_resized
            temp_created = True
        else:
            input_for_cwebp = path
            
        # Step 2: Convert to WebP using cwebp
        print(f"Converting to webp at quality 82...")
        cwebp_path = '/opt/homebrew/bin/cwebp'
        if not os.path.exists(cwebp_path):
            cwebp_path = 'cwebp' # fallback to PATH
            
        subprocess.run([
            cwebp_path,
            '-q', '82',
            input_for_cwebp,
            '-o', webp_path
        ], check=True, capture_output=True)
        
        success = True
        print(f"Successfully converted to {webp_path}!")
    except Exception as e:
        print(f"Error optimizing {path}: {e}")
        if hasattr(e, 'stderr') and e.stderr:
            print(f"Stderr: {e.stderr}")
            
    # Cleanup temporary file if created
    if temp_created and os.path.exists(temp_resized):
        try:
            os.remove(temp_resized)
        except Exception as e:
            print(f"Failed to remove temp file {temp_resized}: {e}")
            
    # If successful, delete original file
    if success:
        try:
            os.remove(path)
            print(f"Deleted original: {path}")
            return True
        except Exception as e:
            print(f"Failed to delete original file {path}: {e}")
            
    return False

def update_references_in_html(old_path, new_webp_path, html_dir):
    # Convert absolute paths to relative paths matching how they are defined in HTML
    # Typically, html files reference images relatively, e.g. "assets/prof-pic.JPEG"
    # Let's find where assets/ starts in both
    
    def get_rel_path(p):
        idx = p.find("assets/")
        if idx != -1:
            return p[idx:]
        return os.path.basename(p)
        
    rel_old = get_rel_path(old_path)
    rel_new = get_rel_path(new_webp_path)
    
    print(f"Replacing '{rel_old}' with '{rel_new}' in HTML files...")
    
    for root, dirs, files in os.walk(html_dir):
        for file in files:
            if file.endswith('.html'):
                html_path = os.path.join(root, file)
                try:
                    with open(html_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if rel_old in content:
                        # Double-check variations in extensions (case-insensitivity, quotes)
                        updated = content.replace(rel_old, rel_new)
                        # Also replace any other capitalization/spelling of this file path if needed
                        # (Usually simple string replacement is perfect)
                        with open(html_path, 'w', encoding='utf-8') as f:
                            f.write(updated)
                        print(f"  Updated {file}")
                except Exception as e:
                    print(f"  Error updating {file}: {e}")

def main():
    workspace_dir = "/Users/matteofain/Desktop/Portfolio VS code"
    assets_dir = os.path.join(workspace_dir, "assets")
    
    print("Starting image optimization recursion...")
    print(f"Scanning assets directory: {assets_dir}")
    
    optimized_files = []
    
    for root, dirs, files in os.walk(assets_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                try:
                    size_bytes = os.path.getsize(file_path)
                    # Detect files larger than 1MB (1,000,000 bytes)
                    if size_bytes > 1_000_000:
                        webp_path = os.path.splitext(file_path)[0] + ".webp"
                        if optimize_image(file_path):
                            optimized_files.append((file_path, webp_path))
                except Exception as e:
                    print(f"Error checking {file}: {e}")
                    
    if optimized_files:
        print("\nUpdating references in HTML files...")
        for old_path, new_webp in optimized_files:
            update_references_in_html(old_path, new_webp, workspace_dir)
        print("\nAll done!")
    else:
        print("\nNo images larger than 1MB were found or optimized.")

if __name__ == "__main__":
    main()
