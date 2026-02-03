# Client Timesheet Application - C++ Migration Plan for Linux

## Executive Summary

This document provides a comprehensive migration plan for converting the Client Timesheet Application from its current Node.js/React stack to a C++ backend running on Linux. The migration aims to achieve improved performance, reduced memory footprint, and native Linux integration while maintaining full feature parity with the existing application.

**Current Stack:** Node.js (Express.js) + React (TypeScript) + SQLite
**Target Stack:** C++ Backend + React Frontend (retained) + SQLite

---

## Table of Contents

1. [Current Application Analysis](#1-current-application-analysis)
2. [Migration Strategy Overview](#2-migration-strategy-overview)
3. [Technology Selection](#3-technology-selection)
4. [Detailed Migration Phases](#4-detailed-migration-phases)
5. [Architecture Design](#5-architecture-design)
6. [Code Migration Guide](#6-code-migration-guide)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment Strategy](#8-deployment-strategy)
9. [Risk Assessment and Mitigation](#9-risk-assessment-and-mitigation)
10. [Timeline and Resource Estimates](#10-timeline-and-resource-estimates)
11. [Appendix](#11-appendix)

---

## 1. Current Application Analysis

### 1.1 Application Overview

The Client Timesheet Application is a full-stack web application for tracking employee work hours across multiple clients. It provides client management, time entry recording, reporting, and data export capabilities.

### 1.2 Current Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend Runtime | Node.js | 20.x |
| Backend Framework | Express.js | 4.18.2 |
| Database | SQLite3 | 5.1.6 |
| Validation | Joi | 17.11.0 |
| Security | Helmet | 7.1.0 |
| Rate Limiting | express-rate-limit | 7.1.5 |
| Logging | Morgan | 1.10.0 |
| CSV Export | csv-writer | 1.6.0 |
| PDF Export | pdfkit | 0.13.0 |
| Frontend Framework | React | 19.2.0 |
| UI Library | Material UI | 7.3.6 |
| State Management | TanStack Query | 5.90.11 |
| HTTP Client | Axios | 1.13.2 |
| Build Tool | Vite | 7.2.4 |
| Containerization | Docker | Multi-stage |

### 1.3 Backend Architecture

The current backend follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Express.js Server                        │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer                                            │
│  ├── Helmet (Security Headers)                              │
│  ├── CORS                                                   │
│  ├── Rate Limiting                                          │
│  ├── Morgan (Logging)                                       │
│  ├── Body Parser (JSON)                                     │
│  └── Authentication (Email-based)                           │
├─────────────────────────────────────────────────────────────┤
│  Routes Layer                                                │
│  ├── /api/auth (login, me)                                  │
│  ├── /api/clients (CRUD)                                    │
│  ├── /api/work-entries (CRUD)                               │
│  └── /api/reports (JSON, CSV, PDF export)                   │
├─────────────────────────────────────────────────────────────┤
│  Validation Layer (Joi Schemas)                              │
├─────────────────────────────────────────────────────────────┤
│  Database Layer (SQLite3)                                    │
│  ├── users                                                  │
│  ├── clients                                                │
│  └── work_entries                                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Database Schema

```sql
-- Users table
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    email TEXT,
    user_email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Work entries table
CREATE TABLE work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_clients_user_email ON clients (user_email);
CREATE INDEX idx_work_entries_client_id ON work_entries (client_id);
CREATE INDEX idx_work_entries_user_email ON work_entries (user_email);
CREATE INDEX idx_work_entries_date ON work_entries (date);
```

### 1.5 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/login` | POST | User login (email-based) |
| `/api/auth/me` | GET | Get current user |
| `/api/clients` | GET | List all clients |
| `/api/clients/:id` | GET | Get specific client |
| `/api/clients` | POST | Create client |
| `/api/clients/:id` | PUT | Update client |
| `/api/clients/:id` | DELETE | Delete client |
| `/api/clients` | DELETE | Delete all clients |
| `/api/work-entries` | GET | List work entries |
| `/api/work-entries/:id` | GET | Get specific entry |
| `/api/work-entries` | POST | Create work entry |
| `/api/work-entries/:id` | PUT | Update work entry |
| `/api/work-entries/:id` | DELETE | Delete work entry |
| `/api/reports/client/:id` | GET | Get client report |
| `/api/reports/export/csv/:id` | GET | Export CSV |
| `/api/reports/export/pdf/:id` | GET | Export PDF |

### 1.6 Frontend Components

The React frontend consists of:

- **Pages:** LoginPage, DashboardPage, ClientsPage, WorkEntriesPage, ReportsPage
- **Components:** Layout (navigation, sidebar)
- **Contexts:** AuthContext (authentication state)
- **API Client:** Axios-based HTTP client with interceptors
- **State Management:** TanStack Query for server state

---

## 2. Migration Strategy Overview

### 2.1 Recommended Approach: Backend-Only Migration

We recommend migrating only the backend to C++ while retaining the React frontend. This approach offers several advantages:

1. **Reduced Complexity:** Frontend migration to C++ (Qt/GTK) would require complete rewrite
2. **Faster Time-to-Market:** React frontend can be reused with minimal changes
3. **Maintained UX:** Users experience no change in the interface
4. **Easier Testing:** API contract remains the same, enabling parallel testing
5. **Team Flexibility:** Frontend and backend teams can work independently

### 2.2 Migration Phases Overview

```
Phase 1: Foundation Setup (Week 1-2)
    └── Development environment, build system, core libraries

Phase 2: Database Layer (Week 2-3)
    └── SQLite integration, models, migrations

Phase 3: Core HTTP Server (Week 3-4)
    └── Web framework, routing, middleware

Phase 4: Authentication & Security (Week 4-5)
    └── Auth middleware, rate limiting, security headers

Phase 5: Business Logic (Week 5-7)
    └── CRUD operations, validation, error handling

Phase 6: Reports & Export (Week 7-8)
    └── CSV generation, PDF generation

Phase 7: Integration & Testing (Week 8-10)
    └── API testing, performance testing, frontend integration

Phase 8: Deployment & Documentation (Week 10-12)
    └── Docker, CI/CD, documentation
```

---

## 3. Technology Selection

### 3.1 C++ Web Framework Comparison

| Framework | Performance | Ease of Use | Documentation | Community | Recommendation |
|-----------|-------------|-------------|---------------|-----------|----------------|
| **Drogon** | Excellent | Moderate | Good | Active | **Primary Choice** |
| Crow | Good | Easy | Moderate | Moderate | Alternative |
| Oat++ | Excellent | Moderate | Good | Growing | Alternative |
| Pistache | Good | Easy | Limited | Small | Not Recommended |
| cpp-httplib | Good | Very Easy | Good | Active | Simple Projects |

**Selected Framework: Drogon**

Drogon is selected as the primary framework due to:
- High performance (async I/O based on epoll/kqueue)
- Built-in ORM support
- JSON handling
- WebSocket support
- Active development and community
- Production-ready

### 3.2 Complete Technology Stack

| Component | Selected Library | Rationale |
|-----------|-----------------|-----------|
| **Web Framework** | Drogon 1.9.x | High performance, full-featured |
| **JSON** | nlohmann/json | Industry standard, easy to use |
| **Database** | SQLite3 + Drogon ORM | Native integration |
| **Validation** | Custom + JSON Schema | Flexible validation |
| **Logging** | spdlog | Fast, feature-rich |
| **PDF Generation** | libharu | Lightweight, cross-platform |
| **CSV Generation** | Custom implementation | Simple requirements |
| **Testing** | Google Test + Catch2 | Comprehensive testing |
| **Build System** | CMake | Industry standard |
| **Package Manager** | vcpkg | Microsoft-backed, extensive |

### 3.3 Linux-Specific Considerations

The C++ backend will leverage Linux-specific features:

- **epoll** for efficient I/O multiplexing (via Drogon)
- **systemd** for service management
- **Linux filesystem** for file operations
- **POSIX threads** for concurrency
- **Linux security modules** (AppArmor/SELinux) compatibility

---

## 4. Detailed Migration Phases

### Phase 1: Foundation Setup (Week 1-2)

#### 4.1.1 Development Environment Setup

**Required Tools:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    cmake \
    git \
    libssl-dev \
    libsqlite3-dev \
    uuid-dev \
    zlib1g-dev \
    libc-ares-dev \
    libjsoncpp-dev \
    libpng-dev \
    pkg-config

# Install vcpkg
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh
./vcpkg integrate install
```

**Install Dependencies via vcpkg:**
```bash
./vcpkg install drogon
./vcpkg install nlohmann-json
./vcpkg install spdlog
./vcpkg install gtest
./vcpkg install libharu
```

#### 4.1.2 Project Structure

```
timesheet-cpp/
├── CMakeLists.txt
├── vcpkg.json
├── src/
│   ├── main.cpp
│   ├── config/
│   │   └── config.h
│   ├── controllers/
│   │   ├── AuthController.h
│   │   ├── AuthController.cpp
│   │   ├── ClientController.h
│   │   ├── ClientController.cpp
│   │   ├── WorkEntryController.h
│   │   ├── WorkEntryController.cpp
│   │   ├── ReportController.h
│   │   └── ReportController.cpp
│   ├── models/
│   │   ├── User.h
│   │   ├── Client.h
│   │   └── WorkEntry.h
│   ├── middleware/
│   │   ├── AuthMiddleware.h
│   │   ├── AuthMiddleware.cpp
│   │   ├── RateLimitMiddleware.h
│   │   └── RateLimitMiddleware.cpp
│   ├── services/
│   │   ├── DatabaseService.h
│   │   ├── DatabaseService.cpp
│   │   ├── ValidationService.h
│   │   ├── ValidationService.cpp
│   │   ├── CsvService.h
│   │   ├── CsvService.cpp
│   │   ├── PdfService.h
│   │   └── PdfService.cpp
│   └── utils/
│       ├── Logger.h
│       └── Utils.h
├── tests/
│   ├── CMakeLists.txt
│   ├── test_auth.cpp
│   ├── test_clients.cpp
│   ├── test_work_entries.cpp
│   └── test_reports.cpp
├── config/
│   ├── config.json
│   └── config.production.json
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/
    └── api.md
```

#### 4.1.3 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.16)
project(timesheet-cpp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(Drogon CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(spdlog CONFIG REQUIRED)
find_package(SQLite3 REQUIRED)

# Source files
set(SOURCES
    src/main.cpp
    src/controllers/AuthController.cpp
    src/controllers/ClientController.cpp
    src/controllers/WorkEntryController.cpp
    src/controllers/ReportController.cpp
    src/middleware/AuthMiddleware.cpp
    src/middleware/RateLimitMiddleware.cpp
    src/services/DatabaseService.cpp
    src/services/ValidationService.cpp
    src/services/CsvService.cpp
    src/services/PdfService.cpp
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE
    Drogon::Drogon
    nlohmann_json::nlohmann_json
    spdlog::spdlog
    SQLite::SQLite3
)

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/src
)

# Enable testing
enable_testing()
add_subdirectory(tests)
```

### Phase 2: Database Layer (Week 2-3)

#### 4.2.1 Database Service Implementation

```cpp
// src/services/DatabaseService.h
#pragma once

#include <sqlite3.h>
#include <string>
#include <memory>
#include <optional>
#include <vector>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

class DatabaseService {
public:
    static DatabaseService& getInstance();
    
    void initialize(const std::string& dbPath);
    void close();
    
    // User operations
    std::optional<json> getUserByEmail(const std::string& email);
    bool createUser(const std::string& email);
    
    // Client operations
    std::vector<json> getClientsByUser(const std::string& userEmail);
    std::optional<json> getClientById(int id, const std::string& userEmail);
    std::optional<json> createClient(const json& clientData, const std::string& userEmail);
    std::optional<json> updateClient(int id, const json& clientData, const std::string& userEmail);
    bool deleteClient(int id, const std::string& userEmail);
    int deleteAllClients(const std::string& userEmail);
    
    // Work entry operations
    std::vector<json> getWorkEntries(const std::string& userEmail, std::optional<int> clientId = std::nullopt);
    std::optional<json> getWorkEntryById(int id, const std::string& userEmail);
    std::optional<json> createWorkEntry(const json& entryData, const std::string& userEmail);
    std::optional<json> updateWorkEntry(int id, const json& entryData, const std::string& userEmail);
    bool deleteWorkEntry(int id, const std::string& userEmail);
    
    // Report operations
    std::optional<json> getClientReport(int clientId, const std::string& userEmail);

private:
    DatabaseService() = default;
    ~DatabaseService();
    
    DatabaseService(const DatabaseService&) = delete;
    DatabaseService& operator=(const DatabaseService&) = delete;
    
    void initializeTables();
    void createIndexes();
    
    sqlite3* db_ = nullptr;
    std::string dbPath_;
};
```

#### 4.2.2 Model Definitions

```cpp
// src/models/User.h
#pragma once

#include <string>
#include <nlohmann/json.hpp>

struct User {
    std::string email;
    std::string createdAt;
    
    NLOHMANN_DEFINE_TYPE_INTRUSIVE(User, email, createdAt)
};

// src/models/Client.h
#pragma once

#include <string>
#include <optional>
#include <nlohmann/json.hpp>

struct Client {
    int id;
    std::string name;
    std::optional<std::string> description;
    std::optional<std::string> department;
    std::optional<std::string> email;
    std::string userEmail;
    std::string createdAt;
    std::string updatedAt;
    
    static Client fromJson(const nlohmann::json& j);
    nlohmann::json toJson() const;
};

// src/models/WorkEntry.h
#pragma once

#include <string>
#include <optional>
#include <nlohmann/json.hpp>

struct WorkEntry {
    int id;
    int clientId;
    std::string userEmail;
    double hours;
    std::optional<std::string> description;
    std::string date;
    std::string createdAt;
    std::string updatedAt;
    std::optional<std::string> clientName;
    
    static WorkEntry fromJson(const nlohmann::json& j);
    nlohmann::json toJson() const;
};
```

### Phase 3: Core HTTP Server (Week 3-4)

#### 4.3.1 Main Application Entry Point

```cpp
// src/main.cpp
#include <drogon/drogon.h>
#include <spdlog/spdlog.h>
#include "services/DatabaseService.h"
#include "config/config.h"

int main(int argc, char* argv[]) {
    // Initialize logging
    spdlog::set_level(spdlog::level::info);
    spdlog::info("Starting Timesheet Application...");
    
    // Load configuration
    auto& app = drogon::app();
    
    // Database initialization
    std::string dbPath = std::getenv("DATABASE_PATH") 
        ? std::getenv("DATABASE_PATH") 
        : ":memory:";
    DatabaseService::getInstance().initialize(dbPath);
    
    // Configure server
    app.setLogPath("./logs")
       .setLogLevel(trantor::Logger::kInfo)
       .addListener("0.0.0.0", 3001)
       .setThreadNum(std::thread::hardware_concurrency())
       .enableRunAsDaemon()
       .setDocumentRoot("./public");
    
    // CORS configuration
    app.registerPreRoutingAdvice([](const drogon::HttpRequestPtr& req,
                                    drogon::AdviceCallback&& callback,
                                    drogon::AdviceChainCallback&& chainCallback) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->addHeader("Access-Control-Allow-Origin", "*");
        resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp->addHeader("Access-Control-Allow-Headers", "Content-Type, x-user-email");
        
        if (req->method() == drogon::Options) {
            callback(resp);
            return;
        }
        chainCallback();
    });
    
    // Health check endpoint
    app.registerHandler("/health",
        [](const drogon::HttpRequestPtr& req,
           std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
            Json::Value json;
            json["status"] = "OK";
            json["timestamp"] = drogon::utils::getFormattedDate();
            auto resp = drogon::HttpResponse::newHttpJsonResponse(json);
            callback(resp);
        },
        {drogon::Get});
    
    spdlog::info("Server starting on port 3001...");
    app.run();
    
    // Cleanup
    DatabaseService::getInstance().close();
    return 0;
}
```

#### 4.3.2 Controller Implementation Example

```cpp
// src/controllers/ClientController.h
#pragma once

#include <drogon/HttpController.h>

class ClientController : public drogon::HttpController<ClientController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ClientController::getAll, "/api/clients", drogon::Get);
    ADD_METHOD_TO(ClientController::getOne, "/api/clients/{id}", drogon::Get);
    ADD_METHOD_TO(ClientController::create, "/api/clients", drogon::Post);
    ADD_METHOD_TO(ClientController::update, "/api/clients/{id}", drogon::Put);
    ADD_METHOD_TO(ClientController::remove, "/api/clients/{id}", drogon::Delete);
    ADD_METHOD_TO(ClientController::removeAll, "/api/clients", drogon::Delete);
    METHOD_LIST_END
    
    void getAll(const drogon::HttpRequestPtr& req,
                std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void getOne(const drogon::HttpRequestPtr& req,
                std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                int id);
    void create(const drogon::HttpRequestPtr& req,
                std::function<void(const drogon::HttpResponsePtr&)>&& callback);
    void update(const drogon::HttpRequestPtr& req,
                std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                int id);
    void remove(const drogon::HttpRequestPtr& req,
                std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                int id);
    void removeAll(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& callback);
};
```

### Phase 4: Authentication & Security (Week 4-5)

#### 4.4.1 Authentication Middleware

```cpp
// src/middleware/AuthMiddleware.h
#pragma once

#include <drogon/HttpFilter.h>
#include <regex>

class AuthMiddleware : public drogon::HttpFilter<AuthMiddleware> {
public:
    void doFilter(const drogon::HttpRequestPtr& req,
                  drogon::FilterCallback&& callback,
                  drogon::FilterChainCallback&& chainCallback) override;
                  
private:
    bool isValidEmail(const std::string& email);
    static const std::regex emailRegex_;
};

// src/middleware/AuthMiddleware.cpp
#include "AuthMiddleware.h"
#include "../services/DatabaseService.h"
#include <spdlog/spdlog.h>

const std::regex AuthMiddleware::emailRegex_(R"([^\s@]+@[^\s@]+\.[^\s@]+)");

void AuthMiddleware::doFilter(const drogon::HttpRequestPtr& req,
                              drogon::FilterCallback&& callback,
                              drogon::FilterChainCallback&& chainCallback) {
    auto userEmail = req->getHeader("x-user-email");
    
    if (userEmail.empty()) {
        Json::Value json;
        json["error"] = "User email required in x-user-email header";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(json);
        resp->setStatusCode(drogon::k401Unauthorized);
        callback(resp);
        return;
    }
    
    if (!isValidEmail(userEmail)) {
        Json::Value json;
        json["error"] = "Invalid email format";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(json);
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    
    // Check/create user
    auto& db = DatabaseService::getInstance();
    auto user = db.getUserByEmail(userEmail);
    
    if (!user) {
        if (!db.createUser(userEmail)) {
            Json::Value json;
            json["error"] = "Failed to create user";
            auto resp = drogon::HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
            return;
        }
    }
    
    // Store user email in request attributes for downstream use
    req->getAttributes()->insert("userEmail", userEmail);
    chainCallback();
}

bool AuthMiddleware::isValidEmail(const std::string& email) {
    return std::regex_match(email, emailRegex_);
}
```

#### 4.4.2 Rate Limiting Middleware

```cpp
// src/middleware/RateLimitMiddleware.h
#pragma once

#include <drogon/HttpFilter.h>
#include <unordered_map>
#include <chrono>
#include <mutex>

class RateLimitMiddleware : public drogon::HttpFilter<RateLimitMiddleware> {
public:
    RateLimitMiddleware();
    
    void doFilter(const drogon::HttpRequestPtr& req,
                  drogon::FilterCallback&& callback,
                  drogon::FilterChainCallback&& chainCallback) override;

private:
    struct RateLimitEntry {
        int count;
        std::chrono::steady_clock::time_point windowStart;
    };
    
    std::unordered_map<std::string, RateLimitEntry> rateLimits_;
    std::mutex mutex_;
    
    static constexpr int MAX_REQUESTS = 100;
    static constexpr int WINDOW_MS = 15 * 60 * 1000; // 15 minutes
};
```

### Phase 5: Business Logic (Week 5-7)

#### 4.5.1 Validation Service

```cpp
// src/services/ValidationService.h
#pragma once

#include <nlohmann/json.hpp>
#include <string>
#include <vector>
#include <optional>

struct ValidationResult {
    bool isValid;
    std::vector<std::string> errors;
};

class ValidationService {
public:
    static ValidationResult validateClient(const nlohmann::json& data, bool isUpdate = false);
    static ValidationResult validateWorkEntry(const nlohmann::json& data, bool isUpdate = false);
    static ValidationResult validateEmail(const std::string& email);
    
private:
    static bool isValidEmail(const std::string& email);
    static bool isValidDate(const std::string& date);
};

// src/services/ValidationService.cpp
#include "ValidationService.h"
#include <regex>

ValidationResult ValidationService::validateClient(const nlohmann::json& data, bool isUpdate) {
    ValidationResult result{true, {}};
    
    if (!isUpdate || data.contains("name")) {
        if (!data.contains("name") || !data["name"].is_string()) {
            result.isValid = false;
            result.errors.push_back("Name is required and must be a string");
        } else {
            std::string name = data["name"].get<std::string>();
            if (name.empty() || name.length() > 255) {
                result.isValid = false;
                result.errors.push_back("Name must be between 1 and 255 characters");
            }
        }
    }
    
    if (data.contains("description") && data["description"].is_string()) {
        if (data["description"].get<std::string>().length() > 1000) {
            result.isValid = false;
            result.errors.push_back("Description must not exceed 1000 characters");
        }
    }
    
    if (data.contains("email") && data["email"].is_string()) {
        std::string email = data["email"].get<std::string>();
        if (!email.empty() && !isValidEmail(email)) {
            result.isValid = false;
            result.errors.push_back("Invalid email format");
        }
    }
    
    if (isUpdate && data.empty()) {
        result.isValid = false;
        result.errors.push_back("At least one field must be provided for update");
    }
    
    return result;
}

ValidationResult ValidationService::validateWorkEntry(const nlohmann::json& data, bool isUpdate) {
    ValidationResult result{true, {}};
    
    if (!isUpdate || data.contains("clientId")) {
        if (!data.contains("clientId") || !data["clientId"].is_number_integer()) {
            result.isValid = false;
            result.errors.push_back("Client ID is required and must be an integer");
        } else if (data["clientId"].get<int>() <= 0) {
            result.isValid = false;
            result.errors.push_back("Client ID must be positive");
        }
    }
    
    if (!isUpdate || data.contains("hours")) {
        if (!data.contains("hours") || !data["hours"].is_number()) {
            result.isValid = false;
            result.errors.push_back("Hours is required and must be a number");
        } else {
            double hours = data["hours"].get<double>();
            if (hours <= 0 || hours > 24) {
                result.isValid = false;
                result.errors.push_back("Hours must be between 0 and 24");
            }
        }
    }
    
    if (!isUpdate || data.contains("date")) {
        if (!data.contains("date") || !data["date"].is_string()) {
            result.isValid = false;
            result.errors.push_back("Date is required and must be a string");
        } else if (!isValidDate(data["date"].get<std::string>())) {
            result.isValid = false;
            result.errors.push_back("Date must be in ISO format (YYYY-MM-DD)");
        }
    }
    
    if (isUpdate && data.empty()) {
        result.isValid = false;
        result.errors.push_back("At least one field must be provided for update");
    }
    
    return result;
}

bool ValidationService::isValidEmail(const std::string& email) {
    static const std::regex emailRegex(R"([^\s@]+@[^\s@]+\.[^\s@]+)");
    return std::regex_match(email, emailRegex);
}

bool ValidationService::isValidDate(const std::string& date) {
    static const std::regex dateRegex(R"(\d{4}-\d{2}-\d{2})");
    return std::regex_match(date, dateRegex);
}
```

### Phase 6: Reports & Export (Week 7-8)

#### 4.6.1 CSV Service

```cpp
// src/services/CsvService.h
#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

class CsvService {
public:
    static std::string generateClientReport(
        const std::string& clientName,
        const std::vector<nlohmann::json>& workEntries
    );
    
private:
    static std::string escapeField(const std::string& field);
};

// src/services/CsvService.cpp
#include "CsvService.h"
#include <sstream>

std::string CsvService::generateClientReport(
    const std::string& clientName,
    const std::vector<nlohmann::json>& workEntries
) {
    std::ostringstream csv;
    
    // Header
    csv << "Date,Hours,Description,Created At\n";
    
    // Data rows
    for (const auto& entry : workEntries) {
        csv << escapeField(entry.value("date", "")) << ",";
        csv << entry.value("hours", 0.0) << ",";
        csv << escapeField(entry.value("description", "")) << ",";
        csv << escapeField(entry.value("created_at", "")) << "\n";
    }
    
    return csv.str();
}

std::string CsvService::escapeField(const std::string& field) {
    if (field.find(',') != std::string::npos || 
        field.find('"') != std::string::npos ||
        field.find('\n') != std::string::npos) {
        std::string escaped = "\"";
        for (char c : field) {
            if (c == '"') escaped += "\"\"";
            else escaped += c;
        }
        escaped += "\"";
        return escaped;
    }
    return field;
}
```

#### 4.6.2 PDF Service

```cpp
// src/services/PdfService.h
#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

class PdfService {
public:
    static std::vector<unsigned char> generateClientReport(
        const std::string& clientName,
        const std::vector<nlohmann::json>& workEntries,
        double totalHours
    );
};

// src/services/PdfService.cpp
#include "PdfService.h"
#include <hpdf.h>
#include <sstream>
#include <iomanip>
#include <ctime>

std::vector<unsigned char> PdfService::generateClientReport(
    const std::string& clientName,
    const std::vector<nlohmann::json>& workEntries,
    double totalHours
) {
    HPDF_Doc pdf = HPDF_New(nullptr, nullptr);
    if (!pdf) {
        throw std::runtime_error("Failed to create PDF document");
    }
    
    HPDF_Page page = HPDF_AddPage(pdf);
    HPDF_Page_SetSize(page, HPDF_PAGE_SIZE_A4, HPDF_PAGE_PORTRAIT);
    
    HPDF_Font font = HPDF_GetFont(pdf, "Helvetica", nullptr);
    HPDF_Font fontBold = HPDF_GetFont(pdf, "Helvetica-Bold", nullptr);
    
    float pageWidth = HPDF_Page_GetWidth(page);
    float pageHeight = HPDF_Page_GetHeight(page);
    float y = pageHeight - 50;
    
    // Title
    HPDF_Page_SetFontAndSize(page, fontBold, 20);
    std::string title = "Time Report for " + clientName;
    float titleWidth = HPDF_Page_TextWidth(page, title.c_str());
    HPDF_Page_BeginText(page);
    HPDF_Page_TextOut(page, (pageWidth - titleWidth) / 2, y, title.c_str());
    HPDF_Page_EndText(page);
    
    y -= 40;
    
    // Summary
    HPDF_Page_SetFontAndSize(page, font, 12);
    std::ostringstream summary;
    summary << std::fixed << std::setprecision(2);
    summary << "Total Hours: " << totalHours;
    
    HPDF_Page_BeginText(page);
    HPDF_Page_TextOut(page, 50, y, summary.str().c_str());
    HPDF_Page_EndText(page);
    
    y -= 20;
    
    summary.str("");
    summary << "Total Entries: " << workEntries.size();
    HPDF_Page_BeginText(page);
    HPDF_Page_TextOut(page, 50, y, summary.str().c_str());
    HPDF_Page_EndText(page);
    
    y -= 40;
    
    // Table header
    HPDF_Page_SetFontAndSize(page, fontBold, 10);
    HPDF_Page_BeginText(page);
    HPDF_Page_TextOut(page, 50, y, "Date");
    HPDF_Page_TextOut(page, 150, y, "Hours");
    HPDF_Page_TextOut(page, 220, y, "Description");
    HPDF_Page_EndText(page);
    
    // Line under header
    y -= 5;
    HPDF_Page_MoveTo(page, 50, y);
    HPDF_Page_LineTo(page, pageWidth - 50, y);
    HPDF_Page_Stroke(page);
    
    y -= 15;
    
    // Table rows
    HPDF_Page_SetFontAndSize(page, font, 10);
    for (const auto& entry : workEntries) {
        if (y < 50) {
            page = HPDF_AddPage(pdf);
            HPDF_Page_SetSize(page, HPDF_PAGE_SIZE_A4, HPDF_PAGE_PORTRAIT);
            y = pageHeight - 50;
        }
        
        HPDF_Page_BeginText(page);
        HPDF_Page_TextOut(page, 50, y, entry.value("date", "").c_str());
        
        std::ostringstream hoursStr;
        hoursStr << std::fixed << std::setprecision(2) << entry.value("hours", 0.0);
        HPDF_Page_TextOut(page, 150, y, hoursStr.str().c_str());
        
        std::string desc = entry.value("description", "No description");
        if (desc.length() > 50) desc = desc.substr(0, 47) + "...";
        HPDF_Page_TextOut(page, 220, y, desc.c_str());
        HPDF_Page_EndText(page);
        
        y -= 15;
    }
    
    // Save to memory
    HPDF_SaveToStream(pdf);
    HPDF_UINT32 size = HPDF_GetStreamSize(pdf);
    std::vector<unsigned char> buffer(size);
    HPDF_ReadFromStream(pdf, buffer.data(), &size);
    
    HPDF_Free(pdf);
    
    return buffer;
}
```

### Phase 7: Integration & Testing (Week 8-10)

#### 4.7.1 Test Structure

```cpp
// tests/test_clients.cpp
#include <gtest/gtest.h>
#include <drogon/drogon.h>
#include "../src/services/DatabaseService.h"

class ClientsTest : public ::testing::Test {
protected:
    void SetUp() override {
        DatabaseService::getInstance().initialize(":memory:");
        DatabaseService::getInstance().createUser("test@example.com");
    }
    
    void TearDown() override {
        DatabaseService::getInstance().close();
    }
};

TEST_F(ClientsTest, CreateClient) {
    nlohmann::json clientData = {
        {"name", "Test Client"},
        {"description", "Test Description"}
    };
    
    auto result = DatabaseService::getInstance().createClient(clientData, "test@example.com");
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result.value()["name"], "Test Client");
}

TEST_F(ClientsTest, GetClients) {
    nlohmann::json clientData = {{"name", "Test Client"}};
    DatabaseService::getInstance().createClient(clientData, "test@example.com");
    
    auto clients = DatabaseService::getInstance().getClientsByUser("test@example.com");
    
    EXPECT_EQ(clients.size(), 1);
}

TEST_F(ClientsTest, UpdateClient) {
    nlohmann::json clientData = {{"name", "Original Name"}};
    auto created = DatabaseService::getInstance().createClient(clientData, "test@example.com");
    int clientId = created.value()["id"];
    
    nlohmann::json updateData = {{"name", "Updated Name"}};
    auto updated = DatabaseService::getInstance().updateClient(clientId, updateData, "test@example.com");
    
    ASSERT_TRUE(updated.has_value());
    EXPECT_EQ(updated.value()["name"], "Updated Name");
}

TEST_F(ClientsTest, DeleteClient) {
    nlohmann::json clientData = {{"name", "To Delete"}};
    auto created = DatabaseService::getInstance().createClient(clientData, "test@example.com");
    int clientId = created.value()["id"];
    
    bool deleted = DatabaseService::getInstance().deleteClient(clientId, "test@example.com");
    
    EXPECT_TRUE(deleted);
    
    auto client = DatabaseService::getInstance().getClientById(clientId, "test@example.com");
    EXPECT_FALSE(client.has_value());
}

TEST_F(ClientsTest, DataIsolation) {
    nlohmann::json clientData = {{"name", "User1 Client"}};
    DatabaseService::getInstance().createUser("user1@example.com");
    DatabaseService::getInstance().createClient(clientData, "user1@example.com");
    
    auto user2Clients = DatabaseService::getInstance().getClientsByUser("test@example.com");
    
    EXPECT_EQ(user2Clients.size(), 0);
}
```

#### 4.7.2 Integration Test with HTTP

```cpp
// tests/test_api_integration.cpp
#include <gtest/gtest.h>
#include <drogon/drogon.h>
#include <drogon/HttpClient.h>

class ApiIntegrationTest : public ::testing::Test {
protected:
    static void SetUpTestSuite() {
        // Start server in background thread
        std::thread([]() {
            drogon::app()
                .addListener("127.0.0.1", 3001)
                .run();
        }).detach();
        
        // Wait for server to start
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
};

TEST_F(ApiIntegrationTest, HealthCheck) {
    auto client = drogon::HttpClient::newHttpClient("http://127.0.0.1:3001");
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setPath("/health");
    req->setMethod(drogon::Get);
    
    std::promise<drogon::HttpResponsePtr> promise;
    client->sendRequest(req, [&promise](drogon::ReqResult result, 
                                         const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    });
    
    auto resp = promise.get_future().get();
    EXPECT_EQ(resp->getStatusCode(), drogon::k200OK);
}

TEST_F(ApiIntegrationTest, CreateAndGetClient) {
    auto client = drogon::HttpClient::newHttpClient("http://127.0.0.1:3001");
    
    // Create client
    auto createReq = drogon::HttpRequest::newHttpJsonRequest(
        Json::Value(Json::objectValue)
    );
    createReq->setPath("/api/clients");
    createReq->setMethod(drogon::Post);
    createReq->addHeader("x-user-email", "test@example.com");
    
    Json::Value body;
    body["name"] = "Integration Test Client";
    createReq->setBody(body.toStyledString());
    
    std::promise<drogon::HttpResponsePtr> createPromise;
    client->sendRequest(createReq, [&createPromise](drogon::ReqResult result,
                                                     const drogon::HttpResponsePtr& resp) {
        createPromise.set_value(resp);
    });
    
    auto createResp = createPromise.get_future().get();
    EXPECT_EQ(createResp->getStatusCode(), drogon::k201Created);
}
```

### Phase 8: Deployment & Documentation (Week 10-12)

#### 4.8.1 Docker Configuration

```dockerfile
# docker/Dockerfile
# Build stage
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libssl-dev \
    libsqlite3-dev \
    uuid-dev \
    zlib1g-dev \
    libc-ares-dev \
    libjsoncpp-dev \
    libpng-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install vcpkg and dependencies
WORKDIR /vcpkg
RUN git clone https://github.com/Microsoft/vcpkg.git . && \
    ./bootstrap-vcpkg.sh && \
    ./vcpkg install drogon nlohmann-json spdlog libharu

# Build application
WORKDIR /app
COPY . .
RUN mkdir build && cd build && \
    cmake -DCMAKE_TOOLCHAIN_FILE=/vcpkg/scripts/buildsystems/vcpkg.cmake .. && \
    make -j$(nproc)

# Production stage
FROM ubuntu:22.04 AS production

RUN apt-get update && apt-get install -y \
    libssl3 \
    libsqlite3-0 \
    libuuid1 \
    zlib1g \
    libc-ares2 \
    libjsoncpp25 \
    libpng16-16 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 appuser

WORKDIR /app

# Copy binary and assets
COPY --from=builder /app/build/timesheet-cpp .
COPY --from=builder /app/config ./config
COPY public ./public

# Create data directory
RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

ENV DATABASE_PATH=/app/data/timesheet.db
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["./timesheet-cpp"]
```

#### 4.8.2 Docker Compose

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  timesheet-app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - timesheet-data:/app/data
    environment:
      - DATABASE_PATH=/app/data/timesheet.db
      - PORT=3001
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  timesheet-data:
```

#### 4.8.3 Systemd Service

```ini
# /etc/systemd/system/timesheet.service
[Unit]
Description=Timesheet Application
After=network.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/timesheet
ExecStart=/opt/timesheet/timesheet-cpp
Restart=always
RestartSec=5
Environment=DATABASE_PATH=/opt/timesheet/data/timesheet.db
Environment=PORT=3001

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/timesheet/data
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

---

## 5. Architecture Design

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Load Balancer (nginx)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│      React Frontend (SPA)        │   │      C++ Backend (Drogon)        │
│  ┌───────────────────────────┐  │   │  ┌───────────────────────────┐  │
│  │   Static Files (nginx)    │  │   │  │     HTTP Server (epoll)   │  │
│  └───────────────────────────┘  │   │  └───────────────────────────┘  │
│                                  │   │              │                  │
│  ┌───────────────────────────┐  │   │  ┌───────────────────────────┐  │
│  │   Material UI Components  │  │   │  │      Middleware Stack     │  │
│  └───────────────────────────┘  │   │  │  - CORS                   │  │
│                                  │   │  │  - Rate Limiting          │  │
│  ┌───────────────────────────┐  │   │  │  - Authentication         │  │
│  │   TanStack Query          │  │   │  │  - Logging                │  │
│  └───────────────────────────┘  │   │  └───────────────────────────┘  │
│                                  │   │              │                  │
│  ┌───────────────────────────┐  │   │  ┌───────────────────────────┐  │
│  │   Axios HTTP Client       │──┼───┼─▶│      Controllers          │  │
│  └───────────────────────────┘  │   │  │  - AuthController         │  │
└─────────────────────────────────┘   │  │  - ClientController        │  │
                                       │  │  - WorkEntryController     │  │
                                       │  │  - ReportController        │  │
                                       │  └───────────────────────────┘  │
                                       │              │                  │
                                       │  ┌───────────────────────────┐  │
                                       │  │       Services            │  │
                                       │  │  - DatabaseService        │  │
                                       │  │  - ValidationService      │  │
                                       │  │  - CsvService             │  │
                                       │  │  - PdfService             │  │
                                       │  └───────────────────────────┘  │
                                       │              │                  │
                                       │  ┌───────────────────────────┐  │
                                       │  │    SQLite Database        │  │
                                       │  └───────────────────────────┘  │
                                       └─────────────────────────────────┘
```

### 5.2 Request Flow

```
HTTP Request
    │
    ▼
┌─────────────────┐
│  CORS Handler   │ ──▶ OPTIONS requests handled here
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate Limiter   │ ──▶ 429 if limit exceeded
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth Middleware│ ──▶ 401 if no email header
└────────┬────────┘     400 if invalid email
         │
         ▼
┌─────────────────┐
│    Router       │ ──▶ 404 if route not found
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │
│  - Validation   │ ──▶ 400 if validation fails
│  - Business     │
│    Logic        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │
│  - Database     │ ──▶ 500 if DB error
│  - Export       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JSON Response  │
└─────────────────┘
```

### 5.3 Thread Model

```
Main Thread
    │
    ├── Accept connections
    │
    └── Dispatch to worker threads
            │
            ├── Worker Thread 1 ──▶ Handle request ──▶ DB query ──▶ Response
            ├── Worker Thread 2 ──▶ Handle request ──▶ DB query ──▶ Response
            ├── Worker Thread 3 ──▶ Handle request ──▶ DB query ──▶ Response
            └── Worker Thread N ──▶ Handle request ──▶ DB query ──▶ Response

Note: Drogon uses event-driven I/O (epoll on Linux) with a thread pool.
Default thread count = number of CPU cores.
```

---

## 6. Code Migration Guide

### 6.1 Express.js to Drogon Mapping

| Express.js | Drogon C++ |
|------------|------------|
| `app.get('/path', handler)` | `ADD_METHOD_TO(Controller::method, "/path", Get)` |
| `app.post('/path', handler)` | `ADD_METHOD_TO(Controller::method, "/path", Post)` |
| `app.use(middleware)` | `app.registerPreRoutingAdvice()` or Filter |
| `req.body` | `req->getJsonObject()` |
| `req.params.id` | Method parameter `int id` |
| `req.query.param` | `req->getParameter("param")` |
| `req.headers['x-header']` | `req->getHeader("x-header")` |
| `res.json(data)` | `HttpResponse::newHttpJsonResponse(json)` |
| `res.status(code)` | `resp->setStatusCode(code)` |
| `next()` | `chainCallback()` |

### 6.2 Joi to C++ Validation Mapping

| Joi | C++ Equivalent |
|-----|----------------|
| `Joi.string().required()` | Check `json.contains()` and `json.is_string()` |
| `Joi.string().max(255)` | Check `str.length() <= 255` |
| `Joi.number().positive()` | Check `num > 0` |
| `Joi.number().max(24)` | Check `num <= 24` |
| `Joi.date().iso()` | Regex match `\d{4}-\d{2}-\d{2}` |
| `Joi.string().email()` | Regex match email pattern |

### 6.3 SQLite Callback to Modern C++

**Node.js (callback-based):**
```javascript
db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ user: row });
});
```

**C++ (synchronous with error handling):**
```cpp
std::optional<json> DatabaseService::getUserByEmail(const std::string& email) {
    sqlite3_stmt* stmt;
    const char* sql = "SELECT email, created_at FROM users WHERE email = ?";
    
    if (sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr) != SQLITE_OK) {
        spdlog::error("Failed to prepare statement: {}", sqlite3_errmsg(db_));
        return std::nullopt;
    }
    
    sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_TRANSIENT);
    
    std::optional<json> result;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        result = json{
            {"email", reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0))},
            {"createdAt", reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1))}
        };
    }
    
    sqlite3_finalize(stmt);
    return result;
}
```

---

## 7. Testing Strategy

### 7.1 Test Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │  (Selenium) │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │  Integration Tests  │  (30%)
                │   (API + Database)  │
                └──────────┬──────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │           Unit Tests                 │  (60%)
        │  (Services, Validation, Utilities)  │
        └─────────────────────────────────────┘
```

