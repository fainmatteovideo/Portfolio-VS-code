import re

file_path = "work.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace <img with <img loading="lazy" but only if loading= is not already present in the tag.
def img_replacer(match):
    tag = match.group(0)
    if "loading=" not in tag:
        return tag.replace("<img", '<img loading="lazy"', 1)
    return tag

# Match any <img tag
new_content = re.sub(r'<img\s+[^>]+>', img_replacer, content, flags=re.IGNORECASE)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully added lazy loading to all image tags in work.html")
