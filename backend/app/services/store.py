import sqlite3,json,secrets
from backend.app.core.config import DATA
class Store:
    def __init__(self,path=None):
        self.path=path or DATA/'progress.sqlite3'
        with self.connect() as c:c.execute('CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, state TEXT NOT NULL)')
    def connect(self):return sqlite3.connect(self.path)
    def create(self):
        token=secrets.token_urlsafe(32);state={'stage':1,'pins':[],'connections':[],'notes':'','notes_observed':'','notes_interpretation':'','notes_verification':'','initial_theory':'','submission':None}
        with self.connect() as c:c.execute('INSERT INTO sessions VALUES (?,?)',(token,json.dumps(state)))
        return token,state
    def get(self,token):
        with self.connect() as c:row=c.execute('SELECT state FROM sessions WHERE token=?',(token,)).fetchone()
        if not row: return None
        d = json.loads(row[0])
        d.setdefault('notes_observed', d.get('notes',''))
        if d.get('notes') and not any(d.get(k) for k in ['notes_observed','notes_interpretation','notes_verification']):
            d['notes_observed']=d['notes']
        d.setdefault('notes_interpretation', '')
        d.setdefault('notes_verification', '')
        d.setdefault('connections', [])
        return d
    def save(self,token,state):
        with self.connect() as c:c.execute('UPDATE sessions SET state=? WHERE token=?',(json.dumps(state),token))
