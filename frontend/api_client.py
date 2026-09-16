import os,httpx
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).with_name('.env'))
BASE=os.environ.get('API_BASE_URL')
def call(method,path,token=None,**kwargs):
    if not BASE:raise RuntimeError('Set API_BASE_URL in your environment.')
    r=httpx.request(method,BASE.rstrip('/')+path,headers={'Authorization':f'Bearer {token}'} if token else {},timeout=260,**kwargs);r.raise_for_status();return r.json()
