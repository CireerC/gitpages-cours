---
layout: course
title: "Programmation mobile"
semestre: "S7"
type_cours: "dev"
tags: ["Android", "Kotlin", "Jetpack Compose", "React Native", "Flutter", "API REST", "SQLite", "lifecycle"]
---

## Introduction

Ce cours couvre le développement d'applications mobiles natives et cross-platform, en se concentrant sur Android/Kotlin et en comparant les approches React Native et Flutter.

---

## Architecture Android

### Composants fondamentaux

| Composant | Rôle |
|-----------|------|
| **Activity** | Écran avec lequel l'utilisateur interagit |
| **Fragment** | Portion d'UI réutilisable dans une Activity |
| **Service** | Traitement en arrière-plan (sans UI) |
| **BroadcastReceiver** | Réception d'événements système |
| **ContentProvider** | Partage de données entre applications |

### Cycle de vie d'une Activity

```
Lancée
    │
    ▼
onCreate()    ← Initialiser les données, inflater la vue
    │
    ▼
onStart()     ← L'activité devient visible
    │
    ▼
onResume()    ← L'activité est au premier plan (interactif)
    │
    ▼ ← L'utilisateur change d'app ou navigue
onPause()     ← Libérer les ressources légères, sauvegarder
    │
    ▼ (si mémoire faible ou autre app lancée)
onStop()      ← Libérer les ressources lourdes
    │
    ▼ (si l'OS a besoin de mémoire)
onDestroy()   ← Nettoyer toutes les ressources

Rotation d'écran : onPause → onStop → onDestroy → onCreate → ...
Solution : ViewModel (survit à la rotation)
```

---

## Kotlin — Bases essentielles

```kotlin
// Variables et types
val name: String = "Alice"        // Immutable
var score: Int = 0                // Mutable
val pi = 3.14159                  // Inférence de type

// Null safety
var nullable: String? = null
val length = nullable?.length ?: 0     // Elvis operator
val upper = nullable!!.uppercase()     // Non-null assertion (dangereux)

// Data class
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val role: Role = Role.USER
)

enum class Role { ADMIN, USER, GUEST }

// Extension functions
fun String.isValidEmail() = Regex("^[A-Za-z0-9+_.-]+@(.+)$").matches(this)

// Coroutines
import kotlinx.coroutines.*

suspend fun fetchUser(id: Int): User = withContext(Dispatchers.IO) {
    api.getUser(id)  // Opération réseau sur thread IO
}

// Lancement depuis une Activity/ViewModel
lifecycleScope.launch {
    val user = fetchUser(42)
    // Retour sur le thread principal automatiquement
    updateUI(user)
}
```

---

## Jetpack Compose

Toolkit UI déclaratif d'Android (équivalent SwiftUI / Flutter).

```kotlin
// Composable de base
@Composable
fun UserCard(user: User, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = user.avatarUrl,
                contentDescription = "Avatar de ${user.name}",
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = user.name, style = MaterialTheme.typography.titleMedium)
                Text(text = user.email, style = MaterialTheme.typography.bodySmall,
                     color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

// État et recomposition
@Composable
fun CounterScreen() {
    var count by remember { mutableStateOf(0) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = "Compteur : $count", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { count++ }) {
            Text("Incrémenter")
        }
    }
}

// LazyColumn (RecyclerView en Compose)
@Composable
fun UserList(users: List<User>, onUserClick: (User) -> Unit) {
    LazyColumn {
        items(users, key = { it.id }) { user ->
            UserCard(user = user, onClick = { onUserClick(user) })
        }
    }
}
```

---

## Architecture MVVM

```
View (Composable/Activity)
    │  observe State
    ▼
ViewModel (logique UI, State)
    │  appelle
    ▼
Repository (source unique de vérité)
    │          │
    ▼          ▼
API REST    Room DB (cache local)
```

```kotlin
// ViewModel
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<List<User>>>(UiState.Loading)
    val uiState: StateFlow<UiState<List<User>>> = _uiState.asStateFlow()

    init { loadUsers() }

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val users = userRepository.getUsers()
                _uiState.value = UiState.Success(users)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Erreur inconnue")
            }
        }
    }
}

sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
```

---

## Consommation d'API REST — Retrofit

```kotlin
// Interface de l'API
interface ApiService {
    @GET("users")
    suspend fun getUsers(@Query("page") page: Int = 1): Response<UsersResponse>

    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: Int): User

    @POST("users")
    suspend fun createUser(@Body user: CreateUserRequest): User

    @PUT("users/{id}")
    suspend fun updateUser(@Path("id") id: Int, @Body user: UpdateUserRequest): User
}

// Configuration Retrofit (injection Hilt)
@Module @InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Bearer ${BuildConfig.API_KEY}")
                .build()
            chain.proceed(request)
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com/v1/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}
```

---

## Persistance — Room (SQLite)

```kotlin
// Entity
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: Int,
    @ColumnInfo(name = "full_name") val name: String,
    val email: String,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)

// DAO (Data Access Object)
@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY full_name ASC")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: Int): UserEntity?

    @Upsert
    suspend fun upsertUser(user: UserEntity)

    @Delete
    suspend fun deleteUser(user: UserEntity)

    @Query("DELETE FROM users")
    suspend fun clearAll()
}

// Database
@Database(entities = [UserEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null
        fun getInstance(context: Context): AppDatabase = INSTANCE ?: synchronized(this) {
            Room.databaseBuilder(context, AppDatabase::class.java, "app_database")
                .fallbackToDestructiveMigration()
                .build().also { INSTANCE = it }
        }
    }
}
```

---

## Comparatif des approches

| Critère | Android Natif (Kotlin) | React Native | Flutter |
|---------|----------------------|-------------|---------|
| Langage | Kotlin / Java | JavaScript / TypeScript | Dart |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Plateformes | Android uniquement | iOS + Android | iOS + Android + Web + Desktop |
| UX native | ✅ parfaite | ⚠️ approximative | ⚠️ custom widgets |
| Courbe d'apprentissage | Élevée | Faible (JS) | Moyenne |
| Taille de l'app | Petite | Grande (+JS runtime) | Grande (+Flutter engine) |
| Cas d'usage | Apps Google, haute perf | Apps simples, équipe JS | Apps cross-platform |

---

## Résumé

- **MVVM + Hilt + Coroutines** = architecture standard Android 2024
- **Jetpack Compose** remplace les XML layouts (API déclarative)
- **Room** pour la persistance locale, **Retrofit** pour les API REST
- **StateFlow / LiveData** pour l'observation réactive de l'état
- Toujours utiliser `lifecycleScope` ou `viewModelScope` pour les coroutines
- Tests : `JUnit4` + `Mockito` pour les ViewModel, `Espresso` pour l'UI
