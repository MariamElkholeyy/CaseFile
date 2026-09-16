from fastapi import APIRouter,Request,Header,HTTPException,Depends
from backend.app.schemas.query import QueryRequest,QueryResponse,ProgressRequest,UnlockRequest,SubmissionRequest
from backend.app.services.corpus import documents
router=APIRouter()
def session(request:Request,authorization:str=Header(default='')):
    token=authorization.removeprefix('Bearer ')
    state=request.app.state.store.get(token)
    if state is None:raise HTTPException(401,'Start a new investigation to continue.')
    return token,state
@router.get('/health')
def health(request:Request):
    return {'status':'ok','retrieval_ready':request.app.state.retriever is not None,'generation_ready':request.app.state.generator.ready(),'provider':getattr(request.app.state.generator,'provider','ollama')}
@router.post('/sessions')
def create(request:Request):
    token,state=request.app.state.store.create();return {'token':token,'state':state}
@router.get('/progress')
def progress(s=Depends(session)):return s[1]
@router.put('/progress')
def save(body:ProgressRequest,request:Request,s=Depends(session)):
    token,state=s;available={d['id'] for d in documents() if d['stage']<=state['stage']}
    if not set(body.pins)<=available:raise HTTPException(422,'A pinned document is not available.')
    state.update(notes=body.notes,notes_observed=body.notes_observed,notes_interpretation=body.notes_interpretation,notes_verification=body.notes_verification,pins=list(dict.fromkeys(body.pins)),connections=body.connections);request.app.state.store.save(token,state);return state
@router.get('/documents')
def docs(s=Depends(session)):return [d for d in documents() if d['stage']<=s[1]['stage']]
@router.post('/unlock')
def unlock(body:UnlockRequest,request:Request,s=Depends(session)):
    if len(body.theory.strip())<40:raise HTTPException(422,'Write a short initial theory first.')
    token,state=s;state.update(stage=2,initial_theory=body.theory);request.app.state.store.save(token,state);return state
@router.post('/query',response_model=QueryResponse)
def query(body:QueryRequest,request:Request,s=Depends(session)):
    retriever=request.app.state.retriever
    if retriever is None:raise HTTPException(503,'The evidence index is not ready. Run the ingestion notebook or scripts/ingest.py.')
    hits=retriever.retrieve(body.question,stage=s[1]['stage'])
    try:answer,mode=request.app.state.generator.answer(body.question,hits)
    except ValueError:
        answer='The model response did not include usable citations. Please inspect the retrieved passages below; this response has not been accepted as a grounded answer.';mode='evidence_only'
    except Exception:
        # Explicit evidence-only mode keeps research usable without pretending an LLM ran.
        answer='The answer service is not available yet. I found relevant passages for you to inspect below; these are search results, not a generated explanation.';mode='evidence_only'
    return QueryResponse(answer=answer,sources=[h['chunk_id'] for h in hits],evidence=hits,mode=mode)
@router.post('/submit')
def submit(body:SubmissionRequest,request:Request,s=Depends(session)):
    token,state=s
    if state['stage']<2:raise HTTPException(409,'Review the follow-up evidence before submitting.')
    allowed={d['id'] for d in documents()}
    if not set(body.citations)<=allowed:raise HTTPException(422,'Choose valid document references.')
    checks=[('Heart scarab identified',body.heart_tray=='P',2),('Funerary assemblage identified',body.funerary_tray=='Q',2),('Latest location established',body.destination=='E-C4',2),('Mistake separated from false update',body.responsibility=='mistake_and_false_update',2),('Evidence limits respected',body.outcome=='accounted_for',1),('Historical and case sources supplied',bool({'REF122','REF123'} & set(body.citations)) and bool({'E02','E06','E10'} & set(body.citations)),1)]
    result={'score':sum(w for _,ok,w in checks if ok),'total':10,'checks':[{'label':label,'passed':ok,'points':w} for label,ok,w in checks], 'note':'Score checks structured answers and citation selection. The written reasoning is saved for human review, not automatically graded.'}
    state['submission']={'answers':body.model_dump(),'result':result};request.app.state.store.save(token,state);return result