### 7.2 Test Categories

| Category | Scope | Tools | Coverage Target |
|----------|-------|-------|-----------------|
| Unit Tests | Individual functions | Google Test | 80% |
| Integration Tests | API endpoints | Drogon Test Client | 70% |
| Database Tests | CRUD operations | SQLite in-memory | 90% |
| Performance Tests | Load testing | wrk, ab | N/A |
| Security Tests | Penetration testing | OWASP ZAP | N/A |

### 7.3 Test Commands

```bash
# Run all tests
cd build && ctest --output-on-failure

# Run specific test suite
./tests/test_clients

# Run with coverage
cmake -DCMAKE_BUILD_TYPE=Debug -DENABLE_COVERAGE=ON ..
make
ctest
lcov --capture --directory . --output-file coverage.info
genhtml coverage.info --output-directory coverage_report
```

---

## 8. Deployment Strategy

### 8.1 Deployment Options

| Option | Pros | Cons | Recommended For |
|--------|------|------|-----------------|
| Docker | Portable, isolated | Slight overhead | Production |
| Systemd | Native, efficient | Linux-only | Single server |
| Kubernetes | Scalable, resilient | Complex | Large scale |

### 8.2 CI/CD Pipeline

```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-22.04
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install dependencies
      run: |
        sudo apt-get update
        sudo apt-get install -y build-essential cmake libssl-dev \
          libsqlite3-dev uuid-dev zlib1g-dev libc-ares-dev \
          libjsoncpp-dev libpng-dev
    
    - name: Setup vcpkg
      run: |
        git clone https://github.com/Microsoft/vcpkg.git
        ./vcpkg/bootstrap-vcpkg.sh
        ./vcpkg/vcpkg install drogon nlohmann-json spdlog libharu gtest
    
    - name: Build
      run: |
        mkdir build && cd build
        cmake -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake ..
        make -j$(nproc)
    
    - name: Test
      run: cd build && ctest --output-on-failure
    
    - name: Build Docker image
      run: docker build -t timesheet-cpp -f docker/Dockerfile .

  deploy:
    needs: build
    runs-on: ubuntu-22.04
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        # Push to ECR and deploy via SSM
        echo "Deploying..."
```

