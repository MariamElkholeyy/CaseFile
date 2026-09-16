"""Assignment-compatible Streamlit chat alongside the custom frontend."""
import streamlit as st
from api_client import call
st.set_page_config(page_title='Casefile research desk',page_icon='🔎',layout='wide')
st.title('Casefile · Research desk')
st.caption('A fictional museum investigation with authentic archaeological references.')
def show_answer(answer):
 st.write(answer['answer'])
 for h in answer['evidence']:
  with st.expander(h['chunk_id']+' · '+h['title']):st.write(h['text'])
try:
 health=call('GET','/health')
 st.caption('Provider: '+health.get('provider','ollama')+' · Questions and retrieved passages go to Groq when that provider is selected.')
 if 'token' not in st.session_state:st.session_state.token=call('POST','/sessions')['token']
 if 'messages' not in st.session_state:st.session_state.messages=[]
 docs=call('GET','/documents',st.session_state.token)
 with st.sidebar:
  st.subheader('Evidence library')
  for d in docs:
   with st.expander(d['id']+' · '+d['title']):st.markdown(d['text'])
 for message in st.session_state.messages:
  with st.chat_message(message['role']):
   if message['role']=='user':st.write(message['content'])
   else:show_answer(message['content'])
 question=st.chat_input('Ask about the available evidence')
 if question:
  st.session_state.messages.append({'role':'user','content':question})
  with st.chat_message('user'):st.write(question)
  with st.spinner('Searching the evidence…'):answer=call('POST','/query',st.session_state.token,json={'question':question})
  st.session_state.messages.append({'role':'assistant','content':answer})
  with st.chat_message('assistant'):show_answer(answer)
except Exception:st.error('The research service is unavailable. Check API_BASE_URL and start the backend.')
