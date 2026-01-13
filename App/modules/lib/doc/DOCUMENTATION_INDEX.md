# AIST Monitor Framework - Complete Documentation

**Version**: 2.0
**Last Updated**: 2024-01-14
**Status**: Production Ready

---

## 📚 Documentation Structure

This documentation is organized into **6 chapters** covering all aspects of the AIST Monitor Framework.

---

## Table of Contents

### [Chapter 1: Getting Started](./01-getting-started/)
Quick start guides and tutorials for new developers.

- **[01-TUTORIAL.md](./01-getting-started/01-TUTORIAL.md)** - Complete step-by-step tutorial
- **[02-QUICKSTART.md](./01-getting-started/02-QUICKSTART.md)** - Quick setup guide
- **[03-ENVIRONMENT-SETUP.md](./01-getting-started/03-ENVIRONMENT-SETUP.md)** - Environment configuration

### [Chapter 2: Architecture](./02-architecture/)
System architecture, design patterns, and framework structure.

- **[01-FRAMEWORK-OVERVIEW.md](./02-architecture/01-FRAMEWORK-OVERVIEW.md)** - Framework revision and architecture
- **[02-CLEAN-ARCHITECTURE.md](./02-architecture/02-CLEAN-ARCHITECTURE.md)** - Clean architecture principles
- **[03-ARCHITECTURE-DIAGRAM.md](./02-architecture/03-ARCHITECTURE-DIAGRAM.md)** - Visual architecture diagrams
- **[04-STRUCTURE-COMPARISON.md](./02-architecture/04-STRUCTURE-COMPARISON.md)** - Before/after structure comparison

### [Chapter 3: Backend Development](./03-backend/)
Backend services, modules, and integration guides.

- **[01-IMPLEMENTATION-GUIDE.md](./03-backend/01-IMPLEMENTATION-GUIDE.md)** - Complete implementation guide
- **[02-BACKEND-INTEGRATION.md](./03-backend/02-BACKEND-INTEGRATION.md)** - Backend integration summary
- **[03-DATABASE.md](./03-backend/03-DATABASE.md)** - Database documentation
- **[04-SERIAL-COMMUNICATION.md](./03-backend/04-SERIAL-COMMUNICATION.md)** - Serial port communication
- **[05-WEBSOCKET.md](./03-backend/05-WEBSOCKET.md)** - WebSocket server documentation
- **[06-CONFIGURATION.md](./03-backend/06-CONFIGURATION.md)** - Configuration compatibility

### [Chapter 4: Frontend Development](./04-frontend/)
React frontend, service layer, and component development.

- **[01-FRONTEND-INTEGRATION.md](./04-frontend/01-FRONTEND-INTEGRATION.md)** - Frontend-backend integration analysis
- **[02-FRONTEND-QUICKSTART.md](./04-frontend/02-FRONTEND-QUICKSTART.md)** - Quick start guide
- **[03-SERVICE-LAYER.md](./04-frontend/03-SERVICE-LAYER.md)** - Service layer documentation
- **[04-REACT-HOOKS.md](./04-frontend/04-REACT-HOOKS.md)** - React hooks guide
- **[05-COMPONENTS.md](./04-frontend/05-COMPONENTS.md)** - Component examples

### [Chapter 5: Deployment](./05-deployment/)
Docker, cloud deployment, and production setup.

- **[01-DOCKER-SETUP.md](./05-deployment/01-DOCKER-SETUP.md)** - Docker configuration
- **[02-DOCKER-DEMO.md](./05-deployment/02-DOCKER-DEMO.md)** - Docker demo and testing
- **[03-AZURE-INTEGRATION.md](./05-deployment/03-AZURE-INTEGRATION.md)** - Azure deployment
- **[04-AZURE-QUICKSTART.md](./05-deployment/04-AZURE-QUICKSTART.md)** - Azure quick start

### [Chapter 6: Reference](./06-reference/)
API reference, troubleshooting, and additional resources.

