from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_transformers import EmbeddingsClusteringFilter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import TextLoader, Docx2txtLoader
import ai_agent.config as config
import os


class ReportGenerator:
    def __init__(self):
        self.chunk_size = config.REPORT_CHUNK_SIZE
        self.chunk_overlap = config.REPORT_CHUNK_OVERLAP
        self.report_llm = config.REPORT_MODEL
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

    def generate_report(self, file_path):
        # Extract the document
        texts = self.extractText(file_path)
        doc_length = len(texts)

        # Dynamically adjust parameters based on document length
        dynamic_clusters = min(max(3, doc_length // 5), 10)  # Between 3-10 clusters

        # In the summarizer method, change how you initialize the LLM
        llm = ChatGoogleGenerativeAI(
            model=self.report_llm,
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
            
            #     # For longer documents, provide more context
            # prompt = f"""
            #     Generate a report for the following document which has been divided into {len(result)} sections. 
            #     Provide a comprehensive report that captures the main points and important details.
                
            #     Important:
            #     - Do not hallucinate or add information not found in the document
            #     - Create appropriate headings and subheadings based on the content
            #     - Use bullets and new lines to make the report more readable.
            #     - FORMAT YOUR RESPONSE IN MARKDOWN.
            #     """
            
            prompt = f"""
                You are tasked with generating a **strictly Markdown-formatted** report based on a scientific research paper divided into {len(result)} sections.

                Generate a detailed report that includes all important information from the document. Your report **must not hallucinate** or include anything that is not clearly stated in the paper.

                Instructions:
                - Use **Markdown** formatting only (headings, subheadings, bullet points, code blocks, etc.)
                - Create meaningful and informative **headings and subheadings** based on the content.
                - Use **bullets, numbered lists, and line breaks** for clarity and readability.
                - Focus on preserving the **technical accuracy** and detail from the original paper.
                - Include details such as objectives, methodology, data collection, model architecture, results, evaluation, and conclusions.
                - Emphasize important **metrics, results**, and **SHAP/XAI interpretations** used in the study.
                - Do not summarize generically—**structure your report to reflect the paper's structure** (e.g., Abstract, Introduction, Methods, Results, Discussion).

                Remember:
                - Do not add assumptions or external information.
                - Format headings with `#`, `##`, `###` as appropriate for nesting."""

                
            for i, doc in enumerate(result):
                prompt += f"Section {i + 1}:\n{doc.page_content}\n\n"

            # Collect the complete summary
            complete_report = ""
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
                    complete_report += chunk_text
                    yield chunk_text

            # Return the complete summary for saving
            return complete_report

        except Exception as e:
            error_message = f"Error during report generation: {str(e)}"
            yield error_message
            return error_message