<template>
  <div class="app-container">
    <header class="header">
      <h1>🪪 CONTROL DE ASISTENCIA</h1>
    </header>

    <nav class="navigation">
      <div class="nav-buttons">
        <button 
          @click="vista = 'registro'" 
          :class="['nav-btn', { active: vista === 'registro' }]"
        >
          <span class="nav-icon">👤</span>
          <span class="nav-text">Registrar Usuario</span>
        </button>
        
        <button 
          @click="vista = 'llegada'" 
          :class="['nav-btn', { active: vista === 'llegada' }]"
        >
          <span class="nav-icon">📅</span>
          <span class="nav-text">Registrar Llegada</span>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <Transition name="fade-slide" mode="out-in">
        <component :is="currentComponent" class="view-container" />
      </Transition>
    </main>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import RegistrarUsuario from "./components/RegistrarUsuario.vue";
import RegistrarLlegada from "./components/RegistrarLlegada.vue";

export default {
  components: { RegistrarUsuario, RegistrarLlegada },
  setup() {
    const vista = ref("registro");
    
    const currentComponent = computed(() => {
      return vista.value === "registro" ? RegistrarUsuario : RegistrarLlegada;
    });

    return { vista, currentComponent };
  }
};
</script>

<style scoped>

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29, #302b63);
}

.header {
  flex-shrink: 0;
  padding: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0 !important;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(90deg, #fff, #4cc9f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navigation {
  flex-shrink: 0;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.nav-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.nav-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.nav-btn.active {
  background: linear-gradient(135deg, #4361ee, #7209b7);
  color: white;
  box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
}

.nav-icon {
  font-size: 18px;
}

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

.view-container {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}


@media (max-width: 1024px) {
  .header h1 {
    font-size: 1.8rem;
  }
  
  .nav-buttons {
    max-width: 400px;
  }
  
  .nav-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 0;
  }
  
  .header {
    padding: 15px 10px;
  }
  
  .header h1 {
    font-size: 1.5rem;
  }
  
  .navigation {
    padding: 10px;
  }
  
  .nav-buttons {
    flex-direction: column;
    max-width: 300px;
    gap: 8px;
  }
  
  .nav-btn {
    width: 100%;
    padding: 12px;
  }
  
  .main-content {
    padding: 10px;
  }
}

@media (max-width: 576px) {
  .header h1 {
    font-size: 1.3rem;
  }
  
  .nav-btn .nav-text {
    font-size: 12px;
  }
  
  .nav-icon {
    font-size: 16px;
  }
}

</style>