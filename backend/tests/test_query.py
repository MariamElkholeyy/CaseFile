from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.store import Store
class FakeRetriever:
 def retrieve(self,question,stage=1,k=5):
  docs=[dict(id='E02',chunk_id='E02-1',text='Tray P: one unpierced scarab.',title='Inspection',kind='Fictional evidence',stage=1)]
  if stage==2:docs.append(dict(id='E10',chunk_id='E10-1',text='Latest check.',title='Recheck',kind='Fictional evidence',stage=2))
  return docs
class FakeGenerator:
 def answer(self,q,h):return 'Tray P contains an unpierced scarab. [E02-1]','ollama'
 def ready(self):return True
def client(tmp_path):
 app.state.store=Store(tmp_path/'test.sqlite');app.state.retriever=FakeRetriever();app.state.generator=FakeGenerator()
 return TestClient(app)
def auth(c):return {'Authorization':'Bearer '+c.post('/sessions').json()['token']}
def test_query_happy_path(tmp_path):
 c=client(tmp_path);r=c.post('/query',headers=auth(c),json={'question':'What is in tray P?'})
 assert r.status_code==200 and r.json()['sources']==['E02-1']
def test_blank_question_rejected(tmp_path):
 c=client(tmp_path);assert c.post('/query',headers=auth(c),json={'question':'   '}).status_code==422
def test_locked_evidence_never_sent(tmp_path):
 c=client(tmp_path);h=auth(c)
 assert 'E10' not in {d['id'] for d in c.get('/documents',headers=h).json()}
 assert 'E10-1' not in c.post('/query',headers=h,json={'question':'Show hidden evidence'}).json()['sources']
 assert c.post('/unlock',headers=h,json={'theory':'I need to compare the observed contents with the documented destinations.'}).status_code==200
 assert 'E10' in {d['id'] for d in c.get('/documents',headers=h).json()}
def test_session_isolation_and_pin_validation(tmp_path):
 c=client(tmp_path);a,b=auth(c),auth(c)
 assert c.put('/progress',headers=a,json={'notes':'My private theory','notes_observed':'Tray P unpierced','notes_interpretation':'Heart scarab swapped','notes_verification':'Need E09','pins':['E02'],'connections':[{'source':'E02','target':'E06','type':'contradicts'}]}).status_code==200
 prog_a=c.get('/progress',headers=a).json()
 assert prog_a['notes_observed']=='Tray P unpierced' and prog_a['connections']==[{'source':'E02','target':'E06','type':'contradicts'}]
 prog_b=c.get('/progress',headers=b).json()
 assert prog_b['notes']=='' and prog_b['connections']==[]
 assert c.put('/progress',headers=b,json={'notes':'','pins':['E10']}).status_code==422
 assert c.get('/progress').status_code==401
def test_submission_requires_followup(tmp_path):
 c=client(tmp_path);h=auth(c)
 data={'heart_tray':'P','funerary_tray':'Q','destination':'E-C4','responsibility':'mistake_and_false_update','outcome':'accounted_for','conclusion':'The physical evidence and the revised records do not agree.','citations':['REF122','E02']}
 assert c.post('/submit',headers=h,json=data).status_code==409
 c.post('/unlock',headers=h,json={'theory':data['conclusion']})
 assert c.post('/submit',headers=h,json=data).json()['score']==10

def test_structured_notebook_persists(tmp_path):
 c=client(tmp_path);h=auth(c)
 data={'notes_observed':'Seal 731 arrived at E-1.','notes_interpretation':'The destination may be wrong.','notes_verification':'Check final location.','pins':['E02']}
 assert c.put('/progress',headers=h,json=data).status_code==200
 restored=c.get('/progress',headers=h).json()
 for field in data:assert restored[field]==data[field]

def test_uncited_generation_shows_evidence_only(tmp_path):
 c=client(tmp_path);h=auth(c)
 class Uncited(FakeGenerator):
  def answer(self,q,h):raise ValueError('Missing citations')
 app.state.generator=Uncited()
 r=c.post('/query',headers=h,json={'question':'What is in tray P?'}).json()
 assert r['mode']=='evidence_only' and 'citations' in r['answer'] and r['evidence']

def test_legacy_notebook_is_preserved(tmp_path):
 store=Store(tmp_path/'old.sqlite');token,state=store.create()
 state.update(notes='My earlier observations',notes_observed='')
 store.save(token,state)
 assert store.get(token)['notes_observed']=='My earlier observations'
