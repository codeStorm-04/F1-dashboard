import asyncio
import nest_asyncio
import websockets
import redis
import os

# Apply nest_asyncio to allow reentrant use of the event loop.
nest_asyncio.apply()

# LangChain, FAISS, and text splitter imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings  # Placeholder for Gemini embedding.
from langchain.vectorstores import FAISS

# Google Generative AI (Gemini) import
import google.generativeai as genai

# Configure your Gemini API key
os.environ['GOOGLE_API_KEY'] = "YOUR_GEMINI_API_KEY"  # Replace with your key
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])

# ----------------------------------------
# Redis connection for real-time F1 data
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def fetch_f1_data():
    data = redis_client.get("f1:current")  # For example, key "f1:current"
    return data.decode('utf-8') if data else "No current F1 data available."

# ----------------------------------------
# Data processing: split raw data into chunks
def process_data_with_langchain(data: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(data)
    return chunks

# ----------------------------------------
# Embedding generation & FAISS vector store
def store_embeddings_in_faiss(chunks):
    hf_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_texts(chunks, hf_embeddings)
    vector_store.save_local("faiss_index")
    return vector_store

# ----------------------------------------
# Query retrieval and answer generation using Gemini
def query_rag(vector_store, question: str):
    retrieved_docs = vector_store.similarity_search(question, k=3)
    context = "\n".join([doc.page_content for doc in retrieved_docs])
    prompt = (
        "Answer the following F1-related question in one or two sentences using only the context provided.\n\n"
        f"Context: {context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip() if response.text else "Sorry, I could not generate an answer at this time."

# ----------------------------------------
# WebSocket handler function
async def handler(websocket, path):
    """
    Receives a query via WebSocket, processes data, builds a FAISS index, retrieves context,
    generates an answer using Gemini, and sends it back.
    """
    while True:
        try:
            user_query = await websocket.recv()
            print(f"Received query: {user_query}")

            f1_data = fetch_f1_data()
            chunks = process_data_with_langchain(f1_data)
            vector_store = store_embeddings_in_faiss(chunks)
            answer = query_rag(vector_store, user_query)
            print(f"Generated answer: {answer}")

            await websocket.send(answer)
        except websockets.ConnectionClosed:
            print("Connection closed by client")
            break

# ----------------------------------------
# Start the WebSocket server on localhost, port 5000.
def run_websocket_server():
    server = websockets.serve(handler, "localhost", 5050)
    print("WebSocket server started on ws://localhost:5050")
    asyncio.get_event_loop().run_until_complete(server)
    asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    run_websocket_server()
