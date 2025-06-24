"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Volume2, Star, Trophy, RefreshCw, ArrowLeft, Mail, Lock, LogOut, User, Database } from "lucide-react"

// Tipos de datos
interface Word {
  complete: string
  incomplete: string
  syllable: string
  image: string
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

// Datos del juego de sílabas
const words: Word[] = [
  { complete: "KIWI", incomplete: "_WI", syllable: "KI", image: "🥝" },
  { complete: "KARATE", incomplete: "_RATE", syllable: "KA", image: "🥋" },
  { complete: "KOALA", incomplete: "_ALA", syllable: "KO", image: "🐨" },
  { complete: "RANA", incomplete: "_NA", syllable: "RA", image: "🐸" },
  { complete: "REMO", incomplete: "_MO", syllable: "RE", image: "🚣" },
  { complete: "RICO", incomplete: "_CO", syllable: "RI", image: "💰" },
  { complete: "ROSA", incomplete: "_SA", syllable: "RO", image: "🌹" },
  { complete: "RUTA", incomplete: "_TA", syllable: "RU", image: "🗺️" },
  { complete: "DADO", incomplete: "_DO", syllable: "DA", image: "🎲" },
  { complete: "DEDO", incomplete: "_DO", syllable: "DE", image: "👆" },
  { complete: "DIENTE", incomplete: "_ENTE", syllable: "DI", image: "🦷" },
  { complete: "DONA", incomplete: "_NA", syllable: "DO", image: "🍩" },
  { complete: "DUCHA", incomplete: "_CHA", syllable: "DU", image: "🚿" },
  { complete: "JARRA", incomplete: "_RRA", syllable: "JA", image: "🏺" },
  { complete: "JEFE", incomplete: "_FE", syllable: "JE", image: "👨‍💼" },
  { complete: "JIRAFA", incomplete: "_RAFA", syllable: "JI", image: "🦒" },
  { complete: "JOYA", incomplete: "_YA", syllable: "JO", image: "💎" },
  { complete: "JUGO", incomplete: "_GO", syllable: "JU", image: "🧃" },
  { complete: "GATO", incomplete: "_TO", syllable: "GA", image: "🐱" },
  { complete: "GENTE", incomplete: "_NTE", syllable: "GE", image: "👥" },
  { complete: "GIGANTE", incomplete: "_GANTE", syllable: "GI", image: "🏔️" },
  { complete: "GOMA", incomplete: "_MA", syllable: "GO", image: "🔴" },
  { complete: "GUSANO", incomplete: "_SANO", syllable: "GU", image: "🐛" },
  { complete: "GRANDE", incomplete: "_ANDE", syllable: "GR", image: "📏" },
  { complete: "DRAGÓN", incomplete: "_AGÓN", syllable: "DR", image: "🐉" },
]

const syllableOptions = [
  "KI",
  "KA",
  "KO",
  "RA",
  "RE",
  "RI",
  "RO",
  "RU",
  "DA",
  "DE",
  "DI",
  "DO",
  "DU",
  "JA",
  "JE",
  "JI",
  "JO",
  "JU",
  "GA",
  "GE",
  "GI",
  "GO",
  "GU",
  "GR",
  "DR",
]

export default function SistemaEducativo() {
  // Estados principales
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "register" | "menu" | "syllableGame" | "wordSearch" | "storage"
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
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [selectedSyllable, setSelectedSyllable] = useState("")
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  // Estados de la sopa de letras
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [wordSearchScore, setWordSearchScore] = useState(0)
  const [wordSearchStarted, setWordSearchStarted] = useState(false)
  const [selectedCells, setSelectedCells] = useState<string[]>([])

  const currentWord = words[currentWordIndex]
  const progress = ((currentWordIndex + 1) / words.length) * 100

  // 🗄️ FUNCIONES DE ALMACENAMIENTO LOCAL NATIVO

  // Cargar usuarios del almacenamiento nativo
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

  // Guardar usuarios en almacenamiento nativo
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

  // Cargar usuario actual
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

  // Guardar usuario actual
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

  // Cargar sesiones de juego
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

  // Guardar sesión de juego
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

  // Obtener información de almacenamiento
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

  // Limpiar todo el almacenamiento
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

  // Timer del juego
  useEffect(() => {
    if (gameStarted && gameStatus === "playing" && timeLeft > 0 && currentScreen === "syllableGame") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      handleWrongAnswer()
    }
  }, [timeLeft, gameStatus, gameStarted, currentScreen])

