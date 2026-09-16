import sys,json,hashlib
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
def prepare(path):
    reader=PdfReader(path);target=ROOT/'backend/data/references';target.mkdir(exist_ok=True)
    for printed,pdf_index in [(122,145),(123,146)]:
        text=reader.pages[pdf_index].extract_text()
        if not text or 'SCARABS' not in text:raise ValueError('Unexpected source edition/page content.')
        (target/f'reference_{printed}.txt').write_text(text)
    (target/'provenance.json').write_text(json.dumps({'title':'Scarabs, Scaraboids, Seals, and Seal Impressions from Medinet Habu','author':'Emily Teeter with T. G. Wilfong','year':2003,'publisher':'University of Chicago','url':'https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/OIP118.pdf','pdf_pages':[146,147],'printed_pages':[122,123],'sha256':hashlib.sha256(Path(path).read_bytes()).hexdigest(),'type':'authentic_reference','rights':'Copyright publication. Extracts for local study; do not redistribute without checking rights.'},indent=2))
if __name__=='__main__':prepare(sys.argv[1])
