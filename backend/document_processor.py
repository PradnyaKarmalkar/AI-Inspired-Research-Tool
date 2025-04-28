import os
from typing import Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
import shutil

class DocumentProcessor:
    def __init__(self):
        self.documents_dir = "ai_agent/documents"
        self.vector_db_dir = "ai_agent/vector_db"
        self.embeddings = HuggingFaceEmbeddings()
        
        # Create directories if they don't exist
        os.makedirs(self.documents_dir, exist_ok=True)
        os.makedirs(self.vector_db_dir, exist_ok=True)

    def process_document(self, file_path: str) -> bool:
        """Process a document and store it in the vector database"""
        try:
            # Copy file to documents directory
            filename = os.path.basename(file_path)
            dest_path = os.path.join(self.documents_dir, filename)
            shutil.copy2(file_path, dest_path)

            # Load and split the document
            loader = PyPDFLoader(dest_path)
            pages = loader.load()
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            splits = text_splitter.split_documents(pages)

            # Create or update vector store
            vector_store = Chroma.from_documents(
                documents=splits,
                embedding=self.embeddings,
                persist_directory=self.vector_db_dir
            )
            vector_store.persist()

            return True
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            return False

    def query_document(self, question: str) -> Optional[str]:
        """Query the vector database for relevant information"""
        try:
            # Load the vector store
            vector_store = Chroma(
                persist_directory=self.vector_db_dir,
                embedding_function=self.embeddings
            )

            # Search for relevant documents
            docs = vector_store.similarity_search(question, k=3)
            
            # Combine relevant context
            context = "\n".join([doc.page_content for doc in docs])
            
            return context
        except Exception as e:
            print(f"Error querying document: {str(e)}")
            return None 