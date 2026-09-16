"""Build once; API startup loads this persisted store, never rebuilds it."""
import sys,os,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
os.environ.setdefault('XDG_CACHE_HOME',str(ROOT/'.cache'))
from backend.app.services.corpus import documents,chunk_documents
from backend.app.core.config import DATA

def build():
    import chromadb
    from chromadb.config import Settings
    from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
    docs=documents()
    if not any(d['kind']=='Authentic reference' for d in docs):raise RuntimeError('Run scripts/prepare_reference.py with the catalogue PDF first.')
    chunks=chunk_documents(docs)
    ONNXMiniLM_L6_V2.DOWNLOAD_PATH=DATA.parent.parent/'.cache'/'minilm'
    ef=ONNXMiniLM_L6_V2(preferred_providers=['CPUExecutionProvider'])
    client=chromadb.PersistentClient(path=str(DATA/'vector_store'),settings=Settings(anonymized_telemetry=False))
    try:client.delete_collection('casefile')
    except Exception:pass
    col=client.create_collection('casefile',embedding_function=ef,metadata={'hnsw:space':'cosine'})
    col.add(ids=[x['id'] for x in chunks],documents=[x['text'] for x in chunks],metadatas=[x['metadata'] for x in chunks])
    config={'embedding_model':'all-MiniLM-L6-v2 (Chroma ONNX)','chunk_words':170,'overlap_words':35,'documents':len(docs),'chunks':len(chunks),'case':'swapped-scarab-v1'}
    (DATA/'vector_store/config.json').write_text(json.dumps(config,indent=2));print(config);return config
if __name__=='__main__':build()