### 8.3 Rollback Strategy

1. **Blue-Green Deployment:** Maintain two identical environments
2. **Version Tags:** Tag Docker images with commit SHA
3. **Database Migrations:** Use versioned, reversible migrations
4. **Health Checks:** Automatic rollback on failed health checks

---

## 9. Risk Assessment and Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Memory leaks | Medium | High | Use smart pointers, ASAN testing |
| Thread safety issues | Medium | High | Careful mutex usage, thread sanitizer |
| Build complexity | High | Medium | Comprehensive CMake, vcpkg |
| Library compatibility | Medium | Medium | Pin versions, test matrix |
| Performance regression | Low | Medium | Benchmark suite, profiling |

### 9.2 Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Timeline overrun | Medium | Medium | Buffer time, MVP approach |
| Skill gap | Medium | High | Training, documentation |
| Scope creep | Medium | Medium | Clear requirements, change control |
| Integration issues | Medium | Medium | Parallel testing, API contracts |

### 9.3 Mitigation Strategies

**Memory Safety:**
```cpp
// Use smart pointers
std::unique_ptr<Resource> resource = std::make_unique<Resource>();
std::shared_ptr<SharedResource> shared = std::make_shared<SharedResource>();

// RAII for database connections
class DatabaseConnection {
public:
    DatabaseConnection() { /* open */ }
    ~DatabaseConnection() { /* close */ }
};
```

