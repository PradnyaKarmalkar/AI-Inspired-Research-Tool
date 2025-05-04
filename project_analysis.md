# AI Inspired Research Buddy - Project Analysis Report

## 1. Introduction

**AI Inspired Research Buddy** is a comprehensive research assistance platform designed to streamline and enhance academic and scientific research processes through artificial intelligence. The project leverages modern web technologies alongside advanced AI models to create an intuitive, user-friendly interface for researchers, students, and professionals who need to process, analyze, and extract insights from academic papers and research documents.

The platform was created to address common pain points in the research workflow: the time-consuming nature of reading extensive papers, difficulty in extracting key information quickly, and challenges in connecting research findings to relevant literature. By automating these processes, the Research Buddy aims to dramatically improve research productivity and effectiveness.

### Technology Stack

The project is built on a hybrid architecture combining:

- **Frontend**: Next.js 15 with React 19, utilizing TypeScript for type safety and Tailwind CSS for styling
- **Backend API**: Flask/FastAPI (Python) for AI processing and Express.js (Node.js) for authentication
- **Database**: MySQL for user authentication and Chroma vector database for document storage
- **AI Models**: Google Gemini models for summarization and report generation, Groq with Llama-3 for Q&A functionality
- **Vector Embeddings**: Google Generative AI Embeddings for document processing

This technology combination allows for a responsive, modern UI on the frontend while leveraging powerful AI capabilities on the backend to process and analyze research documents.

## 2. Functionalities

The Research Buddy offers several key features designed to assist researchers throughout their workflow:

### Document Summarization
**Technology**: Gemini 2.5 Pro
**Implementation**: The platform uses the `DocumentSummarizer` class to:
1. Extract and preprocess text from PDF documents using PyPDFLoader
2. Split documents into manageable chunks with RecursiveCharacterTextSplitter
3. Apply embeddings clustering to identify key sections
4. Generate concise, structured summaries through the Gemini model
5. Format results in Markdown for better readability

### Question & Answer with Research Documents
**Technology**: Groq API with Llama-3 8B model
**Implementation**:
1. Documents are processed via the `QAModel` class
2. Content is split into semantic chunks and embedded using Google's embedding model
3. Chunks are stored in a Chroma vector database for efficient retrieval
4. User questions trigger semantic similarity search against the document chunks
5. Retrieved context is sent to the LLM along with the question for accurate answers

### Research Report Generation
**Technology**: Gemini 2.5 Pro
**Implementation**:
1. Similar to summarization but with a more structured approach
2. The `ReportGenerator` class processes PDF documents
3. Uses clustering to identify important sections
4. Generates comprehensive, formal reports with proper sections, headings, and formatting
5. Outputs are formatted in Markdown with scientific report structure

### Research Paper Recommendations
**Technology**: DuckDuckGo Search API
**Implementation**:
1. The `SearchPapers` class interfaces with DuckDuckGo's search API
2. Searches are refined to focus on academic and research papers
3. Customizable parameters for region, time limits, and safety filters
4. Returns relevant papers based on user queries or document content

### User Authentication & Profile Management
**Technology**: MySQL, Express.js, bcrypt
**Implementation**:
1. Secure user registration and login system
2. Password hashing for security
3. Profile image upload and management
4. Session management with local storage

### Flow Chart of Core Functionality

```mermaid
flowchart TD
    A[User] -->|Uploads PDF| B[File Processing]
    B -->|Extract Text| C[Text Chunking]
    C -->|Generate Embeddings| D[Vector Database]
    
    A -->|Request Summary| E[Summarization Module]
    E -->|Retrieve Document| D
    E -->|Process with Gemini| F[Generate Summary]
    F -->|Return Results| A
    
    A -->|Ask Question| G[Q&A Module]
    G -->|Semantic Search| D
    G -->|Process with Llama-3| H[Generate Answer]
    H -->|Return Results| A
    
    A -->|Request Report| I[Report Generator]
    I -->|Retrieve Document| D
    I -->|Process with Gemini| J[Generate Report]
    J -->|Return Results| A
    
    A -->|Request Recommendations| K[Paper Recommendation]
    K -->|Search via API| L[DuckDuckGo Search]
    L -->|Return Results| A
```