- **[01-API-REFERENCE.md](./06-reference/01-API-REFERENCE.md)** - Complete API reference
- **[02-FIREBASE-REFERENCE.md](./06-reference/02-FIREBASE-REFERENCE.md)** - Firebase/Firestore documentation
- **[03-COSMOS-DB-REFERENCE.md](./06-reference/03-COSMOS-DB-REFERENCE.md)** - Azure Cosmos DB reference
- **[04-DEPENDENCY-VALIDATION.md](./06-reference/04-DEPENDENCY-VALIDATION.md)** - Dependency validation
- **[05-TROUBLESHOOTING.md](./06-reference/05-TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🚀 Quick Navigation

### For New Developers
Start here:
1. [Chapter 1: Getting Started](./01-getting-started/01-TUTORIAL.md)
2. [Quick Start Guide](./01-getting-started/02-QUICKSTART.md)
3. [Environment Setup](./01-getting-started/03-ENVIRONMENT-SETUP.md)

### For Backend Developers
1. [Implementation Guide](./03-backend/01-IMPLEMENTATION-GUIDE.md)
2. [Backend Integration](./03-backend/02-BACKEND-INTEGRATION.md)
3. [Architecture Overview](./02-architecture/01-FRAMEWORK-OVERVIEW.md)

### For Frontend Developers
1. [Frontend Integration](./04-frontend/01-FRONTEND-INTEGRATION.md)
2. [Frontend Quick Start](./04-frontend/02-FRONTEND-QUICKSTART.md)
3. [Service Layer Guide](./04-frontend/03-SERVICE-LAYER.md)

### For DevOps
1. [Docker Setup](./05-deployment/01-DOCKER-SETUP.md)
2. [Azure Integration](./05-deployment/03-AZURE-INTEGRATION.md)
3. [Environment Configuration](./01-getting-started/03-ENVIRONMENT-SETUP.md)

---

## 📊 Documentation Status

| Chapter | Status | Completeness | Last Updated |
|---------|--------|--------------|--------------|
| **1. Getting Started** | ✅ Complete | 100% | 2024-01-14 |
| **2. Architecture** | ✅ Complete | 100% | 2024-01-14 |
| **3. Backend Development** | ✅ Complete | 100% | 2024-01-14 |
| **4. Frontend Development** | ✅ Complete | 100% | 2024-01-14 |
| **5. Deployment** | ✅ Complete | 100% | 2024-01-14 |
| **6. Reference** | ✅ Complete | 100% | 2024-01-14 |

---

## 🎯 Framework Features

### Core Services
- ✅ **EventBus** - Centralized event system
- ✅ **LoggingService** - Structured JSON logging
- ✅ **DatabaseService** - Database facade with encryption
- ✅ **ValidationService** - Schema validation
- ✅ **LifecycleManager** - Standardized lifecycle management

### Backend Modules
- ✅ **DatabaseManager** - Multi-database support (MySQL, Firestore, CosmosDB)
- ✅ **APIServer** - Express REST API
- ✅ **SerialManager** - Serial port communication
- ✅ **WebSocketManager** - Real-time WebSocket server
- ✅ **WindowManager** - Electron window management
- ✅ **IPCManager** - Inter-process communication

### Frontend Integration
- ✅ **Service Layer** - Unified IPC/API abstraction
- ✅ **React Hooks** - Data fetching and state management
- ✅ **Mode-Aware** - Automatic Electron/Standalone detection

### Deployment
- ✅ **Docker** - Containerized deployment
- ✅ **Azure** - Cloud deployment support
- ✅ **Electron** - Desktop application
- ✅ **Standalone** - Web server mode

---

## 🏗️ Project Structure

```
AIST/TA_PROTOTYPE/
├── App/
│   ├── modules/
│   │   ├── modules_config/          # Manager modules
│   │   │   ├── database/            # DatabaseManager
│   │   │   ├── api/                 # APIServer
│   │   │   ├── serial/              # SerialManager
│   │   │   ├── websocket/           # WebSocketManager
│   │   │   ├── window/              # WindowManager
│   │   │   └── ipc/                 # IPCManager
│   │   └── lib/
│   │       ├── events/              # EventBus
│   │       ├── services/            # Core services
│   │       ├── base/                # Base classes
│   │       ├── client/              # Shared clients
│   │       └── doc/                 # 📚 This documentation
│   ├── Http/Controllers/            # API controllers
│   ├── config/                      # Configuration
│   └── bootstrap.js                 # Application entry
├── src/                             # React frontend
│   ├── components/                  # React components
│   ├── hook/                        # React hooks
│   └── services/                    # Frontend service layer
└── main.js                          # Electron entry point
```

---

## 📖 Reading Guide

### Linear Reading (Recommended for Beginners)
Read chapters in order:
1. Getting Started → 2. Architecture → 3. Backend → 4. Frontend → 5. Deployment

### Topic-Based Reading (Experienced Developers)
Jump to relevant chapters:
- **Building Backend**: Chapter 2 + 3
- **Building Frontend**: Chapter 2 + 4
- **Deployment**: Chapter 5
- **API Reference**: Chapter 6

### Quick Reference
Use Chapter 6 for quick lookups:
- API methods
- Configuration options
- Error codes
- Troubleshooting

---

## 🤝 Contributing

When adding new documentation:

1. Place in appropriate chapter directory
2. Follow naming convention: `##-TITLE.md`
3. Update this index file
4. Add to table of contents
5. Update status table

---

## 📝 Document Conventions

### Filename Format
- `##-TITLE.md` where `##` is a two-digit number
- Example: `01-TUTORIAL.md`, `02-QUICKSTART.md`

### Document Structure
Each document should have:
1. **Title** - Clear, descriptive title
2. **Metadata** - Version, status, last updated
3. **Table of Contents** - For longer documents
4. **Content** - Well-structured with headers
5. **Examples** - Code examples where applicable
6. **See Also** - Links to related documents

### Markdown Style
- Use **headers** for structure (H1, H2, H3)
- Use **code blocks** with language tags
- Use **tables** for comparisons
- Use **emojis** for visual cues (✅ ❌ ⚠️ 📚 🚀)
- Use **links** to cross-reference documents

---

## 🔗 External Resources

### GitHub
- Repository: [github.com/your-org/aist-monitor](https://github.com)
- Issues: [github.com/your-org/aist-monitor/issues](https://github.com)

### Community
- Discord: [discord.gg/aist-monitor](https://discord.gg)
- Forum: [forum.aist-monitor.com](https://forum.aist-monitor.com)

### Related Projects
- Electron: [electronjs.org](https://electronjs.org)
- React: [reactjs.org](https://reactjs.org)
- Express: [expressjs.com](https://expressjs.com)

---

## 📊 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2024-01-14 | Complete framework revision, frontend integration, documentation reorganization |
| 1.5 | 2023-11-13 | Clean architecture implementation, Azure support |
| 1.0 | 2023-11-03 | Initial framework release |

---

## 📞 Support

For support:
1. Check [Troubleshooting Guide](./06-reference/05-TROUBLESHOOTING.md)
2. Search existing documentation
3. Review [API Reference](./06-reference/01-API-REFERENCE.md)
4. Open an issue on GitHub

---

**Framework**: AIST Monitor Framework v2.0
**Documentation Status**: ✅ Complete
**Last Audit**: 2024-01-14
**Next Review**: 2024-02-14
