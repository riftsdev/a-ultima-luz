"""Keep requested clips, prune their unused binary data, and resize embedded maps."""
import json,struct,io,sys
from pathlib import Path
from PIL import Image
def optimize(source,destination,clips=None,max_size=512):
 data=Path(source).read_bytes();length=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+length]);binary=data[28+length:]
 if clips is not None:doc['animations']=[a for a in doc.get('animations',[]) if a.get('name') in clips]
 needed=set()
 for m in doc.get('meshes',[]):
  for p in m['primitives']:
   needed.update(p['attributes'].values())
   if 'indices' in p:needed.add(p['indices'])
   for t in p.get('targets',[]):needed.update(t.values())
 for s in doc.get('skins',[]):
  if 'inverseBindMatrices' in s:needed.add(s['inverseBindMatrices'])
 for a in doc.get('animations',[]):
  for s in a['samplers']:needed.update([s['input'],s['output']])
 amap={old:new for new,old in enumerate(sorted(needed))}
 for m in doc.get('meshes',[]):
  for p in m['primitives']:
   p['attributes']={k:amap[v] for k,v in p['attributes'].items()}
   if 'indices' in p:p['indices']=amap[p['indices']]
   for t in p.get('targets',[]):
    for k,v in t.items():t[k]=amap[v]
 for s in doc.get('skins',[]):
  if 'inverseBindMatrices' in s:s['inverseBindMatrices']=amap[s['inverseBindMatrices']]
 for a in doc.get('animations',[]):
  for s in a['samplers']:s['input']=amap[s['input']];s['output']=amap[s['output']]
 doc['accessors']=[doc['accessors'][i] for i in sorted(needed)]
 views=doc.get('bufferViews',[]);new_views=[];out=bytearray();vmap={}
 def append(blob,old=None):
  out.extend(b'\0'*((-len(out))%4));v=dict(old or {});v.update(buffer=0,byteOffset=len(out),byteLength=len(blob));idx=len(new_views);new_views.append(v);out.extend(blob);return idx
 def copyview(idx):
  if idx not in vmap:
   v=views[idx];offset=v.get('byteOffset',0);vmap[idx]=append(binary[offset:offset+v['byteLength']],v)
  return vmap[idx]
 for a in doc['accessors']:
  if 'bufferView' in a:a['bufferView']=copyview(a['bufferView'])
  if 'sparse' in a:
   for k in ['indices','values']:a['sparse'][k]['bufferView']=copyview(a['sparse'][k]['bufferView'])
 for image in doc.get('images',[]):
  v=views[image['bufferView']];offset=v.get('byteOffset',0);im=Image.open(io.BytesIO(binary[offset:offset+v['byteLength']]));im.thumbnail((max_size,max_size),Image.Resampling.LANCZOS);buf=io.BytesIO()
  if im.mode=='RGBA' and im.getchannel('A').getextrema()[0]<255:im.save(buf,format='PNG',optimize=True);image['mimeType']='image/png'
  else:im.convert('RGB').save(buf,format='JPEG',quality=78,optimize=True);image['mimeType']='image/jpeg'
  image['bufferView']=append(buf.getvalue())
 out.extend(b'\0'*((-len(out))%4));doc['bufferViews']=new_views;doc['buffers']=[{'byteLength':len(out)}];js=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode();js+=b' '*((-len(js))%4)
 result=struct.pack('<III',0x46546c67,2,28+len(js)+len(out))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(out),0x004e4942)+out
 Path(destination).parent.mkdir(parents=True,exist_ok=True);Path(destination).write_bytes(result);print(Path(destination).name,len(data),'→',len(result),flush=True)
if __name__=='__main__':optimize(sys.argv[1],sys.argv[2],sys.argv[3].split(',') if len(sys.argv)>3 else None)
