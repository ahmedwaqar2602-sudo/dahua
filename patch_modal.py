import re

with open('frontend/components/CameraRecordingModal.vue', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Replace hardcoded extract URL
code = code.replace('http://localhost:4000/api/dvr/extract', '/api/dvr/extract')

# 2. Add dvrSegments logic
script_injection = '''
const archiveVideoUrl = ref(null)
const dvrSegments = ref([])

watch([selectedDate, () => props.camera], async ([date, cam]) => {
  if (!cam) return;
  try {
    const res = await $fetch(`/api/dvr/continuous?cameraId=${cam.name}&date=${date}`);
    if (res.success) {
      dvrSegments.value = res.segments.map(seg => {
        const [sH, sM] = seg.start.split(':').map(Number);
        const [eH, eM] = seg.end.split(':').map(Number);
        const sPercent = ((sH * 60 + sM) / 1440) * 100;
        const ePercent = ((eH * 60 + eM) / 1440) * 100;
        return {
          startPercent: sPercent,
          widthPercent: ePercent - sPercent,
          title: `Recorded ${seg.start} - ${seg.end}`,
          status: seg.status // 'recorded', 'motion'
        };
      });
    }
  } catch(e) {
    console.error(e);
  }
}, { immediate: true })
'''

code = code.replace('const archiveVideoUrl = ref(null)', script_injection)

# 3. Replace the fake timeline with a real one
fake_timeline = '''              <!-- 24h Green Archive Blocks -->
              <div class="absolute inset-y-1 left-[5%] right-[5%] bg-emerald-500/40 rounded border-y border-emerald-400/50"></div>
              
              <!-- Motion Event Ticks -->
              <div class="absolute inset-y-1 left-[15%] w-1.5 bg-amber-400 rounded-full" title="Motion Event 03:30"></div>
              <div class="absolute inset-y-1 left-[32%] w-2 bg-amber-400 rounded-full" title="Motion Event 07:45"></div>
              <div class="absolute inset-y-1 left-[58%] w-1.5 bg-amber-400 rounded-full" title="Motion Event 14:10"></div>
              <div class="absolute inset-y-1 left-[85%] w-2 bg-amber-400 rounded-full" title="Motion Event 20:25"></div>'''

real_timeline = '''              <!-- Real DVR Segments -->
              <div 
                v-for="(seg, idx) in dvrSegments" 
                :key="idx"
                class="absolute inset-y-1 rounded border-y transition-all"
                :class="seg.status === 'motion' ? 'bg-amber-400 border-amber-500 z-10 w-1.5 rounded-full' : 'bg-emerald-500/40 border-emerald-400/50'"
                :style="seg.status === 'motion' ? { left: seg.startPercent + '%' } : { left: seg.startPercent + '%', width: Math.max(0.2, seg.widthPercent) + '%' }"
                :title="seg.title"
              ></div>'''

code = code.replace(fake_timeline, real_timeline)

with open('frontend/components/CameraRecordingModal.vue', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated CameraRecordingModal.vue")
