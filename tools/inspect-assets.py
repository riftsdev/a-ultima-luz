import bpy,sys,json,math
from pathlib import Path
from mathutils import Vector
root=Path('/workspace/sites/a-ultima-luz')
source=Path('/tmp/codex-remote-attachments/01a1b3dd-416b-736a-8cfe-c6164df48005/8257DCDC-CB69-46C0-9097-B3A1E8893DB0')
out=root/'qa';out.mkdir(exist_ok=True)
def reset():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def render(name,position,target):
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=False;scene.render.resolution_x=640;scene.render.resolution_y=480;scene.render.resolution_percentage=100
 scene.world.color=(.3,.3,.3);scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/(name+'.png'))
 bpy.ops.object.camera_add(location=position);cam=bpy.context.object;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=38;scene.camera=cam
 bpy.ops.object.light_add(type='AREA',location=Vector(target)+Vector((4,-5,7)));lamp=bpy.context.object;lamp.data.energy=1700;lamp.data.shape='DISK';lamp.data.size=8;lamp.rotation_euler=(Vector(target)-lamp.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.render.render(write_still=True)
def bounds(objects):
 pts=[o.matrix_world@Vector(v) for o in objects if o.type=='MESH' for v in o.bound_box];lo=Vector([min(p[i] for p in pts) for i in range(3)]);hi=Vector([max(p[i] for p in pts) for i in range(3)]);return lo,hi
reset();bpy.ops.import_scene.gltf(filepath=str(source/'2-floresta_encantada.glb'))
for o in bpy.context.scene.objects:
 if o.type=='MESH': print('FOREST',o.name,'dims',tuple(round(v,2) for v in o.dimensions),'loc',tuple(round(v,2) for v in o.matrix_world.translation),flush=True)
lo,hi=bounds(bpy.context.scene.objects);c=(lo+hi)/2;s=max(hi-lo);render('forest',c+Vector((s*.8,-s*.8,s*.7)),c)
reset();bpy.ops.import_scene.gltf(filepath=str(source/'1-38_special_revolver.glb'));lo,hi=bounds(bpy.context.scene.objects);c=(lo+hi)/2;s=max(hi-lo);print('REVOLVER BOUNDS',list(lo),list(hi),flush=True);render('revolver',c+Vector((s*.7,-s,s*.5)),c)
reset();bpy.ops.wm.obj_import(filepath=str(root/'source-assets/Car.obj'));lo,hi=bounds(bpy.context.scene.objects);c=(lo+hi)/2;s=max(hi-lo);print('CAR BOUNDS',list(lo),list(hi),flush=True);render('car',c+Vector((s*.8,-s,s*.6)),c)
reset();bpy.ops.import_scene.gltf(filepath=str(root/'source-assets/arms_rig.glb'))
for a in bpy.data.actions:print('ACTION',a.name,tuple(a.frame_range),flush=True)
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');rig.animation_data_create();rig.animation_data.action=next(a for a in bpy.data.actions if a.name.endswith('relax'))
for tr in rig.animation_data.nla_tracks:tr.mute=True
bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
for name in ['hand.R','hand.L','camera']:
 bone=rig.pose.bones.get(name)
 if bone:print('BONE',name,list(rig.matrix_world@bone.head),flush=True)
render('arms',(0,0,1.74),(0,-1,1.74))
