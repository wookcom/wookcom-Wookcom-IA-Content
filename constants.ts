import type { HookCategory, TrainingStep, VideoPlatform } from './types';

export const HOOK_CATEGORIES: HookCategory[] = ['VIDA PERSONAL', 'OPINIÓN', 'EDUCACIONAL'];

export const PLATFORM_DURATIONS: Record<VideoPlatform, number[]> = {
  'Instagram Reels': [15, 30, 60, 90],
  'TikTok': [15, 30, 60, 180], // in seconds
};

export const TRAINING_STEPS: TrainingStep[] = [
  {
    id: 'brandVoice',
    title: 'Tu Voz de Marca',
    questions: [
      { id: 'tone', label: '¿Cómo describirías el tono o personalidad de tu marca?', placeholder: 'Ej: cercana, directa, divertida, profesional, inspiradora' },
      { id: 'phrases', label: '¿Tienes frases o expresiones que usas mucho al escribir?', placeholder: 'Ej: "Vamos al grano", "Absolutamente increíble"' },
      { id: 'examples', label: 'Pega aquí entre 3 y 5 publicaciones, emails o textos que sientas que suenan “muy tú”', placeholder: 'Pega aquí tus textos...', isTextArea: true },
    ],
  },
  {
    id: 'idealClient',
    title: 'Tu Cliente Ideal',
    questions: [
      { id: 'description', label: '¿Quién es tu cliente ideal?', placeholder: 'Ej: edad, profesión, identidad o estilo de vida' },
      { id: 'desire', label: '¿Qué desea lograr o cambiar?', placeholder: 'Ej: Lanzar su negocio, sentirse más segura' },
      { id: 'struggle', label: '¿Con qué está luchando en este momento?', placeholder: 'Ej: Falta de tiempo, no sabe por dónde empezar' },
      { id: 'obstacle', label: '¿Qué le impide lograrlo?', placeholder: 'Ej: Miedo al fracaso, falta de conocimiento técnico' },
      { id: 'limitingBeliefs', label: '¿Qué creencias limitantes suele tener?', placeholder: 'Ej: "No soy lo suficientemente buena", "Es muy tarde para mí"' },
      { id: 'problemSolved', label: '¿Qué problema específico le ayuda a resolver tu producto?', placeholder: 'Ej: Le ayuda a crear un plan de marketing en 30 días' },
    ],
  },
  {
    id: 'products',
    title: 'Tus Productos Digitales',
    questions: [
      { id: 'name', label: '¿Cómo se llama tu producto digital o programa?', placeholder: 'Ej: "Lanzamiento Imparable"' },
      { id: 'includes', label: '¿Qué incluye?', placeholder: 'Ej: módulos, plantillas, clases, bonos, comunidad, etc.', isTextArea: true },
      { id: 'transformation', label: '¿Qué transformación ofrece?', placeholder: '¿Cómo se sentirá o qué logrará después de usarlo?' },
      { id: 'uniqueness', label: '¿Qué lo hace único frente a otras opciones?', placeholder: 'Ej: Mi método personal, el soporte 1 a 1' },
    ],
  },
  {
    id: 'personalStory',
    title: 'Tu Historia Personal',
    questions: [
      { id: 'problem', label: '¿Qué problema tenías tú antes, que ahora ayudas a otras a resolver?', placeholder: 'Ej: Estaba estancada en un trabajo que odiaba' },
      { id: 'turningPoint', label: '¿Cuál fue tu punto de quiebre o decisión que cambió todo?', placeholder: 'Ej: Cuando decidí invertir en un mentor' },
      { id: 'transformation', label: '¿Qué hiciste para transformarte o mejorar esa situación?', placeholder: 'Ej: Aprendí sobre marketing digital y creé mi propio negocio' },
      { id: 'why', label: '¿Por qué decidiste crear este producto para ayudar a otras personas?', placeholder: 'Ej: Porque no quiero que nadie pase por lo que yo pasé' },
    ],
  },
  {
    id: 'results',
    title: 'Resultados y Autoridad',
    questions: [
      { id: 'personalResults', label: '¿Qué resultados personales has logrado tú gracias a lo que enseñas?', placeholder: 'Ej: Facturé 6 cifras en mi primer año' },
      { id: 'clientResults', label: '¿Qué resultados han logrado tus clientas o alumnas?', placeholder: 'Ej: "Una de mis alumnas consiguió sus primeros 5 clientes"' },
      { id: 'authority', label: '¿Qué puntos de autoridad tienes?', placeholder: 'Ej: +100k seguidores, 5 años de experiencia, premios, entrevistas' },
    ],
  },
];