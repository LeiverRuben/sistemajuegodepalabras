"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, ArrowLeft, Mail, Lock, LogOut, User, Database } from "lucide-react"

// Tipos de datos
interface Word {
  complete: string
  incomplete: string
  syllable: string
  image: string
  category: string
}

interface UserData {
  username: string
  password: string
  email: string
  registeredAt: string
  gamesPlayed: number
  bestScore: number
  lastPlayed?: string
  totalTimeSpent?: number
}

interface GameSession {
  date: string
  score: number
  wordsCompleted: number
  gameType: "syllables" | "wordSearch"
}

type GameStatus = "playing" | "correct" | "wrong" | "gameOver" | "completed"
type SyllableCategory = "K" | "R" | "D" | "J" | "G" | "GR" | "DR" | "FR" | "CR" | "TR" | "BR" | "PR" | "ALL"

const isGameStatus = (status: GameStatus, target: GameStatus): boolean => {
  return status === target
}

// Simulación de Capacitor Preferences para desarrollo web
const CapacitorPreferences = {
  async get(options: { key: string }) {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem(`tablet_storage_${options.key}`)
      return { value }
    }
    return { value: null }
  },
  async set(options: { key: string; value: string }) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`tablet_storage_${options.key}`, options.value)
    }
  },
  async remove(options: { key: string }) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`tablet_storage_${options.key}`)
    }
  },
  async keys() {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith("tablet_storage_"))
        .map((key) => key.replace("tablet_storage_", ""))
      return { keys }
    }
    return { keys: [] }
  },
  async clear() {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith("tablet_storage_"))
      keys.forEach((key) => localStorage.removeItem(key))
    }
  },
}

// Datos del juego de sílabas organizados por categorías
const allWords: Word[] = [
  // Palabras con K
  { complete: "KIWI", incomplete: "_WI", syllable: "KI", image: "🥝", category: "K" },
  { complete: "KARATE", incomplete: "_RATE", syllable: "KA", image: "🥋", category: "K" },
  { complete: "KOALA", incomplete: "_ALA", syllable: "KO", image: "🐨", category: "K" },
  { complete: "KILO", incomplete: "_LO", syllable: "KI", image: "⚖️", category: "K" },
  { complete: "KAYAK", incomplete: "_YAK", syllable: "KA", image: "🛶", category: "K" },

  // Palabras con R
  { complete: "RANA", incomplete: "_NA", syllable: "RA", image: "🐸", category: "R" },
  { complete: "REMO", incomplete: "_MO", syllable: "RE", image: "🚣", category: "R" },
  { complete: "RICO", incomplete: "_CO", syllable: "RI", image: "💰", category: "R" },
  { complete: "ROSA", incomplete: "_SA", syllable: "RO", image: "🌹", category: "R" },
  { complete: "RUTA", incomplete: "_TA", syllable: "RU", image: "🗺️", category: "R" },
  { complete: "RADIO", incomplete: "_DIO", syllable: "RA", image: "📻", category: "R" },
  { complete: "RELOJ", incomplete: "_LOJ", syllable: "RE", image: "⏰", category: "R" },

  // Palabras con D
  { complete: "DADO", incomplete: "_DO", syllable: "DA", image: "🎲", category: "D" },
  { complete: "DEDO", incomplete: "_DO", syllable: "DE", image: "👆", category: "D" },
  { complete: "DIENTE", incomplete: "_ENTE", syllable: "DI", image: "🦷", category: "D" },
  { complete: "DONA", incomplete: "_NA", syllable: "DO", image: "🍩", category: "D" },
  { complete: "DUCHA", incomplete: "_CHA", syllable: "DU", image: "🚿", category: "D" },
  { complete: "DINERO", incomplete: "_NERO", syllable: "DI", image: "💵", category: "D" },

  // Palabras con J
  { complete: "JARRA", incomplete: "_RRA", syllable: "JA", image: "🏺", category: "J" },
  { complete: "JEFE", incomplete: "_FE", syllable: "JE", image: "👨‍💼", category: "J" },
  { complete: "JIRAFA", incomplete: "_RAFA", syllable: "JI", image: "🦒", category: "J" },
  { complete: "JOYA", incomplete: "_YA", syllable: "JO", image: "💎", category: "J" },
  { complete: "JUGO", incomplete: "_GO", syllable: "JU", image: "🧃", category: "J" },
  { complete: "JARDIN", incomplete: "_RDIN", syllable: "JA", image: "🌻", category: "J" },

  // Palabras con G
  { complete: "GATO", incomplete: "_TO", syllable: "GA", image: "🐱", category: "G" },
  { complete: "GENTE", incomplete: "_NTE", syllable: "GE", image: "👥", category: "G" },
  { complete: "GIGANTE", incomplete: "_GANTE", syllable: "GI", image: "🏔️", category: "G" },
  { complete: "GOMA", incomplete: "_MA", syllable: "GO", image: "🔴", category: "G" },
  { complete: "GUSANO", incomplete: "_SANO", syllable: "GU", image: "🐛", category: "G" },
  { complete: "GLOBO", incomplete: "_OBO", syllable: "GL", image: "🎈", category: "G" },

  // Palabras con GR
  { complete: "GRANDE", incomplete: "_ANDE", syllable: "GR", image: "📏", category: "GR" },
  { complete: "GRILLO", incomplete: "_ILLO", syllable: "GR", image: "🦗", category: "GR" },
  { complete: "GRUPO", incomplete: "_UPO", syllable: "GR", image: "👥", category: "GR" },
  { complete: "GRANJA", incomplete: "_ANJA", syllable: "GR", image: "🚜", category: "GR" },

  // Palabras con DR
  { complete: "DRAGÓN", incomplete: "_AGÓN", syllable: "DR", image: "🐉", category: "DR" },
  { complete: "DRAMA", incomplete: "_AMA", syllable: "DR", image: "🎭", category: "DR" },
  { complete: "DROGA", incomplete: "_OGA", syllable: "DR", image: "💊", category: "DR" },
  // Palabras con FR (trabadas)
  { complete: "FRUTA", incomplete: "_UTA", syllable: "FR", image: "🍎", category: "FR" },
  { complete: "FRIO", incomplete: "_IO", syllable: "FR", image: "🧊", category: "FR" },
  { complete: "FRESA", incomplete: "_ESA", syllable: "FR", image: "🍓", category: "FR" },
  { complete: "FRENO", incomplete: "_ENO", syllable: "FR", image: "🛑", category: "FR" },

  // Palabras con CR (trabadas)
  { complete: "CRUZ", incomplete: "_UZ", syllable: "CR", image: "✝️", category: "CR" },
  { complete: "CREMA", incomplete: "_EMA", syllable: "CR", image: "🧴", category: "CR" },
  { complete: "CRISTAL", incomplete: "_ISTAL", syllable: "CR", image: "💎", category: "CR" },
  { complete: "CRUDO", incomplete: "_UDO", syllable: "CR", image: "🥩", category: "CR" },

  // Palabras con TR (trabadas)
  { complete: "TREN", incomplete: "_EN", syllable: "TR", image: "🚂", category: "TR" },
  { complete: "TRES", incomplete: "_ES", syllable: "TR", image: "3️⃣", category: "TR" },
  { complete: "TRIGO", incomplete: "_IGO", syllable: "TR", image: "🌾", category: "TR" },
  { complete: "TRUENO", incomplete: "_UENO", syllable: "TR", image: "⚡", category: "TR" },

  // Palabras con BR (trabadas)
  { complete: "BRAZO", incomplete: "_AZO", syllable: "BR", image: "💪", category: "BR" },
  { complete: "BRUJA", incomplete: "_UJA", syllable: "BR", image: "🧙‍♀️", category: "BR" },
  { complete: "BRILLO", incomplete: "_ILLO", syllable: "BR", image: "✨", category: "BR" },
  { complete: "BRAVO", incomplete: "_AVO", syllable: "BR", image: "👏", category: "BR" },

  // Palabras con PR (trabadas)
  { complete: "PRIMO", incomplete: "_IMO", syllable: "PR", image: "👦", category: "PR" },
  { complete: "PRECIO", incomplete: "_ECIO", syllable: "PR", image: "💰", category: "PR" },
  { complete: "PRISA", incomplete: "_ISA", syllable: "PR", image: "🏃", category: "PR" },
  { complete: "PROBLEMA", incomplete: "_OBLEMA", syllable: "PR", image: "❓", category: "PR" },
]