**Thread Safety:**
```cpp
// Use mutex for shared state
std::mutex rateLimitMutex_;
std::lock_guard<std::mutex> lock(rateLimitMutex_);

// Prefer thread-local storage where possible
thread_local std::string threadLocalBuffer;
```

---

## 10. Timeline and Resource Estimates

### 10.1 Detailed Timeline

| Phase | Duration | Start | End | Dependencies |
|-------|----------|-------|-----|--------------|
| Phase 1: Foundation | 2 weeks | Week 1 | Week 2 | None |
| Phase 2: Database | 1.5 weeks | Week 2 | Week 3 | Phase 1 |
| Phase 3: HTTP Server | 1.5 weeks | Week 3 | Week 4 | Phase 1 |
| Phase 4: Auth & Security | 1 week | Week 4 | Week 5 | Phase 3 |
| Phase 5: Business Logic | 2 weeks | Week 5 | Week 7 | Phase 2, 4 |
| Phase 6: Reports | 1.5 weeks | Week 7 | Week 8 | Phase 5 |
| Phase 7: Testing | 2 weeks | Week 8 | Week 10 | Phase 6 |
| Phase 8: Deployment | 2 weeks | Week 10 | Week 12 | Phase 7 |

**Total Duration: 12 weeks**

### 10.2 Resource Requirements

