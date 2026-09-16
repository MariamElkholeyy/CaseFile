from typing import Literal
from pydantic import BaseModel,Field,field_validator
class QueryRequest(BaseModel):
    question:str=Field(min_length=3,max_length=1500)
    @field_validator('question')
    @classmethod
    def not_blank(cls,v):
        v=v.strip()
        if len(v)<3:raise ValueError('Please enter a question of at least 3 characters.')
        return v
class QueryResponse(BaseModel):
    answer:str
    sources:list[str]
    evidence:list[dict]=Field(default_factory=list)
    mode:str='ollama'
class ProgressRequest(BaseModel):
    notes:str=Field(default='',max_length=20000)
    notes_observed:str=Field(default='',max_length=10000)
    notes_interpretation:str=Field(default='',max_length=10000)
    notes_verification:str=Field(default='',max_length=10000)
    pins:list[str]=Field(default_factory=list,max_length=30)
    connections:list[dict]=Field(default_factory=list,max_length=50)
class UnlockRequest(BaseModel):
    theory:str=Field(min_length=40,max_length=5000)
class SubmissionRequest(BaseModel):
    heart_tray:Literal["P","Q","R"]
    funerary_tray:Literal["P","Q","R"]
    destination:Literal["D-1","E-C4","S-C2","unknown"]
    responsibility:Literal["mistake_only","mistake_and_false_update","theft"]
    outcome:Literal["accounted_for","missing","authenticated"]
    conclusion:str=Field(min_length=40,max_length=6000)
    citations:list[str]=Field(min_length=2,max_length=15)
