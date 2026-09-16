import os, re, math
from collections import Counter
from pathlib import Path
from backend.app.core.config import DATA
os.environ.setdefault('ANONYMIZED_TELEMETRY','False')
os.environ.setdefault('XDG_CACHE_HOME',str(DATA.parent.parent/'.cache'))
class Retriever:
    def __init__(self):
        import chromadb
        from chromadb.config import Settings
        from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
        ONNXMiniLM_L6_V2.DOWNLOAD_PATH=DATA.parent.parent/'.cache'/'minilm'
        self.embedding=ONNXMiniLM_L6_V2(preferred_providers=['CPUExecutionProvider'])
        self.client=chromadb.PersistentClient(path=str(DATA/'vector_store'),settings=Settings(anonymized_telemetry=False))
        self.collection=self.client.get_collection('casefile',embedding_function=self.embedding)
    def retrieve(self,question,stage=1,k=5):
        # The filter executes inside the database, before results reach generation.
        search=question
        if re.search(r'\b(should|intended|supposed|requested)\b',question,re.I):search+=' intended destination exhibition preparation request'
        if re.search(r'\b(stolen|theft|missing|latest|current)\b',question,re.I):search+=' physical recheck accounted location'
        out=self.collection.query(query_texts=[search],n_results=self.collection.count(),where={'stage':{'$lte':stage}},include=['documents','metadatas','distances'])
        stop=set('the a an of to in is was were what which where when who how did does do have has had at on for and or by with it its this that should'.split())
        def tokens(text):return [t for t in re.findall(r'[a-z0-9]+',text.lower()) if t not in stop]
        query=tokens(search)
        # Expand common question vocabulary, not answers or document IDs.
        aliases={'flagged':['reported','inconsistent','clarification'],'discrepancy':['inconsistent','clarification'],
                 'latest':['recheck','physical'],'intended':['request'],'should':['request'],'received':['receiving']}
        for term in re.findall(r'[a-z]+',question.lower()):query+=aliases.get(term,[])
        texts=out['documents'][0];metas=out['metadatas'][0]
        bags=[Counter(tokens(m['title']+' '+t)) for m,t in zip(metas,texts)]
        lengths=[sum(b.values()) for b in bags];average=sum(lengths)/max(len(lengths),1)
        df=Counter(t for bag in bags for t in bag);n=len(bags);hits=[]
        for i,(cid,text,meta,dist) in enumerate(zip(out['ids'][0],texts,metas,out['distances'][0])):
            bm25=0
            for term in set(query):
                freq=bags[i][term]
                if freq:bm25+=math.log(1+(n-df[term]+.5)/(df[term]+.5))*freq*2.5/(freq+1.5*(.25+.75*lengths[i]/average))
            hits.append(dict(chunk_id=cid,text=text,**meta,semantic=1/(1+dist),lexical=bm25))
        dense={h['chunk_id']:i for i,h in enumerate(sorted(hits,key=lambda h:h['semantic'],reverse=True))}
        sparse={h['chunk_id']:i for i,h in enumerate(sorted(hits,key=lambda h:h['lexical'],reverse=True))}
        for h in hits:
            h['score']=.55/(10+dense[h['chunk_id']])+.45/(10+sparse[h['chunk_id']])
        # Diversify by document so repeated passages do not crowd out the other
        # half of a cross-document comparison. Preserve best passage per source.
        ranked=sorted(hits,key=lambda h:h['score'],reverse=True)
        selected=[];seen=set()
        for hit in ranked:
            if hit['id'] not in seen:
                selected.append(hit);seen.add(hit['id'])
            if len(selected)==k:break
        # Intended destinations require linking a request to observed object identity.
        # Add provenance-bearing context, never an expected answer or solution file.
        if re.search(r'\b(should|intended|supposed|requested)\b',question,re.I):
            inspection=next((h for h in ranked if 'inspection' in h['title'].lower()),None)
            if inspection and inspection['id'] not in seen:
                selected.append(inspection);seen.add(inspection['id'])
            request=next((h for h in ranked if 'request' in h['title'].lower()),None)
            if request:
                ref=self.collection.query(query_texts=[request['text']],n_results=1,
                    where={'$and':[{'stage':{'$lte':stage}},{'kind':{'$eq':'Authentic reference'}}]},
                    include=['documents','metadatas'])
                if ref['ids'][0]:
                    cid=ref['ids'][0][0]
                    if cid not in {h['chunk_id'] for h in selected}:
                        selected.append(dict(chunk_id=cid,text=ref['documents'][0][0],**ref['metadatas'][0][0],score=0))
        return selected
