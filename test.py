with open("/Users/matteofain/Desktop/Portfolio VS code/work.html", "r") as f:
    text = f.read()

import re

# Update css to have aspect ratio 1/1 for everything, and a white shadow
new_css = '''
        /* Social Grid Styles */
        .social-video-card-horiz, .social-video-card-vert {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 255, 255, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background-color: #000;
            overflow: hidden;
            width: 100%;
            aspect-ratio: 1 / 1;
            position: relative;
        }
        .social-video-card-horiz:hover, .social-video-card-vert:hover {
            transform: scale(1.02) translateY(-2px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 1), 0 0 25px rgba(255, 255, 255, 0.3);
            z-index: 20;
        }
'''

# Find the start and end of Social Grid Styles
start = text.find("/* Social Grid Styles */")
end = text.find(".social-video-card-horiz iframe")
if start != -1 and end != -1:
    text = text[:start] + new_css + text[end:]

with open("/Users/matteofain/Desktop/Portfolio VS code/work.html", "w") as f:
    f.write(text)
