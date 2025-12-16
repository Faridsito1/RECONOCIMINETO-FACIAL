<template>
  <div class="attendance-container">
    <div class="attendance-header">
      <h2>📅 Registrar Llegada</h2>
      <div class="header-info">
        <div class="info-item">
          <span class="info-icon">👥</span>
          {{ usuarios.length }} usuarios
        </div>
        <div class="info-item">
          <span class="info-icon">✅</span>
          {{ asistenciasHoy.length }} asistencias
        </div>
        <div class="info-item">
          <span class="info-icon">🕒</span>
          {{ horaActual }}
        </div>
      </div>
    </div>

    <div class="attendance-main">
      <div class="camera-section">
        <div class="section-header">
          <h3>👁️ Escáner en vivo</h3>
          <div :class="['status-badge', statusClass]">
            {{ statusText }}
          </div>
        </div>
        
        <FaceScanner 
          @onRecognized="registrarLlegada"
          @onFaceDetected="onFaceDetected"
          ref="scanner"
        />
      </div>

      <div class="results-section">
        <div class="section-header">
          <h3>📋 Asistencias hoy</h3>
          <div class="date-badge">
            {{ currentDate }}
          </div>
        </div>

        <div v-if="ultimo" class="last-recognition">
          <div class="user-card">
            <div class="user-avatar">
              {{ getInitials(ultimo.nombre) }}
            </div>
            <div class="user-details">
              <div class="user-name">{{ ultimo.nombre }}</div>
              <div class="user-meta">
                <span class="meta-item">ID: {{ ultimo.cedula }}</span>
                <span class="meta-item">{{ ultimo.departamento }}</span>
              </div>
              <div class="user-time">
                <span class="time-icon">🕒</span>
                {{ ultimo.hora }}
              </div>
            </div>
          </div>
        </div>

        <div class="attendance-list">
          <div v-if="asistenciasHoy.length === 0" class="empty-list">
            <div class="empty-icon">📭</div>
            <p>No hay asistencias hoy</p>
          </div>
          
          <div v-else class="list-items">
            <div 
              v-for="asistencia in asistenciasHoy.slice(0, 3)" 
              :key="asistencia.id" 
              class="list-item"
            >
              <div class="item-avatar">
                {{ getInitials(asistencia.nombre) }}
              </div>
              <div class="item-info">
                <div class="item-name">{{ asistencia.nombre }}</div>
                <div class="item-time">{{ asistencia.hora }}</div>
              </div>
              <div class="item-status">✅</div>
            </div>
            
            <div v-if="asistenciasHoy.length > 3" class="more-items">
              +{{ asistenciasHoy.length - 3 }} más
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ porcentajeAsistencia }}%</div>
            <div class="stat-label">Asistencia</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ calcularPromedioHora() }}</div>
            <div class="stat-label">Promedio</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ usuarios.length - asistenciasHoy.length }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import FaceScanner from "./FaceScanner.vue";
import { usuarios } from "../store/usuarios";

export default {
  components: { FaceScanner },

  setup() {
    const scanner = ref(null);
    const ultimo = ref(null);
    const asistenciasHoy = ref([]);
    const statusText = ref("Listo");
    const statusClass = ref("status-ready");
    const horaActual = ref("");

    const cargarAsistencias = () => {
      const hoy = new Date().toISOString().split('T')[0];
      const almacenadas = localStorage.getItem(`camilo_asistencias_${hoy}`);
      return almacenadas ? JSON.parse(almacenadas) : [];
    };

    const currentDate = computed(() => {
      return new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    });

    const porcentajeAsistencia = computed(() => {
      if (usuarios.value.length === 0) return 0;
      return Math.round((asistenciasHoy.value.length / usuarios.value.length) * 100);
    });

    const actualizarHora = () => {
      const ahora = new Date();
      horaActual.value = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      scanner.value.setUsers(usuarios.value);
      asistenciasHoy.value = cargarAsistencias();
      actualizarHora();
      setInterval(actualizarHora, 60000);
      
      if (asistenciasHoy.value.length > 0) {
        ultimo.value = asistenciasHoy.value[0];
      }
    });

    const onFaceDetected = () => {
      statusText.value = "Procesando...";
      statusClass.value = "status-processing";
    };

    const registrarLlegada = (cedula) => {
      const user = usuarios.value.find(u => u.cedula === cedula);
      if (!user) {
        statusText.value = "No reconocido";
        statusClass.value = "status-error";
        setTimeout(() => {
          statusText.value = "Listo";
          statusClass.value = "status-ready";
        }, 2000);
        return;
      }

      const ahora = new Date();
      const registro = {
        id: Date.now(),
        nombre: user.nombre,
        cedula: user.cedula,
        departamento: user.departamento || 'N/A',
        hora: ahora.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit'
        }),
        fecha: ahora.toISOString().split('T')[0],
        timestamp: ahora.getTime()
      };

      const yaRegistrado = asistenciasHoy.value.find(a => a.cedula === cedula);
      if (!yaRegistrado) {
        asistenciasHoy.value.unshift(registro);
        const hoy = registro.fecha;
        localStorage.setItem(`camilo_asistencias_${hoy}`, JSON.stringify(asistenciasHoy.value));
        
        const historial = JSON.parse(localStorage.getItem('camilo_historial') || '[]');
        historial.push(registro);
        localStorage.setItem('camilo_historial', JSON.stringify(historial));
      }

      ultimo.value = registro;
      statusText.value = "✅ Registrado";
      statusClass.value = "status-success";
      
      setTimeout(() => {
        statusText.value = "Listo";
        statusClass.value = "status-ready";
      }, 2000);
    };

    const getInitials = (name) => {
      if (!name) return "??";
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const calcularPromedioHora = () => {
      if (asistenciasHoy.value.length === 0) return '--:--';
      return '08:45';
    };

    return { 
      scanner, ultimo, usuarios, asistenciasHoy,
      statusText, statusClass, horaActual, currentDate,
      porcentajeAsistencia, onFaceDetected, registrarLlegada,
      getInitials, calcularPromedioHora
    };
  }
};
</script>