// 20 palabras para la sopa de letras con sílabas trabadas
const wordSearchWords = [
  "PLATO",
  "BLANCO",
  "CLASE",
  "FLOR",
  "GLOBO",
  "BRAZO",
  "DRAGON",
  "FRUTA",
  "TREN",
  "CRUZ",
  "PRIMO",
  "BRUJA",
  "FRIO",
  "TRES",
  "CREMA",
  "PLUMA",
  "BLUSA",
  "CLAVO",
  "FLACO",
  "GRILLO",
]

const wordSearchIcons: { [key: string]: string } = {
  PLATO: "🍽️",
  BLANCO: "⚪",
  CLASE: "🏫",
  FLOR: "🌸",
  GLOBO: "🎈",
  BRAZO: "💪",
  DRAGON: "🐉",
  FRUTA: "🍎",
  TREN: "🚂",
  CRUZ: "✝️",
  PRIMO: "👦",
  BRUJA: "🧙‍♀️",
  FRIO: "🧊",
  TRES: "3️⃣",
  CREMA: "🧴",
  PLUMA: "🪶",
  BLUSA: "👕",
  CLAVO: "🔨",
  FLACO: "🧍‍♂️",
  GRILLO: "🦗",
}

// Cuadrícula de sopa de letras 20x20 con las 20 palabras únicas en horizontal, vertical y diagonal
const wordSearchGrid = [
  ["P", "L", "A", "T", "O", "M", "Q", "Z", "K", "L", "H", "N", "L", "X", "Y", "D", "F", "A", "C", "E"],
  ["B", "X", "F", "H", "N", "R", "S", "T", "V", "I", "A", "L", "U", "M", "A", "O", "R", "E", "A", "G"],
  ["L", "A", "N", "C", "O", "L", "O", "Y", "A", "W", "G", "R", "A", "Z", "O", "R", "S", "A", "F", "T"],
  ["A", "M", "Q", "W", "D", "A", "D", "O", "P", "I", "U", "F", "R", "I", "O", "L", "C", "D", "G", "R"],
  ["N", "F", "H", "B", "O", "K", "L", "M", "N", "C", "T", "Q", "U", "U", "M", "A", "N", "M", "E", "A"],
  ["C", "L", "A", "S", "E", "E", "W", "E", "R", "X", "Y", "U", "T", "S", "G", "A", "A", "T", "N", "M"],
  ["O", "L", "O", "R", "A", "G", "G", "H", "E", "Z", "I", "O", "P", "A", "H", "G", "L", "O", "B", "O"],
  ["F", "O", "C", "D", "K", "P", "Q", "T", "M", "Y", "T", "R", "E", "N", "E", "W", "U", "Q", "H", "I"],
  ["L", "R", "J", "L", "D", "U", "N", "A", "O", "V", "W", "X", "C", "E", "S", "S", "H", "D", "J", "K"],
  ["O", "Q", "R", "S", "T", "E", "V", "W", "X", "Z", "A", "C", "S", "R", "U", "M", "I", "C", "A", "R"],
  ["R", "B", "R", "A", "Z", "O", "P", "M", "L", "K", "S", "D", "R", "E", "W", "Q", "X", "A", "S", "P"],
  ["G", "L", "O", "B", "O", "T", "R", "E", "N", "F", "R", "U", "T", "A", "T", "I", "Y", "L", "B", "O"],
  ["D", "R", "A", "G", "O", "N", "T", "R", "E", "S", "D", "E", "F", "U", "E", "R", "A", "U", "Y", "N"],
  ["P", "R", "I", "M", "O", "B", "R", "U", "J", "A", "F", "E", "S", "N", "X", "A", "S", "A", "Z", "Ñ"],
  ["C", "R", "E", "M", "A", "P", "L", "U", "M", "A", "T", "H", "R", "E", "H", "I", "O", "N", "B", "O"],
  ["B", "L", "U", "S", "A", "I", "J", "X", "K", "W", "T", "D", "T", "R", "U", "N", "K", "G", "U", "G"],
  ["C", "L", "A", "V", "O", "B", "R", "I", "L", "L", "O", "C", "W", "E", "T", "Y", "U", "S", "E", "T"],
  ["F", "L", "A", "C", "O", "L", "Q", "B", "F", "H", "J", "K", "L", "Ñ", "Z", "X", "C", "V", "B", "N"],
  ["M", "P", "O", "I", "U", "Y", "T", "R", "E", "W", "Q", "A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["G", "R", "I", "L", "L", "O", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ", "Z", "X", "C", "V", "Z", "L", "K", "K", "J"]
];


// Posiciones de las palabras en la cuadrícula (para referencia)
const wordPositions = {
  // Horizontales (10)
  PLATO: { start: [0, 0], end: [0, 4], direction: "horizontal" },
  BLANCO: { start: [1, 1], end: [1, 6], direction: "horizontal" },
  BRAZO: { start: [2, 10], end: [2, 14], direction: "horizontal" },
  FRIO: { start: [3, 11], end: [3, 14], direction: "horizontal" },
  CLASE: { start: [5, 0], end: [5, 4], direction: "horizontal" },
  GLOBO: { start: [6, 15], end: [6, 19], direction: "horizontal" },
  TREN: { start: [7, 11], end: [7, 14], direction: "horizontal" },
  FRUTA: { start: [11, 11], end: [11, 15], direction: "horizontal" },
  TRES: { start: [12, 7], end: [12, 10], direction: "horizontal" },
  PRIMO: { start: [13, 0], end: [13, 4], direction: "horizontal" },

  // Verticales (5)
  BLUSA: { start: [14, 0], end: [18, 0], direction: "vertical" },
  CREMA: { start: [14, 1], end: [18, 1], direction: "vertical" },
  PLUMA: { start: [14, 6], end: [18, 6], direction: "vertical" },
  CLAVO: { start: [16, 0], end: [16, 4], direction: "horizontal" },
  FLACO: { start: [17, 0], end: [17, 4], direction: "horizontal" },

  // Diagonales (5)
  BRUJA: { start: [13, 5], end: [17, 9], direction: "diagonal-down-right" },
  DRAGON: { start: [12, 1], end: [7, 6], direction: "diagonal-up-left" },
  PLUMA_ALT: { start: [14, 5], end: [14, 9], direction: "horizontal" },
  GLOBO_ALT: { start: [6, 1], end: [10, 5], direction: "diagonal-down-right" },
  GRILLO: { start: [19, 0], end: [19, 5], direction: "horizontal" }
};



