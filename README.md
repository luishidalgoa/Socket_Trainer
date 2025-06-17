## Estado Online de los Usuarios

El sistema gestiona de forma activa el **estado online** de los usuarios a través de conexiones WebSocket autenticadas mediante JWT. Cada vez que un usuario se conecta, se valida su token y, una vez autenticado, se registra su estado como `online` en la base de datos. Este estado se actualiza dinámicamente y se elimina al desconectarse el cliente, lo que garantiza precisión y limpieza en tiempo real.

Este flujo es fundamental para mantener sincronizados los estados de conexión en funcionalidades como presencia, notificaciones o sistemas de intercambio.

El siguiente diagrama resume el flujo completo:

```mermaid
sequenceDiagram
    participant Cliente as "Cliente"
    participant Server as "Socket Server"
    participant Auth as "Auth Middleware"
    participant OnlineService as "User Service"
    participant DB as "MongoDB"
    
    Cliente->>Server: "Conectar con JWT token"
    Server->>Auth: "Validar autenticación"
    Auth->>Auth: "validateToken_Service()"
    Auth->>OnlineService: "getUserRoles()"
    Auth-->>Server: "Usuario autenticado"
    
    Server->>Cliente: "connection event"
    Cliente->>Server: "emit('online')"
    Server->>OnlineService: "updateOnlineStatus(online: true)"
    OnlineService->>DB: "UsersOnlineModel.updateOne()"
    Server-->>Cliente: "emit('online', confirmation)"
    
    Note over Cliente,DB: Usuario ahora está online
    
    Cliente->>Server: "disconnect"
    Server->>OnlineService: "checkSocketIdOnlineStatus()"
    Server->>OnlineService: "updateOnlineStatus(online: false)"
    OnlineService->>DB: "UsersOnlineModel.deleteOne()"
```
El sistema implementa un patrón de seguridad robusto donde:
- La autenticación JWT es obligatoria para todas las conexiones socket
- El estado online se mantiene en la colección `Users_Onlines` con cleanup automático
- La función `secureOn` valida el estado online antes de procesar eventos
- Al desconectarse, el sistema limpia automáticamente el estado online del usuario

### Eventos de Trade Disponibles

El sistema maneja tres tipos de eventos trade principales:

#### 1. `trade:invite` - Crear Invitación de Intercambio

Este evento permite a un usuario crear una nueva sesión de intercambio e invitar a otro usuario.

**Funcionalidad:**
- Genera un `roomSessionId` único usando `uuidv4()`
- Valida que el usuario no se invite a sí mismo
- Verifica que el usuario invitado existe en la base de datos
- Confirma que el usuario invitado está online
- Crea la sesión de intercambio y une al creador a la sala

#### 2. `trade:accept` - Aceptar Invitación de Intercambio

Este evento permite al usuario invitado aceptar una invitación de intercambio existente.

**Funcionalidad:**
- Une al usuario invitado a la sala de intercambio
- Cambia el estado de la sesión a 'active'
- Notifica a ambos participantes que la sesión está activa

#### 3. `trade:exit` - Salir de Sesión de Intercambio

Este evento permite a cualquier participante abandonar una sesión de intercambio activa.

**Funcionalidad:**
- Verifica que el usuario esté en una sesión activa
- Cambia el estado de la sesión a 'closed'
- Notifica al otro participante sobre el abandono
- Desconecta al usuario que sale

### Diagramas de Flujo de Usuario

#### Diagrama: trade:invite (Crear Invitación)

```mermaid
sequenceDiagram
    participant Invitador as "Usuario Invitador"
    participant Server as "Trade Handler"
    participant DB as "UserModel"
    participant Sistema as "Trade System"
    participant Invitado as "Usuario Invitado"
    
    Invitador->>Server: "emit('trade:invite')"
    Server->>Server: "uuidv4() - generar roomSessionId"
    Server->>Server: "Validar: invitador ≠ invitado"
    Server->>DB: "UserModel.findOne(invitedUsername)"
    DB-->>Server: "Usuario existe"
    Server->>Sistema: "checkOnlineStatus(invitedUsername)"
    Sistema-->>Server: "Usuario online"
    Server->>Sistema: "createRoomSession()"
    Server->>Server: "socket.join(roomSessionId)"
    Server-->>Invitador: "trade:invite {roomSessionId, message}"
    
    Note over Invitador,Invitado: Sesión creada, esperando aceptación
```

#### Diagrama: trade:accept (Aceptar Invitación)

```mermaid
sequenceDiagram
    participant Invitado as "Usuario Invitado"
    participant Server as "Trade Handler"
    participant Sistema as "Trade System"
    participant Invitador as "Usuario Invitador"
    
    Invitado->>Server: "emit('trade:accept', {roomSessionId})"
    Server->>Sistema: "roomJoin(socket, roomSessionId)"
    Sistema->>Sistema: "Actualizar session.status = 'active'"
    Sistema->>Sistema: "Agregar usuario invitado a session.users"
    Server->>Invitado: "trade:accept {message, roomSessionId}"
    Server->>Invitador: "trade:invite {message, roomSession}"
    
    Note over Invitado,Invitador: Sesión activa, ambos usuarios conectados

```

#### Diagrama: trade:exit (Salir de Sesión)

```mermaid
sequenceDiagram
    participant Usuario as "Usuario Saliente"
    participant Server as "Trade Handler"
    participant Sistema as "Trade System"
    participant OtroUsuario as "Otro Participante"
    
    Usuario->>Server: "emit('trade:exit', {roomSessionId})"
    Server->>Sistema: "get_RoomSession_By_Username(username)"
    Sistema-->>Server: "Sesión encontrada"
    Server->>Sistema: "session.status = 'closed'"
    Server-->>OtroUsuario: "trade:session {message: 'abandono la sala'}"
    Server->>Usuario: "socket.disconnect(true)"
    
    Note over Usuario,OtroUsuario: Sesión cerrada, usuario desconectado
```

### Modelo de Datos de Sesión

Las sesiones de trade utilizan el modelo `TradeSession`:

````ts
interface TradeSession {
  roomSessionId: string;
  users: {
    [username: string]: {
      socketId: string;
      role: 'owner' | 'guest' | string;
      trade_status: 'waiting' | 'ready' | 'accepted' | 'denied' | string;
      connected: boolean;
      offeredCardIds: string[];
    };
  };
  status: 'waiting' | 'active' | 'denied' | 'closed';
  lastUpdated: string; // ISO timestamp
}
````

### SecureOn (middleware)

Todos los eventos trade están protegidos por el wrapper `secureOn` que valida la autenticación y estado online del usuario antes de procesar el evento. El sistema utiliza mapas en memoria para gestionar las sesiones activas y mantiene sincronización entre sockets y sesiones de intercambio.
