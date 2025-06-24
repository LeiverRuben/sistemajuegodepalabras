"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView } from "react-native"
import * as Speech from "expo-speech"

const Stack = createStackNavigator()

// Datos del juego de sílabas
interface Word {
  complete: string
  incomplete: string
  syllable: string
  image: string
}

const words: Word[] = [
  { complete: "KIWI", incomplete: "_IWI", syllable: "KI", image: "🥝" },
  { complete: "KARATE", incomplete: "_ARATE", syllable: "KA", image: "🥋" },
  { complete: "KOALA", incomplete: "_OALA", syllable: "KO", image: "🐨" },
  { complete: "RANA", incomplete: "_ANA", syllable: "RA", image: "🐸" },
  { complete: "REMO", incomplete: "_EMO", syllable: "RE", image: "🚣" },
  { complete: "RICO", incomplete: "_ICO", syllable: "RI", image: "💰" },
  { complete: "ROSA", incomplete: "_OSA", syllable: "RO", image: "🌹" },
  { complete: "RUTA", incomplete: "_UTA", syllable: "RU", image: "🗺️" },
  { complete: "DADO", incomplete: "_ADO", syllable: "DA", image: "🎲" },
  { complete: "DEDO", incomplete: "_EDO", syllable: "DE", image: "👆" },
  { complete: "DIENTE", incomplete: "_IENTE", syllable: "DI", image: "🦷" },
  { complete: "DONA", incomplete: "_ONA", syllable: "DO", image: "🍩" },
  { complete: "DUCHA", incomplete: "_UCHA", syllable: "DU", image: "🚿" },
  { complete: "JARRA", incomplete: "_ARRA", syllable: "JA", image: "🏺" },
  { complete: "JEFE", incomplete: "_EFE", syllable: "JE", image: "👨‍💼" },
  { complete: "JIRAFA", incomplete: "_IRAFA", syllable: "JI", image: "🦒" },
  { complete: "JOYA", incomplete: "_OYA", syllable: "JO", image: "💎" },
  { complete: "JUGO", incomplete: "_UGO", syllable: "JU", image: "🧃" },
  { complete: "GATO", incomplete: "_ATO", syllable: "GA", image: "🐱" },
  { complete: "GENTE", incomplete: "_ENTE", syllable: "GE", image: "👥" },
  { complete: "GIGANTE", incomplete: "_IGANTE", syllable: "GI", image: "🏔️" },
  { complete: "GOMA", incomplete: "_OMA", syllable: "GO", image: "🔴" },
  { complete: "GUSANO", incomplete: "_USANO", syllable: "GU", image: "🐛" },
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

// Pantalla de Registro
function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")

  const handleRegister = async () => {
    if (!username || !password || !email) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (password.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres")
      return
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await AsyncStorage.getItem(`user_${username}`)
      if (existingUser) {
        Alert.alert("Error", "Este nombre de usuario ya existe")
        return
      }

      // Guardar usuario en AsyncStorage
      const userData = {
        username,
        password,
        email,
        registeredAt: new Date().toISOString(),
        gamesPlayed: 0,
        bestScore: 0,
      }

      await AsyncStorage.setItem(`user_${username}`, JSON.stringify(userData))

      Alert.alert("¡Registro Exitoso! 🎉", "Tu cuenta ha sido creada correctamente", [
        {
          text: "Iniciar Sesión",
          onPress: () => navigation.navigate("Login"),
        },
      ])

      // Limpiar campos
      setUsername("")
      setPassword("")
      setConfirmPassword("")
      setEmail("")
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el usuario")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>📚 Registro de Usuario</Text>
          <Text style={styles.subtitle}>Crea tu cuenta para jugar</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>👤 Nombre de Usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Ingresa tu nombre de usuario"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>📧 Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔒 Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 4 caracteres"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔒 Confirmar Contraseña</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite tu contraseña"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryButtonText}>✨ Crear Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.secondaryButtonText}>¿Ya tienes cuenta? Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Pantalla de Login
function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor ingresa usuario y contraseña")
      return
    }

    try {
      const userData = await AsyncStorage.getItem(`user_${username}`)

      if (!userData) {
        Alert.alert("Error", "Usuario no encontrado. ¿Necesitas registrarte?")
        return
      }

      const user = JSON.parse(userData)

      if (user.password !== password) {
        Alert.alert("Error", "Contraseña incorrecta")
        return
      }

      // Guardar sesión activa
      await AsyncStorage.setItem("currentUser", username)

      Alert.alert("¡Bienvenido! 🎉", `Hola ${username}, ¡listo para jugar!`, [
        {
          text: "Continuar",
          onPress: () => navigation.navigate("MainMenu", { username, userData: user }),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar sesión")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>🔑 Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Accede a tus juegos favoritos</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>👤 Usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Tu nombre de usuario"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🔒 Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>🚀 Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.secondaryButtonText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// Menú Principal de Actividades
function MainMenuScreen({ route, navigation }: any) {
  const { username, userData } = route.params

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        onPress: async () => {
          await AsyncStorage.removeItem("currentUser")
          navigation.navigate("Login")
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menuContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>¡Hola {username}! 👋</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.menuTitle}>🎮 Selecciona una Actividad</Text>

        <View style={styles.activitiesContainer}>
          {/* Actividad 1: Juego de Sílabas */}
          <TouchableOpacity
            style={[styles.activityCard, styles.syllableCard]}
            onPress={() => navigation.navigate("SyllableGame", { username })}
          >
            <Text style={styles.activityEmoji}>🎯</Text>
            <Text style={styles.activityTitle}>Juego de Sílabas</Text>
            <Text style={styles.activityDescription}>Completa las palabras con las sílabas correctas</Text>
            <Text style={styles.activitySubtext}>K, R, D, J, G + combinadas</Text>
            <View style={styles.activityStats}>
              <Text style={styles.activityStatsText}>✅ Disponible</Text>
            </View>
          </TouchableOpacity>

          {/* Actividad 2: Sopa de Letras */}
          <TouchableOpacity
            style={[styles.activityCard, styles.wordSearchCard]}
            onPress={() => navigation.navigate("WordSearchGame", { username })}
          >
            <Text style={styles.activityEmoji}>🔍</Text>
            <Text style={styles.activityTitle}>Sopa de Letras</Text>
            <Text style={styles.activityDescription}>Encuentra palabras ocultas en la cuadrícula</Text>
            <Text style={styles.activitySubtext}>Busca y encuentra</Text>
            <View style={styles.activityStats}>
              <Text style={styles.activityStatsText}>✅ Disponible</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Tus Estadísticas</Text>
          <Text style={styles.statsText}>🏆 Juegos jugados: {userData?.gamesPlayed || 0}</Text>
          <Text style={styles.statsText}>⭐ Mejor puntuación: {userData?.bestScore || 0}</Text>
          <Text style={styles.statsText}>
            📅 Miembro desde: {userData?.registeredAt ? new Date(userData.registeredAt).toLocaleDateString() : "Hoy"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

// Juego de Sílabas
function SyllableGameScreen({ route, navigation }: any) {
  const { username } = route.params
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [selectedSyllable, setSelectedSyllable] = useState("")
  const [gameStatus, setGameStatus] = useState<"playing" | "correct" | "wrong" | "gameOver" | "completed">("playing")
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStarted, setGameStarted] = useState(false)
  const [options, setOptions] = useState<string[]>([])

  const currentWord = words[currentWordIndex]
  const progress = ((currentWordIndex + 1) / words.length) * 100

  // Timer effect
  useEffect(() => {
    if (gameStarted && gameStatus === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      handleWrongAnswer()
    }
  }, [timeLeft, gameStatus, gameStarted])

  // Generate random syllable options
  const getRandomOptions = () => {
    const correctSyllable = currentWord.syllable
    const wrongOptions = syllableOptions
      .filter((s) => s !== correctSyllable)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    return [correctSyllable, ...wrongOptions].sort(() => Math.random() - 0.5)
  }

  useEffect(() => {
    if (currentWord) {
      setOptions(getRandomOptions())
    }
  }, [currentWordIndex])

  const handleSyllableSelect = (syllable: string) => {
    if (gameStatus !== "playing") return

    setSelectedSyllable(syllable)

    if (syllable === currentWord.syllable) {
      setGameStatus("correct")
      setScore(score + 10 + streak * 2)
      setStreak(streak + 1)

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

    setTimeout(() => {
      if (lives - 1 <= 0) {
        setGameStatus("gameOver")
        saveGameStats()
      } else {
        setGameStatus("playing")
        setSelectedSyllable("")
        setTimeLeft(30)
      }
    }, 1500)
  }

  const nextWord = () => {
    setCurrentWordIndex(currentWordIndex + 1)
    setSelectedSyllable("")
    setGameStatus("playing")
    setTimeLeft(30)
  }

  const saveGameStats = async () => {
    try {
      const userData = await AsyncStorage.getItem(`user_${username}`)
      if (userData) {
        const user = JSON.parse(userData)
        user.gamesPlayed = (user.gamesPlayed || 0) + 1
        user.bestScore = Math.max(user.bestScore || 0, score)
        await AsyncStorage.setItem(`user_${username}`, JSON.stringify(user))
      }
    } catch (error) {
      console.log("Error saving stats:", error)
    }
  }

  const restartGame = () => {
    setCurrentWordIndex(0)
    setScore(0)
    setLives(3)
    setSelectedSyllable("")
    setGameStatus("playing")
    setStreak(0)
    setTimeLeft(30)
    setGameStarted(true)
  }

  const startGame = () => {
    setGameStarted(true)
    setGameStatus("playing")
    setTimeLeft(30)
  }

  const speakWord = (word: string) => {
    Speech.speak(word, {
      language: "es-ES",
      pitch: 1.2,
      rate: 0.8,
    })
  }

  const getStatusMessage = () => {
    switch (gameStatus) {
      case "correct":
        return "¡Excelente! 🎉"
      case "wrong":
        return "¡Inténtalo de nuevo! 😊"
      case "gameOver":
        return "¡Juego terminado! 🎮"
      case "completed":
        return "¡Felicitaciones! ¡Completaste todo! 🏆"
      default:
        return "Completa la palabra"
    }
  }

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startScreen}>
          <Text style={styles.title}>🎯 Completa las Sílabas</Text>
          <Text style={styles.subtitle}>Sílabas con K, R, D, J, G</Text>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>¡Hola {username}!</Text>
            <Text style={styles.instructionText}>¡Ayuda a completar las palabras!</Text>
            <Text style={styles.instructionSubtext}>Encuentra la sílaba correcta para cada palabra</Text>
          </View>

          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>🎯 Gana 10 puntos por respuesta correcta</Text>
            <Text style={styles.ruleText}>⭐ Bonus por racha consecutiva</Text>
            <Text style={styles.ruleText}>❤️ Tienes 3 vidas</Text>
            <Text style={styles.ruleText}>⏰ 30 segundos por palabra</Text>
            <Text style={styles.ruleText}>🔤 Sílabas: K, R, D, J, G + combinadas</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>¡Comenzar Juego! 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (gameStatus === "gameOver" || gameStatus === "completed") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endScreen}>
          <Text style={styles.endTitle}>
            {gameStatus === "completed" ? "🏆 ¡Felicitaciones!" : "🎮 Juego Terminado"}
          </Text>

          <Text style={styles.endEmoji}>{gameStatus === "completed" ? "🎉" : "😔"}</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.finalScore}>Puntuación Final: {score}</Text>
            <Text style={styles.wordsCompleted}>
              Palabras completadas: {gameStatus === "completed" ? words.length : currentWordIndex}
            </Text>
            {gameStatus === "completed" && (
              <View style={styles.starsContainer}>
                <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.restartButtonText}>🔄 Jugar de Nuevo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>🏆 {score}</Text>
          </View>
          <View style={[styles.statBadge, styles.livesBadge]}>
            <Text style={styles.statText}>❤️ {lives}</Text>
          </View>
          <View style={[styles.statBadge, styles.streakBadge]}>
            <Text style={styles.statText}>🔥 {streak}</Text>
          </View>
        </View>
        <Text style={styles.timer}>⏰ {timeLeft}s</Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Palabra {currentWordIndex + 1} de {words.length}
      </Text>

      {/* Área principal del juego */}
      <ScrollView style={styles.gameArea}>
        <View style={styles.gameCard}>
          <Text
            style={[
              styles.statusMessage,
              gameStatus === "correct" && styles.correctText,
              gameStatus === "wrong" && styles.wrongText,
            ]}
          >
            {getStatusMessage()}
          </Text>

          {/* Imagen y palabra */}
          <View style={styles.wordContainer}>
            <Text style={styles.wordImage}>{currentWord.image}</Text>
            <Text style={styles.word}>
              {selectedSyllable && gameStatus === "correct"
                ? currentWord.complete
                : currentWord.incomplete.replace("_", selectedSyllable || "_")}
            </Text>

            <TouchableOpacity style={styles.speakButton} onPress={() => speakWord(currentWord.complete)}>
              <Text style={styles.speakButtonText}>🔊 Escuchar palabra</Text>
            </TouchableOpacity>
          </View>

          {/* Opciones de sílabas */}
          {gameStatus === "playing" && (
            <View style={styles.optionsContainer}>
              {options.map((syllable, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.syllableButton,
                    selectedSyllable === syllable && gameStatus === "correct" && styles.correctButton,
                    selectedSyllable === syllable && gameStatus === "wrong" && styles.wrongButton,
                  ]}
                  onPress={() => handleSyllableSelect(syllable)}
                  disabled={gameStatus !== "playing"}
                >
                  <Text style={styles.syllableButtonText}>{syllable}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Botón para escuchar sílaba */}
          {gameStatus === "playing" && (
            <TouchableOpacity style={styles.syllableHelpButton} onPress={() => speakWord(currentWord.syllable)}>
              <Text style={styles.syllableHelpText}>🔊 Escuchar sílaba: "{currentWord.syllable}"</Text>
            </TouchableOpacity>
          )}

          {/* Mensaje de estado */}
          {gameStatus !== "playing" && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusEmoji}>{gameStatus === "correct" ? "🎉" : "😊"}</Text>
              <Text
                style={[
                  styles.statusText,
                  gameStatus === "correct" && styles.correctText,
                  gameStatus === "wrong" && styles.wrongText,
                ]}
              >
                {gameStatus === "correct"
                  ? `¡La respuesta correcta era "${currentWord.syllable}"!`
                  : `La respuesta correcta era "${currentWord.syllable}"`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Juego de Sopa de Letras (Nuevo)
function WordSearchGameScreen({ route, navigation }: any) {
  const { username } = route.params
  const [score, setScore] = useState(0)
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [gameStarted, setGameStarted] = useState(false)

  // Palabras a encontrar
  const wordsToFind = ["GATO", "RANA", "ROSA", "DADO", "JOYA"]

  // Cuadrícula simple 8x8
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

  const startGame = () => {
    setGameStarted(true)
  }

  const handleCellPress = (row: number, col: number) => {
    // Lógica simple para encontrar palabras
    console.log(`Pressed cell: ${row}, ${col} - ${grid[row][col]}`)
  }

  const saveGameStats = async () => {
    try {
      const userData = await AsyncStorage.getItem(`user_${username}`)
      if (userData) {
        const user = JSON.parse(userData)
        user.gamesPlayed = (user.gamesPlayed || 0) + 1
        user.bestScore = Math.max(user.bestScore || 0, score)
        await AsyncStorage.setItem(`user_${username}`, JSON.stringify(user))
      }
    } catch (error) {
      console.log("Error saving stats:", error)
    }
  }

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startScreen}>
          <Text style={styles.title}>🔍 Sopa de Letras</Text>
          <Text style={styles.subtitle}>Encuentra las palabras ocultas</Text>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>¡Hola {username}!</Text>
            <Text style={styles.instructionText}>Busca estas palabras:</Text>
            <View style={styles.wordsToFindContainer}>
              {wordsToFind.map((word, index) => (
                <Text key={index} style={styles.wordToFind}>
                  {word}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>🔍 Busca palabras en la cuadrícula</Text>
            <Text style={styles.ruleText}>➡️ Pueden estar horizontal o verticalmente</Text>
            <Text style={styles.ruleText}>🎯 Encuentra todas para ganar</Text>
            <Text style={styles.ruleText}>⭐ Gana puntos por cada palabra</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>¡Comenzar Búsqueda! 🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wordSearchContainer}>
        {/* Header */}
        <View style={styles.wordSearchHeader}>
          <Text style={styles.wordSearchTitle}>🔍 Sopa de Letras</Text>
          <Text style={styles.wordSearchScore}>Puntos: {score}</Text>
        </View>

        {/* Palabras a encontrar */}
        <View style={styles.wordsListContainer}>
          <Text style={styles.wordsListTitle}>Palabras a encontrar:</Text>
          <View style={styles.wordsList}>
            {wordsToFind.map((word, index) => (
              <Text key={index} style={[styles.wordInList, foundWords.includes(word) && styles.foundWord]}>
                {word} {foundWords.includes(word) ? "✅" : ""}
              </Text>
            ))}
          </View>
        </View>

        {/* Cuadrícula */}
        <View style={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((letter, colIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={styles.gridCell}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  <Text style={styles.gridLetter}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Botones */}
        <View style={styles.wordSearchButtons}>
          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => Alert.alert("Pista", 'Busca "GATO" en la primera fila 😉')}
          >
            <Text style={styles.hintButtonText}>💡 Pista</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Menú</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

// App Principal con Navegación
export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [initialRoute, setInitialRoute] = useState("Login")

  useEffect(() => {
    checkUserSession()
  }, [])

  const checkUserSession = async () => {
    try {
      const currentUser = await AsyncStorage.getItem("currentUser")
      if (currentUser) {
        const userData = await AsyncStorage.getItem(`user_${currentUser}`)
        if (userData) {
          setInitialRoute("MainMenu")
        }
      }
    } catch (error) {
      console.log("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📚 Cargando Sistema Educativo...</Text>
        <Text style={styles.loadingSubtext}>Preparando tus juegos favoritos</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: "#667eea" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "📚 Registro" }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "🔑 Iniciar Sesión" }} />
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{ title: "🏠 Menú Principal", headerLeft: null }}
        />
        <Stack.Screen name="SyllableGame" component={SyllableGameScreen} options={{ title: "🎯 Juego de Sílabas" }} />
        <Stack.Screen name="WordSearchGame" component={WordSearchGameScreen} options={{ title: "🔍 Sopa de Letras" }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#667eea",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primaryButton: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 15,
    padding: 10,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    margin: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
  },
  activitiesContainer: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syllableCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
  },
  wordSearchCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#F59E0B",
  },
  activityEmoji: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 5,
  },
  activitySubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 10,
  },
  activityStats: {
    alignItems: "center",
  },
  activityStatsText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "bold",
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#667eea",
  },
  loadingText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#E5E7EB",
  },
  // Estilos del juego de sílabas
  startScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "600",
  },
  instructionSubtext: {
    fontSize: 14,
    color: "#E5E7EB",
    textAlign: "center",
  },
  rulesContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
  },
  ruleText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 3,
  },
  startButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 15,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  endScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  endTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  endEmoji: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 20,
  },
  scoreContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  finalScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  wordsCompleted: {
    fontSize: 16,
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 10,
  },
  starsContainer: {
    marginTop: 10,
  },
  stars: {
    fontSize: 24,
    textAlign: "center",
  },
  restartButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 15,
  },
  restartButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  statBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  livesBadge: {
    backgroundColor: "#FEE2E2",
  },
  streakBadge: {
    backgroundColor: "#FEF3C7",
  },
  statText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timer: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
  },
  progressContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 10,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  progressText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  gameArea: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: "#FFFFFF",
    margin: 10,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statusMessage: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F2937",
  },
  correctText: {
    color: "#10B981",
  },
  wrongText: {
    color: "#EF4444",
  },
  wordContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  wordImage: {
    fontSize: 80,
    marginBottom: 15,
  },
  word: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    letterSpacing: 3,
    marginBottom: 15,
  },
  speakButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  syllableButton: {
    backgroundColor: "#8B5CF6",
    width: "48%",
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  correctButton: {
    backgroundColor: "#10B981",
  },
  wrongButton: {
    backgroundColor: "#EF4444",
  },
  syllableButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  syllableHelpButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: "center",
    marginBottom: 20,
  },
  syllableHelpText: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "center",
  },
  statusEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  // Estilos para Sopa de Letras
  wordSearchContainer: {
    flex: 1,
    padding: 15,
  },
  wordSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  wordSearchTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  wordSearchScore: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  wordsToFindContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  wordToFind: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  wordsListContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  wordsListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  wordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  wordInList: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 3,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  foundWord: {
    backgroundColor: "#10B981",
  },
  gridContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignSelf: "center",
  },
  gridRow: {
    flexDirection: "row",
  },
  gridCell: {
    width: 35,
    height: 35,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
  },
  gridLetter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  wordSearchButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  hintButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})
