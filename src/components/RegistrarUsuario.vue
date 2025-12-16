<template>
  <div class="register-container">
    <div class="register-header">
      <h2>👤 Nuevo Usuario</h2>
      <p class="subtitle">Registra una nueva persona en el sistema</p>
      <div class="stats-badge">
        <span class="stat-icon">👥</span>
        {{ totalUsuarios }} usuarios registrados
      </div>
    </div>

    <div class="register-grid">
      <div class="form-section">
        <div class="form-grid">
          <div class="form-group">
            <label for="nombre">
              <span class="label-icon">👤</span>
              Nombre completo *
            </label>
            <input 
              v-model="nombre" 
              id="nombre"
              placeholder="Ej: Juan Pérez" 
              class="input"
              :class="{ 'input-error': errorCampo.nombre }"
            />
          </div>

          <div class="form-group">
            <label for="cedula">
              <span class="label-icon">🆔</span>
              Cédula / ID *
            </label>
            <input 
              v-model="cedula" 
              id="cedula"
              placeholder="Ej: 123456789" 
              class="input"
              :class="{ 'input-error': errorCampo.cedula }"
            />
          </div>

          <div class="form-group">
            <label for="correo">
              <span class="label-icon">📧</span>
              Correo electrónico *
            </label>
            <input 
              v-model="correo" 
              id="correo"
              type="email"
              placeholder="Ej: juan@email.com" 
              class="input"
              :class="{ 'input-error': errorCampo.correo }"
            />
          </div>

          <div class="form-group">
            <label for="departamento">
              <span class="label-icon">🏢</span>
              Departamento / Área
            </label>
            <select v-model="departamento" class="input">
              <option value="">Seleccione departamento</option>
              <option value="Administración">Administración</option>
              <option value="TI">TI</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Ventas">Ventas</option>
              <option value="Producción">Producción</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button @click="guardar" class="btn btn-primary" :disabled="!descriptor || guardando">
            <span v-if="guardando" class="btn-icon">⏳</span>
            <span v-else class="btn-icon">💾</span>
            {{ guardando ? 'Guardando...' : 'Guardar Usuario' }}
          </button>
          
          <button @click="limpiar" class="btn btn-secondary">
            <span class="btn-icon">🗑️</span>
            Limpiar
          </button>
        </div>

        <div v-if="mensaje" :class="['message', messageClass]">
          <span class="message-icon">{{ messageIcon }}</span>
          {{ mensaje }}
        </div>
      </div>

      <div class="camera-section">
        <div class="camera-header">
          <h3>📸 Captura Facial</h3>
          <p class="hint">Mira directamente a la cámara y mantén una expresión neutral</p>
        </div>
        
        <div class="camera-container">
          <FaceScanner 
            @onFaceDetected="capturarDescriptor" 
            ref="scanner" 
          />
          
          <div v-if="descriptor" class="capture-indicator success">
            <div class="indicator-icon">✅</div>
            <div class="indicator-text">
              <p>Descriptor facial capturado</p>
              <small>{{ descriptor?.length || 0 }} puntos de referencia</small>
            </div>
          </div>
          <div v-else class="capture-indicator waiting">
            <div class="indicator-icon">👁️</div>
            <div class="indicator-text">
              <p>Esperando detección facial...</p>
              <small>Asegúrate de tener buena iluminación</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="usuarioGuardado" class="user-summary">
      <div class="summary-header">
        <h4>✅ Usuario registrado exitosamente</h4>
        <button @click="usuarioGuardado = null" class="btn-close">×</button>
      </div>
      
      <div class="summary-grid">
        <div class="summary-item">
          <strong>Nombre:</strong> {{ usuarioGuardado.nombre }}
        </div>
        <div class="summary-item">
          <strong>ID:</strong> {{ usuarioGuardado.cedula }}
        </div>
        <div class="summary-item">
          <strong>Correo:</strong> {{ usuarioGuardado.correo }}
        </div>
        <div class="summary-item">
          <strong>Departamento:</strong> {{ usuarioGuardado.departamento || 'No especificado' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import FaceScanner from "./FaceScanner.vue";
import { usuarios, agregarUsuario } from "../store/usuarios";

export default {
  components: { FaceScanner },
  setup() {
    const nombre = ref("");
    const cedula = ref("");
    const correo = ref("");
    const departamento = ref("");
    const descriptor = ref(null);
    const mensaje = ref("");
    const guardando = ref(false);
    const usuarioGuardado = ref(null);
    
    const errorCampo = ref({
      nombre: false,
      cedula: false,
      correo: false
    });

    const totalUsuarios = computed(() => usuarios.value.length);

    const messageClass = computed(() => {
      if (mensaje.value.includes("✅")) return "success";
      if (mensaje.value.includes("❌")) return "error";
      return "info";
    });

    const messageIcon = computed(() => {
      if (mensaje.value.includes("✅")) return "✅";
      if (mensaje.value.includes("❌")) return "❌";
      return "ℹ️";
    });

    const validarFormulario = () => {
      errorCampo.value = { nombre: false, cedula: false, correo: false };
      
      let valido = true;
      
      if (!nombre.value.trim()) {
        errorCampo.value.nombre = true;
        valido = false;
      }
      
      if (!cedula.value.trim()) {
        errorCampo.value.cedula = true;
        valido = false;
      }
      
      if (!correo.value.trim() || !correo.value.includes('@')) {
        errorCampo.value.correo = true;
        valido = false;
      }
      
      return valido;
    };

    const capturarDescriptor = d => {
      descriptor.value = [...d];
      mensaje.value = "✅ Rostro capturado correctamente";
    };

    const guardar = async () => {
      if (!validarFormulario()) {
        mensaje.value = "❌ Complete todos los campos requeridos correctamente";
        return;
      }

      if (!descriptor.value) {
        mensaje.value = "❌ No se detectó rostro. Por favor, mira a la cámara";
        return;
      }

      guardando.value = true;
      
      try {
        const nuevoUsuario = {
          nombre: nombre.value.trim(),
          cedula: cedula.value.trim(),
          correo: correo.value.trim(),
          departamento: departamento.value,
          descriptor: descriptor.value
        };

        agregarUsuario(nuevoUsuario);
        
        usuarioGuardado.value = {
          ...nuevoUsuario,
          fechaRegistro: new Date().toISOString()
        };

        mensaje.value = "✅ Usuario registrado exitosamente";
        
        setTimeout(() => {
          limpiarFormulario();
          guardando.value = false;
        }, 2000);

      } catch (error) {
        mensaje.value = `❌ Error: ${error.message}`;
        guardando.value = false;
      }
    };

    const limpiarFormulario = () => {
      nombre.value = "";
      cedula.value = "";
      correo.value = "";
      departamento.value = "";
      descriptor.value = null;
    };

    const limpiar = () => {
      limpiarFormulario();
      mensaje.value = "";
      usuarioGuardado.value = null;
      errorCampo.value = { nombre: false, cedula: false, correo: false };
    };

    return { 
      nombre, cedula, correo, departamento, mensaje, descriptor, 
      guardando, usuarioGuardado, usuarios, totalUsuarios, errorCampo,
      capturarDescriptor, guardar, limpiar, messageClass, messageIcon
    };
  }
};
</script>

<style scoped>
.register-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.register-header {
  flex-shrink: 0;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.register-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: white;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 10px 0;
}

.stats-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(76, 201, 240, 0.15);
  border: 1px solid #4cc9f0;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #4cc9f0;
}

.register-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 768px) {
  .register-grid {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  overflow-y: auto;
  padding-right: 10px;
  flex: 1;
  min-height: 0;
}

.form-grid::-webkit-scrollbar {
  width: 6px;
}

.form-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.form-grid::-webkit-scrollbar-thumb {
  background: #4361ee;
  border-radius: 3px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.label-icon {
  font-size: 16px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #4cc9f0;
  background: rgba(255, 255, 255, 0.1);
}

.input-error {
  border-color: #f72585 !important;
  background: rgba(247, 37, 133, 0.05) !important;
}

select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px;
  padding-right: 30px;
  cursor: pointer;
}

.form-actions {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #4361ee, #7209b7);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 16px;
}

.message {
  flex-shrink: 0;
  padding: 12px;
  border-radius: 6px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
}

.message.success {
  background: rgba(76, 201, 240, 0.15);
  border: 1px solid #4cc9f0;
  color: #4cc9f0;
}

.message.error {
  background: rgba(247, 37, 133, 0.15);
  border: 1px solid #f72585;
  color: #f72585;
}

.message-icon {
  font-size: 18px;
}

.camera-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.camera-header {
  flex-shrink: 0;
}

.camera-header h3 {
  margin: 0 0 6px 0;
  font-size: 1.2rem;
  color: white;
}

.hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.camera-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.camera-container > *:first-child {
  flex: 1;
  min-height: 0;
}

.capture-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
}