## 3. Models and APIs Used

### AI Models

| Model | Purpose | Location |
|-------|---------|----------|
| **Gemini 2.5 Pro** | Document summarization | `core_module/summarizer.py` |
| **Gemini 2.5 Pro** | Report generation | `core_module/report_generator.py` |
| **Llama-3 8B (via Groq)** | Question answering | `core_module/qa_model.py` |
| **Google Generative AI Embeddings** | Vector embeddings for document chunks | Used across all AI modules |

### APIs

| API | Purpose | Location |
|-----|---------|----------|
| **Google Generative AI API** | Access to Gemini models | `core_module/summarizer.py`, `core_module/report_generator.py` |
| **Groq API** | Fast inference for Llama-3 model | `core_module/qa_model.py` |
| **DuckDuckGo Search API** | Research paper recommendations | `core_module/recommedPapers.py` |
| **Flask/FastAPI Endpoints** | Backend processing of documents | `api/api.py` |
| **Express.js Endpoints** | User authentication and profile management | `api/api.py` |

### Authentication and Database

The application uses MySQL for user authentication and profile management. User credentials are securely stored with password hashing via bcrypt. The database schema includes tables for users with profile information including paths to profile images.

## 4. Architecture Diagrams

### Component Diagram

```mermaid
graph TD
    subgraph "Frontend (Next.js)"
        UI[UI Components] --> Router[Next.js Router]
        Pages[Pages] --> Router
        Context[Context Providers] --> UI
    end

    subgraph "Backend APIs"
        Flask[Flask/FastAPI Service] --> AIModels[AI Processing Models]
        Express[Express.js Service] --> Auth[Authentication Logic]
    end

    subgraph "Databases"
        MySQL[(MySQL Database)] --> Auth
        VectorDB[(Chroma Vector DB)] --> AIModels
    end

    subgraph "External Services"
        GoogleAI[Google Generative AI] --> AIModels
        Groq[Groq API] --> AIModels
        DDGS[DuckDuckGo Search] --> AIModels
    end

    Router --> |API Calls| Flask
    Router --> |Auth Calls| Express
    AIModels --> VectorDB
    Auth --> MySQL
```

### Class Diagram

```mermaid
classDiagram
    class DocumentSummarizer {
        -chunk_size: int
        -chunk_overlap: int
        -summarize_llm: string
        -embed_model: string
        +extractText(file_path): texts
        +summarizer(file_path): summary
    }

    class ReportGenerator {
        -chunk_size: int
        -chunk_overlap: int
        -report_llm: string
        -embed_model: string
        +extractText(file_path): texts
        +generate_report(file_path): report
    }

    class QAModel {
        -vector_store: VectorStore
        +get_llm(): LLM
        +get_prompt(): PromptTemplate
        +get_embeddings(): Embeddings
        +process_uploaded_file(file_path): vector_store
        +has_documents(): bool
        +get_vector_store(): vector_store
        +answer_question(query): answer
    }

    class SearchPapers {
        -ddgs: DDGS
        -region: string
        -safesearch: string
        -timelimit: string
        -backend: string
        -max_results: int
        +getResults(query): results
    }

    DocumentSummarizer --> Config
    ReportGenerator --> Config
    QAModel --> Config
    SearchPapers --> Config

    class Config {
        +CHUNK_SIZE: int
        +CHUNK_OVERLAP: int
        +REPORT_CHUNK_SIZE: int
        +REPORT_CHUNK_OVERLAP: int
        +QA_CHUNK_SIZE: int
        +QA_CHUNK_OVERLAP: int
        +SUMMARIZER_MODEL: string
        +EMBED_MODEL: string
        +REPORT_MODEL: string
        +REGION: string
        +SAFESEARCH: string
        +TIMELIMIT: string
        +BACKEND: string
        +MAX_RESULTS: int
        +QA_MODEL: string
    }
```

### Block Diagram

