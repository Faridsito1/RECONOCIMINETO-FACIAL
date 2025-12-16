import { ref, watch } from 'vue'

const cargarUsuarios = () => {
  const usuariosGuardados = localStorage.getItem('camilo_usuarios')
  return usuariosGuardados ? JSON.parse(usuariosGuardados) : []
}

export const usuarios = ref(cargarUsuarios())

watch(usuarios, (nuevosUsuarios) => {
  localStorage.setItem('camilo_usuarios', JSON.stringify(nuevosUsuarios))
  console.log('✅ Usuarios guardados en localStorage:', nuevosUsuarios.length)
}, { deep: true })

export const agregarUsuario = (usuario) => {
  const existe = usuarios.value.find(u => u.cedula === usuario.cedula)
  if (existe) {
    throw new Error('Ya existe un usuario con esta cédula')
  }
  
  usuarios.value.push({
    ...usuario,
    id: Date.now(),
    fechaRegistro: new Date().toISOString(),
    activo: true
  })
  return usuario
}

export const buscarPorCedula = (cedula) => {
  return usuarios.value.find(u => u.cedula === cedula)
}

export const eliminarUsuario = (cedula) => {
  const index = usuarios.value.findIndex(u => u.cedula === cedula)
  if (index !== -1) {
    usuarios.value.splice(index, 1)
    return true
  }
  return false
}

export const obtenerTotalUsuarios = () => usuarios.value.length

export const limpiarUsuarios = () => {
  usuarios.value = []
  localStorage.removeItem('camilo_usuarios')
}
