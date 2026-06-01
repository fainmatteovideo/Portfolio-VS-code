import os
import re

def update_references():
    workspace_dir = "/Users/matteofain/Desktop/Portfolio VS code"
    html_files = ["about.html", "work.html"]
    
    # Regex pattern: match assets/ followed by characters, space, slashes, or hyphens, ending in image extension
    pattern = re.compile(r'assets/([a-zA-Z0-9_\-\s/]+)\.(png|jpg|jpeg|PNG|JPG|JPEG)')
    
    for file_name in html_files:
        file_path = os.path.join(workspace_dir, file_name)
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        print(f"Processing {file_name}...")
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Find all matches
        matches = pattern.findall(content)
        print(f"Found {len(matches)} image references in {file_name}.")
        
        # Perform replacement
        updated_content = pattern.sub(r'assets/img LOW res/\1.webp', content)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"Successfully updated {file_name}!")

if __name__ == "__main__":
    update_references()
