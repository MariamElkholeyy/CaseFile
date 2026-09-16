import re
from backend.app.core.config import DATA
REFERENCE_URL = "https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/OIP118.pdf"
def documents():
    result=[]
    for p in sorted((DATA/'evidence').glob('*.md')):
        text=p.read_text(); doc_id=p.name[:3]
        result.append(dict(id=doc_id,title=text.splitlines()[0].split('—',1)[-1].strip(),text=text,
                           kind='Fictional evidence',stage=2 if doc_id in ['E09','E10'] else 1,
                           source_url='',page=0))
    for p in sorted((DATA/'references').glob('*.txt')):
        page=int(p.stem.split('_')[-1])
        result.append(dict(id=f'REF{page}',title=f'Medinet Habu catalogue · printed p. {page}',text=p.read_text(),
                      kind='Authentic reference',stage=1,source_url=REFERENCE_URL,page=page))
    return result

def chunk_documents(docs, size=170, overlap=35):
    chunks=[]
    for d in docs:
        words=d['text'].split()
        for n,start in enumerate(range(0,len(words),size-overlap)):
            part=words[start:start+size]
            if not part: continue
            chunks.append(dict(id=f"{d['id']}-{n+1}",text=' '.join(part),metadata={k:v for k,v in d.items() if k!='text'}))
            if start+size>=len(words):break
    return chunks