| Role | FTE | Duration | Skills Required |
|------|-----|----------|-----------------|
| C++ Developer | 2 | 12 weeks | Modern C++, web frameworks |
| DevOps Engineer | 0.5 | 4 weeks | Docker, CI/CD, Linux |
| QA Engineer | 0.5 | 4 weeks | API testing, automation |
| Technical Lead | 0.25 | 12 weeks | Architecture, code review |

### 10.3 Cost Estimates

| Item | Cost | Notes |
|------|------|-------|
| Development | $80,000 - $120,000 | Based on 2 developers for 12 weeks |
| Infrastructure | $500 - $1,000/month | EC2, ECR, monitoring |
| Tools & Licenses | $0 - $500 | Open source stack |
| Training | $2,000 - $5,000 | C++ training if needed |

### 10.4 Gantt Chart

```
Week:  1   2   3   4   5   6   7   8   9  10  11  12
       ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
Phase 1 ████████
Phase 2     ██████
Phase 3         ██████
Phase 4             ████
Phase 5             ████████████
Phase 6                     ██████
Phase 7                         ████████████
Phase 8                                 ████████████
```

---

## 11. Appendix

### 11.1 Recommended Learning Resources

**C++ Web Development:**
- Drogon Documentation: https://drogon.docsforge.com/
- Modern C++ Tutorial: https://changkun.de/modern-cpp/
- C++ Core Guidelines: https://isocpp.github.io/CppCoreGuidelines/

