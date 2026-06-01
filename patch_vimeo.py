import re

path = "/Users/matteofain/Desktop/Portfolio VS code/work.html"
with open(path, "r") as f:
    html = f.read()

# 1. Remove "Full Video" text
html = html.replace('''                        <div class="mt-4 text-center w-full">
                            <span class="text-[11px] font-light tracking-wide text-white/70">Full Video</span>
                        </div>''', '')

# 2. Resize Hope Group image grid to commercial size (4 columns)
old_grid = '''            <div class="pb-32 w-full fade-in delay-1 mt-10">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-center place-items-center">
                    <img src="assets/Still cris/01.png" alt="Documentary Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/Still cris/02.png" alt="Documentary Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/Still cris/03.png" alt="Documentary Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/Still cris/04.png" alt="Documentary Still" class="w-full aspect-[16/9] object-cover">
                </div>
            </div>'''
new_grid = '''            <div class="pb-10 w-full fade-in delay-1 mt-10">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-center place-items-center">
                    <img src="assets/Still cris/01.png" alt="Documentary Still" class="w-[90%] aspect-[16/9] object-cover">
                    <img src="assets/Still cris/02.png" alt="Documentary Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/Still cris/03.png" alt="Documentary Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/Still cris/04.png" alt="Documentary Still" class="w-[90%] aspect-[16/9] object-cover">
                </div>
            </div>'''

html = html.replace(old_grid, new_grid)

# 3. Swap Tomo and Cubo 3D
tomo_str = '''            <!-- Tomo Video (Row 3 now) -->
            <div class="max-w-[800px] mx-auto w-full">
                <div class="social-video-card-horiz" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                    <iframe loading="lazy" src="https://player.vimeo.com/video/1172330198?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                    <div class="vimeo-overlay"></div>
                    <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                </div>
            </div>'''

cubo_str = '''            <!-- Cubo 3D Video (Row 2 now) -->
            <div class="max-w-[800px] mx-auto w-full mb-16">
                <div class="social-video-card-horiz" onclick="toggleMute(this)" onmousemove="resetIdleTimer(this)" onmouseleave="forceIdle(this)">
                    <iframe loading="lazy" src="https://player.vimeo.com/video/1172331391?background=1&autoplay=1&muted=1&loop=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                    <div class="vimeo-overlay"></div>
                    <div class="volume-icon"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></div>
                </div>
            </div>'''

# Replace them with reversed order. Note: cubo has mb-16, Tomo has not.
# We will just swap their video links, which is easier and perfectly keeps spacing.
html = html.replace('1172330198', 'TEMP_TOMO_ID')
html = html.replace('1172331391', '1172330198')  # Put Tomo into Cubo
html = html.replace('TEMP_TOMO_ID', '1172331391')  # Put Cubo into Tomo

# 4. Insert Startup Grid
startup_grid = '''
        <!-- Startup Grid -->
        <div id="startup-grid" class="hidden w-full pt-5 pb-20 fade-in">
            <div class="w-full fade-in">
                <div class="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-center lg:items-start">
                    <div class="w-full lg:w-[35%] flex flex-col justify-start items-center lg:items-center text-center pt-4 lg:pt-10">
                        <h2 class="text-2xl md:text-3xl font-bold tracking-wider mb-6">BTRY</h2>
                        <h3 class="text-[13px] md:text-[15px] font-bold mb-6">Commercial Video</h3>
                        <div class="flex flex-col gap-4 text-[13px] md:text-[14px] font-light text-white/90">
                            <p>Client: BTRY</p>
                        </div>
                    </div>
                    <div class="w-full lg:w-[65%] flex flex-col">
                        <div class="video-wrapper relative pointer-events-none">
                            <iframe loading="lazy" src="https://player.vimeo.com/video/1172322519?autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&autopause=0" frameborder="0" allow="autoplay; fullscreen" class="w-full h-full" style="pointer-events: auto;"></iframe>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pb-10 w-full fade-in delay-1 mt-10">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-center place-items-center">
                    <img src="assets/btry stills/B7.png" alt="BTRY Still" class="w-[90%] aspect-[16/9] object-cover">
                    <img src="assets/btry stills/btry 4.png" alt="BTRY Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/btry stills/btry1.png" alt="BTRY Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/btry stills/btry5.png" alt="BTRY Still" class="w-[90%] aspect-[16/9] object-cover">
                    <img src="assets/btry stills/btry7.png" alt="BTRY Still" class="w-[90%] aspect-[16/9] object-cover">
                    <img src="assets/btry stills/btry6.png" alt="BTRY Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/btry stills/btry 3.png" alt="BTRY Still" class="w-full aspect-[16/9] object-cover">
                    <img src="assets/btry stills/B9.png" alt="BTRY Still" class="w-[90%] aspect-[16/9] object-cover">
                </div>
            </div>
        </div>
        '''

