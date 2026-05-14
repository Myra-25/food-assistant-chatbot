from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# -------------------------------
# Absolute Path FIX
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = "sqlite:///D:/Ai_chatbot/Chatbot/backend/o0.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# -------------------------------
# Chat Table
# -------------------------------
class Chat(Base):
    __tablename__ = "chat"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(String)
    bot_response = Column(String)
    intent = Column(String)
    status = Column(String)


# -------------------------------
# Restaurant Table
# -------------------------------
class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    rating = Column(String)
    time = Column(String)
    image = Column(String)


# -------------------------------
# Order Table
# -------------------------------
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    item = Column(String)
    restaurant = Column(String)
    status = Column(String)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# -------------------------------
# Create Tables
# -------------------------------
Base.metadata.create_all(bind=engine)


# -------------------------------
# Seed Data (FIXED IMAGES 🔥)
# -------------------------------
def seed_data():
    db = SessionLocal()

    if db.query(Restaurant).count() == 0:
        restaurants = [
            Restaurant(
                name="Pizza Hub",
                rating="4.2",
                time="30 mins",
                image="https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg"
            ),
            Restaurant(
                name="Burger King",
                rating="4.0",
                time="25 mins",
                image="https://images.unsplash.com/photo-1550547660-d9450f859349"
            ),
            Restaurant(
                name="Biryani House",
                rating="4.5",
                time="35 mins",
                image="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d"
            )
        ]

        db.add_all(restaurants)
        db.commit()

    db.close()


seed_data()

