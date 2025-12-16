<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Reconocimiento Facial</h2>

    <FaceScanner @descriptor="verificar" />

    <div class="mt-4 p-2 border bg-gray-100">
      <h3 class="font-semibold">Resultado:</h3>
      <p>{{ resultado }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as faceapi from "face-api.js";
import FaceScanner from "./FaceScanner.vue";

const resultado = ref("Aún no detectado");

let matcher = null;

const estudiantes = JSON.parse(localStorage.getItem("estudiantes") || "[]");

if (estudiantes.length > 0) {
  const labeledDescriptors = estudiantes.map((e) => {
    return new faceapi.LabeledFaceDescriptors(
      e.nombre,
      [new Float32Array(e.descriptor)]
    );
  });

  matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);
} else {
  resultado.value = "No hay estudiantes registrados";
}

function verificar(descriptor) {
  if (!matcher) return;

  const floatDescriptor = new Float32Array(descriptor);
  const best = matcher.findBestMatch(floatDescriptor);

  resultado.value = best.toString(); 
}
</script>