# Insert after documentary-grid logic, before social-grid
if '<div id="startup-grid"' not in html:
    html = html.replace('<!-- Social Grid that activates instead of list when \'Social\' is clicked -->', startup_grid + "\n        <!-- Social Grid that activates instead of list when 'Social' is clicked -->")

# 5. Make startup-grid toggleable
if 'if (startupGrid) startupGrid.classList.add(\'hidden\');' not in html:
    # We edit the js script
    html = html.replace("const docuGrid = document.getElementById('documentary-grid');", "const docuGrid = document.getElementById('documentary-grid');\n            const startupGrid = document.getElementById('startup-grid');")
    html = html.replace("if (docuGrid) docuGrid.classList.add('hidden');", "if (docuGrid) docuGrid.classList.add('hidden');\n                    if (startupGrid) startupGrid.classList.add('hidden');")
    html = html.replace("} else if (filter === 'documentary' && docuGrid) {", "} else if (filter === 'documentary' && docuGrid) {\n                        docuGrid.classList.remove('hidden');\n                    } else if (filter === 'startup' && startupGrid) {")
    
# 6. Re-write Intersection observer to handle Hope Group mute/play manually without Unmute UI!
# We will remove muted=1 and autoplay=1 from Hope group iframe in the HTML
html = html.replace(
    '<iframe loading="lazy" src="https://player.vimeo.com/video/1172333370?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0" frameborder="0" allow="autoplay; fullscreen" class="w-full h-full" style="pointer-events: auto;"></iframe>',
    '<iframe id="hope-video-iframe" loading="lazy" src="https://player.vimeo.com/video/1172333370?loop=1&title=0&byline=0&portrait=0&autopause=0" frameborder="0" allow="autoplay; fullscreen" class="w-full h-full" style="pointer-events: auto;"></iframe>'
)

# And inject logic into IntersectionObserver
old_observer = '''const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const iframe = entry.target.querySelector('iframe');
                if (!iframe) return;
                const player = new Vimeo.Player(iframe);
                if (entry.isIntersecting) {
                    player.play().catch(e => console.warn('Autoplay prevented'));
                } else {
                    player.pause().catch(e => console.warn('Pause prevented'));
                }
            });
        }, { threshold: 0.1 });'''

new_observer = '''const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const iframe = entry.target.querySelector('iframe');
                if (!iframe) return;
                const player = new Vimeo.Player(iframe);
                if (entry.isIntersecting) {
                    // Se è Hope Video o non è social background, azzeriamo l'audio per forzare l'autoplay senza overlay Unmute
                    if (iframe.id === 'hope-video-iframe') {
                        player.setVolume(0).then(() => {
                            player.play().catch(e => console.warn('Autoplay prevented'));
                        });
                    } else {
                        player.play().catch(e => console.warn('Autoplay prevented', e));
                    }
                } else {
                    player.pause().catch(e => console.warn('Pause prevented'));
                }
            });
        }, { threshold: 0.1 });'''

html = html.replace(old_observer, new_observer)

with open(path, "w") as f:
    f.write(html)

print("Finished replacing")
