<template>
  <div class="face-scanner-container">
    <div class="scanner-view">
      <video 
        ref="video" 
        autoplay 
        muted 
        playsinline 
        class="scanner-video"
      ></video>
      
      <div class="face-overlay">
        <div class="face-guide"></div>
      </div>
    </div>
    
    <div class="scanner-status">
      <div :class="['status-indicator', statusClass]">
        <span class="status-dot"></span>
        {{ estado }}
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
import { ref, onMounted, computed } from "vue";

export default {
  emits: ["onFaceDetected", "onRecognized"],

  setup(props, { emit }) {
    const video = ref(null);
    const estado = ref("Iniciando cámara...");
    let faceMatcher = null;
    let detectionInterval;

    const statusClass = computed(() => {
      if (estado.value.includes("✅") || estado.value.includes("detectado")) 
        return "status-success";
      if (estado.value.includes("no detectado") || estado.value.includes("Esperando")) 
        return "status-warning";
      return "status-info";
    });

    const loadModels = async () => {
      try {
        estado.value = "⏳ Cargando modelos IA...";
        const URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(URL)
        ]);

        estado.value = "✅ Modelos cargados";
        startCamera();
      } catch (error) {
        estado.value = "❌ Error cargando modelos";
        console.error(error);
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 480 },
            facingMode: "user" 
          } 
        });
        video.value.srcObject = stream;

        video.value.onplaying = () => {
          estado.value = "🔍 Buscando rostros...";
          detectionLoop();
        };
      } catch (error) {
        estado.value = "❌ Error accediendo a la cámara";
      }
    };

    const detectionLoop = async () => {
      clearInterval(detectionInterval);
      
      detectionInterval = setInterval(async () => {
        if (!video.value) return;

        const result = await faceapi
          .detectSingleFace(video.value, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!result) {
          estado.value = "👀 Enfoca tu rostro en el círculo";
          return;
        }

        estado.value = "✅ Rostro detectado";
        emit("onFaceDetected", result.descriptor);

        if (faceMatcher) {
          const match = faceMatcher.findBestMatch(result.descriptor);
          if (match.label !== "unknown") {
            emit("onRecognized", match.label);
          }
        }

      }, 500);
    };

    const setUsers = (users) => {
      const labeled = users.map(u => new faceapi.LabeledFaceDescriptors(
        u.cedula,
        [new Float32Array(u.descriptor)]
      ));

      faceMatcher = new faceapi.FaceMatcher(labeled);
    };

    onMounted(loadModels);

    return { 
      video, 
      estado, 
      setUsers,
      statusClass 
    };
  }
};
</script>

<style scoped>
.face-scanner-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scanner-view {
  flex: 1;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  min-height: 0;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.face-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face-guide {
  width: 150px;
  height: 180px;
  border: 2px solid rgba(76, 201, 240, 0.6);
  border-radius: 35% 35% 40% 40%;
  background: transparent;
}

.scanner-status {
  flex-shrink: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-info {
  background: rgba(67, 97, 238, 0.15);
  color: #4361ee;
  border: 1px solid #4361ee;
}

.status-warning {
  background: rgba(248, 150, 30, 0.15);
  color: #f8961e;
  border: 1px solid #f8961e;
}

.status-success {
  background: rgba(76, 201, 240, 0.15);
  color: #4cc9f0;
  border: 1px solid #4cc9f0;
}


@media (max-width: 1024px) {
  .face-guide {
    width: 130px;
    height: 160px;
  }
  
  .status-indicator {
    font-size: 11px;
    padding: 7px 10px;
  }
}

@media (max-width: 768px) {
  .scanner-view {
    border-radius: 6px;
  }
  
  .face-guide {
    width: 120px;
    height: 150px;
    border-width: 1.5px;
  }
  
  .status-indicator {
    font-size: 11px;
    padding: 6px 10px;
  }
}

@media (max-width: 576px) {
  .scanner-view {
    min-height: 250px;
  }
  
  .face-guide {
    width: 100px;
    height: 130px;
  }
  
  .status-indicator {
    font-size: 10px;
    padding: 5px 8px;
  }
  
  .status-dot {
    width: 5px;
    height: 5px;
  }
}

</style>
