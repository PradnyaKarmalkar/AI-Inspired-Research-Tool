import os
import logging
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import time
from core_module import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

if not GROQ_API_KEY or not GOOGLE_API_KEY:
    raise ValueError("Missing required API keys. Please check your environment variables.")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Get the current directory path
current_dir = os.path.dirname(os.path.abspath(__file__))
DOCUMENTS_DIR = os.path.join(current_dir, "documents")
PERSIST_DIR = os.path.join(current_dir, "vector_db")

# Create directories if they don't exist
try:
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    os.makedirs(PERSIST_DIR, exist_ok=True)
    logger.info(f"Created directories: {DOCUMENTS_DIR}, {PERSIST_DIR}")
except Exception as e:
    logger.error(f"Failed to create directories: {str(e)}")
    raise

class QAModel:
    def __init__(self, model_name=None):
        self.vector_store = None
        self.qa_model = model_name if model_name in config.AVAILABLE_QA_MODELS else config.QA_MODEL
        logger.info("Initialized QAModel")

    # Initialize LLM
    def get_llm(self):
        try:
            llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=self.qa_model
            )
            logger.info(f"Initialized LLM with model: {self.qa_model}")
            return llm
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {str(e)}")
            raise

    # Create QA prompt
    def get_prompt(self):
        try:
            prompt = ChatPromptTemplate.from_template(
                """
                Answer the questions based on the provided context only.
                Please provide the most accurate response based on the question.
                Format your response in markdown.
                
                Context:
                {context}
                
                Question: {input}
                
                IMPORTANT:
                - Do not hallucinate.
                - Do not guess.
                - If the answer is not in the context, say "I don't have enough information to answer this question."
                - DO NOT Start with "According to the context..." or "Based on the context..." just provide the answer naturally.
                - Use proper bullets and lines for the answer where ever needed.
                - Format your response in markdown with proper headings, lists, and code blocks if needed.
                """
            )
            logger.info("Created QA prompt template")
            return prompt
        except Exception as e:
            logger.error(f"Failed to create prompt template: {str(e)}")
            raise

    # Create embeddings model
    def get_embeddings(self):
        try:
            embeddings = GoogleGenerativeAIEmbeddings(model=config.EMBED_MODEL)
            logger.info(f"Initialized embeddings model: {config.EMBED_MODEL}")
            return embeddings
        except Exception as e:
            logger.error(f"Failed to initialize embeddings model: {str(e)}")
            raise

    

    # Process a single uploaded file
    def process_uploaded_file(self, file_path):
        try:
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                raise FileNotFoundError(f"File not found: {file_path}")
                
            logger.info(f"Processing uploaded file: {file_path}")
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            logger.info(f"Loaded document with {len(documents)} pages")
            
            if len(documents) == 0:
                logger.warning("No content found in document")
                return None
                
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=config.QA_CHUNK_SIZE, chunk_overlap=config.QA_CHUNK_OVERLAP)
            split_documents = text_splitter.split_documents(documents)
            logger.info(f"Split document into {len(split_documents)} chunks")
            
            if len(split_documents) == 0:
                logger.warning("No text chunks extracted from document")
                return None
                
            embeddings = self.get_embeddings()
            
            # Get existing vector store or create new one
            if os.path.exists(PERSIST_DIR) and os.listdir(PERSIST_DIR):
                logger.info("Loading existing vector store")
                vector_store = Chroma(
                    persist_directory=PERSIST_DIR,
                    embedding_function=embeddings
                )
                # Add new documents to existing store
                vector_store.add_documents(split_documents)
                logger.info("Added new documents to existing vector store")
            else:
                logger.info("Creating new vector store")
                vector_store = Chroma.from_documents(
                    documents=split_documents,
                    embedding=embeddings,
                    persist_directory=PERSIST_DIR
                )
            
            vector_store.persist()
            self.vector_store = vector_store
            logger.info("Successfully processed and stored document")
            return vector_store
        except Exception as e:
            logger.error(f"Failed to process uploaded file: {str(e)}")
            raise

    # Check if vector store has documents
    def has_documents(self):
        try:
            vector_store = self.get_vector_store()
            if vector_store is None:
                return False
                
            # A simple query to check if there are any documents
            results = vector_store.similarity_search("test", k=1)
            return len(results) > 0
        except Exception:
            return False

    # Get vector store
    def get_vector_store(self):
        try:
            if self.vector_store is not None:
                logger.info("Using cached vector store")
                return self.vector_store
                
            embeddings = self.get_embeddings()
            
            # If vector store exists, load it
            if os.path.exists(PERSIST_DIR) and os.listdir(PERSIST_DIR):
                logger.info("Loading existing vector store")
                vector_store = Chroma(
                    persist_directory=PERSIST_DIR,
                    embedding_function=embeddings
                )
            else:
                # Create new if it doesn't exist
                logger.info("Creating new vector store from directory")
                vector_store = self.process_directory_documents()
                if vector_store is None:
                    logger.warning("No documents to process. Vector store not created.")
                    return None
            
            self.vector_store = vector_store
            return vector_store
        except Exception as e:
            logger.error(f"Failed to get vector store: {str(e)}")
            return None

    # Answer questions from documents
    def answer_question(self, query):
        try:
            logger.info(f"Processing question: {query}")
            
            # Check if we have documents first
            vector_store = self.get_vector_store()
            if vector_store is None:
                return "No documents available. Please upload PDF documents first."
            
            # Check if vector store has documents
            if not self.has_documents():
                return "Vector database appears empty. Please upload PDF documents first."
            
            llm = self.get_llm()
            prompt = self.get_prompt()
            
            document_chain = create_stuff_documents_chain(llm, prompt)
            retriever = vector_store.as_retriever(search_kwargs={"k": 4})
            retrieval_chain = create_retrieval_chain(retriever, document_chain)
            
            start = time.process_time()
            response = retrieval_chain.invoke({'input': query})
            processing_time = time.process_time() - start
            
            logger.info(f"Question answered in {processing_time:.2f} seconds")
            return response['answer']
        except Exception as e:
            logger.error(f"Failed to answer question: {str(e)}")
            return f"An error occurred while processing your question: {str(e)}"