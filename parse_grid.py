import re
with open("work.html", "r") as f:
    text = f.read()

match = re.search(r'<div id="social-grid".*?>(.*?)<!-- Consolidated Footer', text, re.DOTALL)
if match:
    grid_html = match.group(1)
    items = re.findall(r'<!-- (.*?) -->\s*<div class="social-video-card"', grid_html)
    for i, name in enumerate(items):
        print(f"Item {i+1}: {name.strip()}")
