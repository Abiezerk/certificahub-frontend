import { useState, useEffect } from "react";
import apiClient from "../api/client";
import PremiumBadge from "../components/PremiumBadge";
import InstructorDetailModal from "../components/InstructorDetailModal";
import "../styles/Ranking.css";

const ESTADOS_MEXICO = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Cdmx",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

export default function Ranking() {
  const [instructores, setInstructores] = useState([]);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("todas");
  const [filtroCalificacion, setFiltroCalificacion] = useState("cualquiera");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [ordenadoPor, setOrdenadoPor] = useState("premium");
  const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar instructores
  useEffect(() => {
    const cargarInstructores = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/instructores/marketplace");
        setInstructores(response.data || []);
      } catch (error) {
        console.error("Error cargando instructores:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarInstructores();
  }, []);

  // Cargar especialidades
  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const response = await apiClient.get("/especialidades");
        setEspecialidades(response.data || []);
      } catch (error) {
        console.error("Error cargando especialidades:", error);
      }
    };

    cargarEspecialidades();
  }, []);

  // Filtrar instructores
  const instructoresFiltrados = instructores.filter((instructor) => {
    // Filtro especialidad
    if (filtroEspecialidad !== "todas") {
      const tieneEspecialidad = instructor.especialidades?.some(
        (e) => e.id.toString() === filtroEspecialidad
      );
      if (!tieneEspecialidad) return false;
    }

    // Filtro calificación
    if (filtroCalificacion !== "cualquiera") {
      const rating = parseFloat(instructor.ratingPromedio);
      switch (filtroCalificacion) {
        case "4.5+":
          if (rating < 4.5) return false;
          break;
        case "4.0+":
          if (rating < 4.0) return false;
          break;
        case "3.5+":
          if (rating < 3.5) return false;
          break;
      }
    }

    // Filtro estado
    if (filtroEstado && instructor.estado !== filtroEstado) {
      return false;
    }

    return true;
  });

  // Ordenar instructores
  const instructoresOrdenados = [...instructoresFiltrados].sort((a, b) => {
    // Premium siempre primero
    if (a.esPremium && !b.esPremium) return -1;
    if (!a.esPremium && b.esPremium) return 1;

    switch (ordenadoPor) {
      case "premium":
      case "calificacion":
        return b.ratingPromedio - a.ratingPromedio;
      case "evaluaciones":
        return (b.totalEvaluaciones || 0) - (a.totalEvaluaciones || 0);
      case "efectividad":
        return (b.tasaEvaluacion || 0) - (a.tasaEvaluacion || 0);
      case "cursos":
        return (b.totalCursos || 0) - (a.totalCursos || 0);
      default:
        return 0;
    }
  });

  const abrirDetalle = (instructor) => {
    setInstructorSeleccionado(instructor);
  };

  const cerrarDetalle = () => {
    setInstructorSeleccionado(null);
  };

  return (
    <div className="ranking-container">
      <h1>Ranking de instructores</h1>
      <p className="ranking-description">
        Ordena por cualquier columna para comparar instructores según lo que más te importe.
      </p>

      {/* Filtros */}
      <div className="filtros-grupo">
        <select
          value={filtroEspecialidad}
          onChange={(e) => setFiltroEspecialidad(e.target.value)}
          className="filtro-select"
        >
          <option value="todas">Todas las especialidades</option>
          {especialidades.map((esp) => (
            <option key={esp.id} value={esp.id}>
              {esp.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroCalificacion}
          onChange={(e) => setFiltroCalificacion(e.target.value)}
          className="filtro-select"
        >
          <option value="cualquiera">Cualquier calificación</option>
          <option value="4.5+">4.5+ ⭐</option>
          <option value="4.0+">4.0+ ⭐</option>
          <option value="3.5+">3.5+ ⭐</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_MEXICO.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFiltroEspecialidad("todas");
            setFiltroCalificacion("cualquiera");
            setFiltroEstado("");
          }}
          className="btn-limpiar-filtros"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="loading">Cargando instructores...</p>
      ) : instructoresOrdenados.length === 0 ? (
        <p className="no-resultados">
          No se encontraron instructores con los filtros seleccionados.
        </p>
      ) : (
        <div className="tabla-wrapper">
          <table className="ranking-tabla">
            <thead>
              <tr>
                <th className="col-posicion">#</th>
                <th className="col-instructor">INSTRUCTOR</th>
                <th className="col-estado">ESTADO</th>
                <th
                  className="col-ordenable col-calificacion"
                  onClick={() => setOrdenadoPor("calificacion")}
                  title="Click para ordenar"
                >
                  CALIFICACIÓN
                </th>
                <th
                  className="col-ordenable col-evaluaciones"
                  onClick={() => setOrdenadoPor("evaluaciones")}
                  title="Click para ordenar"
                >
                  <div className="header-split">
                    <span>EVALUACIONES</span>
                    <span>TOTALES</span>
                  </div>
                </th>
                <th
                  className="col-ordenable col-efectividad"
                  onClick={() => setOrdenadoPor("efectividad")}
                  title="Click para ordenar"
                >
                  <div className="header-split">
                    <span>EFECTIVIDAD</span>
                    <span>DE EVALUACIÓN</span>
                  </div>
                </th>
                <th
                  className="col-ordenable col-cursos"
                  onClick={() => setOrdenadoPor("cursos")}
                  title="Click para ordenar"
                >
                  <div className="header-split">
                    <span>CURSOS</span>
                    <span>IMPARTIDOS</span>
                  </div>
                </th>
                <th className="col-accion">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {instructoresOrdenados.map((instructor, index) => (
                <tr key={instructor.id} className={instructor.esPremium ? "fila-premium" : ""}>
                  <td className="col-posicion">{index + 1}</td>
                  <td className="col-instructor">
                    <div className="instructor-simple">
                      <div className="instructor-simple-avatar">
                        {instructor.profilePictureUrl ? (
                          <img src={instructor.profilePictureUrl} alt={instructor.nombreCompleto} />
                        ) : (
                          <span>{instructor.nombreCompleto?.charAt(0) || "?"}</span>
                        )}
                      </div>
                      <span className="instructor-simple-name">{instructor.nombreCompleto}</span>
                      {instructor.esPremium && <PremiumBadge />}
                    </div>
                  </td>
                  <td className="col-estado">{instructor.estado || "—"}</td>
                  <td className="col-calificacion">
                    {instructor.ratingPromedio.toFixed(1)}/5
                  </td>
                  <td className="col-evaluaciones">{instructor.totalEvaluaciones || 0}</td>
                  <td className="col-efectividad">
                    {(instructor.tasaEvaluacion || 0).toFixed(1)}%
                  </td>
                  <td className="col-cursos">{instructor.totalCursos || 0}</td>
                  <td className="col-accion">
                    <button
                      onClick={() => abrirDetalle(instructor)}
                      className="btn-ver-detalle"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle instructor */}
      {instructorSeleccionado && (
        <InstructorDetailModal instructor={instructorSeleccionado} onClose={cerrarDetalle} />
      )}
    </div>
  );
}
