import sys
from PIL import Image, ImageChops
a=Image.open(sys.argv[1]).convert('RGB'); b=Image.open(sys.argv[2]).convert('RGB')
if a.size!=b.size: print('size',a.size,b.size); b=b.resize(a.size)
d=ImageChops.difference(a,b).convert('L')
px=d.load(); w,h=d.size; n=0
for y in range(h):
    for x in range(w):
        if px[x,y]>24: n+=1
print(f'{sys.argv[3] if len(sys.argv)>3 else ""} differing pixels: {n} of {w*h} = {100*n/(w*h):.3f}%')
if len(sys.argv)>4:
    m=d.point(lambda v:255 if v>24 else 0)
    out=Image.blend(a.convert('L').convert('RGB'),Image.new('RGB',a.size,(255,255,255)),.6)
    red=Image.new('RGB',a.size,(230,30,30)); out.paste(red,mask=m); out.save(sys.argv[4])