```mermaid
graph TB
    subgraph "User Interface Layer"
        direction LR
        HomePage[Home Page] --- FeaturePages[Feature Pages]
        FeaturePages --- AuthPages[Auth Pages]
        FeaturePages --- ProfilePages[Profile Pages]
    end

    subgraph "API Layer"
        direction LR
        AuthAPI[Authentication API] --- DocAPI[Document Processing API]
        DocAPI --- QAAPI[Q&A API]
        QAAPI --- RecommendAPI[Recommendation API]
    end

    subgraph "Core Processing Layer"
        direction LR
        Summarizer[Summarizer Module] --- QAEngine[Q&A Engine]
        QAEngine --- ReportGen[Report Generator]
        ReportGen --- PaperRecommender[Paper Recommender]
    end

    subgraph "AI Service Layer"
        direction LR
        Gemini[Gemini Models] --- Llama[Llama-3 Model]
        Llama --- Embeddings[Vector Embeddings]
        Embeddings --- SearchAPI[Search API]
    end

    subgraph "Data Layer"
        direction LR
        UserDB[User Database] --- DocStorage[Document Storage]
        DocStorage --- VectorDB[Vector Database]
    end

    FeaturePages --> API_Layer
    API_Layer --> Core_Processing_Layer
    Core_Processing_Layer --> AI_Service_Layer
    AI_Service_Layer --> Data_Layer
```

### Proposed System Diagram

```mermaid
graph TB
    User[User] --> WebApp[Web Application]
    
    WebApp --> AuthSystem[Authentication System]
    WebApp --> UploadSystem[Document Upload System]
    WebApp --> ProcessingSystem[AI Processing System]
    
    AuthSystem --> UserDB[(User Database)]
    
    UploadSystem --> Storage[Document Storage]
    Storage --> ProcessingSystem
    
    ProcessingSystem --> SumModule[Summarization Module]
    ProcessingSystem --> QAModule[Q&A Module]
    ProcessingSystem --> ReportModule[Report Generation Module]
    ProcessingSystem --> RecommendModule[Recommendation Module]
    
    SumModule --> GeminiAPI[Gemini API]
    ReportModule --> GeminiAPI
    QAModule --> GroqAPI[Groq API]
    RecommendModule --> DDGAPI[DuckDuckGo API]
    
    SumModule --> VectorDB[(Vector Database)]
    QAModule --> VectorDB
    ReportModule --> VectorDB
    
    SumModule --> ResultsToUser[Results]
    QAModule --> ResultsToUser
    ReportModule --> ResultsToUser
    RecommendModule --> ResultsToUser
    
    ResultsToUser --> User
```

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant Auth as Auth API
    participant Processor as Document Processor
    participant AI as AI Models
    participant DB as Databases
    
    User->>FE: Login/Register
    FE->>Auth: Send Credentials
    Auth->>DB: Verify/Store User
    DB->>Auth: Confirm Action
    Auth->>FE: Authentication Response
    FE->>User: Display Dashboard
    
    User->>FE: Upload Document
    FE->>Processor: Send Document
    Processor->>AI: Extract & Process Text
    AI->>DB: Store Document Vectors
    DB->>AI: Confirm Storage
    AI->>Processor: Processing Complete
    Processor->>FE: Upload Confirmation
    FE->>User: Document Ready
    
    User->>FE: Request Summarization
    FE->>Processor: Summarize Request
    Processor->>DB: Retrieve Document
    DB->>Processor: Document Data
    Processor->>AI: Generate Summary
    AI->>Processor: Summary Result
    Processor->>FE: Return Summary
    FE->>User: Display Summary
    
    User->>FE: Ask Question
    FE->>Processor: Q&A Request
    Processor->>DB: Search Relevant Chunks
    DB->>Processor: Context Data
    Processor->>AI: Generate Answer
    AI->>Processor: Answer Result
    Processor->>FE: Return Answer
    FE->>User: Display Answer