.capture-indicator.success {
  background: rgba(76, 201, 240, 0.1);
  border: 1px solid #4cc9f0;
}

.capture-indicator.waiting {
  background: rgba(248, 150, 30, 0.1);
  border: 1px solid #f8961e;
}

.indicator-icon {
  font-size: 24px;
}

.indicator-text p {
  margin: 0 0 4px 0;
  font-weight: 600;
}

.indicator-text small {
  color: rgba(255, 255, 255, 0.6);
}

.user-summary {
  flex-shrink: 0;
  background: rgba(76, 201, 240, 0.1);
  border: 1px solid #4cc9f0;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  animation: slideIn 0.3s ease-out;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.summary-header h4 {
  margin: 0;
  font-size: 14px;
  color: #4cc9f0;
}

.btn-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  font-size: 13px;
}

.summary-item {
  display: flex;
  gap: 6px;
}

.summary-item strong {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .register-header h2 {
    font-size: 1.3rem;
  }
  
  .subtitle {
    font-size: 13px;
  }
  
  .form-grid {
    gap: 10px;
  }
  
  .input {
    padding: 9px 11px;
    font-size: 13px;
  }
  
  .btn {
    padding: 9px 14px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .register-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  .form-section {
    min-height: auto;
  }
  
  .form-grid {
    max-height: 300px;
  }
  
  .camera-section {
    min-height: 300px;
  }
  
  .camera-header h3 {
    font-size: 1.1rem;
  }
  
  .user-summary {
    margin-top: 15px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

@media (max-width: 576px) {
  .register-container {
    gap: 15px;
  }
  
  .register-header h2 {
    font-size: 1.2rem;
  }
  
  .stats-badge {
    font-size: 12px;
    padding: 5px 10px;
  }
  
  .form-grid {
    max-height: 250px;
  }
  
  .form-group label {
    font-size: 12px;
  }
  
  .input {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .message {
    padding: 10px;
    font-size: 13px;
  }
  
  .capture-indicator {
    padding: 10px;
    font-size: 12px;
  }
  
  .indicator-icon {
    font-size: 20px;
  }
  
  .user-summary {
    padding: 12px;
  }
  
  .summary-header h4 {
    font-size: 13px;
  }
}

</style>