from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import requests
from dotenv import load_dotenv

# Load API keys from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend

# Load keys
openai.api_key = os.getenv("API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

@app.route("/chat", methods=["POST"])
@app.route("/chat", methods=["POST"])
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").lower()
    weather_data = request.json.get("weather", {})

    # 1. Small talk responses
    small_talk = {
        "hi": "Hey there! 😊 How can I help you today?",
        "hello": "Hello! Need any weather advice or just wanna chat?",
        "how are you": "I'm just a bunch of code, but thanks for asking! 😄 What about you?",
        "good morning": "Good morning! Hope your day is off to a great start.",
        "good night": "Good night! Sleep well and take care.",
        "great": "Awesome! Let me know if you need anything else. 😊",
        "Thanks": "Happy to assist!",
    }
    for phrase, response in small_talk.items():
        if phrase in user_message:
            return jsonify({"reply": response})

    # 2. Weather-aware queries
    weather_keywords = [
        "Today's weather", "what shall i eat today", "what should i wear", "what to do", "where can i go"
    ]
    if any(keyword in user_message for keyword in weather_keywords):
        if weather_data:
            city = weather_data.get("city", "your location")
            temp = weather_data.get("temp", "unknown")
            condition = weather_data.get("description", "").lower()

            # Show full weather message only for direct "weather" query
            if "Today's weather" in user_message:
                return jsonify({
                    "reply": f"Right now in {city}, it's {temp}°C with {condition}. Cloudy skies today. You can go out but maybe carry a light jacket."
                })

            # For others, give only suggestion
            if "what should i wear" in user_message:
                if "rain" in condition:
                    suggestion = "You should wear a raincoat or carry an umbrella today!"
                elif "clear" in condition:
                    suggestion = "Light, breathable clothes would be perfect today."
                elif "cloud" in condition:
                    suggestion = "Maybe wear something comfy and carry a light jacket, just in case."
                else:
                    suggestion = "Wear something comfortable and check the skies before heading out."
            elif "what shall i eat today" in user_message:
                if "rain" in condition in condition:
                    suggestion = "How about some hot pakoras or a warm bowl of soup? Cozy food for the weather!"
                elif "clear" in condition:
                    suggestion = "A fresh salad or some fruit juice would be nice in this weather."
                elif "cloud" in condition:
                    suggestion = "Eat what you love — just make sure it matches the vibe outside!"
                else:
                    suggestion = "Eat warm, cozy foods like soup, pasta, grilled sandwiches, or pancakes with hot chocolate to stay comforted indoors during snowy weather."
            elif "what to do" in user_message or "where to go" in user_message:
                if "rain" in condition:
                    suggestion = "Perfect weather to stay in and watch a movie or read a book."
                elif "clear" in condition:
                    suggestion = "You could go for a walk, visit a cafe, or explore nearby places!"
                elif "cloud" in condition:
                    suggestion = "A casual stroll or a short trip would still be nice today."
                else:
                    suggestion = "Depends on your mood! Indoors or outdoors, just enjoy your day."
            else:
                suggestion = "Looks like a typical day. Stay comfy and enjoy whatever you do."

            return jsonify({"reply": suggestion})
        else:
            return jsonify({"reply": "I’d love to help with that, but I need the weather data first!"})

    # 3. Fallback to OpenAI
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You're a helpful weather and chat assistant."},
                {"role": "user", "content": user_message},
            ]
        )
        ai_reply = completion.choices[0].message['content']
        return jsonify({"reply": ai_reply})

    except Exception as e:
        print("OpenAI error:", e)
        return jsonify({"reply": "Sorry, I didn’t understand that."})


@app.route('/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City is required'}), 400

    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({'error': 'City not found'}), 404

    data = response.json()
    weather = data['weather'][0]

    return jsonify({
        'city': data['name'],
        'country': data['sys']['country'],
        'temperature': data['main']['temp'],
        'feels_like': data['main']['feels_like'],
        'humidity': data['main']['humidity'],
        'wind': data['wind']['speed'],
        'description': weather['description'],
        'main': weather['main'],
        'icon': weather['icon'],
        'sunrise': data['sys']['sunrise'],
        'sunset': data['sys']['sunset']
    })

if __name__ == '__main__':
    app.run(debug=True)