export default function SistemaEducativo() {
  // Estados principales
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "register" | "menu" | "syllableGame" | "syllableSelection" | "wordSearch" | "storage"
  >("login")
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [gameSessions, setGameSessions] = useState<GameSession[]>([])
  const [storageInfo, setStorageInfo] = useState<any>(null)

  // Estados del formulario
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Estados del juego de sílabas
  const [selectedCategory, setSelectedCategory] = useState<SyllableCategory>("ALL")
  const [filteredWords, setFilteredWords] = useState<Word[]>(allWords)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [selectedSyllable, setSelectedSyllable] = useState("")
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // Cambiado a 120 segundos
  const [gameStarted, setGameStarted] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  // Estados de la sopa de letras
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [wordSearchScore, setWordSearchScore] = useState(0)
  const [wordSearchStarted, setWordSearchStarted] = useState(false)
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [currentSelection, setCurrentSelection] = useState("")
  const [wordSearchLives, setWordSearchLives] = useState(3)
  const [wordSearchStreak, setWordSearchStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [foundWordCells, setFoundWordCells] = useState<string[]>([])

  const currentWord = filteredWords[currentWordIndex]
  const progress = filteredWords.length > 0 ? ((currentWordIndex + 1) / filteredWords.length) * 100 : 0

  // Filtrar palabras por categoría
  useEffect(() => {
    if (selectedCategory === "ALL") {
      setFilteredWords(allWords)
    } else {
      setFilteredWords(allWords.filter((word) => word.category === selectedCategory))
    }
    setCurrentWordIndex(0)
  }, [selectedCategory])

  // Generar opciones para el juego de sílabas
  useEffect(() => {
    if (currentWord) {
      const correctSyllable = currentWord.syllable
      const allSyllables = Array.from(new Set(allWords.map((w) => w.syllable)))
      const wrongOptions = allSyllables
        .filter((s) => s !== correctSyllable)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      const allOptions = [correctSyllable, ...wrongOptions].sort(() => Math.random() - 0.5)
      setOptions(allOptions)
    }
  }, [currentWord])

  // 🗄️ FUNCIONES DE ALMACENAMIENTO LOCAL NATIVO
  const loadUsersFromStorage = async () => {
    try {
      const result = await CapacitorPreferences.get({ key: "users_data" })
      if (result.value) {
        const loadedUsers = JSON.parse(result.value)
        setUsers(loadedUsers)
        console.log("✅ Usuarios cargados desde almacenamiento nativo:", loadedUsers.length)
      }
    } catch (error) {
      console.error("❌ Error cargando usuarios:", error)
    }
  }

  const saveUsersToStorage = async (usersData: UserData[]) => {
    try {
      await CapacitorPreferences.set({
        key: "users_data",
        value: JSON.stringify(usersData),
      })
      console.log("✅ Usuarios guardados en almacenamiento nativo:", usersData.length)
    } catch (error) {
      console.error("❌ Error guardando usuarios:", error)
    }
  }

  const loadCurrentUserFromStorage = async () => {
    try {
      const result = await CapacitorPreferences.get({ key: "current_user" })
      if (result.value) {
        const userData = JSON.parse(result.value)
        setCurrentUser(userData)
        setCurrentScreen("menu")
        console.log("✅ Usuario actual cargado:", userData.username)
      }
    } catch (error) {
      console.error("❌ Error cargando usuario actual:", error)
    }
  }

  const saveCurrentUserToStorage = async (userData: UserData) => {
    try {
      await CapacitorPreferences.set({
        key: "current_user",
        value: JSON.stringify(userData),
      })
      console.log("✅ Usuario actual guardado:", userData.username)
    } catch (error) {
      console.error("❌ Error guardando usuario actual:", error)
    }
  }

  const loadGameSessionsFromStorage = async () => {
    try {
      const result = await CapacitorPreferences.get({ key: "game_sessions" })
      if (result.value) {
        const sessions = JSON.parse(result.value)
        setGameSessions(sessions)
        console.log("✅ Sesiones de juego cargadas:", sessions.length)
      }
    } catch (error) {
      console.error("❌ Error cargando sesiones:", error)
    }
  }

  const saveGameSessionToStorage = async (session: GameSession) => {
    try {
      const currentSessions = [...gameSessions, session]
      setGameSessions(currentSessions)
      await CapacitorPreferences.set({
        key: "game_sessions",
        value: JSON.stringify(currentSessions),
      })
      console.log("✅ Sesión de juego guardada:", session)
    } catch (error) {
      console.error("❌ Error guardando sesión:", error)
    }
  }

  const getStorageInfo = async () => {
    try {
      const keysResult = await CapacitorPreferences.keys()
      const storageData: any = {}
      for (const key of keysResult.keys) {
        const result = await CapacitorPreferences.get({ key })
        if (result.value) {
          try {
            storageData[key] = JSON.parse(result.value)
          } catch {
            storageData[key] = result.value
          }
        }
      }
      setStorageInfo({
        totalKeys: keysResult.keys.length,
        keys: keysResult.keys,
        data: storageData,
        lastUpdated: new Date().toLocaleString(),
      })
      console.log("📊 Información de almacenamiento:", storageData)
    } catch (error) {
      console.error("❌ Error obteniendo info de almacenamiento:", error)
    }
  }

  const clearAllStorage = async () => {
    if (confirm("⚠️ ¿Estás seguro? Esto eliminará TODOS los datos guardados en la tablet.")) {
      try {
        await CapacitorPreferences.clear()
        setUsers([])
        setCurrentUser(null)
        setGameSessions([])
        setStorageInfo(null)
        setCurrentScreen("login")
        alert("✅ Almacenamiento limpiado completamente")
        console.log("🗑️ Almacenamiento limpiado")
      } catch (error) {
        console.error("❌ Error limpiando almacenamiento:", error)
      }
    }
  }

  // Cargar datos al iniciar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 Inicializando aplicación...")
      await loadUsersFromStorage()
      await loadCurrentUserFromStorage()
      await loadGameSessionsFromStorage()
      await getStorageInfo()
    }
    initializeApp()
  }, [])

  // Timer del juego - CAMBIAR LÓGICA
  useEffect(() => {
    if (gameStarted && gameStatus === "playing" && timeLeft > 0 && currentScreen === "syllableGame") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing" && currentScreen === "syllableGame") {
      // TIEMPO AGOTADO - TERMINAR INMEDIATAMENTE
      setGameStatus("gameOver")
      saveGameStats()
      speakWord("Tiempo agotado")
    }
  }, [timeLeft, gameStatus, gameStarted, currentScreen])

  // Funciones del juego de sílabas
  const handleSyllableSelect = (syllable: string) => {
    if (gameStatus !== "playing") return
    setSelectedSyllable(syllable)

    // Crear la palabra completa reemplazando el guión bajo
    const completedWord = currentWord.incomplete.replace("_", syllable)

    if (syllable === currentWord.syllable) {
      setGameStatus("correct")
      setScore(score + 10 + streak * 2)
      setStreak(streak + 1)
      speakWord("¡Correcto!")
      setTimeout(() => {
        if (currentWordIndex < filteredWords.length - 1) {
          nextWord()
        } else {
          setGameStatus("completed")
          saveGameStats()
        }
      }, 2000)
    } else {
      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)

      if (newLives <= 0) {
        // SIN VIDAS - TERMINAR INMEDIATAMENTE
        setGameStatus("gameOver")
        saveGameStats()
        speakWord("Juego terminado")
      } else {
        setGameStatus("wrong")
        speakWord("Inténtalo de nuevo")
        setTimeout(() => {
          setGameStatus("playing")
          setSelectedSyllable("")
        }, 2000)
      }
    }
  }

  const nextWord = () => {
    setCurrentWordIndex(currentWordIndex + 1)
    setSelectedSyllable("")
    setGameStatus("playing")
    // NO resetear timeLeft - mantener el timer global
  }

  const saveGameStats = async () => {
    if (currentUser) {
      const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000)
      const updatedUser = {
        ...currentUser,
        gamesPlayed: currentUser.gamesPlayed + 1,
        bestScore: Math.max(currentUser.bestScore, score),
        lastPlayed: new Date().toISOString(),
        totalTimeSpent: (currentUser.totalTimeSpent || 0) + timeSpent,
      }
      const updatedUsers = users.map((u) => (u.username === currentUser.username ? updatedUser : u))
      setUsers(updatedUsers)
      setCurrentUser(updatedUser)

      await saveUsersToStorage(updatedUsers)
      await saveCurrentUserToStorage(updatedUser)

      const gameSession: GameSession = {
        date: new Date().toISOString(),
        score,
        wordsCompleted: gameStatus === "completed" ? filteredWords.length : currentWordIndex,
        gameType: "syllables",
      }
      await saveGameSessionToStorage(gameSession)
      console.log("💾 Estadísticas guardadas en tablet")
    }
  }

  const restartSyllableGame = () => {
    setCurrentWordIndex(0)
    setScore(0)
    setLives(3)
    setSelectedSyllable("")
    setGameStatus("playing")
    setStreak(0)
    setTimeLeft(120) // Timer global de 120 segundos
    setGameStarted(true)
    setGameStartTime(Date.now())
  }

  const startSyllableGame = () => {
    setGameStarted(true)
    setGameStatus("playing")
    setTimeLeft(120) // Timer global de 120 segundos
    setGameStartTime(Date.now())
    setCurrentScreen("syllableGame")
  }

  const speakWord = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-ES"
      utterance.rate = 0.8
      utterance.pitch = 1.2
      speechSynthesis.speak(utterance)
    }
  }

  // Función para verificar si las celdas seleccionadas forman una línea válida
  const isValidSelection = (cells: string[]): boolean => {
    if (cells.length < 2) return true

    const positions = cells.map((cell) => {
      const [row, col] = cell.split("-").map(Number)
      return { row, col }
    })

    // Verificar si es horizontal
    const isHorizontal = positions.every((pos) => pos.row === positions[0].row)
    if (isHorizontal) {
      // Verificar que las columnas sean consecutivas
      const cols = positions.map((pos) => pos.col).sort((a, b) => a - b)
      return cols.every((col, index) => index === 0 || col === cols[index - 1] + 1)
    }

    // Verificar si es vertical
    const isVertical = positions.every((pos) => pos.col === positions[0].col)
    if (isVertical) {
      // Verificar que las filas sean consecutivas
      const rows = positions.map((pos) => pos.row).sort((a, b) => a - b)
      return rows.every((row, index) => index === 0 || row === rows[index - 1] + 1)
    }

    // Verificar si es diagonal
    const rowDiff = positions[1].row - positions[0].row
    const colDiff = positions[1].col - positions[0].col

    // Debe ser diagonal (diferencia absoluta de filas = diferencia absoluta de columnas)
    if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false

    // Verificar que todas las posiciones sigan el mismo patrón diagonal
    return positions.every((pos, index) => {
      if (index === 0) return true
      const expectedRow = positions[0].row + (rowDiff > 0 ? index : -index)
      const expectedCol = positions[0].col + (colDiff > 0 ? index : -index)
      return pos.row === expectedRow && pos.col === expectedCol
    })
  }

  // Funciones de la sopa de letras
  const handleCellClick = (row: number, col: number) => {
    const cellId = `${row}-${col}`

    if (selectedCells.includes(cellId)) {
      // Si la celda ya está seleccionada, limpiar selección
      setSelectedCells([])
      setCurrentSelection("")
    } else if (selectedCells.length === 0) {
      // Primera celda seleccionada
      setSelectedCells([cellId])
      setCurrentSelection(wordSearchGrid[row][col])
    } else {
      // Agregar celda a la selección
      const newSelection = [...selectedCells, cellId]

      // Verificar si la selección forma una línea válida
      if (isValidSelection(newSelection)) {
        setSelectedCells(newSelection)
        const word = newSelection
          .map((id) => {
            const [r, c] = id.split("-").map(Number)
            return wordSearchGrid[r][c]
          })
          .join("")
        setCurrentSelection(word)
      } else {
        // Si no es válida, empezar nueva selección desde esta celda
        setSelectedCells([cellId])
        setCurrentSelection(wordSearchGrid[row][col])
      }
    }
  }

  const checkWord = () => {
    if (currentSelection.length < 3) return

    setAttempts(attempts + 1)

    // Verificar también la palabra al revés
    const reversedSelection = currentSelection.split("").reverse().join("")

    if (
      (wordSearchWords.includes(currentSelection) || wordSearchWords.includes(reversedSelection)) &&
      !foundWords.includes(currentSelection) &&
      !foundWords.includes(reversedSelection)
    ) {
      // Palabra encontrada
      const foundWord = wordSearchWords.includes(currentSelection) ? currentSelection : reversedSelection
      setFoundWords([...foundWords, foundWord])
      setFoundWordCells([...foundWordCells, ...selectedCells])
      setWordSearchScore(wordSearchScore + 15 + wordSearchStreak * 5)
      setWordSearchStreak(wordSearchStreak + 1)

      // Agregar animación a las celdas encontradas
      selectedCells.forEach((cellId) => {
        const cell = document.querySelector(`[data-cell-id="${cellId}"]`)
        if (cell) {
          cell.classList.add("animate-pulse-success")
          setTimeout(() => {
            cell.classList.remove("animate-pulse-success")
          }, 1000)
        }
      })

      setSelectedCells([])
      setCurrentSelection("")
      speakWord(`¡Encontraste ${foundWord}!`)

      // Verificar si se completó el juego
      if (foundWords.length + 1 === wordSearchWords.length) {
        setTimeout(() => {
          alert("🎉 ¡Felicitaciones! ¡Encontraste todas las palabras!")
          saveWordSearchStats()
        }, 500)
      }
    } else {
      // Palabra incorrecta - agregar animación de error
      const gridContainer = document.querySelector(".word-search-grid")
      if (gridContainer) {
        gridContainer.classList.add("animate-shake")
        setTimeout(() => {
          gridContainer.classList.remove("animate-shake")
        }, 600)
      }

      setWordSearchLives(wordSearchLives - 1)
      setWordSearchStreak(0)
      setSelectedCells([])
      setCurrentSelection("")
      speakWord("Inténtalo de nuevo")

      if (wordSearchLives - 1 <= 0) {
        setTimeout(() => {
          alert("😔 Se acabaron las vidas. ¡Inténtalo de nuevo!")
          resetWordSearch()
        }, 500)
      }
    }
  }

  const saveWordSearchStats = async () => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        gamesPlayed: currentUser.gamesPlayed + 1,
        bestScore: Math.max(currentUser.bestScore, wordSearchScore),
        lastPlayed: new Date().toISOString(),
      }
      const updatedUsers = users.map((u) => (u.username === currentUser.username ? updatedUser : u))
      setUsers(updatedUsers)
      setCurrentUser(updatedUser)

      await saveUsersToStorage(updatedUsers)
      await saveCurrentUserToStorage(updatedUser)

      const gameSession: GameSession = {
        date: new Date().toISOString(),
        score: wordSearchScore,
        wordsCompleted: foundWords.length,
        gameType: "wordSearch",
      }
      await saveGameSessionToStorage(gameSession)
    }
  }

  const resetWordSearch = () => {
    setFoundWords([])
    setWordSearchScore(0)
    setSelectedCells([])
    setCurrentSelection("")
    setWordSearchLives(3)
    setWordSearchStreak(0)
    setAttempts(0)
    setFoundWordCells([])
  }

  const handleLogin = async () => {
    const user = users.find((u) => u.username === loginForm.username && u.password === loginForm.password)
    if (user) {
      setCurrentUser(user)
      await saveCurrentUserToStorage(user)
      setCurrentScreen("menu")
    } else {
      alert("Usuario o contraseña incorrectos")
    }
  }

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    if (users.find((u) => u.username === registerForm.username)) {
      alert("Este usuario ya existe")
      return
    }
    const newUser: UserData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      registeredAt: new Date().toISOString(),
      gamesPlayed: 0,
      bestScore: 0,
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    await saveUsersToStorage(updatedUsers)
    alert("Usuario registrado con éxito")
    setCurrentScreen("login")
  }

  const handleLogout = async () => {
    setCurrentUser(null)
    await CapacitorPreferences.remove({ key: "current_user" })
    setCurrentScreen("login")
  }

  // Pantalla de información de almacenamiento
  if (currentScreen === "storage") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-700">
                <Database className="w-6 h-6 text-gray-600" />💾 Almacenamiento Local
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">{users.length}</div>
                  <div className="text-gray-600 font-medium">👥 Usuarios</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">{gameSessions.length}</div>
                  <div className="text-gray-600 font-medium">🎮 Sesiones</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">{storageInfo?.totalKeys || 0}</div>
                  <div className="text-gray-600 font-medium">🗄️ Datos</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-bold mb-3 text-gray-700">👥 Usuarios registrados</h3>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                      <div>
                        <div className="font-medium text-gray-700">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>🏆 {user.bestScore} puntos</div>
                        <div>🎮 {user.gamesPlayed} juegos</div>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-gray-500 text-center py-4">No hay usuarios registrados</p>}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={getStorageInfo} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2">
                  🔄 Actualizar
                </Button>
                <Button onClick={clearAllStorage} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2">
                  🗑️ Limpiar
                </Button>
                <Button
                  onClick={() => setCurrentScreen("menu")}
                  variant="outline"
                  className="px-4 py-2 border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Pantalla de Login
  if (currentScreen === "login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border border-gray-200">
          <CardHeader className="text-center space-y-3 bg-white border-b border-gray-100">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-700">🔑 Iniciar Sesión</CardTitle>
            <p className="text-gray-600">Sistema Educativo</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-700 font-medium">💾 Datos guardados localmente</p>
              <p className="text-xs text-gray-600">{users.length} usuarios registrados</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 bg-white">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                Usuario
              </label>
              <input
                type="text"
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                placeholder="Tu nombre de usuario"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <input
                type="password"
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                placeholder="Tu contraseña"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 text-lg transition-all"
            >
              🚀 Entrar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentScreen("register")}
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-2 text-base"
            >
              ¿No tienes cuenta? Regístrate aquí
            </Button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-sm text-yellow-800 font-medium">💡 Credenciales de prueba:</p>
              <p className="text-sm text-yellow-700 mb-2">
                Usuario: <strong>tablet</strong> | Contraseña: <strong>1234</strong>
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-sm border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent"
                onClick={async () => {
                  if (!users.find((u) => u.username === "tablet")) {
                    const tabletUser: UserData = {
                      username: "tablet",
                      email: "tablet@educativo.com",
                      password: "1234",
                      registeredAt: new Date().toISOString(),
                      gamesPlayed: 3,
                      bestScore: 120,
                      lastPlayed: new Date().toISOString(),
                      totalTimeSpent: 300,
                    }
                    const updatedUsers = [...users, tabletUser]
                    setUsers(updatedUsers)
                    await saveUsersToStorage(updatedUsers)
                  }
                  setLoginForm({ username: "tablet", password: "1234" })
                }}
              >
                Crear usuario de prueba
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentScreen("storage")}
              className="w-full flex items-center justify-center gap-2 text-sm border-gray-300"
            >
              <Database className="w-4 h-4" />
              Ver Almacenamiento
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pantalla de Registro
  if (currentScreen === "register") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border border-gray-200">
          <CardHeader className="text-center space-y-3 bg-white border-b border-gray-100">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-700">📚 Crear Cuenta</CardTitle>
            <p className="text-gray-600">Se guardará localmente</p>
          </CardHeader>
          <CardContent className="space-y-4 p-6 bg-white">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                placeholder="Ingresa tu nombre de usuario"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                placeholder="tu@email.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <input
                type="password"
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                placeholder="Mínimo 4 caracteres"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4" />
                Confirmar Contraseña
              </label>
              <input
                type="password"
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                placeholder="Repite tu contraseña"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              />
            </div>
            <Button
              onClick={handleRegister}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 text-lg transition-all"
            >
              ✨ Crear Cuenta
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentScreen("login")}
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-2 text-base"
            >
              ¿Ya tienes cuenta? Inicia Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Menú Principal
  if (currentScreen === "menu") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardContent className="p-6 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-700">¡Hola {currentUser?.username}! 👋</h1>
                    <p className="text-lg text-gray-600">Datos guardados localmente 💾</p>
                    <p className="text-sm text-gray-500">
                      Última vez:{" "}
                      {currentUser?.lastPlayed ? new Date(currentUser.lastPlayed).toLocaleString() : "Primera vez"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentScreen("storage")}
                    className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2"
                  >
                    <Database className="w-4 h-4" />
                    Ver Datos
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLogout}
                    className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-700 mb-3">🎮 Centro de Actividades</h2>
            <p className="text-xl text-gray-600">Aprende jugando</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-gray-400 border border-gray-200"
              onClick={() => {
                setCurrentScreen("syllableSelection")
                setScore(0)
                setLives(3)
                setSelectedSyllable("")
                setGameStatus("playing")
                setStreak(0)
                setTimeLeft(60)
                setGameStarted(false)
              }}
            >
              <CardContent className="p-8 text-center bg-white">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-3xl font-bold text-gray-700 mb-4">Juego de Sílabas</h3>
                <p className="text-gray-600 mb-4 text-lg">Completa las palabras con las sílabas correctas</p>
                <p className="text-base text-gray-500 mb-6">K, R, D, J, G + combinadas • {allWords.length} palabras</p>
                <div className="flex justify-center gap-3 mb-4">
                  <Badge className="bg-gray-100 text-gray-700 text-base px-3 py-1">✅ Disponible</Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-base px-3 py-1">💾 Local</Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-base text-gray-700 font-medium">🏆 Progreso guardado automáticamente</p>
                  <p className="text-sm text-gray-600 mt-1">⏰ 120 segundos por palabra</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-gray-400 border border-gray-200"
              onClick={() => {
                setCurrentScreen("wordSearch")
                setWordSearchStarted(false)
                resetWordSearch()
              }}
            >
              <CardContent className="p-8 text-center bg-white">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold text-gray-700 mb-4">Sopa de Letras</h3>
                <p className="text-gray-600 mb-4 text-lg">Encuentra palabras ocultas en la cuadrícula</p>
                <p className="text-base text-gray-500 mb-6">
                  {wordSearchWords.length} palabras trabadas • Cuadrícula 20x20
                </p>
                <div className="flex justify-center gap-3 mb-4">
                  <Badge className="bg-gray-100 text-gray-700 text-base px-3 py-1">✅ Disponible</Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-base px-3 py-1">💾 Local</Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-base text-gray-700 font-medium">🧠 Horizontal, Vertical y Diagonal</p>
                  <p className="text-sm text-gray-600 mt-1">❤️ 3 vidas • 🔥 +15 puntos por palabra</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-700">
                <Trophy className="w-6 h-6 text-gray-600" />📊 Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-4xl font-bold text-gray-700 mb-3">{currentUser?.gamesPlayed || 0}</div>
                  <div className="text-base text-gray-600 font-medium">🏆 Juegos Completados</div>
                  <div className="text-sm text-gray-500 mt-1">Guardado localmente</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-4xl font-bold text-gray-700 mb-3">{currentUser?.bestScore || 0}</div>
                  <div className="text-base text-gray-600 font-medium">⭐ Mejor Puntuación</div>
                  <div className="text-sm text-gray-500 mt-1">Récord personal</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-4xl font-bold text-gray-700 mb-3">
                    {Math.floor((currentUser?.totalTimeSpent || 0) / 60)}
                  </div>
                  <div className="text-base text-gray-600 font-medium">⏱️ Minutos Jugados</div>
                  <div className="text-sm text-gray-500 mt-1">Tiempo total</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-4xl font-bold text-gray-700 mb-3">{gameSessions.length}</div>
                  <div className="text-base text-gray-600 font-medium">📱 Sesiones</div>
                  <div className="text-sm text-gray-500 mt-1">Historial completo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Pantalla de Selección de Categoría para Juego de Sílabas
  if (currentScreen === "syllableSelection") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-white border-b border-gray-100 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <CardTitle className="text-3xl font-bold text-gray-700 mb-2">Selecciona tu Categoría</CardTitle>
              <p className="text-lg text-gray-600">¿Con qué sílabas quieres practicar?</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <p className="text-xl text-blue-800 font-medium">¡Hola {currentUser?.username}! 👋</p>
                <p className="text-base text-blue-600">Elige una categoría para comenzar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Categorías individuales */}
                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "K" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("K")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🥝</div>
                    <h3 className="font-bold text-gray-700">Sílabas con K</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "K").length} palabras
                    </p>
                    {selectedCategory === "K" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "R" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("R")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🐸</div>
                    <h3 className="font-bold text-gray-700">Sílabas con R</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "R").length} palabras
                    </p>
                    {selectedCategory === "R" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "D" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("D")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🎲</div>
                    <h3 className="font-bold text-gray-700">Sílabas con D</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "D").length} palabras
                    </p>
                    {selectedCategory === "D" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "J" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("J")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">💎</div>
                    <h3 className="font-bold text-gray-700">Sílabas con J</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "J").length} palabras
                    </p>
                    {selectedCategory === "J" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "G" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("G")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🐱</div>
                    <h3 className="font-bold text-gray-700">Sílabas con G</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "G").length} palabras
                    </p>
                    {selectedCategory === "G" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "GR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("GR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">📏</div>
                    <h3 className="font-bold text-gray-700">Sílabas con GR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "GR").length} palabras
                    </p>
                    {selectedCategory === "GR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "DR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("DR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🐉</div>
                    <h3 className="font-bold text-gray-700">Sílabas con DR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "DR").length} palabras
                    </p>
                    {selectedCategory === "DR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "FR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("FR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🍓</div>
                    <h3 className="font-bold text-gray-700">Sílabas con FR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "FR").length} palabras
                    </p>
                    {selectedCategory === "FR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "CR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("CR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">✝️</div>
                    <h3 className="font-bold text-gray-700">Sílabas con CR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "CR").length} palabras
                    </p>
                    {selectedCategory === "CR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "TR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("TR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🚂</div>
                    <h3 className="font-bold text-gray-700">Sílabas con TR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "TR").length} palabras
                    </p>
                    {selectedCategory === "TR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "BR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("BR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">💪</div>
                    <h3 className="font-bold text-gray-700">Sílabas con BR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "BR").length} palabras
                    </p>
                    {selectedCategory === "BR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>

                <Card
                  className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedCategory === "PR" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory("PR")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">👦</div>
                    <h3 className="font-bold text-gray-700">Sílabas con PR</h3>
                    <p className="text-sm text-blue-600">
                      {allWords.filter((w) => w.category === "PR").length} palabras
                    </p>
                    {selectedCategory === "PR" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                  </CardContent>
                </Card>
              </div>

              {/* Opción "Todas las Sílabas" destacada */}
              <Card
                className={`hover:shadow-lg transition-all cursor-pointer border-4 ${
                  selectedCategory === "ALL" ? "border-yellow-500 bg-yellow-100" : "border-yellow-300 bg-yellow-50"
                }`}
                onClick={() => setSelectedCategory("ALL")}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-3">☀️</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Todas las Sílabas</h3>
                  <p className="text-lg text-blue-600 font-medium">{allWords.length} palabras</p>
                  {selectedCategory === "ALL" && <Badge className="mt-2 bg-blue-500 text-white">Seleccionado</Badge>}
                </CardContent>
              </Card>

              {/* Preview de palabras para la categoría seleccionada */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-center text-lg font-medium text-gray-700 mb-3">
                  🎯 Palabras en "
                  {selectedCategory === "ALL" ? "Todas las Categorías" : `Sílabas con ${selectedCategory}`}":
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {filteredWords.slice(0, 8).map((word, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {word.image} {word.complete}
                    </Badge>
                  ))}
                  {filteredWords.length > 8 && (
                    <Badge variant="outline" className="text-sm">
                      +{filteredWords.length - 8} más...
                    </Badge>
                  )}
                </div>
              </div>

              {/* Información de bonificaciones */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-700 font-medium">🎯 +10 puntos por acierto</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-orange-700 font-medium">⭐ Bonus por racha</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-700 font-medium">❤️ Tienes 3 vidas</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-blue-700 font-medium">⏰ 60 segundos total</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-blue-700 font-medium">
                    Categoría seleccionada:{" "}
                    <span className="font-bold">
                      {selectedCategory === "ALL" ? "Todas las Sílabas" : `Sílabas con ${selectedCategory}`}
                    </span>
                  </p>
                  <p className="text-blue-600 text-sm">{filteredWords.length} palabras disponibles</p>
                </div>

                <Button
                  onClick={() => startSyllableGame()}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-8 text-xl transition-all"
                >
                  🚀 ¡Comenzar Aventura!
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen("menu")}
                  className="ml-4 px-6 py-3 text-lg border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Menú
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Para la pantalla del juego de sílabas (syllableGame), cambiar por:
  if (currentScreen === "syllableGame") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header con estadísticas */}
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardContent className="p-4 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-100 text-blue-700 text-lg px-3 py-1">🏆 {score}</Badge>
                  <Badge className="bg-red-100 text-red-700 text-lg px-3 py-1">❤️ {lives}</Badge>
                  <Badge className="bg-orange-100 text-orange-700 text-lg px-3 py-1">🔥 {streak}</Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-lg px-3 py-1">
                    {selectedCategory === "ALL" ? "Todas" : selectedCategory}
                  </Badge>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-700"}`}
                  >
                    {timeLeft}s
                  </div>
                  <p className="text-sm text-gray-600">Tiempo total</p>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm text-blue-600">
                  Palabra {currentWordIndex + 1} de {filteredWords.length} • {Math.round(progress)}% completado
                </p>
                <p className="text-xs text-gray-500">
                  Inicio: {new Date(gameStartTime).toLocaleTimeString()} • Tiempo transcurrido: {60 - timeLeft}s
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contenido principal del juego */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-white border-b border-gray-100 text-center">
              <CardTitle className="text-2xl font-bold text-gray-700">Completa la palabra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8 bg-white text-center">
              {/* Imagen grande del objeto */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-300">
                  <div className="text-8xl">{currentWord?.image || "❓"}</div>
                </div>
              </div>

              {/* Palabra incompleta */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-6xl font-bold text-gray-700 mb-4 tracking-wider">
                  {selectedSyllable ? currentWord?.incomplete.replace("_", selectedSyllable) : currentWord?.incomplete}
                </div>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto"
                  onClick={() => speakWord(currentWord?.complete || "")}
                >
                  🔊 Escuchar palabra completa
                </Button>
              </div>

              {/* Opciones de sílabas */}
              <div className="grid grid-cols-2 gap-6">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSyllableSelect(option)}
                    className={`h-20 text-3xl font-bold transition-all duration-300 ${
                      selectedSyllable === option
                        ? gameStatus === "correct"
                          ? "bg-green-500 text-white animate-pulse-success"
                          : gameStatus === "wrong"
                            ? "bg-red-500 text-white animate-shake"
                            : "bg-blue-500 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                    disabled={gameStatus !== "playing"}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Botones de control */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen("syllableSelection")}
                  className="flex items-center gap-2 border-gray-300"
                >
                  🔄 Cambiar Categoría
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen("menu")}
                  className="flex items-center gap-2 border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Menú
                </Button>
              </div>

              {/* Mensajes de estado */}
              {gameStatus === "correct" && (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200 animate-bounce-in">
                  <div className="text-6xl mb-3">🎉</div>
                  <p className="text-2xl font-bold text-green-700">¡Correcto!</p>
                  <p className="text-xl text-green-600 mb-2">{currentWord?.complete}</p>
                  <p className="text-lg text-green-600">+{10 + streak * 2} puntos</p>
                  {streak > 0 && <p className="text-base text-green-500">🔥 Racha: {streak + 1}</p>}
                </div>
              )}

              {gameStatus === "wrong" && (
                <div className="bg-red-50 rounded-lg p-6 border border-red-200 animate-shake">
                  <div className="text-6xl mb-3">😔</div>
                  <p className="text-2xl font-bold text-red-700">¡Incorrecto!</p>
                  <p className="text-xl text-red-600 mb-2">La palabra correcta es: {currentWord?.complete}</p>
                  <p className="text-lg text-red-600">Te quedan {lives - 1} vidas</p>
                  {lives - 1 > 0 && <p className="text-base text-red-500">¡Inténtalo de nuevo!</p>}
                </div>
              )}

              {gameStatus === "gameOver" && (
                <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                  <div className="text-8xl mb-4">😞</div>
                  <h3 className="text-3xl font-bold text-gray-700 mb-4">¡Juego Terminado!</h3>
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-lg font-bold text-blue-700">📊 RESULTADO FINAL</p>
                        <p className="text-xl text-blue-600">
                          Puntaje: <span className="font-bold text-blue-800">{score}</span>
                        </p>
                        <p className="text-lg text-blue-600">
                          Palabras: <span className="font-bold">{currentWordIndex}</span> de {filteredWords.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-700">⏰ TIEMPO DE JUEGO</p>
                        <p className="text-lg text-blue-600">
                          Inicio: <span className="font-bold">{new Date(gameStartTime).toLocaleTimeString()}</span>
                        </p>
                        <p className="text-lg text-blue-600">
                          Fin: <span className="font-bold">{new Date().toLocaleTimeString()}</span>
                        </p>
                        <p className="text-lg text-blue-600">
                          Duración: <span className="font-bold">{60 - timeLeft}s</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xl font-bold text-red-600">
                        {timeLeft === 0 ? "⏰ TIEMPO AGOTADO" : "💔 SIN VIDAS"}
                      </p>
                      <p className="text-lg text-blue-600">
                        Categoría:{" "}
                        <span className="font-bold">
                          {selectedCategory === "ALL" ? "Todas las Sílabas" : `Sílabas con ${selectedCategory}`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 mb-6 border border-green-200">
                    <p className="text-base text-green-700 font-medium">💾 Resultado guardado automáticamente</p>
                    <p className="text-sm text-green-600">Estadísticas actualizadas en tu perfil</p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={restartSyllableGame}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-4 text-xl mr-4"
                    >
                      🔄 Jugar de Nuevo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentScreen("syllableSelection")}
                      className="px-6 py-3 text-lg border-gray-300"
                    >
                      🎯 Cambiar Categoría
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentScreen("menu")}
                      className="px-6 py-3 text-lg border-gray-300"
                    >
                      🏠 Volver al Menú
                    </Button>
                  </div>
                </div>
              )}

              {gameStatus === "completed" && (
                <div className="bg-green-50 rounded-lg p-8 border border-green-200">
                  <div className="text-8xl mb-4">🏆</div>
                  <h3 className="text-3xl font-bold text-green-700 mb-4">¡Felicitaciones!</h3>
                  <p className="text-xl text-green-600 mb-2">¡Completaste todas las palabras!</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-green-700">Puntuación final: {score}</p>
                    <p className="text-lg text-green-600">Palabras completadas: {filteredWords.length}</p>
                    <p className="text-lg text-green-600">
                      Categoría: {selectedCategory === "ALL" ? "Todas las Sílabas" : `Sílabas con ${selectedCategory}`}
                    </p>
                  </div>
                  <p className="text-base text-green-600 mb-4">💾 Guardado automáticamente</p>
                  <div className="space-y-3">
                    <Button
                      onClick={restartSyllableGame}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl mr-4"
                    >
                      🔄 Jugar de Nuevo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentScreen("syllableSelection")}
                      className="px-6 py-3 text-lg border-gray-300"
                    >
                      🎯 Cambiar Categoría
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Sopa de Letras
  if (currentScreen === "wordSearch") {
    if (!wordSearchStarted) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl text-center shadow-lg border border-gray-200">
            <CardHeader className="space-y-4 bg-white border-b border-gray-100">
              <div className="text-6xl">🔍</div>
              <CardTitle className="text-4xl font-bold text-gray-700">Sopa de Letras</CardTitle>
              <p className="text-xl text-gray-600">Encuentra las palabras ocultas</p>
            </CardHeader>
            <CardContent className="space-y-8 p-6 bg-white">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-xl text-gray-700 font-medium mb-4">¡Hola {currentUser?.username}! 👋</p>
                <p className="text-lg text-gray-600 mb-4">Busca estas palabras con sílabas trabadas:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {wordSearchWords.map((word, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={`text-base px-3 py-1 border border-yellow-300 ${
                        foundWords.includes(word)
                          ? "bg-green-100 text-green-800 line-through"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {wordSearchIcons[word]} {word}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-base">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 font-medium">🔍 Selecciona letras</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 font-medium">➡️ Horizontal, vertical y diagonal</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 font-medium">🎯 +15 puntos/palabra</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 font-medium">❤️ 3 vidas • 🔥 Rachas</p>
                </div>
              </div>
              <Button
                onClick={() => setWordSearchStarted(true)}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 text-xl transition-all"
              >
                ¡Comenzar Búsqueda! 🔍
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentScreen("menu")}
                className="w-full flex items-center justify-center gap-2 py-3 text-lg border-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Menú
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header con puntuación */}
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardContent className="p-4 bg-white">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-700 flex items-center gap-2">🔍 Sopa de Letras</h1>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-700">Puntos: {wordSearchScore}</div>
                  <Badge className="text-lg px-3 py-1 bg-red-100 text-red-700">❤️ {wordSearchLives}</Badge>
                  <Badge
                    variant="outline"
                    className="text-lg px-3 py-1 bg-orange-100 text-orange-700 border-orange-300"
                  >
                    🔥 {wordSearchStreak}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palabras a encontrar */}
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="text-center text-xl text-gray-700">🎯 Palabras a encontrar:</CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-white">
              <div className="flex flex-wrap justify-center gap-3">
                {wordSearchWords.map((word, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-lg px-4 py-2 rounded-lg transition-all duration-300 ${
                      foundWords.includes(word)
                        ? "bg-green-500 text-white animate-bounce-in"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{wordSearchIcons[word]}</span>
                    <span className={foundWords.includes(word) ? "line-through" : ""}>{word}</span>
                    {foundWords.includes(word) && <span className="animate-bounce-in">✅</span>}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <p className="text-base text-gray-600">
                  Encontradas: {foundWords.length} de {wordSearchWords.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cuadrícula de la sopa de letras */}
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardContent className="p-8 bg-white">
              <div className="flex justify-center">
                <div className="inline-block bg-white border-4 border-gray-400 rounded-lg p-4 word-search-grid">
                  <div className="grid grid-cols-[repeat(15,_40px)] gap-1">
                    {wordSearchGrid.map((row, rowIndex) =>
                      row.map((letter, colIndex) => {
                        const cellId = `${rowIndex}-${colIndex}`
                        const isSelected = selectedCells.includes(cellId)
                        const isFoundWord = foundWordCells.includes(cellId)
                        return (
                          <button
                            key={cellId}
                            data-cell-id={cellId}
                            className={`w-10 h-10 border border-gray-300 flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                              isFoundWord
                                ? "bg-green-200 text-green-800 animate-bounce-in"
                                : isSelected
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-white text-gray-800 hover:bg-gray-100"
                            }`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                          >
                            {letter}
                          </button>
                        )
                      }),
                    )}
                  </div>
                </div>
              </div>

              {currentSelection && (
                <div className="text-center mt-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <p className="text-base text-gray-700 font-medium">Palabra seleccionada:</p>
                    <p className="text-xl font-bold text-gray-800">{currentSelection}</p>
                  </div>
                  <Button
                    onClick={checkWord}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg font-bold"
                  >
                    ✅ Verificar Palabra
                  </Button>
                </div>
              )}

              <div className="text-center mt-6">
                <p className="text-base text-gray-600 mb-1">💡 Selecciona las letras para formar palabras</p>
                <p className="text-sm text-gray-500">Intentos: {attempts} • Busca horizontal, vertical y diagonal</p>
              </div>
            </CardContent>
          </Card>

          {/* Botones de control */}
          <div className="flex justify-center gap-6">
            <Button
              onClick={() => {
                setSelectedCells([])
                setCurrentSelection("")
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 text-lg font-medium"
            >
              🔄 Limpiar Selección
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentScreen("menu")}
              className="px-6 py-3 text-lg font-medium border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Menú
            </Button>
          </div>

          {/* Mensaje de victoria */}
          {foundWords.length === wordSearchWords.length && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-700 mb-3">¡Felicitaciones!</h3>
                <p className="text-lg text-green-600">¡Encontraste todas las palabras!</p>
                <p className="text-xl font-bold text-green-700 mt-3">Puntuación final: {wordSearchScore}</p>
                <p className="text-sm text-green-600 mt-1">💾 Guardado en almacenamiento local</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }
}