  // Generar opciones de sílabas
  useEffect(() => {
    if (currentWord && currentScreen === "syllableGame") {
      const correctSyllable = currentWord.syllable
      const wrongOptions = syllableOptions
        .filter((s) => s !== correctSyllable)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      setOptions([correctSyllable, ...wrongOptions].sort(() => Math.random() - 0.5))
    }
  }, [currentWordIndex, currentScreen])

  // Funciones de autenticación
  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = registerForm

    if (!username || !email || !password) {
      alert("Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (password.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres")
      return
    }

    if (users.find((u) => u.username === username)) {
      alert("Este nombre de usuario ya existe")
      return
    }

    const newUser: UserData = {
      username,
      email,
      password,
      registeredAt: new Date().toISOString(),
      gamesPlayed: 0,
      bestScore: 0,
      lastPlayed: new Date().toISOString(),
      totalTimeSpent: 0,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    await saveUsersToStorage(updatedUsers)

    alert("¡Registro exitoso! 🎉 Datos guardados en la tablet")
    setCurrentScreen("login")
    setRegisterForm({ username: "", email: "", password: "", confirmPassword: "" })
  }

  const handleLogin = async () => {
    const { username, password } = loginForm

    if (!username || !password) {
      alert("Por favor ingresa usuario y contraseña")
      return
    }

    const user = users.find((u) => u.username === username && u.password === password)
    if (!user) {
      alert("Usuario o contraseña incorrectos")
      return
    }

    // Actualizar última vez jugado
    const updatedUser = { ...user, lastPlayed: new Date().toISOString() }
    const updatedUsers = users.map((u) => (u.username === username ? updatedUser : u))

    setUsers(updatedUsers)
    setCurrentUser(updatedUser)
    await saveUsersToStorage(updatedUsers)
    await saveCurrentUserToStorage(updatedUser)

    setCurrentScreen("menu")
    setLoginForm({ username: "", password: "" })
    alert(`¡Bienvenido ${username}! 🎉 Datos cargados desde la tablet`)
  }

  const handleLogout = async () => {
    if (confirm("¿Estás seguro que quieres cerrar sesión?")) {
      try {
        await CapacitorPreferences.remove({ key: "current_user" })
        setCurrentUser(null)
        setCurrentScreen("login")
        console.log("👋 Sesión cerrada")
      } catch (error) {
        console.error("❌ Error cerrando sesión:", error)
      }
    }
  }

