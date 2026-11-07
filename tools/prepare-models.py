"""Prepare only the uploaded scene pieces needed by the game. Blender 4.x."""
import bpy
from pathlib import Path
from mathutils import Vector,Matrix
root=Path('/workspace/sites/a-ultima-luz');source=Path('/tmp/codex-remote-attachments/01a1b3dd-416b-736a-8cfe-c6164df48005/8257DCDC-CB69-46C0-9097-B3A1E8893DB0')
out=root/'source-assets'
def reset():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def normalize(obj,size,axis=2):
 matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=matrix
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 points=[v.co for v in obj.data.vertices];lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)]);scale=size/(hi[axis]-lo[axis]);origin=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 for v in obj.data.vertices:v.co=(v.co-origin)*scale
 obj.location=(0,0,0)
reset();bpy.ops.import_scene.gltf(filepath=str(source/'2-floresta_encantada.glb'))
choices=[('pCylinder14_TREES_0','tree_wide',9),('pCylinder18_TREES_0','tree_tall',7),('polySurface52_TREE_TRUCK_0','fallen_log',.65),('polySurface153_GRASS_0','fern',.85)]
selected=[]
for old,new,size in choices:
 obj=bpy.data.objects.get(old);normalize(obj,size);obj.name=new;selected.append(obj)
bpy.ops.object.select_all(action='DESELECT')
for obj in selected:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'nature-selected.glb'),use_selection=True,export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
reset();bpy.ops.wm.obj_import(filepath=str(out/'Car.obj'))
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH');normalize(obj,4.6,axis=1);obj.name='station_wagon'
mat=bpy.data.materials.new('Car gray paint');mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.8;tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(out/'car_gray.png'));tex.interpolation='Closest';mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color']);obj.data.materials.clear();obj.data.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=str(out/'car-ready.glb'),use_selection=True,export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
