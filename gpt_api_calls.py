from openai import OpenAI
from dotenv import load_dotenv

from PIL import Image
import io
import base64

load_dotenv()

client = OpenAI()


def text_to_image_generation(prompt):
    response = client.images.generate(
      model="dall-e-3",
      prompt=prompt,
      size="1024x1024",
      quality="standard",
      n=1,
      response_format="b64_json",
    )

    b64_string = response.data[0].b64_json

    return b64_string

def gloss_to_sentence(text: str):
    prompt = "You respond only with a phrase in response to the prompti will provide you a series of glosses that were created via translating ASL to english of an object to be generated. They will come in broken phrases that do not make sense. Make a understandable phrase using that information formatted as a prompt to generate an image from the phrase. Here's the text\n" + text
    response = client.chat.completions.create(
    messages=[{
        "role": "user",
        "content": prompt,
    }],
    model="gpt-4o-mini",
    )

    return response.choices[0].message.content
