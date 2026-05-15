# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions

from rasa_sdk import Action
from rasa_sdk.executor import CollectingDispatcher
import requests


class ActionTrackOrder(Action):

    def name(self):
        return "action_track_order"

    def run(self, dispatcher, tracker, domain):

        try:

            # FETCH ORDERS FROM FASTAPI
            response = requests.get(
                "http://127.0.0.1:8000/orders"
            )

            orders = response.json()

            if len(orders) == 0:

                dispatcher.utter_message(
                    text="📦 No orders found."
                )

                return []

            latest = orders[-1]

            dispatcher.utter_message(

                text=f"📦 Your {latest['item']} order from {latest['restaurant']} is currently {latest['status']}."

            )

        except Exception as e:

            dispatcher.utter_message(
                text="⚠️ Unable to track order right now."
            )

        return []
# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