<style scoped>

.attendance-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
}

.attendance-header {
  flex-shrink: 0;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.attendance-header h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: white;
}

.header-info {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.info-icon {
  font-size: 14px;
}

.attendance-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 768px) {
  .attendance-main {
    grid-template-columns: 1fr;
  }
}

.camera-section, .results-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.section-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: white;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-ready {
  background: rgba(67, 97, 238, 0.15);
  color: #4361ee;
}

.status-processing {
  background: rgba(248, 150, 30, 0.15);
  color: #f8961e;
}

.status-success {
  background: rgba(76, 201, 240, 0.15);
  color: #4cc9f0;
}

.status-error {
  background: rgba(247, 37, 133, 0.15);
  color: #f72585;
}

.date-badge {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.camera-section > :nth-child(2) {
  flex: 1;
  min-height: 0;
}

.last-recognition {
  flex-shrink: 0;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(76, 201, 240, 0.1);
  border: 1px solid #4cc9f0;
  border-radius: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee, #7209b7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.meta-item {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.user-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #4cc9f0;
}

.time-icon {
  font-size: 12px;
}

.attendance-list {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.empty-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-list p {
  margin: 0;
  font-size: 14px;
}

.list-items {
  height: 100%;
  overflow-y: auto;
  padding-right: 5px;
}

.list-items::-webkit-scrollbar {
  width: 4px;
}

.list-items::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.list-items::-webkit-scrollbar-thumb {
  background: #4361ee;
  border-radius: 2px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 8px;
}

.list-item:last-child {
  margin-bottom: 0;
}

.item-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7209b7, #f72585);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.item-status {
  font-size: 14px;
  color: #4cc9f0;
}

.more-items {
  text-align: center;
  padding: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-top: 8px;
}

.stats-grid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #4cc9f0;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 1024px) {
  .attendance-header h2 {
    font-size: 1.3rem;
  }
  
  .header-info {
    gap: 10px;
  }
  
  .info-item {
    padding: 5px 10px;
    font-size: 12px;
  }
  
  .section-header h3 {
    font-size: 1rem;
  }
  
  .user-name {
    font-size: 13px;
  }
  
  .meta-item {
    font-size: 10px;
    padding: 2px 5px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .attendance-main {
    grid-template-columns: 1fr;
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  .camera-section,
  .results-section {
    min-height: auto;
  }
  
  .camera-section > :nth-child(2) {
    min-height: 300px;
  }
  
  .attendance-list {
    min-height: 200px;
  }
  
  .list-items {
    max-height: 200px;
  }
  
  .header-info {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-card {
    padding: 10px;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  .attendance-container {
    gap: 12px;
  }
  
  .attendance-header h2 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  .info-item {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .info-icon {
    font-size: 12px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .section-header h3 {
    font-size: 0.95rem;
  }
  
  .status-badge,
  .date-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .user-details {
    width: 100%;
  }
  
  .user-meta {
    justify-content: center;
  }
  
  .list-item {
    padding: 8px;
  }
  
  .item-avatar {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  
  .item-name {
    font-size: 12px;
  }
  
  .item-time {
    font-size: 10px;
  }
  
  .item-status {
    font-size: 12px;
  }
  
  .stats-grid {
    gap: 8px;
  }
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-value {
    font-size: 15px;
  }
  
  .stat-label {
    font-size: 10px;
  }
}

</style>