**Libraries:**
- nlohmann/json: https://github.com/nlohmann/json
- spdlog: https://github.com/gabime/spdlog
- libharu: http://libharu.org/

### 11.2 Performance Benchmarks (Expected)

| Metric | Node.js (Current) | C++ (Expected) | Improvement |
|--------|-------------------|----------------|-------------|
| Requests/sec | ~5,000 | ~50,000 | 10x |
| Memory usage | ~100MB | ~20MB | 5x |
| Startup time | ~2s | ~0.1s | 20x |
| P99 latency | ~50ms | ~5ms | 10x |

### 11.3 Checklist for Go-Live

- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] Performance benchmarks meet targets
- [ ] Security scan completed (no critical issues)
- [ ] Documentation complete
- [ ] Runbook created for operations
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure tested
- [ ] Load testing completed
- [ ] Frontend integration verified
- [ ] Database migration tested
- [ ] CI/CD pipeline operational

### 11.4 Glossary

| Term | Definition |
|------|------------|
| Drogon | High-performance C++ web framework |
| epoll | Linux kernel I/O event notification mechanism |
| RAII | Resource Acquisition Is Initialization (C++ idiom) |
| vcpkg | Microsoft's C++ package manager |
| CMake | Cross-platform build system generator |
| spdlog | Fast C++ logging library |
| libharu | PDF generation library |

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Created | February 2026 |
| Author | Devin AI |
| Status | Draft |
| Review Required | Yes |

---

*This migration plan is a living document and should be updated as the project progresses and requirements evolve.*
