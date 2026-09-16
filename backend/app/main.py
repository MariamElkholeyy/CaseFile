import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import ROOT,settings
from backend.app.services.store import Store
from backend.app.services.generation import Generator
from backend.app.api.routes.query import router
from backend.app.utils.logging_config import setup_logging
@asynccontextmanager
async def lifespan(app):
    setup_logging();app.state.store=Store();app.state.generator=Generator()
    try:
        from backend.app.services.retrieval import Retriever
        app.state.retriever=Retriever()
    except Exception as e:
        logging.warning('Retrieval unavailable: %s',e);app.state.retriever=None
    yield
    app.state.generator.close()
app=FastAPI(title='Casefile · The Swapped Scarab',version='0.1.0',lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[settings.frontend_origin],allow_methods=['GET','POST','PUT'],allow_headers=['Authorization','Content-Type'])
app.include_router(router)
app.mount('/',StaticFiles(directory=ROOT.parent/'frontend',html=True),name='frontend')
