import sys
import pickle
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import INDEX_CACHE_PATH
from src.retrieval.embeddings import EmbeddingService
from src.retrieval.index import VectorIndex
from src.retrieval.retriever import Retriever
from src.generation.generator import GenerationService

def load_or_build_index() -> VectorIndex:
    """Load cached index if available, else run ingestion."""
    if INDEX_CACHE_PATH.exists():
        try:
            with open(INDEX_CACHE_PATH, "rb") as f:
                index = pickle.load(f)
                return index
        except Exception as e:
            print(f"[!] Failed to load cached index ({e}). Rebuilding...")

    from scripts.ingest import run_ingestion
    run_ingestion()

    if INDEX_CACHE_PATH.exists():
        with open(INDEX_CACHE_PATH, "rb") as f:
            return pickle.load(f)

    raise RuntimeError("Vector index could not be initialized.")

def print_response(result: dict):
    print("\n" + "=" * 60)
    print("CIVICLENS AI GROUNDED ANSWER:")
    print("=" * 60)
    print(result.get("answer", ""))
    print("\n" + "-" * 60)
    print("VERIFIED SOURCES & PAGE CITATIONS:")
    print("-" * 60)
    print(result.get("formattedSources", "No sources cited."))
    if "note" in result:
        print(f"\n[System Note: {result['note']}]")
    print("=" * 60 + "\n")

def run_cli():
    print("\n" + "*" * 60)
    print("      CivicLens Source-Backed AI — Interactive CLI Demo")
    print("*" * 60)

    print("Loading vector index and AI model...")
    index = load_or_build_index()
    embedding_service = EmbeddingService()
    retriever = Retriever(embedding_service, index)
    generator = GenerationService()
    print(f"[OK] AI Ready! Index loaded with {len(index.chunks)} verified chunks.\n")

    print("Commands:")
    print("  - Type your question directly")
    print("  - Type 'test' to run the 6 standard benchmark questions")
    print("  - Type 'exit' or 'quit' to end session\n")

    while True:
        try:
            user_input = input("Ask CivicLens AI > ").strip()
            if not user_input:
                continue

            if user_input.lower() in ("exit", "quit", "q"):
                print("Exiting CivicLens AI CLI. Goodbye!")
                break

            if user_input.lower() == "test":
                run_test_suite(retriever, generator)
                continue

            # Retrieve & Generate
            chunks = retriever.retrieve(user_input)
            result = generator.generate(user_input, chunks)
            print_response(result)

        except KeyboardInterrupt:
            print("\nSession terminated.")
            break
        except Exception as e:
            print(f"\n[!] Error processing query: {e}\n")

def run_test_suite(retriever: Retriever, generator: GenerationService):
    test_questions = [
        ("Question 1", "What is the budget of the Ward 12 Road Development project?"),
        ("Question 2", "When was the project expected to be completed?"),
        ("Question 3", "What was the latest reported progress?"),
        ("Question 4", "Why was the project delayed?"),
        ("Question 5", "Who is the contractor?"),
        ("Question 6 (Unrelated / Anti-Hallucination)", "What is the population of Tokyo?")
    ]

    print("\n" + "=" * 70)
    print("RUNNING CIVICLENS AI BENCHMARK TEST SUITE (6 TEST CASES)")
    print("=" * 70)

    for label, q in test_questions:
        print(f"\n> [{label}] Question: {q}")
        chunks = retriever.retrieve(q)
        res = generator.generate(q, chunks)
        print_response(res)

if __name__ == "__main__":
    run_cli()
