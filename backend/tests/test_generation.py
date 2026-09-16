import httpx,pytest
from backend.app.services.generation import Generator
from backend.app.core.config import settings
HITS=[{'chunk_id':'E04-1','title':'Packing','kind':'Fictional evidence','text':'Tray P seal 731.'}]
def generator(monkeypatch,payload):
 monkeypatch.setattr(settings,'generation_provider','ollama')
 g=Generator();g.client.close()
 g.client=httpx.Client(base_url='http://model',transport=httpx.MockTransport(lambda r:httpx.Response(200,json={'message':{'content':payload}})))
 return g

def test_structured_answer_and_citation(monkeypatch):
 g=generator(monkeypatch,'{"answer":"Seal 731.","citations":["E04-1"]}')
 try:assert g.answer('Which seal?',HITS)==('Seal 731. [E04-1]','ollama')
 finally:g.close()

def test_invented_source_rejected(monkeypatch):
 g=generator(monkeypatch,'{"answer":"Seal 731.","citations":["E99-1"]}')
 try:
  with pytest.raises(ValueError):g.answer('Which seal?',HITS)
 finally:g.close()
