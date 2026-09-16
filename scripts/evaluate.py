import sys,json,time,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from backend.app.services.retrieval import Retriever
from backend.app.services.generation import Generator

def evaluate(generate=False):
    questions=json.loads((ROOT/'evaluation/questions.json').read_text())
    retriever=Retriever()
    generator=Generator()
    is_live = generator.ready()
    rows=[]
    for q in questions:
        stage=2
        started=time.monotonic()
        hits=retriever.retrieve(q['question'],stage=stage)
        expected={s.replace('REF:p','REF') for s in q['expected_sources'] if s!='REFERENCE_DESK'}
        found={h['id'] for h in hits}
        coverage=len(expected & found)/len(expected) if expected else None
        answer='Not generated in retrieval-only run'
        mode='retrieval_only'
        if generate:
            try:
                answer,mode=generator.answer(q['question'],hits)
            except Exception as e:
                answer=f'Generation failed validation or service call: {type(e).__name__}: {e}'
                mode='failed'
        correctness='not yet reviewed' if mode not in ['failed','retrieval_only'] else 'not assessed'
        rows.append({
            'id':q['id'],
            'question':q['question'],
            'expected_sources':sorted(expected),
            'retrieved_sources':[h['chunk_id'] for h in hits],
            'expected_source_coverage':coverage,
            'answer':answer,
            'mode':mode,
            'seconds':round(time.monotonic()-started,2),
            'retrieved_passages':hits,
            'grounding_review':'pending review',
            'correct_or_not':correctness
        })
        (ROOT/'evaluation/live-progress.json').write_text(json.dumps(rows,indent=2))
        print(q['id'],mode,flush=True)
    generator.close()
    scored=[x['expected_source_coverage'] for x in rows if x['expected_source_coverage'] is not None]
    result={
        'questions':len(rows),
        'stage':2,
        'k':5,
        'mean_expected_source_coverage':sum(scored)/len(scored),
        'generation_requested':generate,
        'rows':rows
    }
    (ROOT/'evaluation/results.json').write_text(json.dumps(result,indent=2))
    lines=[
        '# Measured evaluation',
        '',
        f"Questions: {len(rows)}. Retrieval: top 5, all case evidence unlocked.",
        f"Mean expected-source coverage: {result['mean_expected_source_coverage']:.1%}. This measures source retrieval, not answer correctness. Generated answers require explicit review.",
        '',
        '| Question | Retrieved sources | Expected-source coverage | Answer | Correct? |',
        '|---|---|---|---|---|'
    ]
    clean=lambda s:str(s).replace('|','/').replace('\n',' ')
    for x in rows:
        lines.append('| '+ ' | '.join([
            clean(x['question']),
            ', '.join(x['retrieved_sources']),
            f"{x['expected_source_coverage']:.0%}" if x['expected_source_coverage'] is not None else 'N/A',
            clean(x['answer']),
            x['correct_or_not']
        ])+' |')
    lines+=[
        '',
        '## Limitations and failure analysis',
        '1. **Cross-Document Crowding**: Multi-part queries (e.g. Q07 / Q10) require passages from both packing (E04) and receiving (E06) logs. In top-5 retrieval, multiple chunks from the same document can push out cross-document references, resulting in partial coverage (e.g. 25-50%). Mitigated by stage diversification and explicit metadata routing.',
        '2. **Negative / Unanswerable Questions**: For questions asking about out-of-scope details (e.g. Q16 market value), similarity search still retrieves nearby passages about LM-101. The generator must strictly abstain rather than fabricate estimates.',
        '3. **Citation Integrity**: Small local models can drop bracketed tokens; citation presence is checked, but does not prove that a claim is supported. Missing citations cause a failed generation result, never a prewritten substitute.'
    ]
    (ROOT/'evaluation/RESULTS.md').write_text('\n'.join(lines)+'\n')
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--generate',action='store_true')
    a=p.parse_args()
    r=evaluate(a.generate)
    print({k:v for k,v in r.items() if k!='rows'})
