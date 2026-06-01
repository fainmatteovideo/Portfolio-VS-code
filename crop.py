import os
import zlib
import struct

def crop_png(path):
    print(f"Processing {os.path.basename(path)}...")
    with open(path, 'rb') as f:
        signature = f.read(8)
        if signature != b'\x89PNG\r\n\x1a\n':
            print("Not a valid PNG signature")
            return
        
        chunks = []
        while True:
            length_bytes = f.read(4)
            if not length_bytes:
                break
            length = struct.unpack('>I', length_bytes)[0]
            chunk_type = f.read(4)
            chunk_data = f.read(length)
            crc = f.read(4)
            chunks.append((chunk_type, chunk_data))
            if chunk_type == b'IEND':
                break
                
    # Parse IHDR
    ihdr_data = [c[1] for c in chunks if c[0] == b'IHDR'][0]
    w, h, depth, color_type, compression, filter_method, interlace = struct.unpack('>IIBBBBB', ihdr_data[:13])
    
    if depth != 8 or color_type != 6:
        print(f"Unsupported PNG format (depth={depth}, color_type={color_type}). Only 8-bit RGBA supported.")
        return
        
    # Concatenate and decompress IDAT
    idat_data = b''.join([c[1] for c in chunks if c[0] == b'IDAT'])
    decompressed = zlib.decompress(idat_data)
    
    # Unfilter PNG scanlines
    stride = 1 + w * 4
    pixels = bytearray(h * w * 4)
    prev_row = bytearray(w * 4)
    
    for y in range(h):
        row_start = y * stride
        filter_type = decompressed[row_start]
        row_data = decompressed[row_start + 1 : row_start + stride]
        
        current_row = bytearray(w * 4)
        for x in range(w * 4):
            val = row_data[x]
            left = current_row[x - 4] if x >= 4 else 0
            up = prev_row[x]
            
            if filter_type == 0:
                current_row[x] = val
            elif filter_type == 1:
                current_row[x] = (val + left) & 0xff
            elif filter_type == 2:
                current_row[x] = (val + up) & 0xff
            elif filter_type == 3:
                current_row[x] = (val + (left + up) // 2) & 0xff
            elif filter_type == 4:
                # Paeth predictor
                a = left
                b = up
                c = prev_row[x - 4] if x >= 4 else 0
                p = a + b - c
                pa = abs(p - a)
                pb = abs(p - b)
                pc = abs(p - c)
                if pa <= pb and pa <= pc:
                    pr = a
                elif pb <= pc:
                    pr = b
                else:
                    pr = c
                current_row[x] = (val + pr) & 0xff
                
        pixels[y * w * 4 : (y + 1) * w * 4] = current_row
        prev_row = current_row
        
    # Find bounding box of non-transparent pixels (alpha > 0)
    min_x, max_x = w, 0
    min_y, max_y = h, 0
    found = False
    
    for y in range(h):
        for x in range(w):
            alpha = pixels[(y * w + x) * 4 + 3]
            if alpha > 0:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                found = True
                
    if not found:
        print(f"Skipping {os.path.basename(path)}: completely transparent!")
        return
        
    w_new = max_x - min_x + 1
    h_new = max_y - min_y + 1
    print(f"Cropping from {w}x{h} to {w_new}x{h_new} (rect: x={min_x}..{max_x}, y={min_y}..{max_y})")
    
    # Construct new cropped pixel data with Filter 0 (None)
    new_decompressed = bytearray()
    for y in range(min_y, max_y + 1):
        new_decompressed.append(0) # Filter type 0 (None)
        row_pixels = pixels[y * w * 4 + min_x * 4 : y * w * 4 + (max_x + 1) * 4]
        new_decompressed.extend(row_pixels)
        
    # Compress new pixel data
    new_idat_data = zlib.compress(bytes(new_decompressed))
    
    # Pack chunks
    def make_chunk(chunk_type, chunk_data):
        length = len(chunk_data)
        chunk = struct.pack('>I', length) + chunk_type + chunk_data
        crc = zlib.crc32(chunk_type + chunk_data) & 0xffffffff
        return chunk + struct.pack('>I', crc)
        
    new_ihdr = struct.pack('>IIBBBBB', w_new, h_new, 8, 6, 0, 0, 0)
    
    # Write back the new PNG file
    new_png = bytearray(b'\x89PNG\r\n\x1a\n')
    new_png.extend(make_chunk(b'IHDR', new_ihdr))
    new_png.extend(make_chunk(b'IDAT', new_idat_data))
    new_png.extend(make_chunk(b'IEND', b''))
    
    with open(path, 'wb') as f:
        f.write(new_png)
    print(f"Successfully cropped and saved {os.path.basename(path)}")

# Process all transparent logo assets
folder = '/Users/matteofain/Desktop/Portfolio VS code/assets/img transparent'
for f in sorted(os.listdir(folder)):
    if f.endswith('.png'):
        crop_png(os.path.join(folder, f))
