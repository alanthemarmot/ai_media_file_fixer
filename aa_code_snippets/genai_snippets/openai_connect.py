
import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(), override=True)

os.environ.get("OPENAI_API_KEY")
# os.environ.get("PINECONE_API_KEY")

print("Hello!")