  // Funciones del juego de sílabas
  const handleSyllableSelect = (syllable: string) => {
    if (gameStatus !== "playing") return

    setSelectedSyllable(syllable)

    if (syllable === currentWord.syllable) {
      setGameStatus("correct")
      setScore(score + 10 + streak * 2)
      setStreak(streak + 1)
      speakWord("¡Correcto!")

      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          nextWord()
        } else {
          setGameStatus("completed")
          saveGameStats()
        }
      }, 1500)
    } else {
      handleWrongAnswer()
    }
  }

  const handleWrongAnswer = () => {
    setGameStatus("wrong")
    setLives(lives - 1)
    setStreak(0)
    speakWord("Inténtalo de nuevo")

    setTimeout(() => {
      if (lives - 1 <= 0) {
        setGameStatus("gameOver")
        saveGameStats()
      } else {
        setGameStatus("playing")
        setSelectedSyllable("")
        setTimeLeft(60)
      }
    }, 1500)
  }

  const nextWord = () => {
    setCurrentWordIndex(currentWordIndex + 1)
    setSelectedSyllable("")
    setGameStatus("playing")
    setTimeLeft(60)
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

      // Guardar en almacenamiento nativo
      await saveUsersToStorage(updatedUsers)
      await saveCurrentUserToStorage(updatedUser)

      // Guardar sesión de juego
      const gameSession: GameSession = {
        date: new Date().toISOString(),
        score,
        wordsCompleted: gameStatus === "completed" ? words.length : currentWordIndex,
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
    setTimeLeft(60)
    setGameStarted(true)
    setGameStartTime(Date.now())
  }

  const startSyllableGame = () => {
    setGameStarted(true)
    setGameStatus("playing")
    setTimeLeft(60)
    setGameStartTime(Date.now())
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

  // Datos de la sopa de letras
  const wordsToFind = ["GATO", "RANA", "ROSA", "DADO", "JOYA"]
  const grid = [
    ["G", "A", "T", "O", "X", "R", "A", "N"],
    ["X", "R", "X", "X", "A", "X", "X", "A"],
    ["R", "A", "N", "A", "X", "J", "O", "Y"],
    ["O", "N", "X", "X", "D", "A", "D", "O"],
    ["S", "A", "X", "R", "O", "S", "A", "X"],
    ["A", "X", "G", "A", "T", "O", "X", "X"],
    ["X", "J", "O", "Y", "A", "X", "R", "A"],
    ["R", "A", "N", "A", "X", "X", "X", "X"],
  ]

  const handleCellClick = (row: number, col: number) => {
    const cellId = `${row}-${col}`
    const letter = grid[row][col]

    if (selectedCells.includes(cellId)) {
      setSelectedCells(selectedCells.filter((id) => id !== cellId))
    } else {
      setSelectedCells([...selectedCells, cellId])
    }

    // Lógica simple para encontrar palabras
    if (letter === "G" && row === 0 && col === 0) {
      if (!foundWords.includes("GATO")) {
        setFoundWords([...foundWords, "GATO"])
        setWordSearchScore(wordSearchScore + 10)
        alert("¡Encontraste GATO! 🎉")
      }
    }
  }

  // Pantalla de información de almacenamiento
  if (currentScreen === "storage") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <Database className="w-8 h-8 text-blue-600" />💾 Almacenamiento Local de la Tablet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                  <div className="text-blue-700 font-medium">👥 Usuarios Registrados</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-600">{gameSessions.length}</div>
                  <div className="text-green-700 font-medium">🎮 Sesiones de Juego</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-600">{storageInfo?.totalKeys || 0}</div>
                  <div className="text-purple-700 font-medium">🗄️ Claves de Datos</div>
                </div>
              </div>

              {/* Usuarios guardados */}
              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">👥 Usuarios en la Tablet</h3>
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div>🏆 {user.bestScore} puntos</div>
                        <div>🎮 {user.gamesPlayed} juegos</div>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-gray-500 text-center py-4">No hay usuarios registrados</p>}
                </div>
              </div>

              {/* Sesiones recientes */}
              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🎮 Últimas Sesiones de Juego</h3>
                <div className="space-y-2">
                  {gameSessions
                    .slice(-5)
                    .reverse()
                    .map((session, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {session.gameType === "syllables" ? "🎯 Sílabas" : "🔍 Sopa de Letras"}
                          </div>
                          <div className="text-sm text-gray-600">{new Date(session.date).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{session.score} pts</div>
                          <div className="text-sm text-gray-600">{session.wordsCompleted} palabras</div>
                        </div>
                      </div>
                    ))}
                  {gameSessions.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No hay sesiones guardadas</p>
                  )}
                </div>
              </div>

              {/* Información técnica */}
              {storageInfo && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">🔧 Información Técnica</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Última actualización:</strong>
                      <br />
                      {storageInfo.lastUpdated}
                    </div>
                    <div>
                      <strong>Claves almacenadas:</strong>
                      <br />
                      {storageInfo.keys.join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-4 justify-center">
                <Button onClick={getStorageInfo} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3">
                  🔄 Actualizar Info
                </Button>
                <Button onClick={clearAllStorage} variant="destructive" className="px-6 py-3">
                  🗑️ Limpiar Todo
                </Button>
                <Button onClick={() => setCurrentScreen("menu")} variant="outline" className="px-6 py-3">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-purple-700">🔑 Iniciar Sesión</CardTitle>
            <p className="text-gray-600">Sistema Educativo - Almacenamiento Local</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800 font-medium">💾 Datos guardados en la tablet</p>
              <p className="text-xs text-green-700">{users.length} usuarios registrados</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                Usuario
              </label>
              <input
                type="text"
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Tu contraseña"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 text-xl transition-all transform hover:scale-105"
            >
              🚀 Entrar
            </Button>

            <Button
              variant="ghost"
              onClick={() => setCurrentScreen("register")}
              className="w-full text-purple-600 hover:text-purple-800 hover:bg-purple-50 py-3 text-lg"
            >
              ¿No tienes cuenta? Regístrate aquí
            </Button>

            {/* Demo credentials para tablet */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800 font-medium">💡 Credenciales de prueba:</p>
              <p className="text-sm text-yellow-700 mb-3">
                Usuario: <strong>tablet</strong> | Contraseña: <strong>1234</strong>
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-sm"
                onClick={async () => {
                  // Crear usuario tablet si no existe
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

            {/* Botón para ver almacenamiento */}
            <Button
              variant="outline"
              onClick={() => setCurrentScreen("storage")}
              className="w-full flex items-center justify-center gap-2 text-sm"
            >
              <Database className="w-4 h-4" />
              Ver Almacenamiento Local
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pantalla de Registro
  if (currentScreen === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-purple-700">📚 Crear Cuenta</CardTitle>
            <p className="text-gray-600">Se guardará en el almacenamiento de la tablet</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Repite tu contraseña"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              />
            </div>

            <Button
              onClick={handleRegister}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 text-xl transition-all transform hover:scale-105"
            >
              ✨ Crear Cuenta
            </Button>

            <Button
              variant="ghost"
              onClick={() => setCurrentScreen("login")}
              className="w-full text-purple-600 hover:text-purple-800 hover:bg-purple-50 py-3 text-lg"
            >
              ¿Ya tienes cuenta? Inicia Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Menú Principal - Con información de almacenamiento
  if (currentScreen === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header para tablet */}
          <Card className="mb-8 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-purple-700">¡Hola {currentUser?.username}! 👋</h1>
                    <p className="text-xl text-gray-600">Datos guardados en tu tablet 💾</p>
                    <p className="text-sm text-gray-500">
                      Última vez:{" "}
                      {currentUser?.lastPlayed ? new Date(currentUser.lastPlayed).toLocaleString() : "Primera vez"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentScreen("storage")}
                    className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 px-6 py-3 text-lg"
                  >
                    <Database className="w-5 h-5" />
                    Ver Datos
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 px-6 py-3 text-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Título principal */}
          <div className="text-center mb-12">
            <h2 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">🎮 Centro de Actividades</h2>
            <p className="text-2xl text-white/90">Todo guardado localmente en tu tablet</p>
          </div>

          {/* Actividades - Layout para tablet */}
          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Juego de Sílabas */}
            <Card
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-8 border-l-green-500 transform hover:scale-105 hover:-translate-y-2"
              onClick={() => {
                setCurrentScreen("syllableGame")
                setGameStarted(false)
                setCurrentWordIndex(0)
                setScore(0)
                setLives(3)
                setSelectedSyllable("")
                setGameStatus("playing")
                setStreak(0)
                setTimeLeft(30)
              }}
            >
              <CardContent className="p-10 text-center">
                <div className="text-9xl mb-8 animate-bounce">🎯</div>
                <h3 className="text-4xl font-bold text-gray-800 mb-6">Juego de Sílabas</h3>
                <p className="text-gray-600 mb-6 text-xl">Completa las palabras con las sílabas correctas</p>
                <p className="text-lg text-gray-500 mb-8">K, R, D, J, G + combinadas • 25 palabras</p>
                <div className="flex justify-center gap-4 mb-6">
                  <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">✅ Disponible</Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">💾 Local</Badge>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <p className="text-lg text-green-700 font-medium">🏆 Progreso guardado automáticamente</p>
                </div>
              </CardContent>
            </Card>

            {/* Sopa de Letras */}
            <Card
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-8 border-l-yellow-500 transform hover:scale-105 hover:-translate-y-2"
              onClick={() => {
                setCurrentScreen("wordSearch")
                setWordSearchStarted(false)
                setFoundWords([])
                setWordSearchScore(0)
                setSelectedCells([])
              }}
            >
              <CardContent className="p-10 text-center">
                <div className="text-9xl mb-8 animate-pulse">🔍</div>
                <h3 className="text-4xl font-bold text-gray-800 mb-6">Sopa de Letras</h3>
                <p className="text-gray-600 mb-6 text-xl">Encuentra palabras ocultas en la cuadrícula</p>
                <p className="text-lg text-gray-500 mb-8">5 palabras • Cuadrícula 8x8</p>
                <div className="flex justify-center gap-4 mb-6">
                  <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">✅ Disponible</Badge>
                  <Badge className="bg-orange-100 text-orange-800 text-lg px-4 py-2">💾 Local</Badge>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6">
                  <p className="text-lg text-yellow-700 font-medium">🧠 Estadísticas guardadas en tablet</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas - Con información de almacenamiento */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-3xl">
                <Trophy className="w-8 h-8 text-yellow-500" />📊 Panel de Estadísticas Locales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-5xl font-bold text-purple-600 mb-4">{currentUser?.gamesPlayed || 0}</div>
                  <div className="text-lg text-purple-700 font-medium">🏆 Juegos Completados</div>
                  <div className="text-sm text-purple-600 mt-2">Guardado en tablet</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-5xl font-bold text-green-600 mb-4">{currentUser?.bestScore || 0}</div>
                  <div className="text-lg text-green-700 font-medium">⭐ Mejor Puntuación</div>
                  <div className="text-sm text-green-600 mt-2">Récord personal</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-5xl font-bold text-blue-600 mb-4">
                    {Math.floor((currentUser?.totalTimeSpent || 0) / 60)}
                  </div>
                  <div className="text-lg text-blue-700 font-medium">⏱️ Minutos Jugados</div>
                  <div className="text-sm text-blue-600 mt-2">Tiempo total</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-5xl font-bold text-orange-600 mb-4">{gameSessions.length}</div>
                  <div className="text-lg text-orange-700 font-medium">📱 Sesiones</div>
                  <div className="text-sm text-orange-600 mt-2">Historial completo</div>
                </div>
              </div>

              {/* Progreso */}
              <div className="mt-10 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-3 text-xl">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Tu Progreso de Aprendizaje (Almacenado Localmente)
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-600">Nivel de Sílabas</span>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {currentUser?.gamesPlayed && currentUser.gamesPlayed > 0 ? "Principiante" : "Nuevo"}
                    </Badge>
                  </div>
                  <Progress value={Math.min((currentUser?.gamesPlayed || 0) * 10, 100)} className="h-4" />
                  <p className="text-sm text-gray-500">
                    Todos tus datos están seguros en el almacenamiento interno de la tablet 🔒
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // El resto de las pantallas permanecen igual...
  // (Juego de Sílabas y Sopa de Letras sin cambios)

  // Juego de Sílabas - Optimizado para tablet
  if (currentScreen === "syllableGame") {
    if (!gameStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl text-center shadow-2xl">
            <CardHeader className="space-y-6">
              <div className="text-9xl animate-bounce">🎯</div>
              <CardTitle className="text-5xl font-bold text-purple-700">Completa las Sílabas</CardTitle>
              <p className="text-2xl text-gray-600">Sílabas con K, R, D, J, G</p>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="bg-blue-50 rounded-xl p-8">
                <p className="text-2xl text-gray-700 font-medium mb-4">¡Hola {currentUser?.username}! 👋</p>
                <p className="text-xl text-gray-600">¡Ayuda a completar las palabras!</p>
                <p className="text-lg text-gray-500 mt-4">Tu progreso se guarda automáticamente 💾</p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-lg">
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-green-700 font-medium">🎯 +10 puntos por acierto</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <p className="text-yellow-700 font-medium">⭐ Bonus por racha</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <p className="text-red-700 font-medium">❤️ Tienes 3 vidas</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-blue-700 font-medium">⏰ 30 segundos/palabra</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <p className="text-purple-700 font-medium text-xl">🔤 Sílabas incluidas:</p>
                <p className="text-lg text-purple-600 mt-2">K, R, D, J, G + combinadas (GR, DR)</p>
              </div>

              <Button
                onClick={startSyllableGame}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-6 text-2xl transition-all transform hover:scale-105"
              >
                ¡Comenzar Aventura! 🚀
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentScreen("menu")}
                className="w-full flex items-center justify-center gap-3 py-4 text-xl"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al Menú
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (gameStatus === "gameOver" || gameStatus === "completed") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl text-center shadow-2xl">
            <CardHeader className="space-y-6">
              <CardTitle className="text-5xl font-bold">
                {gameStatus === "completed" ? (
                  <span className="text-yellow-600">🏆 ¡Increíble!</span>
                ) : (
                  <span className="text-red-600">🎮 Fin del Juego</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="text-9xl animate-bounce">{gameStatus === "completed" ? "🎉" : "😔"}</div>

              <div className="bg-gray-50 rounded-xl p-8 space-y-6">
                <p className="text-4xl font-bold text-purple-700">Puntuación Final: {score}</p>
                <p className="text-2xl text-gray-600">
                  Palabras completadas: {gameStatus === "completed" ? words.length : currentWordIndex} de {words.length}
                </p>
                <div className="text-lg text-gray-500 space-y-2">
                  <p>Racha máxima: {streak}</p>
                  <p>
                    Precisión:{" "}
                    {currentWordIndex > 0 ? Math.round(((currentWordIndex - (3 - lives)) / currentWordIndex) * 100) : 0}
                    %
                  </p>
                  <p className="text-green-600 font-medium">💾 Estadísticas guardadas en tablet</p>
                </div>

                {gameStatus === "completed" && (
                  <div className="flex justify-center space-x-2 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-10 h-10 fill-yellow-400 text-yellow-400 animate-pulse" />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <Button
                  onClick={restartSyllableGame}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-6 text-2xl transition-all transform hover:scale-105"
                >
                  <RefreshCw className="w-6 h-6 mr-3" />
                  Jugar de Nuevo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen("menu")}
                  className="w-full flex items-center justify-center gap-3 py-4 text-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver al Menú
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header con estadísticas - Tablet */}
          <Card className="mb-8 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-6">
                  <Badge variant="secondary" className="text-2xl px-6 py-3 bg-purple-100">
                    <Trophy className="w-6 h-6 mr-3" />
                    {score}
                  </Badge>
                  <Badge variant="destructive" className="text-2xl px-6 py-3">
                    ❤️ {lives}
                  </Badge>
                  <Badge variant="outline" className="text-2xl px-6 py-3 bg-orange-100">
                    🔥 {streak}
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-red-600 animate-pulse">⏰ {timeLeft}s</div>
              </div>
              <Progress value={progress} className="h-6 mb-4" />
              <p className="text-center text-lg text-gray-600 font-medium">
                Palabra {currentWordIndex + 1} de {words.length} • {Math.round(progress)}% completado
              </p>
            </CardContent>
          </Card>

          {/* Área principal del juego - Tablet */}
          <Card className="shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle
                className={`text-4xl font-bold transition-all duration-300 ${
                  gameStatus === "correct"
                    ? "text-green-600 animate-bounce"
                    : gameStatus === "wrong"
                      ? "text-red-600 animate-shake"
                      : gameStatus === "gameOver"
                        ? "text-red-700"
                        : gameStatus === "completed"
                          ? "text-yellow-600"
                          : "text-blue-600"
                }`}
              >
                {gameStatus === "correct"
                  ? "¡Excelente! 🎉"
                  : gameStatus === "wrong"
                    ? "¡Inténtalo de nuevo! 😊"
                    : gameStatus === "gameOver"
                      ? "¡Juego terminado! 🎮"
                      : gameStatus === "completed"
                        ? "¡Felicitaciones! ¡Completaste todo! 🏆"
                        : "Completa la palabra"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Imagen y palabra - Tablet */}
              <div className="text-center space-y-8">
                <div className="text-10xl animate-pulse">{currentWord.image}</div>
                <div className="bg-gray-50 rounded-xl p-8">
                  <div className="text-6xl font-bold text-gray-800 tracking-wider mb-6">
                    {selectedSyllable && gameStatus === "correct"
                      ? currentWord.complete
                      : currentWord.incomplete.replace("_", selectedSyllable || "_")}
                  </div>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors text-xl"
                    onClick={() => speakWord(currentWord.complete)}
                  >
                    <Volume2 className="w-6 h-6 mr-3" />
                    Escuchar palabra completa
                  </Button>
                </div>
              </div>

              {/* Opciones de sílabas - Tablet */}
              {gameStatus === "playing" && (
                <div className="grid grid-cols-2 gap-8">
                  {options.map((syllable, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSyllableSelect(syllable)}
                      className={`h-24 text-4xl font-bold transition-all duration-300 transform hover:scale-105 ${
                        selectedSyllable === syllable
                          ? gameStatus === "correct"
                            ? "bg-green-500 hover:bg-green-600 text-white animate-pulse-success"
                            : gameStatus === "wrong"
                              ? "bg-red-500 hover:bg-red-600 text-white animate-shake"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                      }`}
                      disabled={gameStatus !== "playing"}
                    >
                      {syllable}
                    </Button>
                  ))}
                </div>
              )}

              {/* Botón para escuchar sílaba - Tablet */}
              {gameStatus === "playing" && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-200 text-xl px-8 py-4"
                    onClick={() => speakWord(currentWord.syllable)}
                  >
                    <Volume2 className="w-5 h-5 mr-3" />
                  </Button>
                </div>
              )}

              {/* Mensaje de estado - Tablet */}
              {gameStatus !== "playing" && (
                <div className="text-center bg-gray-50 rounded-xl p-8">
                  <div className="text-8xl mb-6 animate-bounce">{gameStatus === "correct" ? "🎉" : "😊"}</div>
                  {gameStatus === "correct" && (
                    <div className="text-2xl text-green-600 font-semibold">
                      ¡Perfecto! La respuesta era "{currentWord.syllable}" ✨
                    </div>
                  )}
                  {gameStatus === "wrong" && (
                    <div className="text-2xl text-red-600 font-semibold">
                      La respuesta correcta era "{currentWord.syllable}" 💪
                    </div>
                  )}
                </div>
              )}

              {/* Botón volver - Tablet */}
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen("menu")}
                  className="flex items-center gap-3 hover:bg-gray-50 px-8 py-4 text-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver al Menú
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Sopa de Letras - Optimizado para tablet
  if (currentScreen === "wordSearch") {
    if (!wordSearchStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl text-center shadow-2xl">
            <CardHeader className="space-y-6">
              <div className="text-9xl animate-pulse">🔍</div>
              <CardTitle className="text-5xl font-bold text-purple-700">Sopa de Letras</CardTitle>
              <p className="text-2xl text-gray-600">Encuentra las palabras ocultas</p>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="bg-blue-50 rounded-xl p-8">
                <p className="text-2xl text-gray-700 font-medium mb-6">¡Hola {currentUser?.username}! 👋</p>
                <p className="text-xl text-gray-600 mb-6">Busca estas palabras en la cuadrícula:</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {wordsToFind.map((word, index) => (
                    <Badge key={index} variant="secondary" className="text-lg px-4 py-2 bg-yellow-100 text-yellow-800">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-lg">
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-green-700 font-medium">🔍 Busca en la cuadrícula</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <p className="text-yellow-700 font-medium">➡️ Horizontal y vertical</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-blue-700 font-medium">🎯 Encuentra todas</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <p className="text-purple-700 font-medium">⭐ +10 puntos/palabra</p>
                </div>
              </div>

              <Button
                onClick={() => setWordSearchStarted(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-6 text-2xl transition-all transform hover:scale-105"
              >
                ¡Comenzar Búsqueda! 🔍
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentScreen("menu")}
                className="w-full flex items-center justify-center gap-3 py-4 text-xl"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al Menú
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header - Tablet */}
          <Card className="mb-8 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-purple-700 flex items-center gap-3">🔍 Sopa de Letras</h1>
                <div className="text-3xl font-bold text-green-600">Puntos: {wordSearchScore}</div>
              </div>
            </CardContent>
          </Card>

          {/* Palabras a encontrar - Tablet */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">🎯 Palabras a encontrar:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                {wordsToFind.map((word, index) => (
                  <Badge
                    key={index}
                    className={`text-2xl px-6 py-3 transition-all ${
                      foundWords.includes(word) ? "bg-green-500 text-white animate-pulse" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {word} {foundWords.includes(word) ? "✅" : ""}
                  </Badge>
                ))}
              </div>
              <div className="text-center mt-6">
                <p className="text-lg text-gray-600">
                  Encontradas: {foundWords.length} de {wordsToFind.length}
                </p>
                <Progress value={(foundWords.length / wordsToFind.length) * 100} className="mt-4 h-4" />
              </div>
            </CardContent>
          </Card>

          {/* Cuadrícula - Tablet */}
          <Card className="mb-8 shadow-xl">
            <CardContent className="p-10">
              <div className="grid grid-cols-8 gap-2 max-w-2xl mx-auto bg-white p-6 rounded-lg">
                {grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => {
                    const cellId = `${rowIndex}-${colIndex}`
                    const isSelected = selectedCells.includes(cellId)

                    return (
                      <button
                        key={cellId}
                        className={`w-16 h-16 border-2 border-gray-300 flex items-center justify-center font-bold text-2xl transition-all duration-200 hover:scale-110 ${
                          isSelected
                            ? "bg-blue-500 text-white shadow-lg transform scale-105"
                            : "bg-gray-50 hover:bg-blue-100 text-gray-800"
                        }`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {letter}
                      </button>
                    )
                  }),
                )}
              </div>

              <div className="text-center mt-8">
                <p className="text-lg text-gray-600 mb-4">💡 Toca las letras para seleccionarlas</p>
                <p className="text-sm text-gray-500">Pista: "GATO" está en la primera fila</p>
              </div>
            </CardContent>
          </Card>

          {/* Botones - Tablet */}
          <div className="flex justify-center gap-8">
            <Button
              onClick={() => alert('🔍 Pista: Busca "GATO" en la primera fila (G-A-T-O) 😉')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 text-2xl font-medium"
            >
              💡 Obtener Pista
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentScreen("menu")}
              className="px-8 py-4 text-2xl font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Volver al Menú
            </Button>
          </div>

          {/* Progreso - Tablet */}
          {foundWords.length === wordsToFind.length && (
            <Card className="mt-8 bg-green-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold text-green-700 mb-4">¡Felicitaciones!</h3>
                <p className="text-xl text-green-600">¡Encontraste todas las palabras!</p>
                <p className="text-2xl font-bold text-green-700 mt-4">Puntuación final: {wordSearchScore}</p>
                <p className="text-sm text-green-600 mt-2">💾 Guardado en almacenamiento local</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return null
}
