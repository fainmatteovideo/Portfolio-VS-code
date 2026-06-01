with open("/Users/matteofain/Desktop/Portfolio VS code/work.html", "r") as f:
    html = f.read()

import re

# find the social grid
start_idx = html.find('        <!-- Social Grid that activates instead of list when \'Social\' is clicked -->')
end_idx = html.find('            <!-- Consolidated Footer -->')

social_html = html[start_idx:end_idx]

new_social = '''        <!-- Social Grid that activates instead of list when 'Social' is clicked -->
        <div id="social-grid" class="hidden pt-5 pb-20 w-full">
            <!-- Wrapper 85% per rimpicciolire i video mentenendo lo stesso gap -->
            <div class="w-[85%] mx-auto">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 items-center place-items-center mb-16">
                    <!-- Riga 1: Verticali -->
                    <!-- Urban Rhythm -->
                    <div class="social-video-card-vert w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1172300494?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                    <!-- Padelta -->
                    <div class="social-video-card-vert w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1172327238?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                    <!-- ZZ 2025 (song 1) -->
                    <div class="social-video-card-vert w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1171988923?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                    <!-- ZZ summer cup 2025 -->
                    <div class="social-video-card-vert w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1171988980?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>

                    <!-- Riga 2: Orizzontali -->
                    <!-- Cubo 3D Video -->
                    <div class="social-video-card-horiz w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1172330198?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                    <!-- Tomo Video (Playing around - white bg) -->
                    <div class="social-video-card-horiz w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1172331391?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                    <!-- Card-colored -->
                    <div class="social-video-card-horiz w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1172557843?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                    <!-- Sunglasses slowmo horiz -->
                    <div class="social-video-card-horiz w-full" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                        <iframe loading="lazy" src="https://player.vimeo.com/video/1172559030?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                        <div class="vimeo-overlay"></div>
                        <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                    </div>
                </div>
            </div>
        </div>
'''

html = html[:start_idx] + new_social + html[end_idx:]

with open("/Users/matteofain/Desktop/Portfolio VS code/work.html", "w") as f:
    f.write(html)

