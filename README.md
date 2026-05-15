\# AI Food Assistant Chatbot



\## Project Overview

AI-powered food ordering chatbot using FastAPI and Rasa NLP.



The chatbot can:

\- Order food

\- Track orders

\- Handle complaints

\- Provide offers

\- Suggest food

\- Store chat history

\- Show analytics dashboard



\---



\## Technologies Used



\### Frontend

\- HTML

\- CSS

\- JavaScript



\### Backend

\- FastAPI

\- SQLAlchemy



\### NLP

\- Rasa



\### Database

\- SQLite



\---



\## Features

\- Intent recognition

\- Entity extraction

\- Complaint handling

\- Order tracking

\- Analytics dashboard

\- Dark mode UI

\- Admin panel



\---



\## Project Structure



```text id="2qժմ"

Ai\_chatbot/

│

├── Chatbot/

│   ├── backend/

│   └── frontend/

│

├── dir/

│   ├── data/

│   ├── actions/

│   ├── config.yml

│   ├── domain.yml

│

├── run.py

├── requirements.txt

```



\---



\## Run Project



\### Start Backend

```bash

uvicorn backend.main:app --reload

```



\### Start Rasa

```bash

rasa train

rasa run --enable-api --cors "\*"

```



\---



\## Future Improvements

\- Cloud deployment

\- Voice assistant

\- Multi-language support



\---



\## Author

Sakshi

