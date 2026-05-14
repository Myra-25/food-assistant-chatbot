from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import requests

from backend.database import Chat, Restaurant, Order, get_db


# -------------------------------
# APP
# -------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# MODELS
# -------------------------------
class ChatRequest(BaseModel):
    message: str


class OrderRequest(BaseModel):
    item: str
    restaurant: str


class UpdateOrderRequest(BaseModel):
    order_id: int
    status: str


# -------------------------------
# CHAT WITH RASA
# -------------------------------
@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):

    try:

        # -----------------------
        # SEND MESSAGE TO RASA
        # -----------------------
        rasa_response = requests.post(

            "http://localhost:5005/webhooks/rest/webhook",

            json={
                "sender": "user",
                "message": req.message
            }

        )

        rasa_data = rasa_response.json()

        # -----------------------
        # GET INTENT + ENTITIES
        # -----------------------
        parse_response = requests.post(

            "http://localhost:5005/model/parse",

            json={
                "text": req.message
            }

        )

        parsed = parse_response.json()

        intent = parsed["intent"]["name"]

        entities = parsed.get("entities", [])

        food_item = None
        restaurant = None

        for e in entities:

            if e["entity"] == "food_item":
                food_item = e["value"]

            if e["entity"] == "restaurant":
                restaurant = e["value"]

        # -----------------------
        # AUTO PLACE ORDER
        # -----------------------
        if intent == "order_food" and food_item:

            order = Order(

                item=food_item,

                restaurant=restaurant if restaurant else "Unknown Restaurant",

                status="placed"
            )

            db.add(order)
            db.commit()

            bot_response = f"✅ Your {food_item} order has been placed from {restaurant if restaurant else 'our restaurant'}."

            status = "success"

            # SAVE CHAT
            chat_data = Chat(

                user_message=req.message,

                bot_response=bot_response,

                intent=intent,

                status=status
            )

            db.add(chat_data)
            db.commit()

            return {
                "response": bot_response
            }

        # -----------------------
        # NORMAL BOT RESPONSE
        # -----------------------
        if rasa_data and len(rasa_data) > 0:

            bot_response = rasa_data[0]["text"]

            status = "success"

        else:

            bot_response = "😅 Sorry, I didn't understand that."

            status = "fallback"

        # -----------------------
        # SAVE CHAT HISTORY
        # -----------------------
        chat_data = Chat(

            user_message=req.message,

            bot_response=bot_response,

            intent=intent,

            status=status
        )

        db.add(chat_data)
        db.commit()

        # -----------------------
        return {
            "response": bot_response
        }

    except Exception as e:

        print(e)

        return {
            "response": "⚠️ Rasa server not running"
        }


# -------------------------------
# RESTAURANTS
# -------------------------------
@app.get("/restaurants")
def get_restaurants(db: Session = Depends(get_db)):

    data = db.query(Restaurant).all()

    return [
        {
            "name": r.name,
            "rating": r.rating,
            "time": r.time,
            "image": r.image
        }
        for r in data
    ]


# -------------------------------
# PLACE ORDER
# -------------------------------
@app.post("/order")
def place_order(req: OrderRequest, db: Session = Depends(get_db)):

    order = Order(
        item=req.item,
        restaurant=req.restaurant,
        status="placed"
    )

    db.add(order)
    db.commit()

    return {
        "message": "Order placed"
    }


# -------------------------------
# GET ORDERS
# -------------------------------
@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):

    return db.query(Order).all()


# -------------------------------
# UPDATE ORDER
# -------------------------------
@app.post("/update-order")
def update_order(req: UpdateOrderRequest, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == req.order_id).first()

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.status = req.status

    db.commit()

    return {
        "message": "updated"
    }


# -------------------------------
# DELETE ORDER
# -------------------------------
@app.delete("/delete-order/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == id).first()

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db.delete(order)
    db.commit()

    return {
        "message": "Deleted"
    }


# -------------------------------
# ANALYTICS
# -------------------------------
@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):

    return {

        "total_messages": db.query(Chat).count(),

        "success": db.query(Chat)
        .filter(Chat.status == "success")
        .count(),

        "fallback": db.query(Chat)
        .filter(Chat.status == "fallback")
        .count(),

        "orders": db.query(Order).count()
    }


# -------------------------------
# TRENDS
# -------------------------------
@app.get("/analytics/trends")
def trends(db: Session = Depends(get_db)):

    chats = db.query(Chat).order_by(Chat.id).all()

    return [
        {
            "date": f"Msg {i+1}",
            "count": i+1
        }
        for i in range(len(chats))
    ]


# -------------------------------
# TOP QUERIES
# -------------------------------
@app.get("/analytics/top-queries")
def top_queries(db: Session = Depends(get_db)):

    results = (

        db.query(Chat.user_message, func.count(Chat.id))

        .group_by(Chat.user_message)

        .order_by(func.count(Chat.id).desc())

        .limit(5)

        .all()
    )

    return [

        {
            "query": r[0],
            "count": r[1]
        }

        for r in results
    ]


# -------------------------------
# STATUS TREND
# -------------------------------
@app.get("/analytics/status-trend")
def status_trend(db: Session = Depends(get_db)):

    success = db.query(Chat)\
        .filter(Chat.status == "success")\
        .count()

    fallback = db.query(Chat)\
        .filter(Chat.status == "fallback")\
        .count()

    return {
        "success": success,
        "fallback": fallback
    }


# -------------------------------
# RECENT CHATS
# -------------------------------
@app.get("/recent-chats")
def chats(db: Session = Depends(get_db)):

    data = db.query(Chat)\
        .order_by(Chat.id.desc())\
        .limit(10)\
        .all()

    return [

        {
            "user": c.user_message,
            "bot": c.bot_response,
            "status": c.status
        }

        for c in data
    ]