```

### Database Diagram

```mermaid
erDiagram
    USERS {
        string user_id PK
        string username
        string email
        string hash_passwd
        string f_name
        string l_name
        string profile_path
    }
    
    VECTOR_DOCUMENTS {
        string doc_id PK
        string user_id FK
        string filename
        datetime upload_date
        string doc_type
    }
    
    VECTOR_CHUNKS {
        string chunk_id PK
        string doc_id FK
        string content
        vector embedding
        int position
    }
    
    HISTORY {
        string history_id PK
        string user_id FK
        string action_type
        datetime timestamp
        string content
        string result
    }
    
    USERS ||--o{ VECTOR_DOCUMENTS : uploads
    VECTOR_DOCUMENTS ||--o{ VECTOR_CHUNKS : contains
    USERS ||--o{ HISTORY : generates
```

### Use Case Diagram

```mermaid
graph TB
    subgraph "Actors"
        User((User))
        Admin((Admin))
    end
    
    subgraph "System"
        UC1[Register Account]
        UC2[Login]
        UC3[Upload Document]
        UC4[Generate Summary]
        UC5[Ask Questions]
        UC6[Generate Report]
        UC7[Get Paper Recommendations]
        UC8[Update Profile]
        UC9[Manage Subscription]
        UC10[View History]
        UC11[System Maintenance]
        UC12[User Management]
    end
    
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC5
    User --- UC6
    User --- UC7
    User --- UC8
    User --- UC9
    User --- UC10
    
    Admin --- UC11
    Admin --- UC12
    Admin --- UC2
```

### Execution Flow Diagram

```mermaid
flowchart TB
    Start([User Access]) --> Login{Authenticated?}
    Login -->|No| Register[Register/Login]
    Register --> Login
    
    Login -->|Yes| Dashboard[Dashboard]
    
    Dashboard --> FeatureSelect{Select Feature}
    
    FeatureSelect -->|Summarize| UploadDoc1[Upload Document]
    UploadDoc1 --> ProcessDoc1[Process Document]
    ProcessDoc1 --> GenerateSummary[Generate Summary]
    GenerateSummary --> DisplayResults1[Display Summary]
    
    FeatureSelect -->|Q&A| UploadDoc2[Upload Document]
    UploadDoc2 --> ProcessDoc2[Process Document]
    ProcessDoc2 --> AskQuestion[Ask Question]
    AskQuestion --> SearchContext[Search Context]
    SearchContext --> GenerateAnswer[Generate Answer]
    GenerateAnswer --> DisplayResults2[Display Answer]
    
    FeatureSelect -->|Report| UploadDoc3[Upload Document]
    UploadDoc3 --> ProcessDoc3[Process Document]
    ProcessDoc3 --> GenerateReport[Generate Report]
    GenerateReport --> DisplayResults3[Display Report]
    
    FeatureSelect -->|Recommend| EnterTopic[Enter Topic]
    EnterTopic --> SearchPapers[Search Papers]
    SearchPapers --> DisplayResults4[Display Recommendations]
    
    DisplayResults1 --> Dashboard
    DisplayResults2 --> Dashboard
    DisplayResults3 --> Dashboard
    DisplayResults4 --> Dashboard
    
    Dashboard --> Logout[Logout]
    Logout --> End([End Session])
```

## 5. Conclusion

The AI Inspired Research Buddy represents a comprehensive solution for researchers looking to streamline their workflow through AI-powered tools. By integrating multiple AI models and services, the platform provides a complete research assistance ecosystem that can significantly reduce the time and effort required to process academic literature.

The architecture follows modern best practices with a clear separation of concerns between the frontend and backend components. The use of Next.js for the frontend provides a responsive and user-friendly interface, while the Python-based AI processing backend leverages state-of-the-art language models for advanced document understanding.

The system's modular design allows for easy expansion with additional features in the future, such as citation management, collaborative research workspaces, or integration with academic databases. The current implementation already demonstrates the power of combining multiple AI capabilities into a cohesive research tool.

By addressing key pain points in the research process—document understanding, information extraction, and literature discovery—the Research Buddy has the potential to significantly enhance research productivity across academic disciplines. 