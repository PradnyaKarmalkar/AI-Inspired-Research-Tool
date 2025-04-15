from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_transformers import EmbeddingsClusteringFilter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import TextLoader, Docx2txtLoader
import ai_agent.config as config
import os


class DocumentSummarizer:
    def __init__(self):
        self.chunk_size = config.CHUNK_SIZE
        self.chunk_overlap = config.CHUNK_OVERLAP
        self.summarize_llm = config.SUMMARIZER_MODEL
        self.embed_model = config.EMBED_MODEL

    def extractText(self, file_path):
        # Detect file type by extension
        file_extension = file_path.lower().split('.')[-1]

        if file_extension == 'pdf':
            loader = PyPDFLoader(file_path)
        elif file_extension == 'docx':
            loader = Docx2txtLoader(file_path)
        elif file_extension == 'txt':
            loader = TextLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}. Supported types are pdf, docx, and txt.")

        pages = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        texts = text_splitter.split_documents(pages)
        return texts

    def summarizer(self, file_path):
        # Extract the document
        texts = self.extractText(file_path)
        doc_length = len(texts)

        # Dynamically adjust parameters based on document length
        dynamic_clusters = min(max(3, doc_length // 5), 10)  # Between 3-10 clusters

        # In the summarizer method, change how you initialize the LLM
        llm = ChatGoogleGenerativeAI(
            model=self.summarize_llm,
            temperature=0.1,
            top_p=max(0.7, min(0.9, 0.7 + (doc_length / 100) * 0.2)),
            max_output_tokens=min(4096, max(1024, doc_length * 100)),
            google_api_key=os.environ.get("GOOGLE_API_KEY")  # Add this line to explicitly use the API key
        )
        embeddings = GoogleGenerativeAIEmbeddings(model=self.embed_model)

        # Create the filter with dynamic clusters
        filter = EmbeddingsClusteringFilter(
            embeddings=embeddings,
            num_clusters=min(dynamic_clusters, max(2, len(texts) // 2))  # Ensure at least 2 clusters
        )

        try:
            # Transform documents using the filter
            result = filter.transform_documents(documents=texts)

            # Prepare prompt for direct streaming
            if doc_length < 10:
                # For shorter documents, use a simple prompt
                prompt = "\n\n".join([doc.page_content for doc in result])
                prompt = f"Please summarize the following document:\n\n{prompt}"
            else:
                # For longer documents, provide more context
                prompt = f"Please summarize the following document which has been divided into {len(result)} sections. Provide a comprehensive summary that captures the main points and important details:\n\n"
                for i, doc in enumerate(result):
                    prompt += f"Section {i + 1}:\n{doc.page_content}\n\n"

            # Collect the complete summary
            complete_summary = ""
            # Stream directly from the LLM
            for chunk in llm.stream(prompt):
                # Extract just the text content from the response
                chunk_text = ""
                if isinstance(chunk, dict) and 'content' in chunk:
                    chunk_text = chunk['content']
                elif hasattr(chunk, 'content'):
                    chunk_text = chunk.content
                elif isinstance(chunk, str):
                    chunk_text = chunk

                # Add to complete summary
                if chunk_text:
                    complete_summary += chunk_text
                    yield chunk_text

            # Return the complete summary for saving
            return complete_summary

        except Exception as e:
            error_message = f"Error during summarization: {str(e)}"
            yield error_message
            return error_message