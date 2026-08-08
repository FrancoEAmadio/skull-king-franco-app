/**
 * JS/app.js - Controlador principal de la PWA Skull King
 * Flujo guiado por pasos (Paso 1 a Paso 5) con soporte táctil (swipe horizontal)
 * y edición controlada de la ronda inmediatamente anterior.
 */

const { createApp, ref, computed, onMounted, watch } = Vue;

import { LISTA_EVENTOS_BONO, CATALAGO_CARTAS_WIKI } from './datos/cartasDatos.js';
import { CATEGORIAS_REGLAS_WIKI } from './datos/reglasDatos.js';
import { MODOS_REPARTO, obtenerCartasPorRondaDelModo } from './datos/modosReparto.js';
import {
  calcularPuntajeRonda,
  calcularBonoComodines,
  calcularBonosAlianzasBotin
} from './motor/motorPuntuacion.js';
import {
  cargarJugadoresPermanentes,
  guardarJugadoresPermanentes,
  crearJugadorPermanente,
  calcularPromedioPuntos,
  calcularPorcentajeAciertos,
  actualizarEstadisticasFinPartida
} from './motor/motorJugadores.js';

createApp({
  setup() {
    // ======================================================
    // NAVEGACIÓN GENERAL Y ESTADOS
    // ======================================================
    const pantallaActual = ref('inicio');
    const pasoPartida = ref('apuestas');
    const hayPartidaGuardada = ref(false);
    const mostrarPodio = ref(false);
    const partidaFinalizada = ref(false);
    const menuHamburguesaAbierto = ref(false);

    // Edición de ronda inmediatamente anterior
    const editandoRondaAnterior = ref(false);
    const backupRondaActual = ref(null);

    const jugadorViendoHistorial = ref(null);
    const acordeonOpcionalesAbierto = ref(false);
    const acordeonEventosAbierto = ref(false);
    const subAcordeonBase = ref(true);
    const subAcordeonAvanzado = ref(true);
    const subAcordeonExpansion = ref(true);
    const acordeonHabilidadesAbierto = ref(false);

    const vistaWiki = ref('manual');
    const acordeonAbierto = ref('puntuacion');
    const terminoBusquedaCarta = ref('');
    const filtroTipoCarta = ref('Todos');
    const categoriasReglas = ref(CATEGORIAS_REGLAS_WIKI);
    const inputBusquedaCarta = ref(null);

    const vistaJugadoresHub = ref('gestor');
    const nombreNuevoJugadorPermanente = ref('');
    const jugadoresPermanentes = ref([]);
    const jugadorPermanenteEnEdicion = ref(null);
    const jugadorPermanenteViendoStats = ref(null);

    // ======================================================
    // CONFIGURACIÓN DE MESA (Paso 1)
    // ======================================================
    const configuracionMesa = ref({
      modoContenido: 'expansion',
      usarComodinesBonificacion: false,
      usarHabilidadesPiratas: true,
      usarModoBribon: false,
      cobrarBonosSinAcierto: false,
      modoReparto: 'clasico',
      cartasPorRonda: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      reglasOpcionales: {
        kraken: true,
        ballenaBlanca: true,
        botin: true,
        primerOficialKong: true,
        pirataMaryThorne: true,
        mono15: true,
        mantarrayaMoteada: true,
        davyJones: true,
        caminarPorLaTabla: true,
        ultimaDescarga: true,
        carta7: true,
        carta8: true,
        cartas0y14: true
      }
    });

    const idsJugadoresSeleccionados = ref([]);

    // ======================================================
    // ESTADO DE LA PARTIDA EN CURSO
    // ======================================================
    const rondaActual = ref(1);
    const jugadores = ref([]);
    const jugadorSeleccionadoIdx = ref(0);
    const historialPartidas = ref([]);
    const resumenRondaActual = ref([]);

    const cartasPorRondaActivas = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const alianzasBotinRonda = ref([]);
    const idxBotinJugadorA = ref(0);
    const idxBotinJugadorB = ref(1);

    const registroHabilidadesRonda = ref([]);

    const habSeleccionada = ref('bribon_rotan');
    const habJugadorIdx = ref(0);
    const habHabilidadCopiada = ref('Bribón de Roatán');
    const habPuntosBribon = ref(10);

    // ======================================================
    // GESTOS TÁCTILES (SWIPE HORIZONTAL ENTRE JUGADORES)
    // ======================================================
    let touchStartX = 0;
    let touchStartY = 0;

    const iniciarTouch = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const finalizarTouch = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Umbral mínimo y verificación de predominio horizontal para no bloquear el scroll vertical
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
        if (deltaX < 0) {
          // Swipe a la izquierda (←) -> Siguiente jugador
          navegarSiguienteJugadorSwipe();
        } else {
          // Swipe a la derecha (→) -> Jugador anterior
          navegarAnteriorJugadorSwipe();
        }
      }
    };

    const navegarSiguienteJugadorSwipe = () => {
      const actualVis = indiceVisualActual.value;
      if (actualVis < jugadoresOrdenados.value.length - 1) {
        const siguienteItem = jugadoresOrdenados.value[actualVis + 1];
        if (siguienteItem) jugadorSeleccionadoIdx.value = siguienteItem.originalIndex;
      }
    };

    const navegarAnteriorJugadorSwipe = () => {
      const actualVis = indiceVisualActual.value;
      if (actualVis > 0) {
        const anteriorItem = jugadoresOrdenados.value[actualVis - 1];
        if (anteriorItem) jugadorSeleccionadoIdx.value = anteriorItem.originalIndex;
      }
    };

    // ======================================================
    // COMPUTADOS GENERALES
    // ======================================================
    const jugadorActual = computed(() => jugadores.value[jugadorSeleccionadoIdx.value] || null);

    const totalRondas = computed(() => cartasPorRondaActivas.value.length || 10);

    const indiceJugadorInicial = computed(() => {
      if (!jugadores.value.length) return 0;
      return (rondaActual.value - 1) % jugadores.value.length;
    });

    const jugadorInicial = computed(() => jugadores.value[indiceJugadorInicial.value] || { nombre: '-' });

    const jugadorReparte = computed(() => {
      if (!jugadores.value.length) return { nombre: '-' };
      const pos = (indiceJugadorInicial.value - 1 + jugadores.value.length) % jugadores.value.length;
      return jugadores.value[pos];
    });

    const jugadoresOrdenados = computed(() => {
      if (!jugadores.value.length) return [];
      const arr = jugadores.value.map((j, idx) => ({ jugador: j, originalIndex: idx }));
      const inicio = indiceJugadorInicial.value;
      return arr.slice(inicio).concat(arr.slice(0, inicio));
    });

    const indiceVisualActual = computed(() => {
      if (!jugadoresOrdenados.value.length) return 0;
      return jugadoresOrdenados.value.findIndex(item => item.originalIndex === jugadorSeleccionadoIdx.value);
    });

    const tablaGeneralOrdenada = computed(() => [...jugadores.value].sort((a, b) => b.puntos - a.puntos));

    const cartasPorJugadorEnRonda = computed(() => {
      const val = Number(cartasPorRondaActivas.value[rondaActual.value - 1]);
      return !isNaN(val) && val >= 1 ? val : (Number(rondaActual.value) || 1);
    });

    const totalCartasMesa = computed(() => (jugadores.value.length || 0) * cartasPorJugadorEnRonda.value);

    const totalGanadasAsignadas = computed(() => {
      return jugadores.value.reduce((acc, j) => acc + (Number(j.ganadas) || 0), 0);
    });

    const puedeModificarRondaAnterior = computed(() => {
      return rondaActual.value > 1 && !editandoRondaAnterior.value && !partidaFinalizada.value;
    });

    // ======================================================
    // PASO 1: SELECCIÓN DE MODO DE REPARTO Y JUGADORES
    // ======================================================
    const cambiarModoContenido = (modo) => {
      configuracionMesa.value.modoContenido = modo;
      if (modo !== 'expansion' && idsJugadoresSeleccionados.value.length === 9) {
        idsJugadoresSeleccionados.value = idsJugadoresSeleccionados.value.slice(0, 8);
      }
    };

    const seleccionarModoReparto = (idModo) => {
      configuracionMesa.value.modoReparto = idModo;
    };

    const modoRepartoSeleccionado = computed(() => {
      return MODOS_REPARTO.find(m => m.id === configuracionMesa.value.modoReparto) || MODOS_REPARTO[0];
    });

    const vistaPreviaCartasPorRonda = computed(() => {
      return obtenerCartasPorRondaDelModo(configuracionMesa.value.modoReparto, configuracionMesa.value.cartasPorRonda);
    });

    const guardarListaJugadoresPermanentes = () => {
      guardarJugadoresPermanentes(jugadoresPermanentes.value);
    };

    const crearNuevoJugadorPermanente = () => {
      const nombre = nombreNuevoJugadorPermanente.value.trim();
      if (!nombre) return;
      const nuevo = crearJugadorPermanente(nombre);
      jugadoresPermanentes.value.push(nuevo);
      nombreNuevoJugadorPermanente.value = '';
      guardarListaJugadoresPermanentes();
      return nuevo;
    };

    const iniciarEdicionJugadorPermanente = (jug) => {
      jugadorPermanenteEnEdicion.value = { id: jug.id, nombre: jug.nombre };
    };

    const guardarEdicionJugadorPermanente = () => {
      if (!jugadorPermanenteEnEdicion.value) return;
      const jug = jugadoresPermanentes.value.find(j => j.id === jugadorPermanenteEnEdicion.value.id);
      if (jug) {
        const nombre = jugadorPermanenteEnEdicion.value.nombre.trim();
        jug.nombre = nombre || jug.nombre;
        guardarListaJugadoresPermanentes();
      }
      jugadorPermanenteEnEdicion.value = null;
    };

    const cancelarEdicionJugadorPermanente = () => {
      jugadorPermanenteEnEdicion.value = null;
    };

    const eliminarJugadorPermanente = (id) => {
      if (!confirm('¿Eliminar esta tarjeta de jugador y todas sus estadísticas guardadas?')) return;
      jugadoresPermanentes.value = jugadoresPermanentes.value.filter(j => j.id !== id);
      idsJugadoresSeleccionados.value = idsJugadoresSeleccionados.value.filter(i => i !== id);
      guardarListaJugadoresPermanentes();
    };

    const alternarSeleccionJugador = (id) => {
      const idx = idsJugadoresSeleccionados.value.indexOf(id);
      if (idx !== -1) {
        idsJugadoresSeleccionados.value.splice(idx, 1);
        return;
      }
      const maximo = configuracionMesa.value.modoContenido === 'expansion' ? 9 : 8;
      if (idsJugadoresSeleccionados.value.length >= maximo) {
        alert(`La mesa admite un máximo de ${maximo} piratas ${maximo === 8 ? '(9 solo con Expansión)' : ''}.`);
        return;
      }
      idsJugadoresSeleccionados.value.push(id);
    };

    const posicionSeleccion = (id) => {
      const idx = idsJugadoresSeleccionados.value.indexOf(id);
      return idx === -1 ? null : idx + 1;
    };

    const abrirEstadisticasJugador = (jug) => {
      jugadorPermanenteViendoStats.value = jug;
    };

    const cerrarEstadisticasJugador = () => {
      jugadorPermanenteViendoStats.value = null;
    };

    const irANuevaPartida = () => {
      idsJugadoresSeleccionados.value = [];
      pantallaActual.value = 'nueva_partida';
    };

    const comenzarPartida = () => {
      if (idsJugadoresSeleccionados.value.length < 2) {
        alert('Seleccioná al menos 2 piratas para empezar la partida.');
        return;
      }

      cartasPorRondaActivas.value = obtenerCartasPorRondaDelModo(
        configuracionMesa.value.modoReparto,
        configuracionMesa.value.cartasPorRonda
      );

      jugadores.value = idsJugadoresSeleccionados.value.map(id => {
        const permanente = jugadoresPermanentes.value.find(j => j.id === id);
        return {
          permanenteId: id,
          nombre: permanente ? permanente.nombre : 'Pirata',
          puntos: 0,
          apuesta: 0,
          ganadas: 0,
          modoEnvite: 'metralla',
          bribonHabilidadPts: null,
          bribonStolenFrom: null,
          eventosBono: {},
          cartasBlancas: 0,
          apuestasAcertadas: 0,
          apuestasFalladas: 0,
          capturasSkullKing: 0,
          capturasSirena: 0,
          capturasMonstruo: 0,
          historial: []
        };
      });

      rondaActual.value = 1;
      jugadorSeleccionadoIdx.value = 0;
      pasoPartida.value = 'apuestas';
      alianzasBotinRonda.value = [];
      registroHabilidadesRonda.value = [];
      idxBotinJugadorA.value = 0;
      idxBotinJugadorB.value = jugadores.value.length > 1 ? 1 : 0;
      partidaFinalizada.value = false;
      editandoRondaAnterior.value = false;
      backupRondaActual.value = null;

      pantallaActual.value = 'partida';
      guardarEnCelular();
    };

    // ======================================================
    // PASO 2: APUESTAS / ENVITES
    // ======================================================
    const cambiarApuesta = (jug, delta) => {
      const max = cartasPorJugadorEnRonda.value;
      let nuevo = (Number(jug.apuesta) || 0) + delta;
      if (nuevo < 0) nuevo = 0;
      if (nuevo > max) nuevo = max;
      jug.apuesta = nuevo;
    };

    const avanzarAPasoBazas = () => {
      pasoPartida.value = 'bazas';
      guardarEnCelular();
    };

    // ======================================================
    // PASO 3: REGISTRO DE BAZAS
    // ======================================================
    const maximoGanadasDisponiblesPara = (idx) => {
      let sumaOtras = 0;
      jugadores.value.forEach((j, i) => {
        if (i !== idx) sumaOtras += (Number(j.ganadas) || 0);
      });
      return Math.max(0, cartasPorJugadorEnRonda.value - sumaOtras);
    };

    const cambiarGanadas = (idx, delta) => {
      const jug = jugadores.value[idx];
      if (!jug) return;
      const max = maximoGanadasDisponiblesPara(idx);
      let nuevo = (Number(jug.ganadas) || 0) + delta;
      if (nuevo < 0) nuevo = 0;
      if (nuevo > max) nuevo = max;
      jug.ganadas = nuevo;
    };

    const limpiarBazasRonda = () => {
      jugadores.value.forEach(j => { j.ganadas = 0; });
      guardarEnCelular();
    };

    const avanzarAPasoBonos = () => {
      if (totalGanadasAsignadas.value > cartasPorJugadorEnRonda.value) {
        alert(`Las bazas asignadas (${totalGanadasAsignadas.value}) superan el máximo posible de esta ronda (${cartasPorJugadorEnRonda.value}).`);
        return;
      }
      jugadorSeleccionadoIdx.value = indiceJugadorInicial.value;
      pasoPartida.value = 'bonos';
      acordeonHabilidadesAbierto.value = false;
      acordeonEventosAbierto.value = false;
      guardarEnCelular();
    };

    const volverAPasoApuestas = () => { pasoPartida.value = 'apuestas'; };
    const volverAPasoBazas = () => { pasoPartida.value = 'bazas'; };

    // ======================================================
    // HABILIDADES DE PIRATAS (Paso 4)
    // ======================================================
    const esHabilidadYaRegistrada = (tipoPirata) => {
      return registroHabilidadesRonda.value.some(h => h.tipo === tipoPirata);
    };

    const esKongYaRegistradoCon = (subTipo) => {
      return registroHabilidadesRonda.value.some(h => h.tipo === 'Primer Oficial Kong' && h.etiqueta.includes(subTipo));
    };

    const habilidadesBloqueadasPorLimiteMesa = computed(() => {
      return registroHabilidadesRonda.value.length >= 3;
    });

    const registrarHabilidadPirata = (tipo, idxJugador, extra = {}) => {
      const j = jugadores.value[idxJugador];
      if (!j) return false;

      registroHabilidadesRonda.value.push({
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        ronda: rondaActual.value,
        jugadorIdx: idxJugador,
        jugadorNombre: j.nombre,
        tipo,
        etiqueta: extra.etiqueta || tipo,
        detalle: extra.detalle || ''
      });
      guardarEnCelular();
      return true;
    };

    const aplicarBribonRotan = (idxJug, pts) => {
      if (esHabilidadYaRegistrada('Bribón de Roatán')) return;
      if (!registrarHabilidadPirata('Bribón de Roatán', idxJug, {
        etiqueta: 'Bribón de Roatán (Apuesta de puntos)',
        detalle: `Arriesgó una apuesta de ${pts} pts sobre el cumplimiento de su envite`
      })) return;
      const j = jugadores.value[idxJug];
      if (j) { j.bribonHabilidadPts = pts; j.bribonStolenFrom = null; }
    };

    const aplicarHarryGigante = (idxJugador, delta) => {
      if (esHabilidadYaRegistrada('Harry el Gigante')) return;
      const j = jugadores.value[idxJugador];
      if (!j) return;
      const enviteAnterior = j.apuesta || 0;
      const nuevoEnvite = Math.max(0, Math.min(cartasPorJugadorEnRonda.value, enviteAnterior + delta));
      if (!registrarHabilidadPirata('Harry el Gigante', idxJugador, {
        etiqueta: 'Harry el Gigante (Modificó Envite)',
        detalle: `Modificó su envite de ${enviteAnterior} a ${nuevoEnvite} baza(s) (${delta > 0 ? '+1' : '-1'})`
      })) return;
      j.apuesta = nuevoEnvite;
    };

    const aplicarKongCopiaBribon = (idxJugador, pts) => {
      if (esKongYaRegistradoCon('Bribón')) return;
      const j = jugadores.value[idxJugador];
      if (!j) return;
      if (!registrarHabilidadPirata('Primer Oficial Kong', idxJugador, {
        etiqueta: 'Primer Oficial Kong (Copió Bribón de Roatán)',
        detalle: `Copió apuesta de ${pts} pts (ambos conservan su apuesta de riesgo)`
      })) return;
      j.bribonHabilidadPts = pts;
      j.bribonStolenFrom = '(Copiado por Kong)';
    };

    const aplicarKongHarryGigante = (idxJugador, delta) => {
      if (esKongYaRegistradoCon('Harry')) return;
      const j = jugadores.value[idxJugador];
      if (!j) return;
      const enviteAnterior = j.apuesta || 0;
      const nuevoEnvite = Math.max(0, Math.min(cartasPorJugadorEnRonda.value, enviteAnterior + delta));
      if (!registrarHabilidadPirata('Primer Oficial Kong', idxJugador, {
        etiqueta: 'Primer Oficial Kong (Copió Harry el Gigante)',
        detalle: `Modificó su envite de ${enviteAnterior} a ${nuevoEnvite} baza(s) (${delta > 0 ? '+1' : '-1'}) copiando a Harry`
      })) return;
      j.apuesta = nuevoEnvite;
    };

    const eliminarRegistroHabilidad = (idx) => {
      const item = registroHabilidadesRonda.value[idx];
      if (item) {
        if (item.tipo === 'Bribón de Roatán' || (item.tipo === 'Primer Oficial Kong' && item.etiqueta.includes('Bribón'))) {
          const j = jugadores.value[item.jugadorIdx];
          if (j) { j.bribonHabilidadPts = null; j.bribonStolenFrom = null; }
        }
      }
      registroHabilidadesRonda.value.splice(idx, 1);
      guardarEnCelular();
    };

    // ======================================================
    // PUNTAJE PROYECTADO Y EVENTOS DE BONO (Paso 4)
    // ======================================================
    const puntajeProyectadoActual = computed(() => {
      if (!jugadorActual.value) return 0;
      const res = calcularPuntajeRonda(
        jugadorActual.value.apuesta,
        jugadorActual.value.ganadas,
        cartasPorJugadorEnRonda.value,
        jugadorActual.value.eventosBono,
        configuracionMesa.value.usarModoBribon,
        jugadorActual.value.modoEnvite,
        jugadorActual.value.bribonHabilidadPts,
        configuracionMesa.value.cobrarBonosSinAcierto
      );
      const bonosBotin = calcularBonosAlianzasBotin(alianzasBotinRonda.value, jugadores.value);
      const bonoBotinProyectado = Number(bonosBotin[jugadorSeleccionadoIdx.value]) || 0;
      return res.puntajeTotal + bonoBotinProyectado;
    });

    const textoBotonAvanzar = computed(() => {
      if (indiceVisualActual.value < jugadoresOrdenados.value.length - 1) return 'Siguiente Jugador ➔';
      if (editandoRondaAnterior.value) return '✓ Guardar Corrección de Ronda ➔';
      if (rondaActual.value < totalRondas.value) return 'Ver Resumen de la Ronda ➔';
      return '🏁 Ver Resumen Final ➔';
    });

    const eventosBaseFiltrados = computed(() => {
      const idsBase = ['pirata_por_sk', 'sk_por_sirena', 'sirena_por_pirata', 'catorce_negro', 'catorce_color'];
      return LISTA_EVENTOS_BONO.filter(ev => idsBase.includes(ev.id));
    });

    const eventosExpansionFiltrados = computed(() => {
      const idsExpansion = ['ocho_expansion', 'siete_expansion', 'monstruo_davy', 'kong_por_sk_sirena'];
      const opciones = configuracionMesa.value.reglasOpcionales || {};
      return LISTA_EVENTOS_BONO.filter(ev => {
        if (!idsExpansion.includes(ev.id)) return false;
        if (ev.id === 'siete_expansion' && opciones.carta7 === false) return false;
        if (ev.id === 'ocho_expansion' && opciones.carta8 === false) return false;
        if (ev.id === 'monstruo_davy' && opciones.davyJones === false) return false;
        if (ev.id === 'kong_por_sk_sirena' && opciones.primerOficialKong === false) return false;
        return true;
      });
    });

    const catalogoCartasFiltrado = computed(() => {
      return CATALAGO_CARTAS_WIKI.filter(c => {
        const coincideTexto = c.nombre.toLowerCase().includes(terminoBusquedaCarta.value.toLowerCase()) ||
                              c.descripcion.toLowerCase().includes(terminoBusquedaCarta.value.toLowerCase());
        const coincideFiltro = filtroTipoCarta.value === 'Todos' || c.modo === filtroTipoCarta.value;
        return coincideTexto && coincideFiltro;
      });
    });

    const limpiarBusquedaCarta = () => {
      terminoBusquedaCarta.value = '';
      if (inputBusquedaCarta.value) inputBusquedaCarta.value.focus();
    };

    const limiteBazasAlcanzado = computed(() => {
      let sumaComodinesOtras = 0;
      jugadores.value.forEach((j, index) => {
        if (index !== jugadorSeleccionadoIdx.value) sumaComodinesOtras += (Number(j.cartasBlancas) || 0);
      });
      const maxComodinesPermitidos = configuracionMesa.value.modoContenido === 'expansion' ? 8 : 4;
      const comodinesDisponibles = maxComodinesPermitidos - sumaComodinesOtras;
      return {
        comodinesDisponibles: Math.max(0, comodinesDisponibles),
        comodinesBloqueados: (sumaComodinesOtras + (Number(jugadorActual.value?.cartasBlancas) || 0)) >= maxComodinesPermitidos,
        maxComodinesPermitidos
      };
    });

    const toggleAcordeon = (id) => { acordeonAbierto.value = acordeonAbierto.value === id ? null : id; };

    const agregarAlianzaBotin = (idxA, idxB) => {
      const iA = Number(idxA);
      const iB = Number(idxB);
      if (isNaN(iA) || isNaN(iB) || iA === iB) {
        alert('Una alianza de Botín debe realizarse entre dos jugadores diferentes.');
        return;
      }
      if (!jugadores.value[iA] || !jugadores.value[iB]) return;
      if (alianzasBotinRonda.value.length >= 2) {
        alert('Ya se registraron las 2 alianzas de Botín máximas de esta ronda.');
        return;
      }
      alianzasBotinRonda.value.push({
        idxA: iA, idxB: iB,
        nombreA: jugadores.value[iA].nombre,
        nombreB: jugadores.value[iB].nombre
      });
      guardarEnCelular();
    };

    const eliminarAlianzaBotin = (index) => {
      alianzasBotinRonda.value.splice(index, 1);
      guardarEnCelular();
    };

    const obtenerCantidadBono = (idEvento) => {
      if (!jugadorActual.value || !jugadorActual.value.eventosBono) return 0;
      return Number(jugadorActual.value.eventosBono[idEvento]) || 0;
    };

    const obtenerMaximoDisponible = (idEvento) => {
      const opciones = configuracionMesa.value.reglasOpcionales || {};
      const modo = configuracionMesa.value.modoContenido;

      let usadoPorOtros = 0;
      jugadores.value.forEach((j, idx) => {
        if (idx !== jugadorSeleccionadoIdx.value && j.eventosBono) {
          usadoPorOtros += Number(j.eventosBono[idEvento]) || 0;
        }
      });

      const numJugadores = jugadores.value.length || 2;
      const cartasEnMano = cartasPorJugadorEnRonda.value;

      switch (idEvento) {
        case 'pirata_por_sk': {
          let maxPiratasMazo = modo === 'expansion' ? 7 : 6;
          return Math.max(0, Math.min(maxPiratasMazo, (numJugadores - 1) * cartasEnMano) - usadoPorOtros);
        }
        case 'sk_por_sirena':
          return Math.max(0, 1 - usadoPorOtros);
        case 'sirena_por_pirata':
          return Math.max(0, 2 - usadoPorOtros);
        case 'catorce_negro':
          return Math.max(0, 1 - usadoPorOtros);
        case 'catorce_color':
          return Math.max(0, 3 - usadoPorOtros);
        case 'ocho_expansion':
          return Math.max(0, 4 - usadoPorOtros);
        case 'siete_expansion':
          return Math.max(0, 4 - usadoPorOtros);
        case 'monstruo_davy': {
          let maxMonstruos = 0;
          if (modo !== 'base' && opciones.kraken !== false) maxMonstruos++;
          if (modo !== 'base' && opciones.ballenaBlanca !== false) maxMonstruos++;
          if (modo === 'expansion' && opciones.mantarrayaMoteada !== false) maxMonstruos++;
          return Math.max(0, maxMonstruos - usadoPorOtros);
        }
        case 'kong_por_sk_sirena':
          return Math.max(0, 1 - usadoPorOtros);
        default:
          return 99;
      }
    };

    const cambiarCantidadBono = (idEvento, delta) => {
      if (!jugadorActual.value) return;
      if (!jugadorActual.value.eventosBono) jugadorActual.value.eventosBono = {};
      const actual = obtenerCantidadBono(idEvento);
      const maximoPosible = obtenerMaximoDisponible(idEvento);
      let nuevoValor = actual + delta;
      if (nuevoValor < 0) nuevoValor = 0;
      if (nuevoValor > maximoPosible) nuevoValor = maximoPosible;
      jugadorActual.value.eventosBono[idEvento] = nuevoValor;
    };

    const borrarBonoInmediato = (idEvento) => {
      if (jugadorActual.value && jugadorActual.value.eventosBono) jugadorActual.value.eventosBono[idEvento] = 0;
    };

    const limpiarTodosLosEventos = () => {
      if (jugadorActual.value) jugadorActual.value.eventosBono = {};
    };

    const guardarJugadorYContinuar = () => {
      guardarEnCelular();
      if (indiceVisualActual.value < jugadoresOrdenados.value.length - 1) {
        const siguienteItem = jugadoresOrdenados.value[indiceVisualActual.value + 1];
        jugadorSeleccionadoIdx.value = siguienteItem.originalIndex;
      } else {
        procesarFinDeRonda();
      }
    };

    const verHistorialJugador = (jugador) => { jugadorViendoHistorial.value = jugador; };
    const cerrarHistorialJugador = () => { jugadorViendoHistorial.value = null; };

    // ======================================================
    // EDICIÓN DE RONDA INMEDIATAMENTE ANTERIOR
    // ======================================================
    const iniciarModificacionRondaAnterior = () => {
      if (!puedeModificarRondaAnterior.value) return;

      // Respaldo de la ronda en curso
      backupRondaActual.value = {
        ronda: rondaActual.value,
        pasoPartida: pasoPartida.value,
        jugadorSeleccionadoIdx: jugadorSeleccionadoIdx.value,
        jugadoresEstado: jugadores.value.map(j => ({
          apuesta: j.apuesta,
          ganadas: j.ganadas,
          modoEnvite: j.modoEnvite,
          bribonHabilidadPts: j.bribonHabilidadPts,
          bribonStolenFrom: j.bribonStolenFrom,
          eventosBono: { ...(j.eventosBono || {}) }
        }))
      };

      const rondaAnteriorNum = rondaActual.value - 1;

      // Cargar datos previos de la ronda anterior
      jugadores.value.forEach(j => {
        const h = (j.historial || []).find(ent => ent.ronda === rondaAnteriorNum);
        if (h) {
          j.apuesta = h.apuesta !== '-' ? Number(h.apuesta) || 0 : 0;
          j.ganadas = h.ganadas !== '-' ? Number(h.ganadas) || 0 : 0;
          j.eventosBono = {};
        }
      });

      rondaActual.value = rondaAnteriorNum;
      editandoRondaAnterior.value = true;
      pasoPartida.value = 'apuestas';
      jugadorSeleccionadoIdx.value = indiceJugadorInicial.value;
      guardarEnCelular();
    };

    const cancelarModificacionRondaAnterior = () => {
      if (!editandoRondaAnterior.value || !backupRondaActual.value) return;

      rondaActual.value = backupRondaActual.value.ronda;
      pasoPartida.value = backupRondaActual.value.pasoPartida;
      jugadorSeleccionadoIdx.value = backupRondaActual.value.jugadorSeleccionadoIdx;

      // Restaurar estado de los jugadores en la ronda actual
      backupRondaActual.value.jugadoresEstado.forEach((est, idx) => {
        if (jugadores.value[idx]) {
          jugadores.value[idx].apuesta = est.apuesta;
          jugadores.value[idx].ganadas = est.ganadas;
          jugadores.value[idx].modoEnvite = est.modoEnvite;
          jugadores.value[idx].bribonHabilidadPts = est.bribonHabilidadPts;
          jugadores.value[idx].bribonStolenFrom = est.bribonStolenFrom;
          jugadores.value[idx].eventosBono = est.eventosBono;
        }
      });

      editandoRondaAnterior.value = false;
      backupRondaActual.value = null;
      guardarEnCelular();
    };

    // ======================================================
    // FIN DE RONDA Y RECÁLCULO DE PUNTUACIÓN
    // ======================================================
    const procesarFinDeRonda = () => {
      const bonosBotin = calcularBonosAlianzasBotin(alianzasBotinRonda.value, jugadores.value);

      const getEtiquetaBonoLimpia = (idEvento) => {
        const ev = LISTA_EVENTOS_BONO.find(e => e.id === idEvento);
        if (!ev) return idEvento;
        return ev.etiqueta.replace(/\s*\([^)]*\)$/, '');
      };

      const nuevoResumen = [];
      const numRondaProcesada = rondaActual.value;

      jugadores.value.forEach((j, index) => {
        const apuestaDeLaRonda = Number(j.apuesta) || 0;
        const ganadasDeLaRonda = Number(j.ganadas) || 0;

        const res = calcularPuntajeRonda(
          j.apuesta,
          j.ganadas,
          cartasPorJugadorEnRonda.value,
          j.eventosBono,
          configuracionMesa.value.usarModoBribon,
          j.modoEnvite,
          j.bribonHabilidadPts,
          configuracionMesa.value.cobrarBonosSinAcierto
        );

        const bonoBotinJugador = Number(bonosBotin[index]) || 0;

        let bonosCobradas = [];
        let bonosNoCobradas = [];
        let totalBonosRonda = 0;

        if (j.eventosBono) {
          Object.keys(j.eventosBono).forEach(evId => {
            if (evId === 'alianza_botin') return;
            const qty = Number(j.eventosBono[evId]) || 0;
            if (qty > 0) {
              const ev = LISTA_EVENTOS_BONO.find(e => e.id === evId);
              const unitPts = ev ? ev.puntos : 0;
              const subtotal = qty * unitPts;
              const objBono = { etiqueta: getEtiquetaBonoLimpia(evId), cantidad: qty, unitario: unitPts, subtotal };
              if (res.acierto || configuracionMesa.value.cobrarBonosSinAcierto) {
                bonosCobradas.push(objBono);
                totalBonosRonda += subtotal;
              } else {
                bonosNoCobradas.push(objBono);
              }
            }
          });

          j.capturasSkullKing += Number(j.eventosBono.pirata_por_sk) || 0;
          j.capturasSirena += (Number(j.eventosBono.sk_por_sirena) || 0) + (Number(j.eventosBono.sirena_por_pirata) || 0);
          j.capturasMonstruo += Number(j.eventosBono.monstruo_davy) || 0;
        }

        // Apuesta de riesgo del Bribón de Roatán
        if (j.bribonHabilidadPts !== null && j.bribonHabilidadPts !== undefined) {
          const pts = Number(j.bribonHabilidadPts);
          if (pts > 0) {
            let etiqueta = 'Apuesta de puntos: Bribón de Roatán';
            if (j.bribonStolenFrom) etiqueta = 'Apuesta de puntos: Bribón de Roatán (Copia Kong)';
            if (res.acierto) {
              bonosCobradas.push({ etiqueta: `${etiqueta} (Acertada)`, cantidad: 1, unitario: pts, subtotal: pts });
              totalBonosRonda += pts;
            } else {
              bonosCobradas.push({ etiqueta: `${etiqueta} (Fallada)`, cantidad: 1, unitario: -pts, subtotal: -pts });
              totalBonosRonda -= pts;
            }
          }
        }

        const alianzasJugador = alianzasBotinRonda.value.filter(al => al.idxA === index || al.idxB === index);
        alianzasJugador.forEach(al => {
          const esA = al.idxA === index;
          const nombreOtro = esA ? al.nombreB : al.nombreA;
          const jA = jugadores.value[al.idxA];
          const jB = jugadores.value[al.idxB];
          const aciertoA = (jA.apuesta === jA.ganadas);
          const aciertoB = (jB.apuesta === jB.ganadas);
          const ambosAcertaron = aciertoA && aciertoB;
          const objBono = { etiqueta: `Alianza de Botín (con ${nombreOtro})`, cantidad: 1, unitario: 20, subtotal: 20 };
          if (ambosAcertaron) { bonosCobradas.push(objBono); totalBonosRonda += 20; }
          else bonosNoCobradas.push(objBono);
        });

        const totalRealDeLaRonda = res.puntajeTotal + bonoBotinJugador;
        const habsDelJugador = registroHabilidadesRonda.value.filter(h => h.jugadorIdx === index || h.jugadorNombre === j.nombre);

        const entradaRonda = {
          ronda: numRondaProcesada,
          apuesta: apuestaDeLaRonda,
          ganadas: ganadasDeLaRonda,
          acierto: res.acierto,
          puntajeBase: res.puntajeBase,
          totalBonos: totalBonosRonda,
          bonosCobradas,
          bonosNoCobradas,
          habilidadesRegistradas: habsDelJugador,
          totalRonda: totalRealDeLaRonda,
          acumuladoAnterior: 0,
          acumuladoNuevo: 0
        };

        if (!j.historial) j.historial = [];

        if (editandoRondaAnterior.value) {
          // Reemplazar la entrada de la ronda modificada
          const idxHist = j.historial.findIndex(h => h.ronda === numRondaProcesada);
          if (idxHist !== -1) {
            j.historial[idxHist] = entradaRonda;
          } else {
            j.historial.push(entradaRonda);
          }
        } else {
          j.historial.push(entradaRonda);
        }

        nuevoResumen.push({ nombre: j.nombre, ...entradaRonda });

        // Limpiar controles temporales del jugador
        j.apuesta = 0;
        j.ganadas = 0;
        j.modoEnvite = 'metralla';
        j.bribonHabilidadPts = null;
        j.bribonStolenFrom = null;
        j.eventosBono = {};
      });

      // Recalcular en cadena los puntos acumulados y totales de todos los jugadores
      jugadores.value.forEach(j => {
        let acumulador = 0;
        let aciertos = 0;
        let fallos = 0;

        j.historial.forEach(h => {
          h.acumuladoAnterior = acumulador;
          acumulador += h.totalRonda;
          h.acumuladoNuevo = acumulador;
          if (h.apuesta !== '-') {
            if (h.acierto) aciertos++;
            else fallos++;
          }
        });

        j.puntos = acumulador;
        j.apuestasAcertadas = aciertos;
        j.apuestasFalladas = fallos;

        const resItem = nuevoResumen.find(r => r.nombre === j.nombre);
        if (resItem) {
          resItem.acumuladoNuevo = acumulador;
        }
      });

      resumenRondaActual.value = nuevoResumen;
      alianzasBotinRonda.value = [];
      registroHabilidadesRonda.value = [];

      // Si estábamos modificando la ronda anterior, restaurar el estado y volver
      if (editandoRondaAnterior.value && backupRondaActual.value) {
        rondaActual.value = backupRondaActual.value.ronda;

        backupRondaActual.value.jugadoresEstado.forEach((est, idx) => {
          if (jugadores.value[idx]) {
            jugadores.value[idx].apuesta = est.apuesta;
            jugadores.value[idx].ganadas = est.ganadas;
            jugadores.value[idx].modoEnvite = est.modoEnvite;
            jugadores.value[idx].bribonHabilidadPts = est.bribonHabilidadPts;
            jugadores.value[idx].bribonStolenFrom = est.bribonStolenFrom;
            jugadores.value[idx].eventosBono = est.eventosBono;
          }
        });

        editandoRondaAnterior.value = false;
        backupRondaActual.value = null;
        pasoPartida.value = 'resumen';
        guardarEnCelular();
        return;
      }

      // Flujo regular de avance de rondas
      if (rondaActual.value < totalRondas.value) {
        rondaActual.value++;
        jugadorSeleccionadoIdx.value = indiceJugadorInicial.value;
        pasoPartida.value = 'resumen';
        guardarEnCelular();
      } else {
        // Fin de partida: procesar comodines finales y ranking
        if (configuracionMesa.value.usarComodinesBonificacion) {
          jugadores.value.forEach(j => {
            const bonoBlancas = calcularBonoComodines(j.cartasBlancas);
            if (bonoBlancas > 0) {
              if (!j.historial) j.historial = [];
              j.historial.push({
                ronda: 'Final (Blancas)', apuesta: '-', ganadas: '-', acierto: true, puntajeBase: 0,
                totalBonos: bonoBlancas,
                bonosCobradas: [{ etiqueta: 'Cartas Blancas acumuladas', cantidad: j.cartasBlancas, unitario: '-', subtotal: bonoBlancas }],
                bonosNoCobradas: [],
                totalRonda: bonoBlancas,
                acumuladoAnterior: j.puntos,
                acumuladoNuevo: j.puntos + bonoBlancas
              });
              j.puntos += bonoBlancas;

              const entradaResumen = resumenRondaActual.value.find(r => r.nombre === j.nombre);
              if (entradaResumen) {
                entradaResumen.bonosCobradas = [...entradaResumen.bonosCobradas, { etiqueta: 'Cartas Blancas acumuladas (Bono Final)', cantidad: j.cartasBlancas, unitario: '-', subtotal: bonoBlancas }];
                entradaResumen.totalBonos += bonoBlancas;
                entradaResumen.totalRonda += bonoBlancas;
                entradaResumen.acumuladoNuevo += bonoBlancas;
              }
            }
          });
        }

        const rankingFinal = tablaGeneralOrdenada.value;
        const fechaPartida = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const nuevaEntrada = {
          fecha: fechaPartida,
          ranking: rankingFinal.map(j => ({ nombre: j.nombre, puntos: j.puntos, historial: j.historial || [] }))
        };
        historialPartidas.value.unshift(nuevaEntrada);
        localStorage.setItem('skullking_historial', JSON.stringify(historialPartidas.value));

        rankingFinal.forEach((j, idx) => {
          if (!j.permanenteId) return;
          const permanente = jugadoresPermanentes.value.find(p => p.id === j.permanenteId);
          if (!permanente) return;
          actualizarEstadisticasFinPartida(permanente, {
            fecha: fechaPartida,
            puntos: j.puntos,
            posicion: idx + 1,
            apuestasAcertadas: j.apuestasAcertadas || 0,
            apuestasFalladas: j.apuestasFalladas || 0,
            capturasSkullKing: j.capturasSkullKing || 0,
            capturasSirena: j.capturasSirena || 0,
            capturasMonstruo: j.capturasMonstruo || 0
          });
        });
        guardarListaJugadoresPermanentes();

        localStorage.removeItem('skullking_guardado');
        hayPartidaGuardada.value = false;
        partidaFinalizada.value = true;
        pasoPartida.value = 'resumen';
      }
    };

    const irASiguienteRonda = () => {
      pasoPartida.value = 'apuestas';
      guardarEnCelular();
    };

    const abrirPodioDesdePartida = () => { partidaFinalizada.value = false; mostrarPodio.value = true; };
    const verResultadoFinal = () => { mostrarPodio.value = true; };

    const cerrarPodio = () => {
      mostrarPodio.value = false;
      if (partidaFinalizada.value) pantallaActual.value = 'inicio';
    };

    const volverAlInicioDesdeMenu = () => { menuHamburguesaAbierto.value = false; pantallaActual.value = 'inicio'; };

    const descartarPartidaActual = () => {
      if (confirm('¿Estás seguro de que querés descartar y eliminar la partida actual?')) {
        localStorage.removeItem('skullking_guardado');
        hayPartidaGuardada.value = false;
        menuHamburguesaAbierto.value = false;
        pantallaActual.value = 'inicio';
      }
    };

    const guardarEnCelular = () => {
      localStorage.setItem('skullking_guardado', JSON.stringify({
        jugadores: jugadores.value,
        rondaActual: rondaActual.value,
        configuracionMesa: configuracionMesa.value,
        alianzasBotinRonda: alianzasBotinRonda.value,
        jugadorSeleccionadoIdx: jugadorSeleccionadoIdx.value,
        registroHabilidadesRonda: registroHabilidadesRonda.value,
        cartasPorRondaActivas: cartasPorRondaActivas.value,
        pasoPartida: pasoPartida.value,
        resumenRondaActual: resumenRondaActual.value,
        editandoRondaAnterior: editandoRondaAnterior.value,
        backupRondaActual: backupRondaActual.value
      }));
      hayPartidaGuardada.value = true;
    };

    const eliminarPartidaHistorial = (idx) => {
      historialPartidas.value.splice(idx, 1);
      localStorage.setItem('skullking_historial', JSON.stringify(historialPartidas.value));
    };

    const borrarTodoElHistorial = () => {
      if (confirm('¿Estás seguro de que querés borrar todo el historial de partidas?')) {
        historialPartidas.value = [];
        localStorage.removeItem('skullking_historial');
      }
    };

    watch(
      [jugadores, rondaActual, configuracionMesa, alianzasBotinRonda, jugadorSeleccionadoIdx, registroHabilidadesRonda, pasoPartida],
      () => {
        if (pantallaActual.value === 'partida' && !partidaFinalizada.value) guardarEnCelular();
      },
      { deep: true }
    );

    onMounted(() => {
      jugadoresPermanentes.value = cargarJugadoresPermanentes();

      const guardado = localStorage.getItem('skullking_guardado');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        hayPartidaGuardada.value = true;
        if (parsed.jugadores) jugadores.value = parsed.jugadores;
        if (parsed.rondaActual) rondaActual.value = parsed.rondaActual;
        if (parsed.configuracionMesa) {
          configuracionMesa.value = {
            ...configuracionMesa.value,
            ...parsed.configuracionMesa,
            reglasOpcionales: {
              ...configuracionMesa.value.reglasOpcionales,
              ...(parsed.configuracionMesa.reglasOpcionales || {})
            }
          };
          delete configuracionMesa.value.reglasOpcionales.cartas7y8;
        }
        if (parsed.alianzasBotinRonda) alianzasBotinRonda.value = parsed.alianzasBotinRonda;
        if (parsed.jugadorSeleccionadoIdx !== undefined) jugadorSeleccionadoIdx.value = parsed.jugadorSeleccionadoIdx;
        if (parsed.registroHabilidadesRonda && Array.isArray(parsed.registroHabilidadesRonda)) {
          registroHabilidadesRonda.value = parsed.registroHabilidadesRonda;
        }
        if (parsed.cartasPorRondaActivas && Array.isArray(parsed.cartasPorRondaActivas)) {
          cartasPorRondaActivas.value = parsed.cartasPorRondaActivas;
        } else {
          cartasPorRondaActivas.value = obtenerCartasPorRondaDelModo(
            configuracionMesa.value.modoReparto || 'clasico',
            configuracionMesa.value.cartasPorRonda
          );
        }
        if (parsed.pasoPartida) pasoPartida.value = parsed.pasoPartida;
        if (parsed.resumenRondaActual && Array.isArray(parsed.resumenRondaActual)) {
          resumenRondaActual.value = parsed.resumenRondaActual;
        }
        if (parsed.editandoRondaAnterior !== undefined) editandoRondaAnterior.value = parsed.editandoRondaAnterior;
        if (parsed.backupRondaActual !== undefined) backupRondaActual.value = parsed.backupRondaActual;
      }
      const hist = localStorage.getItem('skullking_historial');
      if (hist) historialPartidas.value = JSON.parse(hist);
    });

    return {
      pantallaActual, pasoPartida,
      hayPartidaGuardada, mostrarPodio, partidaFinalizada, menuHamburguesaAbierto,
      editandoRondaAnterior, puedeModificarRondaAnterior,
      iniciarModificacionRondaAnterior, cancelarModificacionRondaAnterior,
      iniciarTouch, finalizarTouch,
      vistaWiki, acordeonAbierto, terminoBusquedaCarta, inputBusquedaCarta, limpiarBusquedaCarta,
      filtroTipoCarta, categoriasReglas,
      configuracionMesa, MODOS_REPARTO, seleccionarModoReparto, modoRepartoSeleccionado, vistaPreviaCartasPorRonda,
      rondaActual, totalRondas, jugadores, jugadorSeleccionadoIdx, jugadorActual, resumenRondaActual,
      jugadorInicial, jugadorReparte, tablaGeneralOrdenada, historialPartidas,
      alianzasBotinRonda, idxBotinJugadorA, idxBotinJugadorB,
      eventosBaseFiltrados, eventosExpansionFiltrados, catalogoCartasFiltrado,
      limiteBazasAlcanzado, puntajeProyectadoActual, textoBotonAvanzar,
      toggleAcordeon, cambiarModoContenido,
      irANuevaPartida, comenzarPartida,
      agregarAlianzaBotin, eliminarAlianzaBotin,
      cambiarCantidadBono, obtenerCantidadBono, obtenerMaximoDisponible, borrarBonoInmediato, limpiarTodosLosEventos,
      calcularBonoBlancas: calcularBonoComodines,
      guardarJugadorYContinuar, abrirPodioDesdePartida, verResultadoFinal, cerrarPodio, volverAlInicioDesdeMenu,
      descartarPartidaActual, eliminarPartidaHistorial, borrarTodoElHistorial,
      jugadorViendoHistorial, verHistorialJugador, cerrarHistorialJugador,
      jugadoresOrdenados, indiceVisualActual,
      acordeonOpcionalesAbierto, acordeonEventosAbierto, subAcordeonBase, subAcordeonAvanzado, subAcordeonExpansion,
      acordeonHabilidadesAbierto,
      cartasPorJugadorEnRonda, totalGanadasAsignadas,
      cambiarApuesta, avanzarAPasoBazas, maximoGanadasDisponiblesPara, cambiarGanadas, limpiarBazasRonda,
      avanzarAPasoBonos, volverAPasoApuestas, volverAPasoBazas, irASiguienteRonda,
      registroHabilidadesRonda, esHabilidadYaRegistrada, esKongYaRegistradoCon,
      habilidadesBloqueadasPorLimiteMesa,
      habSeleccionada, habJugadorIdx, habHabilidadCopiada, habPuntosBribon,
      registrarHabilidadPirata, aplicarBribonRotan, aplicarHarryGigante,
      aplicarKongCopiaBribon, aplicarKongHarryGigante, eliminarRegistroHabilidad,
      vistaJugadoresHub, nombreNuevoJugadorPermanente, jugadoresPermanentes,
      jugadorPermanenteEnEdicion, jugadorPermanenteViendoStats,
      crearNuevoJugadorPermanente, iniciarEdicionJugadorPermanente, guardarEdicionJugadorPermanente,
      cancelarEdicionJugadorPermanente, eliminarJugadorPermanente,
      idsJugadoresSeleccionados, alternarSeleccionJugador, posicionSeleccion,
      abrirEstadisticasJugador, cerrarEstadisticasJugador,
      calcularPromedioPuntos, calcularPorcentajeAciertos
    };
  }
}).mount('#app');