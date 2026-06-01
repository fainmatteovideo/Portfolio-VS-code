import re

with open("work.html", "r") as f:
    html = f.read()

# --- 1. Fix Social Grid: Remove mistakenly added videos ---
# Find social-grid bounds
social_start = html.find('id="social-grid"')
if social_start != -1:
    social_end = html.find('<!-- Consolidated Footer -->', social_start)
    social_html = html[social_start:social_end]
    
    # List of videos to remove from social-grid
    videos_to_remove = [
        "1196609537", "1196609526", "1196609468", "1196609481", "1196609475", # transitions
        "1196613750", # vimeo-player
        "1171988980"  # New Vertical Video
    ]
    
    # Second pattern: sometimes the comment doesn't have the ID. We search for the card containing the ID in the iframe src
    for vid in videos_to_remove:
        pattern2 = re.compile(r'<!--[^\n]*-->\s*<div class="social-video-card[^>]*>(?:(?!<div class="social-video-card).)*?' + vid + r'.*?</div>', re.DOTALL)
        social_html = re.sub(pattern2, '', social_html)

    # Reconstruct
    html = html[:social_start] + social_html + html[social_end:]

# --- 2. Fix Motion Graphic Grid: Reposition vertical videos ---
mg_start = html.find('id="motion-graphic-grid"')
if mg_start != -1:
    mg_end = html.find('id="social-grid"', mg_start)
    mg_html = html[mg_start:mg_end]
    
    # We need to extract the vertical grid and move it BEFORE the horizontal grid
    vert_grid_pattern = re.compile(r'(<!-- Griglia Verticale -->\s*<div class="grid grid-cols-2[^>]*>.*?</div>\s*</div>)', re.DOTALL)
    vert_match = vert_grid_pattern.search(mg_html)
    
    horiz_grid_pattern = re.compile(r'(<!-- Griglia Orizzontale \(file da 4\) -->\s*<div class="grid grid-cols-2[^>]*>.*?</div>\s*)', re.DOTALL)
    horiz_match = horiz_grid_pattern.search(mg_html)
    
    # If both exist and vertical is after horizontal (which it is)
    if vert_match and horiz_match:
        vert_content = vert_match.group(1)
        # Remove vert_content from its current position
        mg_html = mg_html.replace(vert_content, '')
        
        # Insert vert_content right before horiz_content
        mg_html = mg_html.replace(horiz_match.group(1), vert_content + '\n                ' + horiz_match.group(1))

    # Reconstruct
    html = html[:mg_start] + mg_html + html[mg_end:]

# --- 3. Fix Gelato Lyrics Carousel ---
gelato_start = html.find('<!-- Gelato Lyrics -->')
if gelato_start != -1:
    carousel_start = html.find('<div class="stills-marquee-track">', gelato_start)
    if carousel_start != -1:
        group_pattern = re.compile(r'<!-- Group 2 \(Duplicate for seamless loop\) -->(.*?)</div>', re.DOTALL)
        group_match = group_pattern.search(html[carousel_start:])
        if group_match:
            group2_content = group_match.group(1)
            group3_4 = f'\n                    <!-- Group 3 (Duplicate for seamless loop) -->{group2_content}</div>\n                    <!-- Group 4 (Duplicate for seamless loop) -->{group2_content}</div>\n'
            
            # replace the end of group 2's div
            target = f'<!-- Group 2 (Duplicate for seamless loop) -->{group2_content}</div>'
            html = html.replace(target, target + group3_4)


# Let's write the modified HTML
with open("work.html", "w") as f:
    f.write(html)
print("done")
