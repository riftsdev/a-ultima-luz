"""Remove constant-key redundancy and sample linear GLB animations at 15 fps."""
import json,struct,sys,math,importlib.util
from pathlib import Path
data=Path(sys.argv[1]).read_bytes();length=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+length]);binary=bytearray(data[28+length:])
def values(index):
 a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']];n={'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']];offset=v.get('byteOffset',0)+a.get('byteOffset',0)
 return [struct.unpack_from('<'+'f'*n,binary,offset+i*v.get('byteStride',n*4)) for i in range(a['count'])]
def accessor(rows,kind):
 binary.extend(b'\0'*((-len(binary))%4));offset=len(binary);flat=[v for row in rows for v in row];binary.extend(struct.pack('<'+'f'*len(flat),*flat));view=len(doc['bufferViews']);doc['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(flat)*4});i=len(doc['accessors']);a={'bufferView':view,'componentType':5126,'count':len(rows),'type':kind}
 if kind=='SCALAR':a.update(min=[min(flat)],max=[max(flat)])
 doc['accessors'].append(a);return i
for animation in doc.get('animations',[]):
 for sampler in animation['samplers']:
  if sampler.get('interpolation','LINEAR')!='LINEAR':continue
  times=values(sampler['input']);rows=values(sampler['output'])
  if len(times)<3 or len(rows)!=len(times):continue
  constant=all(all(abs(a-b)<.000001 for a,b in zip(row,rows[0])) for row in rows)
  if constant:indices=[0,len(times)-1]
  else:
   indices=[0];last=times[0][0]
   for i in range(1,len(times)-1):
    if times[i][0]-last>=1/15-.001:indices.append(i);last=times[i][0]
   indices.append(len(times)-1)
  kind=doc['accessors'][sampler['output']]['type'];sampler['input']=accessor([times[i] for i in indices],'SCALAR');sampler['output']=accessor([rows[i] for i in indices],kind)
doc['buffers']=[{'byteLength':len(binary)}];binary.extend(b'\0'*((-len(binary))%4));js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
temp=Path(sys.argv[2]).with_suffix('.working.glb');temp.write_bytes(struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary)
spec=importlib.util.spec_from_file_location('opt',Path(__file__).with_name('optimize-glb.py'));opt=importlib.util.module_from_spec(spec);spec.loader.exec_module(opt);opt.optimize(temp,sys.argv[2]);temp.unlink()
